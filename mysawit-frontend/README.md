# MySawit Frontend

A Next.js/React/TypeScript frontend for the MySawit Harvest Management System. This pure frontend application provides a user interface for submitting harvest data and uploading photos to the Harvest Service.

## 🏗️ Architecture

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.3
- **React**: React 19
- **HTTP Client**: Axios 1.7
- **Styling**: CSS Modules
- **Package Manager**: npm or pnpm

This is a **pure frontend application** with NO backend code. It submits data to the Harvest Service API running on `http://localhost:8001`.

## 📋 Features

- **Harvest Submission Form**:
  - Plantation ID input (required)
  - Buruh ID input (required)
  - Weight input in kg (required)
  - Description textarea (optional)
  - Multiple photo file uploads
  - Client-side validation
  - Loading states and error handling

- **Success Page**:
  - Displays harvest ID upon successful submission
  - Shows submission timestamp
  - Link to submit another harvest

- **Error Handling**:
  - Network error messages
  - Form validation feedback
  - API error messages with troubleshooting hints
  - 10-second timeout protection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or pnpm 8+
- Harvest Service running on `http://localhost:8001`
- MySQL database configured for harvest service

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Configure environment**:
   ```bash
   # Copy example to local env file
   cp .env.example .env.local
   
   # Update API URL if needed (default is localhost:8001)
   # NEXT_PUBLIC_API_URL=http://localhost:8001
   ```

3. **Start development server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
mysawit-frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Home/success page
│   ├── globals.css              # Global styles
│   ├── page.module.css          # Page-specific styles
│   └── components/
│       ├── HarvestForm.tsx       # Main form component
│       └── HarvestForm.module.css # Form styles
├── lib/
│   └── harvestClient.ts         # Axios API client for Harvest Service
├── public/                       # Static assets
│   └── favicon.ico
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── next.config.ts               # Next.js configuration
├── eslint.config.mjs            # ESLint configuration
├── .env.example                 # Example environment variables
├── .env.local                   # Local environment (git ignored)
└── .gitignore                   # Git ignore rules
```

## 🔌 API Integration

The frontend communicates with the Harvest Service API:

**Endpoint**: `POST /harvests`

**Request Format**: `multipart/form-data`

**Form Fields**:
- `request`: JSON object with harvest data
  - `plantation_id`: string (required)
  - `buruh_id`: string (required)
  - `weight`: number (required)
  - `description`: string (optional)
- `photos`: array of files (optional)

**Response**:
```json
{
  "id": "uuid",
  "plantation_id": "string",
  "buruh_id": "string",
  "weight": number,
  "description": "string",
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp",
  "photos": [
    {
      "id": "uuid",
      "filename": "string",
      "url": "string"
    }
  ]
}
```

## 🛠️ Development Scripts

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🧪 Testing

To test the form:

1. **Start Harvest Service**:
   ```bash
   cd ../mysawit-harvest
   ./gradlew bootRun
   ```

2. **In another terminal, start frontend**:
   ```bash
   cd ../mysawit-frontend
   npm run dev
   ```

3. **Open http://localhost:3000 and submit a harvest**:
   - Fill in all required fields (Plantation ID, Buruh ID, Weight)
   - Optionally add photos
   - Click "Submit Harvest"
   - View success page with harvest ID

## 🐛 Troubleshooting

### "Connection refused" errors
- Ensure Harvest Service is running on `http://localhost:8001`
- Check MySQL database is accessible
- Verify API_URL in `.env.local` is correct

### Form validation errors
- All fields marked with * are required
- Weight must be a positive number
- Photos must be image files

### Photos not uploading
- Check file size limits in browser console
- Ensure Harvest Service has storage configured
- Verify multipart/form-data support

### Build errors
- Delete `node_modules` and `.next` folder
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

## 📚 Component Documentation

### HarvestForm.tsx
Main submission form component. Handles:
- Form state (plantation_id, buruh_id, weight, description, photos)
- Form validation
- API submission via HarvestClient
- Loading and error states
- Success callback to parent

### harvestClient.ts
Axios wrapper for Harvest Service API. Provides:
- `submitHarvest(request, photos?)` - Submit harvest with optional photos
- Automatic FormData construction for multipart uploads
- Error handling with helpful messages
- 10-second timeout for all requests
- TypeScript types for request/response

## 🔐 Environment Variables

- `NEXT_PUBLIC_API_URL` - Harvest Service API base URL (default: `http://localhost:8001`)
  - Note: `NEXT_PUBLIC_` prefix makes it available in browser

## 📦 Dependencies

- **next** - React framework with SSR/SSG
- **react** - UI library
- **typescript** - Static typing
- **axios** - HTTP client with timeout support
- **eslint** - Code linting

## 🚢 Deployment

To deploy to production:

1. **Build**:
   ```bash
   npm run build
   ```

2. **Update environment**:
   Set `NEXT_PUBLIC_API_URL` to production Harvest Service URL

3. **Deploy artifact**:
   - The `.next` folder is a standalone build
   - Can be deployed to Vercel, Docker, or any Node.js host

## 📝 Notes

- This is a **stateless frontend** - no server-side state
- All sensitive operations (authentication, database) are in backend services
- Form data is validated on client-side for UX; server validates for security
- API calls have 10-second timeout to prevent hanging
- Error messages provide hints for troubleshooting

## 🤝 Contributing

When making changes:
1. Follow TypeScript strict mode
2. Use CSS Modules for component styles
3. Add proper error handling
4. Test with Harvest Service running
5. Keep form validation logic clear

---

**Related Projects**:
- Harvest Service: `../mysawit-harvest`
- Plantation Service: `../mysawit-plantation`

For more info, see the GitHub repository.
