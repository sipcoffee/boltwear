# BoltWear

A full-stack apparel ecommerce MVP. Customers browse the storefront, add to cart, and check out. The owner manages the catalog and fulfills orders.

## Stack

**Backend:** Python 3.11+, FastAPI, SQLAlchemy 2 (sync), Alembic, PostgreSQL, JWT auth
**Frontend:** Vite, React 18, TypeScript, Tailwind CSS, shadcn-style UI, React Query, Axios, Zustand, React Hook Form + Zod

## Project layout

```
BoltWear/
├── backend/
│   ├── app/
│   │   ├── api/v1/      # Routers: auth, products, categories, cart, orders, admin
│   │   ├── core/        # Config, DB, security
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── main.py
│   │   └── seed.py      # Owner + sample products
│   ├── alembic/
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/  # ui/ primitives + layout + product cards
    │   ├── hooks/       # React Query wrappers
    │   ├── lib/         # api client, utils
    │   ├── pages/       # Storefront + admin pages
    │   ├── stores/      # Zustand auth store
    │   └── types/       # API types
    ├── package.json
    └── tailwind.config.js
```

## Prerequisites

- Python 3.11+
- Node 18+ and npm
- A running PostgreSQL instance (local or Docker)

```bash
# Optional: spin up Postgres in Docker
docker run --name boltwear-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=boltwear -p 5432:5432 -d postgres:16
```

## Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env — set DATABASE_URL, SECRET_KEY, OWNER_PASSWORD

# Generate the initial migration from the models, then apply it
alembic revision --autogenerate -m "initial schema"
alembic upgrade head

# Seed the owner user + sample categories/products
python -m app.seed

# Start the API
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env       # VITE_API_URL=http://localhost:8000/api/v1
npm run dev
```

App: http://localhost:5173

## Default credentials

The seed script creates an owner from `.env`:

- Email: `owner@boltwear.local` (default)
- Password: `ChangeMe123!` (default — change this in `.env` before seeding for any non-toy use)

Clients sign up at `/register`. The owner sees the **Admin** link in the nav and can manage products, categories, orders, and users at `/admin`.

## API overview

| Route | Method | Auth | Notes |
|-------|--------|------|-------|
| `/auth/register` | POST | — | Creates a CLIENT user, returns JWT |
| `/auth/login` | POST | — | Returns JWT |
| `/auth/me` | GET | user | Current user |
| `/categories` | GET | — | List all |
| `/categories` | POST/PUT/DELETE | owner | CRUD |
| `/products` | GET | — | Filters: `category`, `q`, `page`, `page_size`, `include_inactive` |
| `/products/{slug}` | GET | — | Detail with variants |
| `/products` | POST | owner | Create with variants |
| `/products/{id}` | PUT/DELETE | owner | Update/delete |
| `/products/{id}/variants` | POST | owner | Add variant |
| `/products/{id}/variants/{vid}` | PUT/DELETE | owner | Update/delete variant |
| `/cart` | GET/DELETE | user | View / clear |
| `/cart/items` | POST | user | Add or merge |
| `/cart/items/{id}` | PUT/DELETE | user | Update qty / remove |
| `/orders` | POST | user | Checkout from cart (decrements stock, snapshots line items) |
| `/orders` | GET | user | Own orders (`?all_users=true` for owner) |
| `/orders/{id}` | GET | user | Own; owner sees any |
| `/orders/{id}/status` | PATCH | owner | Move through PENDING → PAID → SHIPPED → DELIVERED / CANCELLED |
| `/admin/stats` | GET | owner | Dashboard counters |
| `/admin/users` | GET | owner | List users |
| `/admin/products/{id}` | GET | owner | Fetch by ID for editing |

## Reviews & ratings (post-MVP)

Customers can rate and review products. Highlights:

- **One review per user per product** (enforced by a unique constraint).
- **Verified purchase** badge — set when the review is created if the user has any non-cancelled order containing a variant of that product.
- **Aggregate rating** rolled up into the product list and detail responses (`average_rating`, `review_count`) via a single subquery, so cards and the storefront show stars without an extra round-trip.
- **Owners** can delete any review for moderation.

### Endpoints

| Route | Method | Auth | Notes |
|-------|--------|------|-------|
| `/products/{slug}/reviews` | GET | — | Sortable by `recent` / `highest` / `lowest` |
| `/products/{slug}/reviews/summary` | GET | — | Avg + count + 1–5 distribution |
| `/products/{slug}/reviews/mine` | GET | user | Returns 404 if the user hasn't reviewed it |
| `/products/{slug}/reviews` | POST | user | Creates; rejects duplicates with 409 |
| `/reviews/{id}` | PUT | user | Author only |
| `/reviews/{id}` | DELETE | user | Author or owner |

### Applying the migration

After pulling the reviews code, regenerate the schema:

```bash
cd backend
alembic revision --autogenerate -m "add reviews"
alembic upgrade head
```

If you previously seeded the DB, no further action is needed — existing products simply have zero reviews.

## Next steps

- **Payments** are not integrated; checkout creates a `PENDING` order. Wire Stripe (or similar) into the `POST /orders` flow when ready.
- **Image uploads** use plain URLs in this MVP. Plug in S3/Cloudinary and swap the URL field for an upload component.
- **Email notifications** are not implemented. Consider hooking into order status updates.
- **Stock control** is decremented on checkout. There's no compensation if a `CANCELLED` order should restock — add that if needed.
- **Review moderation** — there's no admin UI for reviews; owners can delete via API. A `/admin/reviews` view would be the natural follow-up.
