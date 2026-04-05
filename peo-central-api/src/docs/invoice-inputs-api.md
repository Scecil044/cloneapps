# Invoice Inputs API Documentation

## Overview
The Invoice Inputs module allows companies to create, manage, and track invoice inputs with line items. Each item can have multiple receipt attachments.

## Field Requirements

### Invoice Input Fields
- `company_id` (required) - MongoDB ObjectId of the company
- `input_month` (required) - Month in YYYY-MM format
- `items` (required) - Array of invoice input items (minimum 1 item)
- `status` (optional) - Status of the invoice input (draft, pending, approved, rejected, paid)
- `notes` (optional) - Additional notes

### Invoice Input Item Fields
- `user_id` (required) - MongoDB ObjectId of the user/employee associated with this item
- `service_name` (required) - Name of the service or product
- `description` (required) - Detailed description of the service/product
- `quantity` (required) - Quantity (minimum 1)
- `amount` (required) - Unit amount (minimum 0)
- `receipts` (optional) - Array of receipt attachments

### Receipt Fields
- `filename` (required) - Original filename of the receipt
- `file_url` (required) - Valid URL to the receipt file

## Base URL
```
/api/v1/invoice-inputs
```

## Authentication
All endpoints require authentication with appropriate permissions:
- `getInvoiceInputs` - View invoice inputs
- `manageInvoiceInputs` - Create, update, delete invoice inputs

## Endpoints

### 1. Create Invoice Input
**POST** `/api/v1/invoice-inputs`

Create a new invoice input for a company.

**Request Body:**
```json
{
  "company_id": "60f1b2a3c4d5e6f7a8b9c0d1",
  "input_month": "2025-07",
  "items": [
    {
      "user_id": "60f1b2a3c4d5e6f7a8b9c0d0",
      "service_name": "Consulting Services",
      "description": "Business consultation and strategy development",
      "quantity": 10,
      "amount": 150.00,
      "receipts": [
        {
          "filename": "receipt1.pdf",
          "file_url": "https://s3.amazonaws.com/bucket/receipt1.pdf"
        }
      ]
    },
    {
      "user_id": "60f1b2a3c4d5e6f7a8b9c0d9",
      "service_name": "Software Development",
      "description": "Custom software development services",
      "quantity": 5,
      "amount": 200.00,
      "receipts": [
        {
          "filename": "receipt2.pdf",
          "file_url": "https://s3.amazonaws.com/bucket/receipt2.pdf"
        }
      ]
    }
  ],
  "status": "draft",
  "notes": "Monthly service inputs for July 2025"
}
```

**Response:**
```json
{
  "id": "60f1b2a3c4d5e6f7a8b9c0d2",
  "company_id": "60f1b2a3c4d5e6f7a8b9c0d1",
  "input_month": "2025-07",
  "items": [
    {
      "_id": "60f1b2a3c4d5e6f7a8b9c0d3",
      "user_id": {
        "_id": "60f1b2a3c4d5e6f7a8b9c0d0",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "emp_id": "EMP001",
        "designation": "Senior Consultant"
      },
      "service_name": "Consulting Services",
      "description": "Business consultation and strategy development",
      "quantity": 10,
      "amount": 150,
      "total_amount": 1500,
      "receipts": [
        {
          "_id": "60f1b2a3c4d5e6f7a8b9c0d4",
          "filename": "receipt1.pdf",
          "file_url": "https://s3.amazonaws.com/bucket/receipt1.pdf"
        }
      ]
    },
    {
      "_id": "60f1b2a3c4d5e6f7a8b9c0d5",
      "user_id": {
        "_id": "60f1b2a3c4d5e6f7a8b9c0d9",
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane.smith@example.com",
        "emp_id": "EMP002",
        "designation": "Software Developer"
      },
      "service_name": "Software Development",
      "description": "Custom software development services",
      "quantity": 5,
      "amount": 200,
      "total_amount": 1000,
      "receipts": [
        {
          "_id": "60f1b2a3c4d5e6f7a8b9c0d6",
          "filename": "receipt2.pdf",
          "file_url": "https://s3.amazonaws.com/bucket/receipt2.pdf"
        }
      ]
    }
  ],
  "status": "draft",
  "notes": "Monthly service inputs for July 2025",
  "created_by": "60f1b2a3c4d5e6f7a8b9c0d7",
  "createdAt": "2025-07-08T11:30:00.000Z",
  "updatedAt": "2025-07-08T11:30:00.000Z"
}
```

### 2. Get All Invoice Inputs
**GET** `/api/v1/invoice-inputs`

Retrieve all invoice inputs with optional filtering.

**Query Parameters:**
- `company_id` (optional) - Filter by company ID
- `status` (optional) - Filter by status (draft, pending, approved, rejected, paid)
- `input_month` (optional) - Filter by input month (YYYY-MM format)
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `sortBy` (optional) - Sort field:order (e.g., 'input_month:desc')

**Example:**
```
GET /api/v1/invoice-inputs?company_id=60f1b2a3c4d5e6f7a8b9c0d1&status=pending&input_month=2025-07
```

### 3. Get Invoice Input by ID
**GET** `/api/v1/invoice-inputs/:invoiceInputId`

Retrieve a specific invoice input by ID.

### 4. Update Invoice Input
**PATCH** `/api/v1/invoice-inputs/:invoiceInputId`

Update an existing invoice input.

**Request Body:** (same structure as create, but all fields optional)

### 5. Delete Invoice Input
**DELETE** `/api/v1/invoice-inputs/:invoiceInputId`

Soft delete an invoice input (sets is_deleted to true).

### 6. Get Invoice Inputs by Company
**GET** `/api/v1/invoice-inputs/company/:companyId`

Retrieve all invoice inputs for a specific company.

### 7. Get Invoice Inputs Statistics
**GET** `/api/v1/invoice-inputs/company/:companyId/stats`

Get statistics for invoice inputs by company.

**Response:**
```json
[
  {
    "_id": "draft",
    "count": 5,
    "total_amount": 12500
  },
  {
    "_id": "pending",
    "count": 3,
    "total_amount": 7500
  },
  {
    "_id": "approved",
    "count": 10,
    "total_amount": 25000
  }
]
```

### 8. Update Invoice Status
**PATCH** `/api/v1/invoice-inputs/:invoiceInputId/status`

Update the status of an invoice input. **This endpoint also triggers email approval notifications when status is changed to "pending".**

**Request Body:**
```json
{
  "status": "pending"
}
```

**Status Options:**
- `draft` - Initial state
- `pending` - Submitted for approval (triggers email to roney@nathandigital.com)
- `approved` - Approved by admin
- `rejected` - Rejected by admin

**Response (200 OK):**
```json
{
  "_id": "60f1b2a3c4d5e6f7a8b9c0d1",
  "company_id": "60f1b2a3c4d5e6f7a8b9c0d2",
  "input_month": "2025-07",
  "status": "pending",
  "approved_date": null,
  "updated_by": "60f1b2a3c4d5e6f7a8b9c0d3",
  "items": [...],
  "createdAt": "2025-07-09T10:00:00.000Z",
  "updatedAt": "2025-07-09T10:30:00.000Z"
}
```

**Important:** When status is updated to "pending", an approval email is automatically sent to roney@nathandigital.com with approve/reject buttons.

### 9. Add Receipt to Invoice Item
**POST** `/api/v1/invoice-inputs/:invoiceInputId/items/:itemId/receipts`

Add a receipt attachment to a specific item in an invoice input.

**Request Body:**
```json
{
  "filename": "receipt3.pdf",
  "file_url": "https://s3.amazonaws.com/bucket/receipt3.pdf"
}
```

### 10. Remove Receipt from Invoice Item
**DELETE** `/api/v1/invoice-inputs/:invoiceInputId/items/:itemId/receipts/:receiptId`

Remove a receipt attachment from a specific item in an invoice input.

## Email Approval Feature

### 7. Email-based Approval/Rejection
When an invoice input status is updated to "pending" via either the main update endpoint or the status-specific endpoint, an automated email is sent to `roney@nathandigital.com` with approve and reject buttons.

**Trigger Endpoints:**
- `PATCH /api/v1/invoice-inputs/:invoiceInputId` (when body contains `"status": "pending"`)
- `PATCH /api/v1/invoice-inputs/:invoiceInputId/status` (when body contains `"status": "pending"`)

**Email Features:**
- **Automatic Trigger**: Sent when status changes from any status to "pending" via either endpoint
- **Secure Links**: Time-limited tokens (24 hours) for approval/rejection
- **Rich Email Content**: Includes invoice details, items, and total amounts
- **One-Click Actions**: Direct approve/reject buttons in the email
- **HTML Responses**: User-friendly confirmation pages

**Email Approval Endpoints:**
```
GET /api/v1/invoice-inputs/approve-email/:token
GET /api/v1/invoice-inputs/reject-email/:token
```

**How it works:**
1. When invoice status is updated to "pending", system automatically sends email
2. Email contains secure approval/rejection links with embedded tokens
3. Clicking approve/reject updates the invoice status immediately
4. User sees confirmation page with action details
5. Links expire after 24 hours for security

**Email Content Includes:**
- Company details and invoice month
- Total amount and item count
- Complete item breakdown with services, descriptions, quantities, and amounts
- Notes (if any)
- Clickable approve/reject buttons
- Link to admin panel for detailed review

**Token Security:**
- Base64 encoded with invoice ID, action, and timestamp
- Automatically expires after 24 hours
- Validates invoice is still in pending status
- Prevents replay attacks with timestamp validation

**Status Updates:**
- **Approve**: Changes status to "approved" and sets approved_date
- **Reject**: Changes status to "rejected" and sets approved_date
- Both actions log the activity and show confirmation page

---

## Data Models

### Invoice Input Schema
```javascript
{
  company_id: ObjectId (ref: Companies),
  input_month: String (format: YYYY-MM),
  items: [InvoiceInputItem],
  status: String (enum: ['draft', 'pending', 'approved', 'rejected', 'paid']),
  notes: String,
  created_by: ObjectId (ref: User),
  updated_by: ObjectId (ref: User),
  approved_by: ObjectId (ref: User),
  approved_date: Date,
  is_deleted: Boolean,
  timestamps: true
}
```

### Invoice Input Item Schema
```javascript
{
  service_name: String,
  description: String,
  quantity: Number,
  amount: Number,
  total_amount: Number (calculated automatically),
  receipts: [ReceiptItem]
}
```

### Receipt Item Schema
```javascript
{
  filename: String,
  file_url: String
}
```

## Error Responses

### 400 Bad Request
```json
{
  "code": 400,
  "message": "Invoice input already exists for this company and month"
}
```

### 404 Not Found
```json
{
  "code": 404,
  "message": "Invoice input not found"
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

## Notes

1. **Automatic Calculations**: The system automatically calculates:
   - `total_amount` for each item (quantity × amount)

2. **Monthly Uniqueness**: Each company can only have one invoice input per month (enforced by unique index on company_id + input_month).

3. **Input Month Format**: Must be in YYYY-MM format (e.g., "2025-07" for July 2025).

4. **AWS S3 Integration**: Receipt file URLs should be valid AWS S3 URLs. The system only stores the URL and filename, not the actual file.

5. **Item-Level Receipts**: Each item can have multiple receipt attachments, allowing for granular documentation.

6. **Status Workflow**: 
   - `draft` → `pending` → `approved`/`rejected` → `paid`
   - When status is changed to `approved`, the `approved_by` and `approved_date` fields are automatically set.

7. **Soft Delete**: Deleted invoice inputs are not permanently removed, they are marked as `is_deleted: true`.

8. **Permissions**: Make sure users have appropriate permissions (`getInvoiceInputs`, `manageInvoiceInputs`) before accessing these endpoints.

## Usage Examples

### Create Invoice Input for July 2025
```bash
curl -X POST /api/v1/invoice-inputs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "company_id": "60f1b2a3c4d5e6f7a8b9c0d1",
    "input_month": "2025-07",
    "items": [
      {
        "service_name": "IT Support",
        "description": "Monthly IT support services",
        "quantity": 1,
        "amount": 2000,
        "receipts": [
          {
            "filename": "it-support-july.pdf",
            "file_url": "https://s3.amazonaws.com/bucket/it-support-july.pdf"
          }
        ]
      }
    ],
    "status": "draft",
    "notes": "July 2025 IT support invoice input"
  }'
```

### Add Receipt to Existing Item
```bash
curl -X POST /api/v1/invoice-inputs/60f1b2a3c4d5e6f7a8b9c0d2/items/60f1b2a3c4d5e6f7a8b9c0d3/receipts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "filename": "additional-receipt.pdf",
    "file_url": "https://s3.amazonaws.com/bucket/additional-receipt.pdf"
  }'
```
