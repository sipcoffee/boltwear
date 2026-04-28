from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CategoryBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None


class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    created_at: datetime


class VariantBase(BaseModel):
    size: str = Field(min_length=1, max_length=20)
    color: str = Field(min_length=1, max_length=60)
    sku: str = Field(min_length=1, max_length=64)
    stock: int = Field(ge=0)
    price_override: Decimal | None = None


class VariantCreate(VariantBase):
    pass


class VariantUpdate(BaseModel):
    size: str | None = Field(default=None, min_length=1, max_length=20)
    color: str | None = Field(default=None, min_length=1, max_length=60)
    sku: str | None = Field(default=None, min_length=1, max_length=64)
    stock: int | None = Field(default=None, ge=0)
    price_override: Decimal | None = None


class VariantOut(VariantBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int


class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str = ""
    base_price: Decimal = Field(ge=0)
    compare_at_price: Decimal | None = None
    category_id: int
    images: list[str] = []
    is_active: bool = True


class ProductCreate(ProductBase):
    variants: list[VariantCreate] = []


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    base_price: Decimal | None = Field(default=None, ge=0)
    compare_at_price: Decimal | None = None
    category_id: int | None = None
    images: list[str] | None = None
    is_active: bool | None = None


class ProductListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    base_price: Decimal
    compare_at_price: Decimal | None
    images: list[str]
    is_active: bool
    category: CategoryOut
    average_rating: float | None = None
    review_count: int = 0


class ProductDetail(ProductListItem):
    description: str
    variants: list[VariantOut]
    created_at: datetime
    updated_at: datetime


class ProductListResponse(BaseModel):
    items: list[ProductListItem]
    total: int
    page: int
    page_size: int
