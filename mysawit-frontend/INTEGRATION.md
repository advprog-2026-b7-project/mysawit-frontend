# Frontend-Backend Integration Guide

This document explains how the MySawit Frontend integrates with the Harvest Service backend.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  http://localhost:3000                                 │ │
│  │  - Next.js Frontend                                    │ │
│  │  - React components (HarvestForm)                      │ │
│  │  - TypeScript types                                    │ │
│  │  - CSS Modules styling                                 │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────┬───────────────────────────────────────────────┘
               │ HTTP (axios)
               │ POST /harvests
               │ Content-Type: multipart/form-data
               │
┌──────────────▼───────────────────────────────────────────────┐
│                  Harvest Service Backend                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  http://localhost:8001                                 │ │
│  │  - Spring Boot 3.2.2 API                               │ │
│  │  - HarvestController (POST /harvests)                  │ │
│  │  - HarvestService (business logic)                     │ │
│  │  - Database integration                                │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────┬───────────────────────────────────────────────┘
               │ JDBC
               │
┌──────────────▼───────────────────────────────────────────────┐
│                      MySQL Database                           │
│  - harvest table (id, plantation_id, buruh_id, weight, ...)  │
│  - photo table (id, harvest_id, filename, url, ...)          │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoint Details

### Endpoint: POST /harvests

**Base URL**: Configured via `NEXT_PUBLIC_API_URL` (default: `http://localhost:8001`)

**Full URL**: `http://localhost:8001/harvests`

**Request Method**: POST

**Content-Type**: multipart/form-data

### Request Format

The frontend sends a `multipart/form-data` request with:

```
request (FormData field):
├── plantation_id: string (required)
├── buruh_id: string (required)
├── weight: number (required, in kg)
├── description: string (optional)
└── timestamp: ISO 8601 string

photos (FormData fields):
├── file: File object (optional, multiple)
├── file: File object
└── ...
```

**Example in axios**:
```typescript
const formData = new FormData();
formData.append('request', JSON.stringify({
  plantation_id: 'PLANT-001',
  buruh_id: 'BURUH-001',
  weight: 150,
  description: 'Good quality harvest'
}));
formData.append('photos', imageFile1);
formData.append('photos', imageFile2);

axios.post('http://localhost:8001/harvests', formData)
```

### Response Format

On success (HTTP 200/201):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "plantation_id": "PLANT-001",
  "buruh_id": "BURUH-001",
  "weight": 150,
  "description": "Good quality harvest",
  "createdAt": "2025-01-15T10:30:45.123Z",
  "updatedAt": "2025-01-15T10:30:45.123Z",
  "photos": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "filename": "photo_1.jpg",
      "url": "http://localhost:8001/uploads/photo_1.jpg",
      "createdAt": "2025-01-15T10:30:45.123Z"
    }
  ]
}
```

### Error Responses

**Missing required field (HTTP 400)**:
```json
{
  "error": "Missing required field: plantation_id",
  "timestamp": "2025-01-15T10:30:45.123Z"
}
```

**Invalid input (HTTP 400)**:
```json
{
  "error": "Weight must be a positive number",
  "timestamp": "2025-01-15T10:30:45.123Z"
}
```

**Server error (HTTP 500)**:
```json
{
  "error": "Internal server error: Database connection failed",
  "timestamp": "2025-01-15T10:30:45.123Z"
}
```

## Frontend Code Flow

### 1. User Opens Form
- Browser navigates to `http://localhost:3000`
- Next.js loads `app/page.tsx`
- React renders `HarvestForm` component

### 2. User Fills Form
- States managed in HarvestForm via `useState`:
  - `formData` - Harvest data (plantation_id, buruh_id, weight, description)
  - `photos` - Selected files
  - `loading` - API request in progress
  - `error` - Error message
  - `success` - Submission succeeded

### 3. User Submits Form
- `handleSubmit()` called on form submission
- Client-side validation:
  ```typescript
  if (!formData.plantation_id) {
    setError('Plantation ID is required');
    return;
  }
  // ... more validation
  ```

### 4. API Call via HarvestClient
- If validation passes, calls `harvestClient.submitHarvest(formData, photos)`
- HarvestClient (lib/harvestClient.ts):
  ```typescript
  export async function submitHarvest(
    request: HarvestCreateRequest,
    photos?: File[]
  ): Promise<HarvestResponse> {
    const formData = new FormData();
    formData.append('request', JSON.stringify(request));
    
    photos?.forEach(photo => {
      formData.append('photos', photo);
    });

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/harvests`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000  // 10-second timeout
      }
    );
    
    return response.data;
  }
  ```

### 5. Success Response Handling
- If successful (`response.data`):
  - Set `success: true`
  - Show success page with Harvest ID
  - Display submission timestamp
  - Show "Submit Another" button

### 6. Error Handling
- If request fails:
  - Network error: "Unable to reach server"
  - Timeout: "Request took too long"
  - Validation error: Echo backend error message
  - Show error alert with troubleshooting hint
  - Allow user to retry

## Type Definitions

### HarvestCreateRequest (from frontend)
```typescript
interface HarvestCreateRequest {
  plantation_id: string;
  buruh_id: string;
  weight: number;
  description?: string;
}
```

### HarvestResponse (from backend)
```typescript
interface HarvestResponse {
  id: string;
  plantation_id: string;
  buruh_id: string;
  weight: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
  photos: Photo[];
}

interface Photo {
  id: string;
  filename: string;
  url: string;
  createdAt: string;
}
```

## Timeout Configuration

The frontend implements a **10-second timeout** on all requests:

```typescript
// In lib/harvestClient.ts
{
  headers: { 'Content-Type': 'multipart/form-data' },
  timeout: 10000  // 10 seconds
}
```

**Why 10 seconds?**
- Photo uploads may take time
- Database operations may be slow
- Network latency varies
- Prevents indefinite hanging

**If timeout occurs:**
- User sees error: "Request took too long. Please try again."
- Form is unlocked for retry
- No duplicate submission

## Testing the Integration

### Prerequisites
1. Harvest Service running: `./gradlew bootRun` in `mysawit-harvest`
2. Frontend running: `npm run dev` in `mysawit-frontend`
3. MySQL database configured and accessible

### Manual Test Steps

**Test 1: Basic Submission**
```
1. Navigate to http://localhost:3000
2. Fill form:
   - Plantation ID: PLANT-001
   - Buruh ID: BURUH-001
   - Weight: 100
3. Click Submit
4. Verify success page shows with harvest ID
5. Check database: SELECT * FROM harvest WHERE plantation_id = 'PLANT-001';
```

**Test 2: With Photos**
```
1. Fill form as above
2. Click "Select Photos"
3. Choose 2-3 image files
4. Click Submit
5. Verify success page shows
6. Check photos uploaded: SELECT * FROM photo WHERE harvest_id = ?;
```

**Test 3: Validation**
```
1. Leave Plantation ID blank
2. Try to submit
3. Verify error: "Plantation ID is required"
4. Fill field and retry
5. Verify submission succeeds
```

**Test 4: Network Error**
```
1. Stop Harvest Service (Ctrl+C in harvest terminal)
2. Try to submit form
3. Verify error: "Unable to reach server"
4. Restart Harvest Service
5. Verify form submission works again
```

**Test 5: Timeout**
```
1. Simulate slow network (in browser DevTools Network tab):
   - Set network throttling to "Slow 4G"
2. Add large file (>10MB)
3. Submit form
4. Should complete or timeout gracefully
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8001
```

### Harvest Service (application.properties)
```
server.port=8001
spring.datasource.url=jdbc:mysql://localhost:3306/mysawit_harvest
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update
```

## Debugging Integration Issues

### Check 1: Network Request
1. Open Browser DevTools (F12)
2. Go to **Network** tab
3. Submit form
4. Look for POST request to `/harvests`
5. Click on it to see:
   - Request headers (Content-Type, etc.)
   - Request body (FormData fields)
   - Response status
   - Response body (success or error)

### Check 2: Backend Logs
Terminal running Harvest Service should show:
```
2025-01-15 10:30:45 - POST /harvests - 200 OK
2025-01-15 10:30:46 - Harvest created with ID: 550e8400...
```

### Check 3: Database
```sql
-- Check harvest table
SELECT * FROM harvest ORDER BY createdAt DESC LIMIT 5;

-- Check photo table
SELECT * FROM photo WHERE harvest_id = 'your-harvest-id';

-- Count total harvests
SELECT COUNT(*) as total_harvests FROM harvest;
```

### Check 4: Frontend Logs
Browser console (F12 > Console) should show:
```
Submitting harvest to http://localhost:8001/harvests
Response: {
  id: '550e8400-...',
  plantation_id: 'PLANT-001',
  ...
}
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Connection refused" | Harvest Service not running | Start with `./gradlew bootRun` |
| Empty response body | Backend not returning JSON | Check backend API endpoint |
| Photos not uploading | File size too large | Limit to <10MB |
| 500 error | Database connection issue | Check MySQL is running, credentials correct |
| Timeout after 10s | Network too slow | Check connection, retry with smaller files |
| CORS errors | Frontend/backend different origin | Add CORS configuration if needed |

## Performance Considerations

### Request Size
- FormData with photos can be 5-50MB
- Keep files under 10MB
- Consider compression for photos

### Response Time
- Simple form: ~100-500ms
- With 3 large photos: ~2-5 seconds
- Slow network: up to 10 seconds (timeout limit)

### Database
- Harvest inserts: <50ms
- Photo saves: depends on storage backend
- Typical total: 200-1000ms

## Security Considerations

### Data Validation
- Frontend: Basic UX validation
- Backend: Strict validation (trust backend only)

### File Upload
- Frontend: No file type check
- Backend: Should validate file types, size, scan for malware
- Recommend: Whitelist only image files

### HTTPS
- Development: HTTP is fine
- Production: Use HTTPS for all requests

## Future Enhancements

1. **Authentication**: Add JWT token to requests
2. **Offline Support**: Cache forms, sync when online
3. **Batch Upload**: Submit multiple harvests at once
4. **Progress Bar**: Show photo upload progress
5. **Real-time Status**: WebSocket for live status updates
6. **Analytics**: Track submission success rates

---

**API Spec Version**: 1.0  
**Last Updated**: January 2025  
**Frontend**: Next.js 15, React 19, TypeScript 5.3  
**Backend**: Spring Boot 3.2.2
