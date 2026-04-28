"""Seed the database with the owner user and a few sample products.

Run with: python -m app.seed
"""
from decimal import Decimal

from slugify import slugify
from sqlalchemy import select

from app.core.config import settings
from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.catalog import Category, Product, ProductVariant
from app.models.user import User, UserRole


SAMPLE_CATEGORIES = [
    {"name": "T-Shirts", "description": "Premium cotton tees"},
    {"name": "Hoodies", "description": "Cozy hooded sweatshirts"},
    {"name": "Jeans", "description": "Denim for everyday"},
    {"name": "Jackets", "description": "Outerwear for every season"},
]

SAMPLE_PRODUCTS = [
    {
        "name": "Bolt Classic Tee",
        "category": "T-Shirts",
        "description": "A breathable, slim-fit cotton tee with the BoltWear emblem.",
        "base_price": "24.00",
        "compare_at_price": "32.00",
        "images": [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
        ],
        "variants": [
            {"size": "S", "color": "Black", "stock": 25},
            {"size": "M", "color": "Black", "stock": 40},
            {"size": "L", "color": "Black", "stock": 30},
            {"size": "M", "color": "White", "stock": 20},
            {"size": "L", "color": "White", "stock": 15},
        ],
    },
    {
        "name": "Storm Hoodie",
        "category": "Hoodies",
        "description": "Heavyweight fleece hoodie with kangaroo pocket.",
        "base_price": "68.00",
        "compare_at_price": None,
        "images": [
            "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
        ],
        "variants": [
            {"size": "S", "color": "Charcoal", "stock": 12},
            {"size": "M", "color": "Charcoal", "stock": 18},
            {"size": "L", "color": "Charcoal", "stock": 14},
            {"size": "XL", "color": "Charcoal", "stock": 8},
        ],
    },
    {
        "name": "Volt Slim Jean",
        "category": "Jeans",
        "description": "Stretch denim with a tailored modern fit.",
        "base_price": "82.00",
        "compare_at_price": "98.00",
        "images": [
            "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
        ],
        "variants": [
            {"size": "30", "color": "Indigo", "stock": 10},
            {"size": "32", "color": "Indigo", "stock": 14},
            {"size": "34", "color": "Indigo", "stock": 12},
            {"size": "32", "color": "Black", "stock": 9},
        ],
    },
    {
        "name": "Charge Bomber Jacket",
        "category": "Jackets",
        "description": "Lightweight bomber with ribbed cuffs and stand collar.",
        "base_price": "129.00",
        "compare_at_price": None,
        "images": [
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800",
        ],
        "variants": [
            {"size": "M", "color": "Olive", "stock": 7},
            {"size": "L", "color": "Olive", "stock": 5},
            {"size": "M", "color": "Black", "stock": 6},
        ],
    },
]


def main() -> None:
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        owner = db.scalar(select(User).where(User.email == settings.OWNER_EMAIL))
        if not owner:
            owner = User(
                email=settings.OWNER_EMAIL,
                hashed_password=hash_password(settings.OWNER_PASSWORD),
                full_name=settings.OWNER_NAME,
                role=UserRole.OWNER,
            )
            db.add(owner)
            print(f"Created owner: {settings.OWNER_EMAIL}")

        category_map: dict[str, Category] = {}
        for cat_data in SAMPLE_CATEGORIES:
            existing = db.scalar(select(Category).where(Category.name == cat_data["name"]))
            if existing:
                category_map[cat_data["name"]] = existing
                continue
            cat = Category(name=cat_data["name"], description=cat_data["description"], slug=slugify(cat_data["name"]))
            db.add(cat)
            db.flush()
            category_map[cat.name] = cat

        sku_counter = 1000
        for prod_data in SAMPLE_PRODUCTS:
            existing = db.scalar(select(Product).where(Product.name == prod_data["name"]))
            if existing:
                continue
            product = Product(
                name=prod_data["name"],
                slug=slugify(prod_data["name"]),
                description=prod_data["description"],
                base_price=Decimal(prod_data["base_price"]),
                compare_at_price=Decimal(prod_data["compare_at_price"]) if prod_data["compare_at_price"] else None,
                category_id=category_map[prod_data["category"]].id,
                images=prod_data["images"],
                is_active=True,
            )
            for v in prod_data["variants"]:
                sku_counter += 1
                product.variants.append(
                    ProductVariant(
                        size=v["size"],
                        color=v["color"],
                        sku=f"BW-{sku_counter}",
                        stock=v["stock"],
                    )
                )
            db.add(product)

        db.commit()
        print("Seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
