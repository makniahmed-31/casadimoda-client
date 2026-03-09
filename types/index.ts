export interface Brand {
  _id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
}

export interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  parentCategory: string;
  description: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  isActive: boolean;
  expiryDate?: string;
  maxUsage?: number | null;
  usageCount?: number;
}

export interface GiftCard {
  _id: string;
  code: string;
  amount: number;
  balance: number;
  isActive: boolean;
}

export interface CartVariation {
  color: string;
  size: string;
  quantity: number;
}

export interface CartItem {
  name: string;
  slug: string;
  image: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  countInStock: number;
  selectedSize?: string;
  selectedColor?: string;
  sizes?: string[];
  colors?: string[];
  parentCategory?: "detail" | "gros";
  variations?: CartVariation[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  price: number;
  discountPrice: number;
  sizes: string[];
  colors: string[];
  colorImages?: { color: string; hex: string; image: string }[];
  parentCategory: "detail" | "gros";
  countInStock: number;
  image: string;
  description: string;
  subCategory: string;
  rating: number;
  numReviews: number;
  deliveryTime?: string;
  dimensions?: string;
  weight?: string;
  cbm?: number;
  hsCode?: string;
  isFeatured?: boolean;
  supplier?: string | Supplier;
  approvalStatus?: "pending" | "approved" | "rejected";
  approvalNote?: string;
  addedBy?: "admin" | "supplier";
}

export type CategoryFormData = {
  name: string;
  description: string;
};

export type SubCategoryFormData = {
  name: string;
  parentCategory: string;
  description: string;
};

export type GiftCardFormData = {
  _id: string;
  code: string;
  amount: number;
  balance: number;
  isActive: boolean;
};

export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  role: "customer" | "supplier" | "admin";
  supplierId?: string;
  createdAt: string;
}

export interface SupplierAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Supplier {
  _id: string;
  user: string | User;
  businessName: string;
  businessSlug: string;
  businessDescription?: string;
  businessLogo?: string;
  businessBanner?: string;
  contactPhone: string;
  contactEmail: string;
  address: SupplierAddress;
  taxId?: string;
  businessLicense?: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  commissionRate: number;
  totalSales: number;
  totalProducts: number;
  rating: number;
  numReviews: number;
  createdAt: string;
  updatedAt: string;
}
