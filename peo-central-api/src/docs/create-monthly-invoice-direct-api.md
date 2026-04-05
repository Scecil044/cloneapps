# Create Monthly Invoice Direct API

## Overview
This API endpoint allows direct creation of monthly invoices for companies by calling the `createMonthlyInvoice` function with custom parameters.

## Endpoint
**POST** `/api/v1/invoice/create/monthly/invoice/direct`

## Authentication
Requires valid JWT token in headers: `Authorization: Bearer <token>`

## Request Body
```json
{
  "companyId": "string", // Required - MongoDB ObjectId of the company
  "startDate": "string", // Optional - Start date in ISO format (e.g., "2025-01-01T00:00:00Z")
  "endDate": "string"    // Optional - End date in ISO format (e.g., "2025-01-31T23:59:59Z")
}
```

### Parameters
- **companyId** (required): The MongoDB ObjectId of the company for which to create the monthly invoice
- **startDate** (optional): The start date for the invoice period. If not provided, defaults to the first day of the current month
- **endDate** (optional): The end date for the invoice period. If not provided, defaults to the last day of the current month

## Response

### Success Response (200 OK)
```json
{
  "message": "Monthly invoice created successfully",
  "data": {
    // Invoice object or array of invoice objects (depending on visa sponsor types)
    "_id": "string",
    "invoice_number": "string",
    "type": "Monthly Invoice",
    "customer": "string",
    "company": "string",
    "total": "number",
    "status": "string",
    "items": [...],
    // ... other invoice fields
  }
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "message": "Company ID is required"
}
```

```json
{
  "message": "Invalid start date format"
}
```

```json
{
  "message": "Invalid end date format"
}
```

#### 404 Not Found
```json
{
  "message": "Company not found"
}
```

```json
{
  "message": "Could not create monthly invoice!"
}
```

## Example Usage

### Basic Usage (Current Month)
```bash
curl -X POST \
  http://localhost:3001/api/v1/invoice/create/monthly/invoice/direct \
  -H 'Authorization: Bearer <your-jwt-token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "companyId": "647891f4db2d9a5f80b45181"
  }'
```

### With Custom Date Range
```bash
curl -X POST \
  http://localhost:3001/api/v1/invoice/create/monthly/invoice/direct \
  -H 'Authorization: Bearer <your-jwt-token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "companyId": "647891f4db2d9a5f80b45181",
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-01-31T23:59:59Z"
  }'
```

## Features
- **Direct Function Call**: Directly calls the `createMonthlyInvoice` function for maximum flexibility
- **Custom Date Range**: Allows specifying custom start and end dates for the invoice period
- **Visa Sponsor Grouping**: Automatically groups employees by visa sponsor type and creates separate invoices
- **Automatic PDF Generation**: Generates PDF preview for each created invoice
- **Journal Entries**: Automatically creates corresponding journal entries
- **Employee Filtering**: Only includes active, onboarding, new visa process, or offboarding employees

## Differences from Existing API
- **POST /create/monthly/invoice**: Uses `createmonthlyInvoice` service method (PostMan version) with different parameter structure
- **POST /create/monthly/invoice/direct**: Directly calls `createMonthlyInvoice` function with company object and date parameters

## Notes
- The function groups employees by `visa_sponsor_type` and creates separate invoices for:
  - Dynamic Employment Services
  - Executive Employment Services
- Default monthly costs are used based on the visa sponsor type
- Invoice and due dates are calculated based on the company's payroll schedule
- VAT is automatically calculated at 5%
- Journal entries are automatically generated for accounting purposes
