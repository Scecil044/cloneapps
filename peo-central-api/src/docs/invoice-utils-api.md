# Invoice Utils API Documentation

## Overview
The Invoice Utils module provides automated and manual functions for managing invoice input reminders and related utilities.

## Base URL
```
/api/v1/invoice-utils
```

## Authentication
All endpoints require authentication with appropriate permissions:
- `getInvoiceInputs` - View invoice utilities data
- `manageInvoiceInputs` - Trigger utilities and send reminders

---

## 📋 API Endpoints

### 1. Trigger Invoice Input Reminder Check
**POST** `/api/v1/invoice-utils/reminder-check`

Manually triggers the automated reminder check process. This will check all companies with automated payroll enabled and send reminders to those whose cutoff date is 3 days away and haven't submitted invoice inputs.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Invoice input reminder check completed",
  "success": true,
  "emailsSent": 5,
  "errors": 0,
  "totalCompaniesChecked": 25
}
```

**Example Usage:**
```javascript
const triggerReminderCheck = async () => {
  const response = await fetch('/api/v1/invoice-utils/reminder-check', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  console.log('Reminder check result:', result);
};
```

### 2. Get Companies Needing Reminders
**GET** `/api/v1/invoice-utils/companies-needing-reminders`

Retrieves a list of companies that need invoice input reminders based on their cutoff dates and missing submissions.

**Query Parameters:**
- `month` (string, optional) - Month to check in YYYY-MM format (default: current month)

**Example Request:**
```
GET /api/v1/invoice-utils/companies-needing-reminders?month=2025-07
```

**Response (200 OK):**
```json
{
  "companies": [
    {
      "id": "60f1b2a3c4d5e6f7a8b9c0d1",
      "company_name": "ABC Corp",
      "legal_name": "ABC Corporation Ltd",
      "company_email": "admin@abccorp.com",
      "input_cutoff_date": "Every 15",
      "current_month": "2025-07"
    },
    {
      "id": "60f1b2a3c4d5e6f7a8b9c0d2",
      "company_name": "XYZ Ltd",
      "legal_name": "XYZ Limited",
      "company_email": "payroll@xyzltd.com",
      "input_cutoff_date": "Every 20",
      "current_month": "2025-07"
    }
  ],
  "count": 2,
  "month": "2025-07"
}
```

### 3. Send Manual Reminder to Company
**POST** `/api/v1/invoice-utils/send-manual-reminder/:companyId`

Sends a manual invoice input reminder email to a specific company.

**Parameters:**
- `companyId` (string, required) - Company ID

**Request Body:**
```json
{
  "month": "2025-07"
}
```

**Response (200 OK):**
```json
{
  "message": "Manual reminder sent successfully",
  "success": true
}
```

**Response (400 Bad Request) - If invoice already submitted:**
```json
{
  "message": "Failed to send manual reminder",
  "error": "Invoice input already submitted for this month"
}
```

### 4. Trigger Final Invoice Input Reminder Check
**POST** `/api/v1/invoice-utils/final-reminder-check`

Manually triggers the final reminder check process. This will check all companies whose cutoff date is TODAY and send urgent final reminders to those who haven't submitted invoice inputs.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Final invoice input reminder check completed",
  "success": true,
  "emailsSent": 3,
  "errors": 0,
  "totalCompaniesChecked": 25,
  "reminderType": "final"
}
```

**Example Usage:**
```javascript
const triggerFinalReminderCheck = async () => {
  const response = await fetch('/api/v1/invoice-utils/final-reminder-check', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  console.log('Final reminder check result:', result);
};
```

---

### 5. Get Companies Needing Final Reminders
**GET** `/api/v1/invoice-utils/companies-needing-final-reminders`

Returns a list of companies that need final reminders (cutoff date is today and no invoice input submitted).

**Request Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `month` (optional): Specific month in YYYY-MM format. Defaults to current month.

**Response (200 OK):**
```json
{
  "companies": [
    {
      "id": "507f1f77bcf86cd799439011",
      "company_name": "ABC Corp",
      "legal_name": "ABC Corporation Inc.",
      "company_email": "billing@abccorp.com",
      "input_cutoff_date": {
        "value": "15",
        "label": "15th of each month"
      },
      "current_month": "2025-07",
      "reminder_type": "final"
    }
  ],
  "count": 1,
  "month": "2025-07",
  "reminderType": "final"
}
```

**Example Usage:**
```javascript
const getCompaniesNeedingFinalReminders = async (month) => {
  const queryParams = month ? `?month=${month}` : '';
  const response = await fetch(`/api/v1/invoice-utils/companies-needing-final-reminders${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.companies;
};
```

---

### 6. Send Manual Final Reminder
**POST** `/api/v1/invoice-utils/send-manual-final-reminder/:companyId`

Sends a manual final reminder email to a specific company.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `companyId`: The MongoDB ObjectId of the company

**Request Body:**
```json
{
  "month": "2025-07"  // Optional: defaults to current month
}
```

**Response (200 OK):**
```json
{
  "message": "Manual final reminder sent successfully",
  "success": true,
  "reminderType": "final"
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Failed to send manual final reminder",
  "error": "Invoice input already submitted for this month"
}
```

**Example Usage:**
```javascript
const sendManualFinalReminder = async (companyId, month) => {
  const response = await fetch(`/api/v1/invoice-utils/send-manual-final-reminder/${companyId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ month })
  });
  
  const result = await response.json();
  
  if (response.ok) {
    console.log('Final reminder sent successfully');
  } else {
    console.error('Failed to send final reminder:', result.error);
  }
};
```

---

## 🔧 Automated Functionality

### Cron Job Schedule

The system automatically runs reminder checks:

1. **Daily Check**: Every day at 9:00 AM (Asia/Dubai timezone)
2. **Business Hours Check**: Every 6 hours during weekdays (Monday-Friday)

### Email Trigger Conditions

An email is sent to a company when ALL of the following conditions are met:

1. ✅ Company has `automated_payroll: true`
2. ✅ Company has a valid `company_email`
3. ✅ Company status is `active`
4. ✅ Company is not deleted (`is_deleted: false`)
5. ✅ Cutoff date is exactly 3 days from today
6. ✅ No invoice input exists for the current month

### Cutoff Date Parsing

The system supports multiple cutoff date formats:

- `"Every 15"` - 15th of every month
- `"15"` - 15th of every month  
- `"2025-07-15"` - Specific date

### Email Template

The reminder email includes:
- Company name and month
- Cutoff date information
- Days remaining (3 days)
- Direct link to invoice inputs portal
- Professional formatting with company branding

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install node-cron moment
```

### 2. Initialize Cron Jobs

Add to your main app file (e.g., `app.js` or `index.js`):

```javascript
const { initializeInvoiceCronJobs } = require('./src/utils/invoiceCronJobs');

// Initialize cron jobs after app setup
initializeInvoiceCronJobs();
```

### 3. Environment Variables

Ensure these environment variables are set:

```env
CLIENT_URL=https://your-portal.com
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD=your-smtp-password
EMAIL_FROM=noreply@yourcompany.com
```

### 4. Company Configuration

Ensure companies have the following fields configured:

```javascript
{
  "company_email": "admin@company.com",
  "payroll_schedule": {
    "automated_payroll": true,
    "input_cutoff_date": "Every 15"
  },
  "status": "active",
  "is_deleted": false
}
```

---

## 📊 Utility Functions

### Core Functions Available

```javascript
const {
  hasInvoiceInputForMonth,
  isCutoffDateApproaching,
  sendInvoiceInputReminderEmail,
  checkAndSendInvoiceInputReminders,
  getCompaniesNeedingReminders,
  sendManualReminder
} = require('./utils/invoiceUtils');

// Check if company has submitted invoice for month
const hasSubmitted = await hasInvoiceInputForMonth(companyId, '2025-07');

// Check if cutoff date is 3 days away
const isApproaching = isCutoffDateApproaching('Every 15');

// Get companies needing reminders
const companies = await getCompaniesNeedingReminders('2025-07');

// Send manual reminder
const result = await sendManualReminder(companyId, '2025-07');
```

---

## 🔍 Monitoring and Logs

### Log Messages

The system generates detailed logs for monitoring:

```
INFO: Starting invoice input reminder check...
INFO: Found 25 companies with automated payroll enabled
INFO: Invoice input reminder email sent to admin@company.com for ABC Corp
INFO: Invoice input reminder check completed. Emails sent: 5, Errors: 0
```

### Error Handling

- Invalid email addresses are logged and skipped
- Missing company data is handled gracefully
- Email service failures are logged but don't stop the process
- Cron job failures are logged for debugging

### Performance Considerations

- Uses database indexes for efficient querying
- Batches email sending to avoid overwhelming SMTP servers
- Caches current month calculations
- Skips unnecessary checks when conditions aren't met

---

## 🧪 Testing

### Manual Testing

```javascript
// Test reminder check
POST /api/v1/invoice-utils/reminder-check

// Test getting companies needing reminders
GET /api/v1/invoice-utils/companies-needing-reminders

// Test manual reminder
POST /api/v1/invoice-utils/send-manual-reminder/60f1b2a3c4d5e6f7a8b9c0d1
```

### Unit Testing

```javascript
const { isCutoffDateApproaching } = require('./utils/invoiceUtils');

// Test cutoff date parsing
expect(isCutoffDateApproaching('Every 15')).toBe(true); // if today + 3 days = 15th
expect(isCutoffDateApproaching('Every 20')).toBe(false); // if today + 3 days ≠ 20th
```

---

## 🚨 Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check SMTP configuration
   - Verify company email addresses
   - Check email service logs

2. **Cron jobs not running**
   - Verify timezone settings
   - Check server system time
   - Review cron job logs

3. **Wrong companies getting reminders**
   - Verify payroll_schedule configuration
   - Check cutoff date formats
   - Review automated_payroll flags

4. **Duplicate emails**
   - Check cron job frequency
   - Verify email tracking logic
   - Review business hours schedule

### Debug Mode

Enable debug logging:

```javascript
// Add to logger configuration
logger.level = 'debug';

// Test specific functions
const companies = await getCompaniesNeedingReminders();
console.log('Debug - Companies found:', companies);
```

---

## 🔮 Future Enhancements

The utility file is designed to be extensible for future invoice-related features:

1. **Late Submission Penalties**
2. **Invoice Approval Reminders**
3. **Payment Due Notifications**
4. **Monthly Reports Generation**
5. **Integration with External Accounting Systems**

---

**Need Help?** Contact the backend team for assistance with invoice utilities configuration or troubleshooting.
