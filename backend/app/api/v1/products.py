from fastapi import APIRouter, HTTPException, Query, status
from slugify import slugify
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import DbSession, OwnerUser
from app.models.catalog import Category, Product, ProductVariant
from app.models.review import Review
from app.schemas.catalog import (
    ProductCreate,
    ProductDetail,
    ProductListItem,
    ProductListResponse,
    ProductUpdate,
    VariantCreate,
    VariantOut,
    VariantUpdate,
)

router = APIRouter(prefix="/products", tags=["products"])


def attach_review_stats(db: Session, products: list[Product]) -> None:
    if not products:
        return
    ids = [p.id for p in products]
    rows = db.execute(
        select(Review.product_id, func.avg(Review.rating), func.count(Review.id))
        .where(Review.product_id.in_(ids))
        .group_by(Review.product_id)
    ).all()
    stats = {pid: (float(avg) if avg is not None else None, int(count)) for pid, avg, count in rows}
    for p in products:
        avg, count = stats.get(p.id, (None, 0))
        p.average_rating = round(avg, 2) if avg is not None else None
        p.review_count = count


def _unique_product_slug(db, name: str, ignore_id: int | None = None) -> str:
    base = slugify(name) or "product"
    candidate = base
    n = 1
    while True:
        stmt = select(Product).where(Product.slug == candidate)
        if ignore_id is not None:
            stmt = stmt.where(Product.id != ignore_id)
        if db.scalar(stmt) is None:
            return candidate
        n += 1
        candidate = f"{base}-{n}"


@router.get("", response_model=ProductListResponse)
def list_products(
    db: DbSession,
    category: str | None = Query(default=None, description="Category slug"),
    q: str | None = Query(default=None, description="Search by name"),
    include_inactive: bool = Query(default=False),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> ProductListResponse:
    stmt = select(Product).options(selectinload(Product.category))
    count_stmt = select(func.count(Product.id))

    if not include_inactive:
        stmt = stmt.where(Product.is_active.is_(True))
        count_stmt = count_stmt.where(Product.is_active.is_(True))

    if category:
        cat = db.scalar(select(Category).where(Category.slug == category))
        if cat:
            stmt = stmt.where(Product.category_id == cat.id)
            count_stmt = count_stmt.where(Product.category_id == cat.id)
        else:
            return ProductListResponse(items=[], total=0, page=page, page_size=page_size)

    if q:
        like = f"%{q.lower()}%"
        stmt = stmt.where(func.lower(Product.name).like(like))
        count_stmt = count_stmt.where(func.lower(Product.name).like(like))

    total = db.scalar(count_stmt) or 0
    stmt = stmt.order_by(Product.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    items = list(db.scalars(stmt))
    attach_review_stats(db, items)
    return ProductListResponse(
        items=[ProductListItem.model_validate(p) for p in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{slug}", response_model=ProductDetail)
def get_product(slug: str, db: DbSession) -> Product:
    product = db.scalar(
        select(Product)
        .options(selectinload(Product.category), selectinload(Product.variants))
        .where(Product.slug == slug)
    )
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    attach_review_stats(db, [product])
    return product


@router.post("", response_model=ProductDetail, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: DbSession, _: OwnerUser) -> Product:
    category = db.get(Category, payload.category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category does not exist")

    if payload.variants:
        skus = [v.sku for v in payload.variants]
        if len(skus) != len(set(skus)):
            raise HTTPException(status_code=400, detail="Duplicate SKU within variants")
        existing_skus = db.scalars(select(ProductVariant.sku).where(ProductVariant.sku.in_(skus))).all()
        if existing_skus:
            raise HTTPException(status_code=409, detail=f"SKU(s) already exist: {existing_skus}")

    product = Product(
        name=payload.name,
        slug=_unique_product_slug(db, payload.name),
        description=payload.description,
        base_price=payload.base_price,
        compare_at_price=payload.compare_at_price,
        category_id=payload.category_id,
        images=payload.images,
        is_active=payload.is_active,
    )
    for v in payload.variants:
        product.variants.append(
            ProductVariant(
                size=v.size,
                color=v.color,
                sku=v.sku,
                stock=v.stock,
                price_override=v.price_override,
            )
        )
    db.add(product)
    db.commit()
    db.refresh(product)
    attach_review_stats(db, [product])
    return product


@router.put("/{product_id}", response_model=ProductDetail)
def update_product(product_id: int, payload: ProductUpdate, db: DbSession, _: OwnerUser) -> Product:
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if payload.name is not None and payload.name != product.name:
        product.name = payload.name
        product.slug = _unique_product_slug(db, payload.name, ignore_id=product.id)
    if payload.description is not None:
        product.description = payload.description
    if payload.base_price is not None:
        product.base_price = payload.base_price
    if payload.compare_at_price is not None:
        product.compare_at_price = payload.compare_at_price
    if payload.category_id is not None and payload.category_id != product.category_id:
        if not db.get(Category, payload.category_id):
            raise HTTPException(status_code=400, detail="Category does not exist")
        product.category_id = payload.category_id
    if payload.images is not None:
        product.images = payload.images
    if payload.is_active is not None:
        product.is_active = payload.is_active

    db.commit()
    db.refresh(product)
    attach_review_stats(db, [product])
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: DbSession, _: OwnerUser) -> None:
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    db.delete(product)
    db.commit()


@router.post("/{product_id}/variants", response_model=VariantOut, status_code=status.HTTP_201_CREATED)
def add_variant(product_id: int, payload: VariantCreate, db: DbSession, _: OwnerUser) -> ProductVariant:
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if db.scalar(select(ProductVariant).where(ProductVariant.sku == payload.sku)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")
    variant = ProductVariant(product_id=product.id, **payload.model_dump())
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return variant


@router.put("/{product_id}/variants/{variant_id}", response_model=VariantOut)
def update_variant(
    product_id: int,
    variant_id: int,
    payload: VariantUpdate,
    db: DbSession,
    _: OwnerUser,
) -> ProductVariant:
    variant = db.get(ProductVariant, variant_id)
    if not variant or variant.product_id != product_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variant not found")
    data = payload.model_dump(exclude_unset=True)
    if "sku" in data and data["sku"] != variant.sku:
        if db.scalar(select(ProductVariant).where(ProductVariant.sku == data["sku"])):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")
    for k, v in data.items():
        setattr(variant, k, v)
    db.commit()
    db.refresh(variant)
    return variant


@router.delete("/{product_id}/variants/{variant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_variant(product_id: int, variant_id: int, db: DbSession, _: OwnerUser) -> None:
    variant = db.get(ProductVariant, variant_id)
    if not variant or variant.product_id != product_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variant not found")
    db.delete(variant)
    db.commit()
