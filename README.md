# MySawit Frontend

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install dependencies and run the development server:

```bash
pnpm install
pnpm dev
```

Other available scripts:

```bash
pnpm build   # Production build
pnpm start   # Start production server
pnpm lint    # Run ESLint
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Project Structure

This project follows a **feature-based architecture** using the Next.js **App Router**.  
Instead of grouping files by type (e.g., all components or hooks together), files are grouped by **domain features** such as authentication, harvest, delivery, etc.

This makes the codebase easier to navigate and scale because all logic related to a feature lives in one place.

### High-Level Structure

```
├── app/          # Next.js App Router pages
├── components/   # Shared UI components
├── features/     # Feature modules (auth, harvest, delivery, etc.)
├── lib/          # Utility functions
├── services/     # API client configuration
└── types/        # Global TypeScript types
```

Each directory has a specific responsibility.

## `app/` – Application Routes

The `app` directory follows the **Next.js App Router** convention. Each folder inside `app` represents a route in the application.

```
app/
├── auth/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── dashboard/
│   └── page.tsx
├── harvest/
│   └── page.tsx
├── delivery/
│   └── page.tsx
├── payment/
│   └── page.tsx
└── plantation/
    └── page.tsx
```

These correspond to routes such as:
- `/auth/login`
- `/auth/register`
- `/dashboard`
- `/harvest`
- `/delivery`
- `/payment`
Pages inside `app/` are responsible for **rendering the UI and composing components**, while the business logic lives in `features/`.

## `features/` – Feature Modules

The `features` directory contains **business logic grouped by domain features**.

Each feature typically contains:

- API calls
- Hooks
- Types
- Feature-specific components

Example:

```
features/auth/
├── api.ts
├── hooks.ts
├── useAuth.ts
├── types.ts
└── components/
    ├── LoginForm.tsx
    └── RegisterForm.tsx
```

### Typical responsibilities

| File | Purpose |
|-----|------|
| `api.ts` | API requests related to the feature |
| `hooks.ts` | Feature-specific React hooks |
| `types.ts` | TypeScript types for the feature |
| `components/` | UI components specific to the feature |

Other features follow the same structure:

```
features/
├── auth/
├── delivery/
├── harvest/
├── payment/
└── plantation/
```

This pattern makes it easy to understand and maintain each domain independently.

---

# `components/` – Shared UI Components

The `components` directory contains **reusable UI components used across multiple features**.

```
components/
├── common/
│   └── Loader.tsx
├── layout/
│   ├── Navbar.tsx
│   └── Sidebar.tsx
└── ui/
    ├── Button.tsx
    └── Input.tsx
```

### Component categories

| Folder | Purpose |
|------|------|
| `ui` | Basic reusable UI elements |
| `layout` | Application layout components |
| `common` | Shared components used in multiple pages |

---

# `lib/` – Utility Functions

The `lib` directory contains **helper functions and utilities** used across the application.

Example:

```
lib/
└── utils.ts
```

Utilities might include:

- formatting helpers
- small reusable functions
- shared logic not tied to a specific feature

---

# `services/` – API Client

The `services` directory contains the **central API configuration**, such as the Axios client used by the feature modules.

Example:

```
services/
└── apiClient.ts
```

This allows all API calls in the application to share the same configuration (base URL, headers, interceptors, etc.).

---

# `types/` – Global TypeScript Types

The `types` directory contains **shared TypeScript definitions** used across multiple features.

Example:

```
types/
└── global.ts
```

Feature-specific types are usually stored inside their respective feature folder.

---

# Architecture Philosophy

This project follows a **feature-first architecture** where each domain is self-contained.

Benefits include:

- Easier navigation
- Better scalability as the project grows
- Clear separation of concerns
- Improved maintainability for teams

When adding a new feature, create a new folder inside `features/` and follow the same structure.