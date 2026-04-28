import secrets
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.api.deps import CurrentUser, DbSession, OwnerUser
from app.models.cart import CartItem
from app.models.catalog import Product, ProductVariant
from app.models.order import Order, OrderItem, OrderStatus
from app.models.user import UserRole
from app.schemas.order import OrderCreate, OrderListItem, OrderOut, OrderStatusUpdate

router = APIRouter(prefix="/orders", tags=["orders"])


def _generate_order_number(db) -> str:
    year = datetime.now(timezone.utc).year
    while True:
        suffix = secrets.token_hex(3).upper()  # 6 hex chars
        candidate = f"BW-{year}-{suffix}"
        if not db.scalar(select(Order).where(Order.order_number == candidate)):
            return candidate


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def checkout(payload: OrderCreate, user: CurrentUser, db: DbSession) -> Order:
    items = list(
        db.scalars(
            select(CartItem)
            .where(CartItem.user_id == user.id)
            .options(selectinload(CartItem.variant).selectinload(ProductVariant.product))
        )
    )
    if not items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")

    for item in items:
        if item.quantity > item.variant.stock:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Insufficient stock for SKU {item.variant.sku} (have {item.variant.stock})",
            )

    subtotal = Decimal("0")
    order_items: list[OrderItem] = []
    for item in items:
        variant = item.variant
        product: Product = variant.product
        unit_price = variant.price_override if variant.price_override is not None else product.base_price
        subtotal += unit_price * item.quantity
        order_items.append(
            OrderItem(
                variant_id=variant.id,
                product_name=product.name,
                variant_size=variant.size,
                variant_color=variant.color,
                unit_price=unit_price,
                quantity=item.quantity,
            )
        )
        variant.stock -= item.quantity

    shipping_fee = Decimal("0")
    total = subtotal + shipping_fee

    order = Order(
        user_id=user.id,
        order_number=_generate_order_number(db),
        status=OrderStatus.PENDING,
        subtotal=subtotal,
        shipping=shipping_fee,
        total=total,
        shipping_name=payload.shipping_name,
        shipping_address_line1=payload.shipping_address_line1,
        shipping_address_line2=payload.shipping_address_line2,
        shipping_city=payload.shipping_city,
        shipping_state=payload.shipping_state,
        shipping_postal=payload.shipping_postal,
        shipping_country=payload.shipping_country,
        notes=payload.notes,
        items=order_items,
    )
    db.add(order)

    for item in items:
        db.delete(item)

    db.commit()
    db.refresh(order)
    return order


@router.get("", response_model=list[OrderListItem])
def list_orders(
    user: CurrentUser,
    db: DbSession,
    all_users: bool = Query(default=False, description="Owner only: list every user's orders"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> list[OrderListItem]:
    stmt = select(Order, func.count(OrderItem.id)).join(OrderItem).group_by(Order.id)
    if not (all_users and user.role == UserRole.OWNER):
        stmt = stmt.where(Order.user_id == user.id)
    stmt = stmt.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    rows = db.execute(stmt).all()
    out: list[OrderListItem] = []
    for order, count in rows:
        out.append(
            OrderListItem(
                id=order.id,
                order_number=order.order_number,
                status=order.status,
                total=order.total,
                created_at=order.created_at,
                item_count=count,
            )
        )
    return out


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, user: CurrentUser, db: DbSession) -> Order:
    order = db.scalar(select(Order).options(selectinload(Order.items)).where(Order.id == order_id))
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != user.id and user.role != UserRole.OWNER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    return order


@router.patch("/{order_id}/status", response_model=OrderOut)
def update_status(order_id: int, payload: OrderStatusUpdate, db: DbSession, _: OwnerUser) -> Order:
    order = db.scalar(select(Order).options(selectinload(Order.items)).where(Order.id == order_id))
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order
