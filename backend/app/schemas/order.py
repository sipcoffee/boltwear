from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.order import OrderStatus


class ShippingAddress(BaseModel):
    shipping_name: str = Field(min_length=1, max_length=255)
    shipping_address_line1: str = Field(min_length=1, max_length=255)
    shipping_address_line2: str | None = None
    shipping_city: str = Field(min_length=1, max_length=120)
    shipping_state: str = Field(min_length=1, max_length=120)
    shipping_postal: str = Field(min_length=1, max_length=32)
    shipping_country: str = Field(min_length=2, max_length=2)


class OrderCreate(ShippingAddress):
    notes: str | None = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    variant_id: int
    product_name: str
    variant_size: str
    variant_color: str
    unit_price: Decimal
    quantity: int


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    status: OrderStatus
    subtotal: Decimal
    shipping: Decimal
    total: Decimal
    shipping_name: str
    shipping_address_line1: str
    shipping_address_line2: str | None
    shipping_city: str
    shipping_state: str
    shipping_postal: str
    shipping_country: str
    notes: str | None
    created_at: datetime
    items: list[OrderItemOut]


class OrderListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    status: OrderStatus
    total: Decimal
    created_at: datetime
    item_count: int
