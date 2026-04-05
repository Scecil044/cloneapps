# Invoice Inputs API Documentation - Frontend Integration

## Overview
This API allows companies to manage monthly invoice inputs with line items and receipt attachments. Each item can be associated with a specific user and contain multiple receipts.

## Base URL
```
https://your-api-domain.com/api/v1/invoice-inputs
```

## Authentication
All requests require Bearer token authentication:
```
Authorization: Bearer <your-jwt-token>
```

## Required Permissions
- `getInvoiceInputs` - View invoice inputs
- `manageInvoiceInputs` - Create, update, delete invoice inputs

---

## 📋 API Endpoints

### 1. Create Invoice Input
**POST** `/api/v1/invoice-inputs`

Creates a new monthly invoice input for a company.

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "company_id": "60f1b2a3c4d5e6f7a8b9c0d1",
  "input_month": "2025-07",
  "items": [
    {
      "user_id": "60f1b2a3c4d5e6f7a8b9c0d8",
      "service_name": "IT Consulting",
      "description": "Monthly IT support and consulting services",
      "quantity": 20,
      "amount": 150.00,
      "receipts": [
        {
          "filename": "it-consulting-receipt.pdf",
          "file_url": "https://s3.amazonaws.com/bucket/it-consulting-receipt.pdf"
        }
      ]
    },
    {
      "user_id": "60f1b2a3c4d5e6f7a8b9c0d9",
      "service_name": "Marketing Services",
      "description": "Social media marketing and content creation",
      "quantity": 10,
      "amount": 200.00,
      "receipts": [
        {
          "filename": "marketing-receipt.pdf",
          "file_url": "https://s3.amazonaws.com/bucket/marketing-receipt.pdf"
        }
      ]
    }
  ],
  "status": "draft",
  "notes": "Monthly services for July 2025"
}
```

**Response (201 Created):**
```json
{
  "id": "60f1b2a3c4d5e6f7a8b9c0d2",
  "company_id": "60f1b2a3c4d5e6f7a8b9c0d1",
  "input_month": "2025-07",
  "items": [
    {
      "_id": "60f1b2a3c4d5e6f7a8b9c0d3",
      "user_id": "60f1b2a3c4d5e6f7a8b9c0d8",
      "service_name": "IT Consulting",
      "description": "Monthly IT support and consulting services",
      "quantity": 20,
      "amount": 150,
      "total_amount": 3000,
      "receipts": [
        {
          "_id": "60f1b2a3c4d5e6f7a8b9c0d4",
          "filename": "it-consulting-receipt.pdf",
          "file_url": "https://s3.amazonaws.com/bucket/it-consulting-receipt.pdf"
        }
      ]
    },
    {
      "_id": "60f1b2a3c4d5e6f7a8b9c0d5",
      "user_id": "60f1b2a3c4d5e6f7a8b9c0d9",
      "service_name": "Marketing Services",
      "description": "Social media marketing and content creation",
      "quantity": 10,
      "amount": 200,
      "total_amount": 2000,
      "receipts": [
        {
          "_id": "60f1b2a3c4d5e6f7a8b9c0d6",
          "filename": "marketing-receipt.pdf",
          "file_url": "https://s3.amazonaws.com/bucket/marketing-receipt.pdf"
        }
      ]
    }
  ],
  "status": "draft",
  "notes": "Monthly services for July 2025",
  "created_by": "60f1b2a3c4d5e6f7a8b9c0d7",
  "is_deleted": false,
  "createdAt": "2025-07-08T11:30:00.000Z",
  "updatedAt": "2025-07-08T11:30:00.000Z"
}
```

### 2. Get All Invoice Inputs
**GET** `/api/v1/invoice-inputs`

Retrieves all invoice inputs with optional filtering and pagination.

**Query Parameters:**
- `company_id` (string, optional) - Filter by company ID
- `status` (string, optional) - Filter by status: `draft`, `pending`, `approved`, `rejected`, `paid`
- `input_month` (string, optional) - Filter by month in YYYY-MM format
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10, max: 100)
- `sortBy` (string, optional) - Sort field and order (e.g., `input_month:desc`, `createdAt:asc`)

**Example Request:**
```
GET /api/v1/invoice-inputs?company_id=60f1b2a3c4d5e6f7a8b9c0d1&status=pending&page=1&limit=10&sortBy=input_month:desc
```

**Response (200 OK):**
```json
{
  "results": [
    {
      "id": "60f1b2a3c4d5e6f7a8b9c0d2",
      "company_id": "60f1b2a3c4d5e6f7a8b9c0d1",
      "input_month": "2025-07",
      "items": [...],
      "status": "pending",
      "notes": "Monthly services for July 2025",
      "created_by": "60f1b2a3c4d5e6f7a8b9c0d7",
      "createdAt": "2025-07-08T11:30:00.000Z",
      "updatedAt": "2025-07-08T11:30:00.000Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "totalResults": 1
}
```

### 3. Get Invoice Input by ID
**GET** `/api/v1/invoice-inputs/:invoiceInputId`

Retrieves a specific invoice input with all populated references.

**Response (200 OK):**
```json
{
  "id": "60f1b2a3c4d5e6f7a8b9c0d2",
  "company_id": {
    "_id": "60f1b2a3c4d5e6f7a8b9c0d1",
    "company_name": "ABC Corp",
    "legal_name": "ABC Corporation Ltd",
    "email": "admin@abccorp.com"
  },
  "input_month": "2025-07",
  "items": [
    {
      "_id": "60f1b2a3c4d5e6f7a8b9c0d3",
      "user_id": "60f1b2a3c4d5e6f7a8b9c0d8",
      "service_name": "IT Consulting",
      "description": "Monthly IT support and consulting services",
      "quantity": 20,
      "amount": 150,
      "total_amount": 3000,
      "receipts": [...]
    }
  ],
  "status": "draft",
  "notes": "Monthly services for July 2025",
  "created_by": {
    "_id": "60f1b2a3c4d5e6f7a8b9c0d7",
    "name": "John Admin",
    "email": "john@company.com"
  },
  "updated_by": null,
  "approved_by": null,
  "approved_date": null,
  "is_deleted": false,
  "createdAt": "2025-07-08T11:30:00.000Z",
  "updatedAt": "2025-07-08T11:30:00.000Z"
}
```

### 4. Update Invoice Input
**PATCH** `/api/v1/invoice-inputs/:invoiceInputId`

Updates an existing invoice input. All fields are optional.

**Request Body:**
```json
{
  "items": [
    {
      "_id": "60f1b2a3c4d5e6f7a8b9c0d3",
      "user_id": "60f1b2a3c4d5e6f7a8b9c0d8",
      "service_name": "Updated IT Consulting",
      "description": "Updated description",
      "quantity": 25,
      "amount": 160.00,
      "receipts": [
        {
          "filename": "updated-receipt.pdf",
          "file_url": "https://s3.amazonaws.com/bucket/updated-receipt.pdf"
        }
      ]
    }
  ],
  "status": "pending",
  "notes": "Updated notes"
}
```

**Response (200 OK):**
```json
{
  "id": "60f1b2a3c4d5e6f7a8b9c0d2",
  "company_id": "60f1b2a3c4d5e6f7a8b9c0d1",
  "input_month": "2025-07",
  "items": [...],
  "status": "pending",
  "notes": "Updated notes",
  "updated_by": "60f1b2a3c4d5e6f7a8b9c0d7",
  "createdAt": "2025-07-08T11:30:00.000Z",
  "updatedAt": "2025-07-08T12:00:00.000Z"
}
```

### 5. Delete Invoice Input
**DELETE** `/api/v1/invoice-inputs/:invoiceInputId`

Soft deletes an invoice input (sets `is_deleted` to true).

**Response (204 No Content):**
```
(Empty response body)
```

### 6. Get Invoice Inputs by Company
**GET** `/api/v1/invoice-inputs/company/:companyId`

Retrieves all invoice inputs for a specific company.

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10)
- `sortBy` (string, optional) - Sort field and order

**Response (200 OK):**
```json
{
  "results": [...],
  "page": 1,
  "limit": 10,
  "totalPages": 2,
  "totalResults": 15
}
```

### 7. Get Invoice Inputs Statistics
**GET** `/api/v1/invoice-inputs/company/:companyId/stats`

Retrieves statistics for invoice inputs by company.

**Response (200 OK):**
```json
[
  {
    "_id": "draft",
    "count": 5,
    "total_amount": 12500.00
  },
  {
    "_id": "pending",
    "count": 3,
    "total_amount": 7500.00
  },
  {
    "_id": "approved",
    "count": 10,
    "total_amount": 25000.00
  },
  {
    "_id": "paid",
    "count": 2,
    "total_amount": 5000.00
  }
]
```

### 8. Update Invoice Status
**PATCH** `/api/v1/invoice-inputs/:invoiceInputId/status`

Updates the status of an invoice input.

**Request Body:**
```json
{
  "status": "approved"
}
```

**Response (200 OK):**
```json
{
  "id": "60f1b2a3c4d5e6f7a8b9c0d2",
  "status": "approved",
  "approved_by": "60f1b2a3c4d5e6f7a8b9c0d7",
  "approved_date": "2025-07-08T13:00:00.000Z",
  "updatedAt": "2025-07-08T13:00:00.000Z"
}
```

### 9. Add Receipt to Invoice Item
**POST** `/api/v1/invoice-inputs/:invoiceInputId/items/:itemId/receipts`

Adds a receipt attachment to a specific item.

**Request Body:**
```json
{
  "filename": "additional-receipt.pdf",
  "file_url": "https://s3.amazonaws.com/bucket/additional-receipt.pdf"
}
```

**Response (200 OK):**
```json
{
  "id": "60f1b2a3c4d5e6f7a8b9c0d2",
  "items": [
    {
      "_id": "60f1b2a3c4d5e6f7a8b9c0d3",
      "receipts": [
        {
          "_id": "60f1b2a3c4d5e6f7a8b9c0d4",
          "filename": "original-receipt.pdf",
          "file_url": "https://s3.amazonaws.com/bucket/original-receipt.pdf"
        },
        {
          "_id": "60f1b2a3c4d5e6f7a8b9c0d10",
          "filename": "additional-receipt.pdf",
          "file_url": "https://s3.amazonaws.com/bucket/additional-receipt.pdf"
        }
      ]
    }
  ]
}
```

### 10. Remove Receipt from Invoice Item
**DELETE** `/api/v1/invoice-inputs/:invoiceInputId/items/:itemId/receipts/:receiptId`

Removes a receipt attachment from a specific item.

**Response (200 OK):**
```json
{
  "id": "60f1b2a3c4d5e6f7a8b9c0d2",
  "items": [
    {
      "_id": "60f1b2a3c4d5e6f7a8b9c0d3",
      "receipts": [
        {
          "_id": "60f1b2a3c4d5e6f7a8b9c0d4",
          "filename": "original-receipt.pdf",
          "file_url": "https://s3.amazonaws.com/bucket/original-receipt.pdf"
        }
      ]
    }
  ]
}
```

---

## 📊 Data Models

### Invoice Input Object
```typescript
interface InvoiceInput {
  id: string;
  company_id: string | CompanyObject;
  input_month: string; // Format: YYYY-MM
  items: InvoiceInputItem[];
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid';
  notes?: string;
  created_by: string | UserObject;
  updated_by?: string | UserObject;
  approved_by?: string | UserObject;
  approved_date?: string; // ISO 8601 date
  is_deleted: boolean;
  createdAt: string; // ISO 8601 date
  updatedAt: string; // ISO 8601 date
}
```

### Invoice Input Item Object
```typescript
interface InvoiceInputItem {
  _id: string;
  user_id?: string; // Optional user association
  service_name: string;
  description: string;
  quantity: number; // Minimum: 1
  amount: number; // Minimum: 0
  total_amount: number; // Calculated: quantity * amount
  receipts: Receipt[];
}
```

### Receipt Object
```typescript
interface Receipt {
  _id: string;
  filename: string;
  file_url: string; // AWS S3 URL
}
```

### Company Object (when populated)
```typescript
interface CompanyObject {
  _id: string;
  company_name: string;
  legal_name: string;
  email: string;
}
```

### User Object (when populated)
```typescript
interface UserObject {
  _id: string;
  name: string;
  email: string;
}
```

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "code": 400,
  "message": "Invoice input already exists for this company and month"
}
```

### 401 Unauthorized
```json
{
  "code": 401,
  "message": "Please authenticate"
}
```

### 403 Forbidden
```json
{
  "code": 403,
  "message": "Forbidden"
}
```

### 404 Not Found
```json
{
  "code": 404,
  "message": "Invoice input not found"
}
```

### 422 Validation Error
```json
{
  "code": 422,
  "message": "Validation Error",
  "errors": [
    {
      "field": "input_month",
      "message": "Input month must be in YYYY-MM format"
    },
    {
      "field": "items",
      "message": "At least one item is required"
    }
  ]
}
```

---

## 🔧 Frontend Implementation Examples

### React/JavaScript Example

```javascript
// Create Invoice Input
const createInvoiceInput = async (invoiceData) => {
  try {
    const response = await fetch('/api/v1/invoice-inputs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(invoiceData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating invoice input:', error);
    throw error;
  }
};

// Get Invoice Inputs with Filters
const getInvoiceInputs = async (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  try {
    const response = await fetch(`/api/v1/invoice-inputs?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching invoice inputs:', error);
    throw error;
  }
};

// Update Invoice Status
const updateInvoiceStatus = async (invoiceId, status) => {
  try {
    const response = await fetch(`/api/v1/invoice-inputs/${invoiceId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating invoice status:', error);
    throw error;
  }
};

// Add Receipt to Item
const addReceiptToItem = async (invoiceId, itemId, receiptData) => {
  try {
    const response = await fetch(`/api/v1/invoice-inputs/${invoiceId}/items/${itemId}/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(receiptData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding receipt:', error);
    throw error;
  }
};
```

---

## 📝 Important Notes for Frontend

1. **Monthly Uniqueness**: Each company can only have one invoice input per month. Handle this constraint in your UI.

2. **Input Month Format**: Always use YYYY-MM format (e.g., "2025-07" for July 2025).

3. **User Association**: The `user_id` field in items is optional - items can be created without user association.

4. **Automatic Calculations**: The `total_amount` for each item is calculated automatically (quantity × amount).

5. **Status Workflow**: 
   - `draft` → `pending` → `approved`/`rejected` → `paid`
   - When approved, `approved_by` and `approved_date` are automatically set.

6. **File Uploads**: Receipt files should be uploaded to AWS S3 first, then provide the S3 URL to the API.

7. **Pagination**: Use the pagination parameters to handle large datasets efficiently.

8. **Error Handling**: Always check response status and handle errors appropriately.

9. **Permissions**: Ensure users have proper permissions before showing UI elements.

10. **Soft Delete**: Deleted items are marked as `is_deleted: true`, not permanently removed.

---

## 🔗 Quick Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/invoice-inputs` | Create new invoice input |
| GET | `/api/v1/invoice-inputs` | Get all invoice inputs |
| GET | `/api/v1/invoice-inputs/:id` | Get specific invoice input |
| PATCH | `/api/v1/invoice-inputs/:id` | Update invoice input |
| DELETE | `/api/v1/invoice-inputs/:id` | Delete invoice input |
| GET | `/api/v1/invoice-inputs/company/:companyId` | Get by company |
| GET | `/api/v1/invoice-inputs/company/:companyId/stats` | Get statistics |
| PATCH | `/api/v1/invoice-inputs/:id/status` | Update status |
| POST | `/api/v1/invoice-inputs/:id/items/:itemId/receipts` | Add receipt |
| DELETE | `/api/v1/invoice-inputs/:id/items/:itemId/receipts/:receiptId` | Remove receipt |

---

**Need Help?** Contact the backend team for any questions or issues with the API implementation.
