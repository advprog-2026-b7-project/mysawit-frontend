# MySawit Design System

Color palette and UI conventions for the MySawit frontend.
All tokens are defined in `app/globals.css` and available as Tailwind utility classes.

---

## Design Philosophy

| Theme               | Feeling                    |
| ------------------- | -------------------------- |
| Palm oil plantation  | Natural (green/brown)      |
| Agriculture / nature | Trustworthy (deep greens)  |
| Industrial logistics | Operational (neutral greys)|
| Financial modules    | Clear status indicators    |

---

## 1. Primary Brand (Palm Green)

Used for buttons, links, active states, navbar, sidebar.

| Token          | Hex       | Usage                |
| -------------- | --------- | -------------------- |
| `primary-50`   | `#ECFDF5` | Hover backgrounds    |
| `primary-100`  | `#D1FAE5` | Light UI accents     |
| `primary-200`  | `#A7F3D0` | Badges               |
| `primary-300`  | `#6EE7B7` | Subtle highlights    |
| `primary-400`  | `#34D399` | Secondary buttons    |
| `primary-500`  | `#10B981` | **Main brand color** |
| `primary-600`  | `#059669` | Primary buttons      |
| `primary-700`  | `#047857` | Navbar               |
| `primary-800`  | `#065F46` | Sidebar              |
| `primary-900`  | `#064E3B` | Dark hover           |

---

## 2. Secondary (Palm Oil / Harvest)

Represents harvest, agriculture, and weight indicators.

| Token           | Hex       | Usage               |
| --------------- | --------- | ------------------- |
| `secondary-50`  | `#FFFBEB` | Soft backgrounds     |
| `secondary-100` | `#FEF3C7` | Highlight backgrounds|
| `secondary-200` | `#FDE68A` | Light accents        |
| `secondary-300` | `#FCD34D` | Highlights           |
| `secondary-400` | `#FBBF24` | Badges               |
| `secondary-500` | `#F59E0B` | Harvest indicators   |
| `secondary-600` | `#D97706` | Active states        |
| `secondary-700` | `#B45309` | Icons                |
| `secondary-800` | `#92400E` | Dark accents         |
| `secondary-900` | `#78350F` | Deep contrast        |

---

## 3. Neutral (UI Foundation)

Cards, backgrounds, text, borders.

| Token      | Hex       | Usage            |
| ---------- | --------- | ---------------- |
| `gray-50`  | `#F9FAFB` | Page background  |
| `gray-100` | `#F3F4F6` | Hover states     |
| `gray-200` | `#E5E7EB` | Borders          |
| `gray-300` | `#D1D5DB` | Dividers         |
| `gray-400` | `#9CA3AF` | Placeholder text |
| `gray-500` | `#6B7280` | Secondary text   |
| `gray-600` | `#4B5563` | Body text        |
| `gray-700` | `#374151` | Body text (dark) |
| `gray-800` | `#1F2937` | Headings         |
| `gray-900` | `#111827` | Headings (dark)  |

---

## 4. Status Colors

### Success (Approved / Completed)

| Token          | Hex       |
| -------------- | --------- |
| `success-50`   | `#F0FDF4` |
| `success-100`  | `#DCFCE7` |
| `success-500`  | `#22C55E` |
| `success-700`  | `#15803D` |

Used for: harvest approved, shipment completed, payroll success.

### Warning (Pending)

| Token          | Hex       |
| -------------- | --------- |
| `warning-50`   | `#FEFCE8` |
| `warning-100`  | `#FEF9C3` |
| `warning-500`  | `#EAB308` |
| `warning-700`  | `#A16207` |

Used for: pending approval, shipment loading, incomplete forms.

### Error (Rejected / Failed)

| Token        | Hex       |
| ------------ | --------- |
| `error-50`   | `#FEF2F2` |
| `error-100`  | `#FEE2E2` |
| `error-500`  | `#EF4444` |
| `error-700`  | `#B91C1C` |

Used for: rejected harvest, payment failure, system errors.

---

## 5. Delivery Status Colors

| Status              | Token          | Hex       |
| ------------------- | -------------- | --------- |
| Created             | `gray-400`     | `#9CA3AF` |
| Memuat (Loading)    | `warning-500`  | `#EAB308` |
| Mengirim (Delivery) | `primary-500`  | `#10B981` |
| Tiba di Tujuan      | `secondary-500`| `#F59E0B` |
| Approved            | `success-500`  | `#22C55E` |

---

## 6. Background System

| Element        | Class                  |
| -------------- | ---------------------- |
| App background | `bg-gray-50`          |
| Cards          | `bg-white`            |
| Sidebar        | `bg-primary-800`      |
| Navbar         | `bg-primary-700`      |
| Hover rows     | `hover:bg-gray-100`   |

---

## 7. Button Styles

### Primary Button

```html
<button class="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2">
  Submit
</button>
```

### Secondary Button

```html
<button class="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg px-4 py-2">
  Cancel
</button>
```

### Danger Button

```html
<button class="bg-error-500 hover:bg-error-700 text-white rounded-lg px-4 py-2">
  Delete
</button>
```

---

## 8. Element Styling Reference

### Navbar

```
bg-primary-700 text-white
```

### Sidebar

```
bg-primary-800 text-white
active item: bg-primary-600
```

### Cards

```
bg-white border border-gray-200 shadow-sm rounded-lg
```

### Status Badges

```html
<!-- Success -->
<span class="bg-success-100 text-success-700 px-2 py-1 rounded-full text-sm">Approved</span>

<!-- Warning -->
<span class="bg-warning-100 text-warning-700 px-2 py-1 rounded-full text-sm">Pending</span>

<!-- Error -->
<span class="bg-error-100 text-error-700 px-2 py-1 rounded-full text-sm">Rejected</span>
```

---

## 9. Typography

**Font:** Inter (loaded via `next/font/google`)

| Element     | Class                         |
| ----------- | ----------------------------- |
| Page title  | `text-2xl font-bold text-gray-900` |
| Section     | `text-xl font-semibold text-gray-800` |
| Body        | `text-base text-gray-700`     |
| Caption     | `text-sm text-gray-500`       |
| Label       | `text-sm font-medium text-gray-700` |

---

## Quick Reference

```
Primary button:   bg-primary-600 hover:bg-primary-700 text-white
Navbar:           bg-primary-700 text-white
Sidebar:          bg-primary-800 text-white
Page background:  bg-gray-50
Card:             bg-white border-gray-200 shadow-sm
Body text:        text-gray-700
Heading:          text-gray-900
Success badge:    bg-success-100 text-success-700
Warning badge:    bg-warning-100 text-warning-700
Error badge:      bg-error-100 text-error-700
```
