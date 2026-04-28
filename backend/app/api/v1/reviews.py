from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.api.deps import CurrentUser, DbSession
from app.models.catalog import Product, ProductVariant
from app.models.order import Order, OrderItem, OrderStatus
from app.models.review import Review
from app.models.user import UserRole
from app.schemas.review import ReviewCreate, ReviewOut, ReviewSummary, ReviewUpdate

# Router 1: nested under /products/{slug}/reviews
product_reviews_router = APIRouter(prefix="/products/{slug}/reviews", tags=["reviews"])

# Router 2: flat /reviews/{id} for update + delete by id
reviews_router = APIRouter(prefix="/reviews", tags=["reviews"])


def _resolve_product(db, slug: str) -> Product:
    product = db.scalar(select(Product).where(Product.slug == slug))
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


def _has_purchased(db, user_id: int, product_id: int) -> bool:
    found = db.scalar(
        select(OrderItem.id)
        .join(Order, Order.id == OrderItem.order_id)
        .join(ProductVariant, ProductVariant.id == OrderItem.variant_id)
        .where(
            Order.user_id == user_id,
            Order.status != OrderStatus.CANCELLED,
            ProductVariant.product_id == product_id,
        )
        .limit(1)
    )
    return found is not None


@product_reviews_router.get("", response_model=list[ReviewOut])
def list_reviews(
    slug: str,
    db: DbSession,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    sort: str = Query(default="recent", pattern="^(recent|highest|lowest)$"),
) -> list[Review]:
    product = _resolve_product(db, slug)
    stmt = (
        select(Review)
        .options(selectinload(Review.user))
        .where(Review.product_id == product.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    if sort == "highest":
        stmt = stmt.order_by(Review.rating.desc(), Review.created_at.desc())
    elif sort == "lowest":
        stmt = stmt.order_by(Review.rating.asc(), Review.created_at.desc())
    else:
        stmt = stmt.order_by(Review.created_at.desc())
    return list(db.scalars(stmt))


@product_reviews_router.get("/summary", response_model=ReviewSummary)
def review_summary(slug: str, db: DbSession) -> ReviewSummary:
    product = _resolve_product(db, slug)
    rows = db.execute(
        select(Review.rating, func.count(Review.id))
        .where(Review.product_id == product.id)
        .group_by(Review.rating)
    ).all()
    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    total_count = 0
    weighted = 0
    for rating, count in rows:
        distribution[rating] = count
        total_count += count
        weighted += rating * count
    avg = (weighted / total_count) if total_count else None
    return ReviewSummary(
        average_rating=round(avg, 2) if avg is not None else None,
        review_count=total_count,
        distribution=distribution,
    )


@product_reviews_router.get("/mine", response_model=ReviewOut)
def my_review(slug: str, user: CurrentUser, db: DbSession) -> Review:
    product = _resolve_product(db, slug)
    review = db.scalar(
        select(Review)
        .options(selectinload(Review.user))
        .where(Review.user_id == user.id, Review.product_id == product.id)
    )
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No review yet")
    return review


@product_reviews_router.post("", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(slug: str, payload: ReviewCreate, user: CurrentUser, db: DbSession) -> Review:
    product = _resolve_product(db, slug)
    existing = db.scalar(
        select(Review).where(Review.user_id == user.id, Review.product_id == product.id)
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already reviewed this product. Edit your existing review instead.",
        )
    review = Review(
        user_id=user.id,
        product_id=product.id,
        rating=payload.rating,
        title=payload.title.strip(),
        body=payload.body.strip(),
        is_verified_purchase=_has_purchased(db, user.id, product.id),
    )
    db.add(review)
    db.commit()
    db.refresh(review, attribute_names=["user"])
    return review


@reviews_router.put("/{review_id}", response_model=ReviewOut)
def update_review(review_id: int, payload: ReviewUpdate, user: CurrentUser, db: DbSession) -> Review:
    review = db.scalar(
        select(Review).options(selectinload(Review.user)).where(Review.id == review_id)
    )
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    if review.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your review")
    data = payload.model_dump(exclude_unset=True)
    if "title" in data and data["title"] is not None:
        review.title = data["title"].strip()
    if "body" in data and data["body"] is not None:
        review.body = data["body"].strip()
    if "rating" in data and data["rating"] is not None:
        review.rating = data["rating"]
    db.commit()
    db.refresh(review)
    return review


@reviews_router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(review_id: int, user: CurrentUser, db: DbSession) -> None:
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    if review.user_id != user.id and user.role != UserRole.OWNER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    db.delete(review)
    db.commit()
