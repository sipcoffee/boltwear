from decimal import Decimal

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.deps import CurrentUser, DbSession
from app.models.cart import CartItem
from app.models.catalog import Product, ProductVariant
from app.schemas.cart import CartItemAdd, CartItemUpdate, CartItemVariant, CartOut, CartItemOut

router = APIRouter(prefix="/cart", tags=["cart"])


def _serialize_cart(db, user_id: int) -> CartOut:
    items = list(
        db.scalars(
            select(CartItem)
            .where(CartItem.user_id == user_id)
            .options(selectinload(CartItem.variant).selectinload(ProductVariant.product))
            .order_by(CartItem.created_at)
        )
    )
    out_items: list[CartItemOut] = []
    subtotal = Decimal("0")
    item_count = 0
    for item in items:
        variant = item.variant
        product: Product = variant.product
        unit_price = variant.price_override if variant.price_override is not None else product.base_price
        line_total = unit_price * item.quantity
        subtotal += line_total
        item_count += item.quantity
        out_items.append(
            CartItemOut(
                id=item.id,
                quantity=item.quantity,
                unit_price=unit_price,
                line_total=line_total,
                product_name=product.name,
                product_slug=product.slug,
                product_image=product.images[0] if product.images else None,
                variant=CartItemVariant.model_validate(variant),
            )
        )
    return CartOut(items=out_items, subtotal=subtotal, item_count=item_count)


@router.get("", response_model=CartOut)
def get_cart(user: CurrentUser, db: DbSession) -> CartOut:
    return _serialize_cart(db, user.id)


@router.post("/items", response_model=CartOut, status_code=status.HTTP_201_CREATED)
def add_item(payload: CartItemAdd, user: CurrentUser, db: DbSession) -> CartOut:
    variant = db.get(ProductVariant, payload.variant_id)
    if not variant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variant not found")

    existing = db.scalar(
        select(CartItem).where(CartItem.user_id == user.id, CartItem.variant_id == variant.id)
    )
    new_qty = (existing.quantity if existing else 0) + payload.quantity
    if new_qty > variant.stock:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Only {variant.stock} in stock",
        )

    if existing:
        existing.quantity = new_qty
    else:
        db.add(CartItem(user_id=user.id, variant_id=variant.id, quantity=payload.quantity))
    db.commit()
    return _serialize_cart(db, user.id)


@router.put("/items/{item_id}", response_model=CartOut)
def update_item(item_id: int, payload: CartItemUpdate, user: CurrentUser, db: DbSession) -> CartOut:
    item = db.get(CartItem, item_id)
    if not item or item.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")
    variant = db.get(ProductVariant, item.variant_id)
    if variant and payload.quantity > variant.stock:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Only {variant.stock} in stock",
        )
    item.quantity = payload.quantity
    db.commit()
    return _serialize_cart(db, user.id)


@router.delete("/items/{item_id}", response_model=CartOut)
def remove_item(item_id: int, user: CurrentUser, db: DbSession) -> CartOut:
    item = db.get(CartItem, item_id)
    if not item or item.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")
    db.delete(item)
    db.commit()
    return _serialize_cart(db, user.id)


@router.delete("", response_model=CartOut)
def clear_cart(user: CurrentUser, db: DbSession) -> CartOut:
    db.query(CartItem).filter(CartItem.user_id == user.id).delete()
    db.commit()
    return _serialize_cart(db, user.id)
