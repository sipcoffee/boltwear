from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    title: str = Field(default="", max_length=160)
    body: str = Field(default="", max_length=4000)


class ReviewUpdate(BaseModel):
    rating: int | None = Field(default=None, ge=1, le=5)
    title: str | None = Field(default=None, max_length=160)
    body: str | None = Field(default=None, max_length=4000)


class Reviewer(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    rating: int
    title: str
    body: str
    is_verified_purchase: bool
    created_at: datetime
    user: Reviewer


class ReviewSummary(BaseModel):
    average_rating: float | None
    review_count: int
    distribution: dict[int, int]
