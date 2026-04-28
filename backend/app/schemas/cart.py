from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CartItemAdd(BaseModel):
    variant_id: int
    quantity: int = Field(default=1, ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)


class CartItemVariant(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    size: str
    color: str
    sku: str
    stock: int


class CartItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    quantity: int
    unit_price: Decimal
    line_total: Decimal
    product_name: str
    product_slug: str
    product_image: str | None
    variant: CartItemVariant


class CartOut(BaseModel):
    items: list[CartItemOut]
    subtotal: Decimal
    item_count: int
