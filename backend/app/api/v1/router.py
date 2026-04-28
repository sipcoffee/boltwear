from fastapi import APIRouter

from app.api.v1 import admin, auth, cart, categories, orders, products, reviews

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(categories.router)
api_router.include_router(products.router)
api_router.include_router(reviews.product_reviews_router)
api_router.include_router(reviews.reviews_router)
api_router.include_router(cart.router)
api_router.include_router(orders.router)
api_router.include_router(admin.router)
