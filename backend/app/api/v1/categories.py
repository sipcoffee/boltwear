from fastapi import APIRouter, HTTPException, status
from slugify import slugify
from sqlalchemy import select

from app.api.deps import DbSession, OwnerUser
from app.models.catalog import Category
from app.schemas.catalog import CategoryCreate, CategoryOut, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["categories"])


def _unique_slug(db, name: str, ignore_id: int | None = None) -> str:
    base = slugify(name) or "category"
    candidate = base
    n = 1
    while True:
        stmt = select(Category).where(Category.slug == candidate)
        if ignore_id is not None:
            stmt = stmt.where(Category.id != ignore_id)
        if db.scalar(stmt) is None:
            return candidate
        n += 1
        candidate = f"{base}-{n}"


@router.get("", response_model=list[CategoryOut])
def list_categories(db: DbSession) -> list[Category]:
    return list(db.scalars(select(Category).order_by(Category.name)))


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryCreate, db: DbSession, _: OwnerUser) -> Category:
    category = Category(
        name=payload.name,
        description=payload.description,
        slug=_unique_slug(db, payload.name),
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/{category_id}", response_model=CategoryOut)
def update_category(category_id: int, payload: CategoryUpdate, db: DbSession, _: OwnerUser) -> Category:
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    if payload.name is not None and payload.name != category.name:
        category.name = payload.name
        category.slug = _unique_slug(db, payload.name, ignore_id=category.id)
    if payload.description is not None:
        category.description = payload.description
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: DbSession, _: OwnerUser) -> None:
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    if category.products:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete category with products. Reassign or delete products first.",
        )
    db.delete(category)
    db.commit()
