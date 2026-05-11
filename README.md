# RentMaster — Rental Management System

A full-featured rental property management platform built with **Next.js 16**, **Clerk Auth**, **Drizzle ORM** + **PostgreSQL (Neon)**, **Tailwind CSS v4**, and **shadcn/ui**. Landlords manage tenants, bills, payments, and receipts; tenants view their bills and payment history through a dedicated portal.

---

## Features

### For Landlords

| Feature                   | Description                                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Dashboard**             | Revenue overview, collection rate, payment status pie chart, monthly trends                                       |
| **Tenant Management**     | Add, edit (name, email, phone, family size, rent, water charge), and delete tenants                               |
| **Custom Charges**        | Define per-tenant custom recurring charges (parking, maintenance, etc.)                                           |
| **Billing**               | Generate monthly bills with rent, water, electricity (meter-based), custom charges, and old pending carry-forward |
| **Partial Payments**      | Accept per-category partial payments (rent, water, electricity, custom charges)                                   |
| **Professional Receipts** | Beautiful receipt page with gradient header, amount-in-words, payment status, digital signature area              |
| **Receipt Export**        | Download as PDF, PNG image, or TXT                                                                                |
| **Receipt Sharing**       | Share PDF directly via Gmail/WhatsApp (Web Share API on mobile; link fallback on desktop)                         |
| **Payment Calendar**      | Monthly payment status view with green/amber/red indicators                                                       |
| **Tenant Portal**         | Tenants can sign up and link their account via email/phone verification                                           |

### For Tenants

| Feature          | Description                                                   |
| ---------------- | ------------------------------------------------------------- |
| **Portal**       | View linked properties, bills, and payment history            |
| **Self-Linking** | Sign up and link to your landlord's record using name + email |
| **Receipts**     | View and download/share receipts                              |

### Two-Way Confirmation

Tenant linking requires confirmation from **both parties**:

1. Landlord adds tenant → record created with `is_landlord_confirmed: true`
2. Tenant signs up and self-links → `is_tenant_confirmed: true`, `tenantUserId` set
3. Both confirmed → tenant portal is active
4. Landlord can also reject a pending link

---

## Tech Stack

| Layer          | Technology                                         |
| -------------- | -------------------------------------------------- |
| **Framework**  | Next.js 16 (App Router, Turbopack)                 |
| **Auth**       | Clerk (email/password, Google OAuth, etc.)         |
| **Database**   | PostgreSQL via Neon (serverless)                   |
| **ORM**        | Drizzle ORM                                        |
| **Styling**    | Tailwind CSS v4, shadcn/ui components              |
| **Forms**      | React Hook Form + Zod validation                   |
| **Animations** | Framer Motion                                      |
| **Charts**     | Recharts                                           |
| **PDF**        | jsPDF + html2canvas                                |
| **Testing**    | Vitest + @testing-library/react                    |
| **Linting**    | ESLint (flat config) with jsx-a11y, unused-imports |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (Neon, Supabase, or local)
- Clerk account

### Installation

```bash
git clone <repo-url>
cd rent_management_system
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Clerk (from https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Neon PostgreSQL (from https://neon.tech)
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Optional: Custom Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### Database Setup

Push the Drizzle schema to your database:

```bash
npx drizzle-kit push
```

Or generate and run migrations:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
├── app/
│   ├── actions.ts              # Server actions (CRUD for tenants, bills, payments)
│   ├── page.tsx                # Landing/marketing page
│   ├── layout.tsx              # Root layout (Clerk provider)
│   ├── error.tsx               # Global error boundary
│   ├── not-found.tsx           # 404 page
│   ├── loading.tsx             # Global loading state
│   ├── onboarding/
│   │   ├── role/page.tsx       # Role selection (landlord vs tenant)
│   │   └── link-tenant/page.tsx # Tenant self-linking form
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard sidebar + role check
│   │   ├── page.tsx            # Overview with stats + charts
│   │   ├── Charts.tsx          # Recharts components
│   │   ├── tenants/
│   │   │   ├── page.tsx        # Tenant list + add form
│   │   │   └── [id]/page.tsx   # Tenant detail (bills, payments, custom charges)
│   │   └── bills/
│   │       ├── page.tsx        # All bills table
│   │       └── [billId]/edit/page.tsx  # Edit bill
│   ├── my/
│   │   ├── layout.tsx          # Tenant portal layout
│   │   └── page.tsx            # Tenant's bills and payments
│   └── receipt/[billId]/page.tsx  # Professional receipt view
├── components/
│   ├── AddTenantForm.tsx       # Create tenant form (RHF + Zod)
│   ├── EditTenantDialog.tsx    # Edit tenant modal dialog
│   ├── LinkTenantForm.tsx      # Tenant self-linking form
│   ├── GenerateReceiptForm.tsx # Generate bill form with custom charges
│   ├── EditReceiptForm.tsx     # Edit existing bill
│   ├── EditPaymentDialog.tsx   # Edit payment modal
│   ├── CustomChargesManager.tsx # Per-tenant custom charge definitions
│   ├── PaymentCalendar.tsx     # Monthly payment status table
│   ├── ReceiptActions.tsx      # Export/Share (PDF, Image, TXT, WhatsApp, Gmail)
│   └── ui/                     # shadcn/ui components (Button, Input, Card, etc.)
├── db/
│   ├── schema.ts               # Drizzle tables (tenants, bills, payments)
│   └── index.ts                # Neon HTTP Drizzle client singleton
├── lib/
│   ├── validations.ts          # Zod schemas for all forms
│   ├── utils.ts                # cn() utility
│   ├── logger.ts               # Structured console logger
│   └── performance.ts          # Web Vitals monitoring
├── proxy.ts                    # Clerk middleware (route protection)
├── vitest.config.ts            # Vitest configuration
└── eslint.config.mjs           # ESLint flat configuration
```

---

## Database Schema

### `tenants`

| Column                  | Type               | Notes                         |
| ----------------------- | ------------------ | ----------------------------- |
| `id`                    | `serial PK`        |                               |
| `user_id`               | `text NOT NULL`    | Clerk ID of the landlord      |
| `tenant_user_id`        | `text nullable`    | Clerk ID of the linked tenant |
| `name`                  | `text NOT NULL`    | Tenant's full name            |
| `email`                 | `text nullable`    | For portal verification       |
| `phone`                 | `text nullable`    | Secondary verification        |
| `family_size`           | `integer NOT NULL` |                               |
| `base_rent`             | `decimal(10,2)`    | Monthly rent amount           |
| `water_charge`          | `decimal(10,2)`    | Monthly water charge          |
| `custom_charges`        | `jsonb`            | Array of `{ name, amount }`   |
| `is_landlord_confirmed` | `boolean`          | Landlord approved the link    |
| `is_tenant_confirmed`   | `boolean`          | Tenant confirmed the link     |
| `created_at`            | `timestamp`        |                               |

### `bills`

| Column                                            | Type         | Notes                              |
| ------------------------------------------------- | ------------ | ---------------------------------- |
| `id`                                              | `serial PK`  |                                    |
| `tenant_id`                                       | `integer FK` | References tenants                 |
| `date_start` / `date_end`                         | `text`       | Billing period                     |
| `month`                                           | `text`       | Display string                     |
| `rent_amount` / `water_amount`                    | `decimal`    | Due amounts                        |
| `electricity_prev_unit` / `electricity_curr_unit` | `integer`    | Meter readings                     |
| `electricity_amount`                              | `decimal`    | Calculated as `(curr - prev) * 10` |
| `old_pending_amount`                              | `decimal`    | Carry-forward from previous bills  |
| `custom_charges`                                  | `jsonb`      | Array of `{ name, amount, paid }`  |
| `total_amount`                                    | `decimal`    | Sum of all charges                 |
| `rent_paid` / `water_paid` / `electricity_paid`   | `decimal`    | Per-category payments              |
| `total_paid`                                      | `decimal`    | Sum of all paid                    |
| `is_paid`                                         | `boolean`    |                                    |
| `created_at`                                      | `timestamp`  |                                    |

### `payments`

| Column         | Type                  | Notes              |
| -------------- | --------------------- | ------------------ |
| `id`           | `serial PK`           |                    |
| `tenant_id`    | `integer FK`          | References tenants |
| `bill_id`      | `integer FK nullable` | References bills   |
| `amount`       | `decimal`             |                    |
| `payment_date` | `timestamp`           |                    |
| `description`  | `text`                |                    |

---

## Server Actions

All actions in `app/actions.ts`:

| Action                | Purpose                                                  |
| --------------------- | -------------------------------------------------------- |
| `createTenant`        | Insert new tenant (landlord)                             |
| `updateTenant`        | Edit tenant name, email, phone, family size, rent, water |
| `updateCustomCharges` | Set per-tenant custom charge definitions                 |
| `generateReceipt`     | Create bill with all charges and payments                |
| `updateBill`          | Edit existing bill                                       |
| `deleteBill`          | Delete bill + associated payments                        |
| `updatePayment`       | Edit payment amount/description                          |
| `deletePayment`       | Delete a single payment                                  |
| `setUserRole`         | Set Clerk `publicMetadata.role` (landlord/tenant)        |
| `linkTenantByName`    | Tenant self-links using name + email                     |
| `linkTenantAccount`   | Landlord-initiated tenant link                           |
| `confirmTenantLink`   | Landlord confirms pending tenant link                    |
| `rejectTenantLink`    | Landlord rejects tenant link request                     |
| `unlinkTenantAccount` | Remove tenant portal access                              |

---

## Testing

```bash
# Run tests
npm test

# Run in watch mode
npm run test -- --watch
```

Tests use **Vitest** with **@testing-library/react**. Test files live in `__tests__/`.

### Test Coverage

- Utility functions (`cn`, `logger`, validations)
- Zod schema validation (tenant, receipt, link-tenant, payment schemas)
- UI components (Button, Badge, Card, Input, Label, Skeleton)
- Form components (AddTenantForm, LinkTenantForm)

---

## Scripts

| Command                    | Description                |
| -------------------------- | -------------------------- |
| `npm run dev`              | Start Turbopack dev server |
| `npm run build`            | Production build           |
| `npm start`                | Start production server    |
| `npm test`                 | Run Vitest test suite      |
| `npm run lint`             | Run ESLint                 |
| `npx drizzle-kit push`     | Push schema to DB          |
| `npx drizzle-kit generate` | Generate migration SQL     |
| `npx drizzle-kit migrate`  | Apply migrations           |
| `npx tsc --noEmit`         | TypeScript type check      |

---

## Deployment

Deploy to **Vercel** (recommended):

1. Push your code to a Git repository
2. Import into Vercel
3. Set environment variables (Clerk keys, DATABASE_URL)
4. Deploy

The database schema is applied via `npx drizzle-kit push` during the build step or manually.

---

## License

MIT
