from decimal import Decimal

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.api.deps import DbSession, OwnerUser
from app.models.catalog import Product
from app.models.order import Order, OrderItem, OrderStatus
from app.models.user import User, UserRole
from app.schemas.catalog import ProductDetail
from app.schemas.order import OrderListItem
from app.schemas.user import UserOut

router = APIRouter(prefix="/admin", tags=["admin"])


class AdminStats(BaseModel):
    total_revenue: Decimal
    total_orders: int
    pending_orders: int
    total_products: int
    total_clients: int
    recent_orders: list[OrderListItem]


@router.get("/stats", response_model=AdminStats)
def stats(db: DbSession, _: OwnerUser) -> AdminStats:
    total_revenue = db.scalar(
        select(func.coalesce(func.sum(Order.total), 0)).where(Order.status != OrderStatus.CANCELLED)
    ) or Decimal("0")
    total_orders = db.scalar(select(func.count(Order.id))) or 0
    pending_orders = db.scalar(select(func.count(Order.id)).where(Order.status == OrderStatus.PENDING)) or 0
    total_products = db.scalar(select(func.count(Product.id))) or 0
    total_clients = db.scalar(select(func.count(User.id)).where(User.role == UserRole.CLIENT)) or 0

    rows = db.execute(
        select(Order, func.count(OrderItem.id))
        .join(OrderItem)
        .group_by(Order.id)
        .order_by(Order.created_at.desc())
        .limit(5)
    ).all()
    recent = [
        OrderListItem(
            id=o.id,
            order_number=o.order_number,
            status=o.status,
            total=o.total,
            created_at=o.created_at,
            item_count=c,
        )
        for o, c in rows
    ]

    return AdminStats(
        total_revenue=total_revenue,
        total_orders=total_orders,
        pending_orders=pending_orders,
        total_products=total_products,
        total_clients=total_clients,
        recent_orders=recent,
    )


@router.get("/users", response_model=list[UserOut])
def list_users(db: DbSession, _: OwnerUser) -> list[User]:
    return list(db.scalars(select(User).order_by(User.created_at.desc())))


@router.get("/products/{product_id}", response_model=ProductDetail)
def get_product_by_id(product_id: int, db: DbSession, _: OwnerUser) -> Product:
    from app.api.v1.products import attach_review_stats

    product = db.scalar(
        select(Product)
        .options(selectinload(Product.category), selectinload(Product.variants))
        .where(Product.id == product_id)
    )
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    attach_review_stats(db, [product])
    return product
