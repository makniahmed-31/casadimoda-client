# Casa Di Moda — Claude Context

## Stack
Next.js 15 App Router · TypeScript · MongoDB/Mongoose · NextAuth.js JWT · Tailwind CSS · next-intl (fr/en/ar, default: fr) · lucide-react

## Roles
| Role | Portal | Login |
|------|--------|-------|
| admin | /admin | admin@casadimoda.com / admin123 |
| supplier | /fournisseur | supplier@casadimoda.com / supplier123 |
| customer | / | client@casadimoda.com / client123 |
| transporter | /transporter | rapidpost@casadimoda.com / transporter123 |
| transporter | /transporter | aramex@casadimoda.com / transporter123 |
| transporter | /transporter | dhl@casadimoda.com / transporter123 |

After login each role is redirected to its portal (login page: app/[locale]/(site)/login/page.tsx).

## Transporter Feature (built across sessions)

### Models
- `models/Order.ts` — added: `transporter` (ObjectId ref User), `isConfirmedByClient` (Boolean), `confirmedAt` (Date)
- `models/User.ts` — added role `"transporter"` to enum, added `transporterCompanyId` (ObjectId ref TransporterCompany)
- `models/TransporterCompany.ts` — NEW: companyName, companySlug, description, logo, phone, contactEmail, website, trackingUrl, address, coverageAreas, status

### API Routes
| Route | Methods | Description |
|-------|---------|-------------|
| /api/transporter/orders | GET, PUT | Transporter: list orders (active/mine/delivered), pick/release/mark paid/delivered |
| /api/admin/transporters | GET, POST | List all transporters with company info; create new company + user |
| /api/admin/transporters/[id] | PUT, DELETE | Update or delete a transporter company + its user |
| /api/admin/orders | GET, PUT | Added: transporterId assignment, assignedBadge status |
| /api/user/orders | GET, POST, PUT | Added: confirmReception (client confirms delivery) |

### Transporter Portal (app/[locale]/transporter/)
- `layout.tsx` — sidebar with Truck icon, sign out
- `page.tsx` — 3 tabs: "All active" / "Mine" / "Delivered"
  - Unassigned orders: "Pick up" button to self-assign
  - Assigned to me: "Mark delivered", "Mark paid", "Release" buttons
  - Shows client confirmed badge

### Admin Orders Page Changes
- Transporter assignment section: shows select+assign when unassigned, shows name+Retirer when assigned
- "Assignée" gold badge in order row when transporter assigned but not yet delivered
- Transporter dropdown shows: companyName — phone (city)

### Admin Shipping Page (app/[locale]/admin/transporters/page.tsx)
- Full CRUD: create company+user, edit company, delete company+user
- Cards show logo, phone, email, address, coverage zones, tracking link

### Client Orders Page
- "Confirm reception" button appears when isDelivered && !isConfirmedByClient
- Calls PUT /api/user/orders with { confirmReception: true }

### Seed
Run `npm run seed` to create all users + 3 Tunisian shipping companies.
File: scripts/seed.ts — imports TransporterCompany, creates 3 transporter users linked to companies.

## Shipping Companies (seeded)
| Company | Email | Phone | Address |
|---------|-------|-------|---------|
| Postes Tunisiennes – Rapid Post | rapidpost@casadimoda.com | +216 71 847 000 | 9 Rue Hedi Nouira, Tunis 1001 |
| Aramex Tunisia | aramex@casadimoda.com | +216 70 027 272 | Immeuble Iris, Centre Urbain Nord, Tunis 1082 |
| DHL Express Tunisia | dhl@casadimoda.com | +216 71 168 168 | Zone Fret, Aéroport Tunis-Carthage, Tunis 1080 |

## Translation Namespaces Added
- `transporter` — added to fr/en/ar (transporter portal labels)
- `admin.shipping`, `admin.assignTransporter`, `admin.noTransporter`, `admin.assign`, `admin.unassign`, `admin.assignedBadge` — added to fr/en/ar
- `orders.confirmReception`, `orders.receptionConfirmed` — added to fr/en/ar

## Key Patterns
- Always import model files in API routes that use `.populate()` to ensure Mongoose registers them: `import "@/models/TransporterCompany"`
- `getServerSession()` is called without authOptions throughout (works via NEXTAUTH_SECRET)
- `apiFetch` from `@/utils/api` wraps fetch with `credentials: "include"`
- Select elements use `bg-[#1a1a1a] [&>option]:bg-[#1a1a1a] [&>option]:text-white` for visible options in dark UI
- i18n Link always from `@/i18n/routing`, never `next/link`
