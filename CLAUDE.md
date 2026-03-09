# Casa Di Moda — Project Reference

## Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB via Mongoose
- **Auth**: NextAuth.js (JWT strategy, credentials provider)
- **Styling**: Tailwind CSS
- **i18n**: next-intl (fr, en, ar — default: fr)
- **Forms**: react-hook-form
- **Icons**: lucide-react

## Folder Structure

```
app/
  [locale]/
    (site)/          ← Public customer-facing pages
      page.tsx       (Homepage)
      layout.tsx
      cart/
      checkout/
      login/
      register/
      profile/       ← My Profile
      orders/        ← My Orders
      products/
      product/[slug]/
      search/
      wholesale/
      vip-store/
      become-supplier/
      supplier/[slug]/
    admin/           ← Admin panel (separate route group)
    fournisseur/     ← Supplier portal (separate route group)
  api/
    auth/[...nextauth]/
    user/
      profile/       ← GET/PUT user profile
      orders/        ← GET user orders
    admin/           ← Admin API routes
    supplier/        ← Supplier API routes
    products/
    search/

components/
  header/
    TopBar.tsx       ← Main nav, search, account menu, cart
  Footer.tsx
  LanguageSwitcher.tsx

models/              ← Mongoose schemas
  User.ts
  Order.ts
  Product.ts
  Brand.ts
  Category.ts
  SubCategory.ts
  Supplier.ts
  Coupon.ts
  GiftCard.ts

types/index.ts       ← TypeScript interfaces (User, Product, CartItem, etc.)
utils/
  db.ts              ← MongoDB connect/disconnect/convertDocToObj
  context/Store.tsx  ← Cart context (useStore hook)

i18n/routing.ts      ← i18n-aware Link and useRouter
messages/
  fr.json  en.json  ar.json
```

## Design System

- **Background**: dark radial gradient or `url('/bgg.webp')` for pages
- **Colors**:
  - `primary` = `#1a1a1a` (dark)
  - `secondary` = `#e8e3d3` (cream)
  - `accent` = `#c9a96e` (gold)
- **Typography**: serif for headings (`font-serif`), sans-serif for body
- **Container**: `max-w-7xl mx-auto px-4 md:px-8`
- **Buttons**: `bg-accent text-primary font-black uppercase tracking-[0.2em]`
- **Inputs**: `bg-white/5 border border-white/10 focus:border-accent py-3 px-4 text-sm text-white`
- **Labels**: `text-[10px] font-black uppercase tracking-widest text-white/40`
- **Cards**: `bg-black/40 border border-white/10`

## Page Pattern

```tsx
// Client page
"use client";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing"; // always use this, not next/link

// Server page
import db from "@/utils/db";
import SomeModel from "@/models/SomeModel";
const docs = await SomeModel.find().lean();
// Convert _id: doc._id.toString()
```

## Auth & Session

- Session has: `session.user.name`, `.email`, `._id`, `.isAdmin`, `.role`, `.supplierId`
- Roles: `"customer" | "supplier" | "admin"`
- API auth check: `const session = await getServerSession();`
- Client auth check: `const { data: session } = useSession();`
- Login page: `/login`

## State Management

- Cart state via `useStore()` from `@/utils/context/Store`
- Actions: `CART_ADD_ITEM`, `CART_REMOVE_ITEM`
- Access: `const { state, dispatch } = useStore();`
- Cart items: `state.cart.cartItems`

## i18n

- Translation hook: `const t = useTranslations("namespace");`
- Namespaces in fr.json: `common`, `nav`, `homepage`, `products`, `cart`, `checkout`, `login`, `register`, `search`, `supplier`, `admin`, `footer`, `vip`, `wholesale`
- Always use `Link` from `@/i18n/routing`, not `next/link`

## Key Existing Routes

| Route              | Description                       |
| ------------------ | --------------------------------- |
| `/`                | Homepage with hero carousel       |
| `/products`        | Product listing with filters      |
| `/product/[slug]`  | Product detail                    |
| `/cart`            | Shopping cart                     |
| `/checkout`        | Checkout page                     |
| `/login`           | Login                             |
| `/register`        | Register                          |
| `/profile`         | User profile (edit name/password) |
| `/orders`          | User order history                |
| `/search`          | Search results                    |
| `/wholesale`       | Wholesale B2B page                |
| `/vip-store`       | VIP store page                    |
| `/become-supplier` | Supplier application              |
| `/supplier/[slug]` | Supplier storefront               |
| `/admin`           | Admin dashboard                   |
| `/fournisseur`     | Supplier portal                   |

## API Routes

| Route                     | Methods             | Description              |
| ------------------------- | ------------------- | ------------------------ |
| `/api/auth/[...nextauth]` | GET/POST            | NextAuth                 |
| `/api/auth/register`      | POST                | Register user            |
| `/api/user/profile`       | GET/PUT             | User profile             |
| `/api/user/orders`        | GET                 | User orders              |
| `/api/products`           | GET                 | Public products          |
| `/api/search`             | GET                 | Search (`?q=&pageSize=`) |
| `/api/admin/*`            | GET/POST/PUT/DELETE | Admin CRUD               |
| `/api/supplier/*`         | GET/POST/PUT        | Supplier CRUD            |

## Currency & Locale

- Currency: TND (Tunisian Dinar)
- Price display: `price.toLocaleString() + " TND"`
- Brand: "Casa Di Moda" / "CASA DI MODA"

##Users

Role Email Password
Admin admin@casadimoda.com admin123
Supplier supplier@casadimoda.com supplier123
Customer client@casadimoda.com client123
Products (8 total)

parentCategory Added by Product
detail admin Robe de Soirée Versace Noire — 2 890 TND
detail admin Sac Hermès Birkin 30 Togo — 12 500 TND
gros admin Lot 12 T-Shirts Premium — 1 200 TND
gros admin Collection Écharpes Soie Lot 6 — 650 TND
detail supplier Sneakers Balenciaga Triple S — 820 TND
detail supplier Montre Rolex Submariner — 18 500 TND
gros supplier Lot Vestes Cuir Agneau 8 pcs — 4 200 TND
gros supplier Lot Sneakers Running 24 paires — 2 400 TND
Order — Sophie Martin, 1 detail + 1 gros item, 4 090 TND, paiement à la livraison.

Run again anytime with npm run seed (it deletes and recreates these records safely).
