# Frontend Setup Guide

Step-by-step instructions for setting up the MySawit Frontend development environment.

## Prerequisites

Before you start, ensure you have:

1. **Node.js**: Version 18 or higher
   - Download from https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **Harvest Service Running**: The backend must be available
   - Default: `http://localhost:8001`
   - See `../mysawit-harvest/README.md` for setup

3. **Git**: For version control
   - Download from https://git-scm.com/

## Installation Steps

### 1. Navigate to Frontend Directory

```bash
cd d:\materi\ kuliah\semester\ 4\adpro\Group\ Project\mysawit-frontend
```

### 2. Install Node Dependencies

```bash
npm install
```

This will:
- Download all npm packages to `node_modules/`
- Create `package-lock.json` to lock versions
- This includes: Next.js, React, axios, TypeScript, ESLint

Expected time: 2-5 minutes depending on internet connection

**If using pnpm instead**:
```bash
pnpm install
```

### 3. Verify Installation

Check that all dependencies are installed:

```bash
npm list --depth=0
```

Should show:
- next (15.x)
- react (19.x)
- typescript (5.3.x)
- axios (1.7.x)
- eslint

### 4. Start Development Server

```bash
npm run dev
```

Expected output:
```
> mysawit-frontend@1.0.0 dev
> next dev

  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.3s
```

### 5. Open in Browser

Navigate to: **http://localhost:3000**

You should see the MySawit Harvest Form

## Connecting to Harvest Service

### Verify Harvest Service is Running

In a **new terminal**, check if Harvest Service is accessible:

**Windows (PowerShell)**:
```powershell
Invoke-WebRequest -Uri http://localhost:8001/actuator/health
```

**Windows (Command Prompt)**:
```cmd
curl http://localhost:8001/actuator/health
```

Should return status 200 with health info.

### Start Harvest Service (if not running)

In a **separate terminal**:

```bash
cd ../mysawit-harvest
./gradlew bootRun
```

Wait for output showing "Started Application in X.XXX seconds"

## Testing the Form

1. **Form Page** (should already be loaded at http://localhost:3000):
   - Plantation ID: Enter any ID (e.g., "PLANT-001")
   - Buruh ID: Enter any ID (e.g., "BURUH-001")
   - Weight: Enter a number (e.g., "100")
   - Photos: (Optional) Click to select image files
   - Click "Submit Harvest"

2. **Expected Result**:
   - Success page shows with Harvest ID and timestamp
   - Back button returns to form for another submission

3. **If error occurs**:
   - Check browser console (F12) for detailed error messages
   - See Troubleshooting section below

## Environment Configuration

### Default Configuration

The frontend is configured to connect to `http://localhost:8001` by default.

This is set in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8001
```

### Custom Configuration

To use a different Harvest Service URL:

1. Edit `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://your-harvest-service-url:port
   ```

2. Restart dev server:
   ```bash
   npm run dev
   ```

## Available Commands

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Check for linting errors
npm run lint:fix     # Auto-fix linting errors

# Package Management
npm list             # Show installed packages
npm outdated         # Show outdated packages
npm update           # Update packages
```

## Troubleshooting

### "Port 3000 already in use"

The dev server tries to use port 3000. If it's occupied:

**Option 1**: Find and close the process using port 3000

**Option 2**: Use a different port
```bash
npm run dev -- -p 3001
```

### "Connection refused" on form submission

1. Verify Harvest Service is running:
   ```bash
   curl http://localhost:8001/actuator/health
   ```

2. Check `.env.local` has correct API URL:
   ```bash
   cat .env.local
   ```

3. Check browser console (F12) for full error message

### "Module not found" errors

The `node_modules` folder might be corrupted:

```bash
# Delete and reinstall
rm -r node_modules package-lock.json
npm install
npm run dev
```

### TypeScript or ESLint errors

Usually not blocking, but to fix:

```bash
npm run lint:fix
npm run build
```

### Photos not uploading

Check:
1. File size (should be < 10MB)
2. File format (JPG, PNG, WebP supported)
3. Browser console for detailed error
4. Harvest Service logs for upload errors

### Dev server freezes or hangs

The form submission has a 10-second timeout. If it's hanging:

1. Check Harvest Service is responding:
   ```bash
   curl -v http://localhost:8001/actuator/health
   ```

2. Check browser console for timeout error

3. Restart both services:
   ```bash
   # Terminal 1
   npm run dev
   
   # Terminal 2 (in mysawit-harvest)
   ./gradlew bootRun
   ```

## Development Tips

### Auto-reload on save
The dev server watches files automatically. Just save your changes and the browser will refresh.

### Browser DevTools
- Press F12 to open developer tools
- **Console** tab shows JavaScript errors
- **Network** tab shows API requests/responses
- **Application** tab shows local storage and cookies

### Debugging Form Submission
To see detailed logs:

1. Open Browser Console (F12)
2. Submit the form
3. Look for logs like:
   - `Submitting harvest...`
   - `Response:` with harvest data
   - Or `Error:` with error details

### Next.js Documentation
For more info on Next.js features: https://nextjs.org/docs

## Next Steps

After successful setup:

1. **Explore the Code**:
   - `app/page.tsx` - Home page
   - `app/components/HarvestForm.tsx` - Form component
   - `lib/harvestClient.ts` - API client

2. **Try Modifications**:
   - Add a new field to the form
   - Change form styling in CSS modules
   - Add validation rules

3. **Integration Testing**:
   - Submit multiple harvests
   - Verify data in Harvest Service database
   - Test with actual photos
   - Test error scenarios

## Getting Help

If you encounter issues:

1. Check the logs in:
   - Browser console (F12)
   - Terminal running `npm run dev`
   - Terminal running Harvest Service (`./gradlew bootRun`)

2. Read error messages carefully - they often hint at the solution

3. Check the main README.md for more documentation

4. Review the GitHub repository for similar issues

---

**Created**: January 2025  
**Last Updated**: January 2025  
**Frontend Stack**: Next.js 15, React 19, TypeScript 5.3
