# MySawit UI Page Specification

This document defines the UI structure, routing, user flows, and API integration points for the MySawit frontend.

**Modules:** `auth` · `users` · `plantation` · `harvest` · `delivery` · `payment` · `notifications`

**Goals:**

- Consistent navigation
- Predictable page responsibilities
- Alignment between frontend and backend
- Clarity for all developers in the team

---

## 1. User Roles

| Role   | Description              |
| ------ | ------------------------ |
| Admin  | System administrator     |
| Buruh  | Plantation worker        |
| Mandor | Field supervisor         |
| Supir  | Delivery truck driver    |

Each role has different UI access and navigation.

---

## 2. Application Layout

All authenticated pages follow the same layout:

```
┌──────────────────────────────────┐
│            Navbar                │
├──────────┬───────────────────────┤
│          │                       │
│ Sidebar  │   Main Content Area   │
│          │                       │
└──────────┴───────────────────────┘
```

**Components:**

```
components/layout/
  Navbar.tsx
  Sidebar.tsx
```

---

## 3. Route Structure

All pages are inside `app/`.

```
app/
├── auth/
├── dashboard/
├── users/
├── plantation/
├── harvest/
├── delivery/
├── payment/
└── notifications/
```

| Route         | URL              |
| ------------- | ---------------- |
| Login         | `/auth/login`    |
| Register      | `/auth/register` |
| Dashboard     | `/dashboard`     |
| Users         | `/users`         |
| Plantation    | `/plantation`    |
| Harvest       | `/harvest`       |
| Delivery      | `/delivery`      |
| Payment       | `/payment`       |
| Notifications | `/notifications` |

---

## 4. Authentication Pages

### 4.1 Login

- **Route:** `/auth/login`
- **Roles:** Public
- **Component:** `features/auth/components/LoginForm`
- **Fields:** `email`, `password`
- **API:** `POST /auth/login`
- **Response:**
  ```json
  { "token": "...", "user": "...", "role": "..." }
  ```
- **Redirect:** `/dashboard`

### 4.2 Register

- **Route:** `/auth/register`
- **Component:** `features/auth/components/RegisterForm`
- **Fields (common):** `name`, `email`, `password`
- **Fields (Mandor):** `certificationNumber`
- **API:** `POST /auth/register`

---

## 5. Dashboard

- **Route:** `/dashboard`
- **Components:** `DashboardOverview`, `RecentActivity`, `StatsCards`
- **API:** `GET /dashboard/summary`

**Role Behavior:**

| Role   | Widgets                                                            |
| ------ | ------------------------------------------------------------------ |
| Admin  | Total users, total plantations, pending shipments, pending payroll |
| Buruh  | Today harvest status, payroll summary, wallet balance              |
| Mandor | Pending harvest validation, active shipments                       |
| Supir  | Assigned deliveries, shipment status                               |

---

## 6. Users Module

- **Route:** `/users`
- **Service:** `mysawit-auth`

### 6.1 User List

- **Roles:** Admin
- **Route:** `/users`
- **Components:** `UserTable`, `RoleFilter`, `SearchBar`
- **Table columns:** name, email, role, status, actions
- **API:** `GET /users`

### 6.2 User Detail

- **Route:** `/users/[id]`
- **Info:** name, email, role, assigned plantation, harvest history, shipment history, payroll history
- **API:** `GET /users/{id}`

---

## 7. Plantation Module

- **Route:** `/plantation`
- **Service:** `mysawit-plantation`

### 7.1 Plantation List

- **Roles:** Admin
- **Components:** `PlantationTable`, `SearchFilter`, `CreatePlantationButton`
- **Table columns:** name, code, size, assigned mandor, actions
- **API:** `GET /plantations`

### 7.2 Create Plantation

- **Route:** `/plantation/create`
- **Fields:** `name`, `code`, `size`, `coordinates` (4 points)
- **API:** `POST /plantations`

### 7.3 Plantation Detail

- **Route:** `/plantation/[id]`
- **Components:** `PlantationDetail`, `MandorAssignment`, `SupirAssignment`
- **Info:** plantation info, assigned mandor, assigned supir
- **API:** `GET /plantations/{id}`

### 7.4 Assign Mandor

- **API:** `POST /plantations/{id}/assign-mandor`
- **Payload:** `{ mandorId }`

### 7.5 Assign Supir

- **API:** `POST /plantations/{id}/assign-driver`
- **Payload:** `{ driverId }`

### 7.6 Update Plantation

- **Route:** `/plantation/[id]/edit`
- **Fields:** `name`, `code`, `size`, `coordinates` (4 points)
- **API:** `PUT /plantations/{id}`

### 7.7 Delete Plantation

- **API:** `DELETE /plantations/{id}`
- **Constraint:** Plantation cannot be deleted if a mandor is still assigned.

---

## 8. Harvest Module

- **Route:** `/harvest`
- **Service:** `mysawit-harvest`

### 8.1 Submit Harvest

- **Role:** Buruh
- **Components:** `HarvestForm`, `PhotoUploader`
- **Fields:** `date`, `weight` (kg), `description`, `photos`
- **Rule:** A buruh can only submit **one harvest report per day**. If a report already exists for the current date, the form must be disabled.
- **API:** `POST /harvest`
- **Payload:**
  ```json
  { "date": "...", "weight": 0, "description": "...", "photos": [] }
  ```

### 8.2 Harvest History

- **Route:** `/harvest/history`
- **Components:** `HarvestTable`, `FilterPanel`
- **API:** `GET /harvest`

### 8.3 Harvest Validation

- **Role:** Mandor
- **Route:** `/harvest/validation`
- **Components:** `HarvestValidationTable`, `HarvestDetail`, `ApproveRejectModal`
- **API:**

| Action  | Endpoint                      | Payload      |
| ------- | ----------------------------- | ------------ |
| List    | `GET /harvest/pending`        | —            |
| Approve | `POST /harvest/{id}/approve`  | —            |
| Reject  | `POST /harvest/{id}/reject`   | `{ reason }` |

---

## 9. Delivery Module

- **Route:** `/delivery`
- **Service:** `mysawit-delivery`

**Delivery Status Lifecycle:**

```
Created → Memuat → Mengirim → Tiba di Tujuan → Approved
```

> Mandor must confirm arrival before admin approval can proceed.

### 9.1 Create Shipment

- **Role:** Mandor
- **Route:** `/delivery/create`
- **Components:** `ShipmentForm`, `HarvestSelector`, `DriverSelector`, `WeightSummary`
- **Rule:** Maximum shipment weight **400 kg**
- **API:** `POST /deliveries`
- **Payload:** `{ driverId, harvestIds }`

### 9.2 Delivery List

- **Route:** `/delivery`
- **Roles:** Mandor, Supir, Admin
- **API:** `GET /deliveries`

### 9.3 Delivery Detail

- **Route:** `/delivery/[id]`
- **API:** `GET /deliveries/{id}`

### 9.4 Update Shipment Status

- **Role:** Supir
- **Status flow:** `Memuat` → `Mengirim` → `Tiba di Tujuan`
- **API:** `PATCH /deliveries/{id}/status`
- **Payload:** `{ status }`

### 9.5 Mandor Shipment Approval

| Action  | Endpoint                                |
| ------- | --------------------------------------- |
| Approve | `POST /deliveries/{id}/mandor-approve`  |
| Reject  | `POST /deliveries/{id}/mandor-reject`   |

### 9.6 Admin Shipment Approval

| Action         | Endpoint                                      | Payload                      |
| -------------- | --------------------------------------------- | ---------------------------- |
| Approve        | `POST /deliveries/{id}/admin-approve`         | —                            |
| Reject         | `POST /deliveries/{id}/admin-reject`          | —                            |
| Partial reject | `POST /deliveries/{id}/admin-partial-reject`  | `{ acceptedWeight, reason }` |

---

## 10. Payment Module

- **Route:** `/payment`
- **Service:** `mysawit-payment`

> Payroll records are automatically generated after an admin approves a shipment.

### 10.1 Payroll List

- **Roles:** All
- **Components:** `PayrollTable`, `StatusFilter`
- **API:** `GET /payroll`

### 10.2 Payroll Detail

- **Route:** `/payment/[id]`
- **API:** `GET /payroll/{id}`

### 10.3 Admin Payroll Approval

| Action  | Endpoint                     |
| ------- | ---------------------------- |
| Approve | `POST /payroll/{id}/approve` |
| Reject  | `POST /payroll/{id}/reject`  |

---

## 11. Wallet

- **Route:** `/payment/wallet`
- **Components:** `WalletBalance`, `TransactionHistory`, `TopUpForm`
- **Conversion rate:** 1 SawitDollar = Rp10.000

> Admin wallet is used to pay payroll to workers. Payroll approval deducts the amount from the admin wallet.

| Action  | Endpoint             | Payload      |
| ------- | -------------------- | ------------ |
| Balance | `GET /wallet`        | —            |
| Top Up  | `POST /wallet/topup` | `{ amount }` |

---

## 12. Notifications

- **Route:** `/notifications`
- **Service:** `mysawit-notification`

> Notifications can be generated by system events or admin actions (e.g. harvest rejected, shipment assigned, payroll approved).

| Action    | Endpoint                         |
| --------- | -------------------------------- |
| List      | `GET /notifications`             |
| Mark read | `PATCH /notifications/{id}/read` |

---

## 13. Core System Workflow

```
Buruh submit harvest
        ↓
Mandor validates harvest
        ↓
Mandor creates shipment
        ↓
Supir delivers shipment
        ↓
Supir marks arrival
        ↓
Mandor confirms arrival
        ↓
Admin approves shipment
        ↓
Payroll generated
```

---

## 14. Feature to Frontend Mapping

| Feature    | Folder                |
| ---------- | --------------------- |
| Auth       | `features/auth`       |
| Users      | `features/users`      |
| Plantation | `features/plantation` |
| Harvest    | `features/harvest`    |
| Delivery   | `features/delivery`   |
| Payment    | `features/payment`    |

Each feature folder contains:

```
api.ts
hooks.ts
types.ts
components/
```

Pages compose components from features.

---

## 15. Example Page Composition

**`app/harvest/page.tsx`** → `HarvestForm`, `HarvestHistory`

**`app/delivery/page.tsx`** → `DeliveryTable`, `DeliveryFilters`

**`app/users/page.tsx`** → `UserTable`, `RoleFilter`, `SearchBar`

---

## 16. Navigation Structure

| Admin          | Buruh         | Mandor             | Supir         |
| -------------- | ------------- | ------------------ | ------------- |
| Dashboard      | Dashboard     | Dashboard          | Dashboard     |
| Users          | Harvest       | Buruh              | Delivery      |
| Plantations    | Payroll       | Harvest Validation | Payroll       |
| Deliveries     | Wallet        | Delivery           | Wallet        |
| Payroll        | Notifications | Payroll            | Notifications |
| Wallet         |               | Wallet             |               |
| Notifications  |               | Notifications      |               |

---

## 17. Common UI States

All pages should handle the following states:

| State             | Description                                           |
| ----------------- | ----------------------------------------------------- |
| Loading           | Spinner or skeleton while data is being fetched       |
| Empty             | Friendly message when no data exists yet              |
| Error             | Error message with retry option on fetch failure      |
| Permission denied | Redirect or message when user lacks the required role |
| Form validation   | Inline field errors on invalid input                  |

---

## 18. Role Access Matrix

| Module        | Admin | Buruh | Mandor | Supir |
| ------------- | :---: | :---: | :----: | :---: |
| Dashboard     |   ✓   |   ✓   |   ✓    |   ✓   |
| Users         |   ✓   |       |        |       |
| Plantation    |   ✓   |       |   ✓    |       |
| Harvest       |       |   ✓   |   ✓    |       |
| Delivery      |   ✓   |       |   ✓    |   ✓   |
| Payroll       |   ✓   |   ✓   |   ✓    |   ✓   |
| Wallet        |   ✓   |   ✓   |   ✓    |   ✓   |
| Notifications |   ✓   |   ✓   |   ✓    |   ✓   |

---

## 19. UI Development Rules

1. Pages must stay thin.
2. Business logic belongs inside features.
3. Shared UI goes to `components/ui`.
4. API calls go inside feature `api.ts`.
5. Types must live inside feature `types.ts`.