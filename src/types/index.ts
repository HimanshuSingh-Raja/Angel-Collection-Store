export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  type: 'SHIPPING' | 'BILLING';
  name: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  isFeatured?: boolean;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isFeatured?: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size?: string;
  color?: string;
  colorHex?: string;
  sku?: string;
  price?: number;
  stock: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  position: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  barcode?: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
  categoryId: string;
  category?: Category;
  subcategoryId?: string;
  subcategory?: Subcategory;
  brandId?: string;
  brand?: Brand;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  tags?: string;
  rating: number;
  reviewCount: number;
  images: ProductImage[];
  variants?: ProductVariant[];
  colors?: string[];
  sizes?: string[];
  materials?: string[];
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'FLAT' | 'PERCENTAGE';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit?: number;
  timesUsed: number;
  isFirstOrderOnly: boolean;
  isActive: boolean;
  expiresAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED';

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: 'RAZORPAY' | 'COD';
  shippingAddress: Address;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  couponCode?: string;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerified: boolean;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  adminReply?: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  link?: string;
  category: 'HERO_SLIDER' | 'OFFER_BANNER' | 'FESTIVAL_BANNER' | 'COLLECTION_BANNER' | 'POPUP_BANNER';
  position: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorName: string;
  authorAvatar?: string;
  category: string;
  tags?: string;
  readTime: string;
  isPublished: boolean;
  publishedAt: string;
  commentsCount?: number;
}

export interface Comment {
  id: string;
  blogId: string;
  userName: string;
  userEmail: string;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export interface FilterState {
  category: string;
  subcategory: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  colors: string[];
  sizes: string[];
  rating: number;
  inStockOnly: boolean;
  onSaleOnly: boolean;
  sortBy: 'newest' | 'popularity' | 'price-low' | 'price-high' | 'rating';
  searchQuery: string;
}
