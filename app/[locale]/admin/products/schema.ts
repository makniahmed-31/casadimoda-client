import { z } from "zod";

export const productSchema = z
  .object({
    name: z.string().min(1, "Product name is required"),
    slug: z.string().optional().default(""),
    category: z.string().min(1, "Category is required"),
    subCategory: z.string().min(1, "Subcategory is required"),
    brand: z.string().min(1, "Brand is required"),
    parentCategory: z.enum(["detail", "gros"]).default("detail"),
    price: z.coerce.number().positive("Price must be greater than 0"),
    discountPrice: z.coerce.number().min(0).optional().default(0),
    countInStock: z.coerce.number().min(0, "Stock cannot be negative"),
    description: z.string().min(1, "Description is required"),
    dimensions: z.string().optional().default(""),
    weight: z.string().optional().default(""),
    hsCode: z.string().optional().default(""),
    productType: z.enum(["local", "international"]).default("local"),
    currency: z.enum(["TND", "USD", "EUR"]).default("TND"),
    isFeatured: z.boolean().optional().default(false),
    cbm: z.coerce.number().optional(),
    deliveryTime: z.string().optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.productType === "international") {
      if (!data.cbm || data.cbm <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "CBM is required for international products",
          path: ["cbm"],
        });
      }
      if (!data.deliveryTime) {
        ctx.addIssue({
          code: "custom",
          message: "Shipping time is required",
          path: ["deliveryTime"],
        });
      }
    }
  });

export type ProductFormInput = {
  name: string;
  slug: string;
  category: string;
  subCategory: string;
  brand: string;
  parentCategory: "detail" | "gros";
  price: number;
  discountPrice: number;
  countInStock: number;
  description: string;
  dimensions: string;
  weight: string;
  hsCode: string;
  productType: "local" | "international";
  currency: "TND" | "USD" | "EUR";
  isFeatured: boolean;
  cbm?: number;
  deliveryTime: string;
};

export const stepFields: Record<string, (keyof ProductFormInput)[]> = {
  details: ["name", "category", "subCategory", "brand"],
  pricing: ["price", "countInStock"],
  media: ["description"],
  shipping: ["cbm", "deliveryTime"],
};
