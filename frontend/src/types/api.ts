export type UserRole = "CLIENT" | "OWNER";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  size: string;
  color: string;
  sku: string;
  stock: number;
  price_override: string | null;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  base_price: string;
  compare_at_price: string | null;
  images: string[];
  is_active: boolean;
  category: Category;
  average_rating: number | null;
  review_count: number;
}

export interface ProductDetail extends ProductListItem {
  description: string;
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface Reviewer {
  id: number;
  full_name: string;
}

export interface Review {
  id: number;
  rating: number;
  title: string;
  body: string;
  is_verified_purchase: boolean;
  created_at: string;
  user: Reviewer;
}

export interface ReviewSummary {
  average_rating: number | null;
  review_count: number;
  distribution: Record<string, number>;
}

export interface ProductListResponse {
  items: ProductListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface CartItemVariant {
  id: number;
  product_id: number;
  size: string;
  color: string;
  sku: string;
  stock: number;
}

export interface CartItem {
  id: number;
  quantity: number;
  unit_price: string;
  line_total: string;
  product_name: string;
  product_slug: string;
  product_image: string | null;
  variant: CartItemVariant;
}

export interface Cart {
  items: CartItem[];
  subtotal: string;
  item_count: number;
}

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface OrderItem {
  id: number;
  variant_id: number;
  product_name: string;
  variant_size: string;
  variant_color: string;
  unit_price: string;
  quantity: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  subtotal: string;
  shipping: string;
  total: string;
  shipping_name: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_postal: string;
  shipping_country: string;
  notes: string | null;
  created_at: string;
  items: OrderItem[];
}

export interface OrderListItem {
  id: number;
  order_number: string;
  status: OrderStatus;
  total: string;
  created_at: string;
  item_count: number;
}

export interface AdminStats {
  total_revenue: string;
  total_orders: number;
  pending_orders: number;
  total_products: number;
  total_clients: number;
  recent_orders: OrderListItem[];
}
