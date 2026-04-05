# PeoCentral Admin - Comprehensive Billing System Documentation

## Overview
The PeoCentral Admin billing system is a sophisticated invoice management platform that supports multi-currency operations, automated invoice generation, credit/debit notes, bulk payments, and comprehensive payment tracking. The system handles complex financial workflows with real-time currency conversion and exchange rate management.

## System Architecture

### Frontend Components Structure
```
peo-central-admin/
├── pages/Billings/index.vue                    # Main billing page with tabs
├── components/Billings/
│   ├── billingsInvoiceWrapper.vue             # Main billing hub
│   ├── allInvoices.vue                        # Invoice listing component
│   ├── bulkPayments.vue                       # Bulk payment processing
│   └── paymentSchedule.vue                    # Payment scheduling
├── components/Dialogs/
│   ├── generalInvoiceDialog.vue               # Custom invoice creation
│   ├── creditNoteDialog.vue                   # Credit note creation
│   ├── debitNoteDialog.vue                    # Debit note creation
│   └── createInvoicePaymentRecord.vue         # Payment recording
├── components/invoice/
│   └── previewPanel.vue                       # Invoice preview & actions
└── components/ProcessFlow/
    └── RecordPayment/index.vue                # Payment recording component
```

### Backend API Structure
```
peo-central-api/
├── src/controllers/
│   ├── invoice.controller.js                  # Invoice CRUD operations
│   ├── payment.controller.js                  # Payment processing
│   ├── creditNote.controller.js              # Credit note management
│   └── debitNote.controller.js               # Debit note management
├── src/services/
│   ├── invoice.service.js                     # Invoice business logic
│   ├── payment.service.js                     # Payment processing logic
│   └── exchangeRate.service.js               # Currency conversion
├── src/routes/v1/
│   ├── invoice.route.js                       # Invoice API endpoints
│   ├── payment.routes.js                      # Payment API endpoints
│   └── exchangeRate.route.js                 # Exchange rate endpoints
└── src/validations/
    ├── invoice.validation.js                  # Invoice validation schemas
    └── payment.validation.js                  # Payment validation schemas
```

## Core Components Analysis

### 1. Main Billing Wrapper (`billingsInvoiceWrapper.vue`)

**Location**: `components/Billings/billingsInvoiceWrapper.vue`

**Purpose**: Central hub for all billing operations and invoice management

**Key Features**:
- Status filtering (Draft, Sent, Paid, Overdue, Unapproved, Void)
- New transaction menu with dropdown options
- Invoice preview and management
- Bulk operations support
- Real-time invoice status updates

**New Transaction Menu Options**:
```javascript
new_menu: [
  { title: 'Custom Invoice', value: 'general_invoice', locked: false },
  { title: 'Debit Note', value: 'debit_note', locked: false },
  { title: 'Bulk Payments', value: 'bulk_payments', locked: false },
  { title: 'Products/Services', value: 'products', locked: false },
]
```

**Key Methods**:
- `handleNewTransaction(value)` - Routes to appropriate dialog based on selection
- `getBillingList()` - Fetches paginated invoice list with filters
- `changeActiveStatus()` - Handles status filtering
- `handleRecordPayment()` - Opens payment recording dialog
- `handleReload()` - Refreshes invoice data

**Status Filtering**:
```javascript
statusFilters: [
  { text: 'All', value: 'all', count: 0 },
  { text: 'Draft', value: 'Draft', count: 0 },
  { text: 'Sent', value: 'Sent', count: 0 },
  { text: 'Paid', value: 'Paid', count: 0 },
  { text: 'Overdue', value: 'Overdue', count: 0 },
  { text: 'Unapproved', value: 'Unapproved', count: 0 },
  { text: 'Void', value: 'Void', count: 0 },
]
```

### 2. General Invoice Dialog (`generalInvoiceDialog.vue`)

**Location**: `components/Dialogs/generalInvoiceDialog.vue`

**Purpose**: Multi-step invoice creation wizard with currency support

**Key Features**:
- Multi-step invoice creation process
- Real-time currency conversion
- Exchange rate integration
- PDF generation and download
- Preview functionality
- Customer and company selection
- Item/service management

**Currency Handling**:
```javascript
// Currency options
currencyOptions: ['AED', 'USD', 'EUR']

// Invoice object structure
invoiceObj: {
  currency: 'AED',                    // Default to AED
  conversion_rate: 1.0,              // Default exchange rate for AED
  base_currency: 'AED',               // Always AED as base currency
  converted_amount_aed: 0,           // Amount converted to AED for reporting
  // ... other fields
}

// Currency change handler
async changeCurrency() {
  if (this.invoiceObj.currency === 'AED') {
    this.invoiceObj.conversion_rate = 1.0;
  } else {
    await this.fetchCurrentExchangeRate();
  }
  this.updateConvertedAmount();
}

// Exchange rate fetching
async fetchCurrentExchangeRate() {
  const response = await this.$axios.get('/exchange-rates/latest');
  if (response.data.success && response.data.data) {
    const rates = response.data.data;
    this.invoiceObj.conversion_rate = rates[this.invoiceObj.currency] || 1.0;
    this.updateConvertedAmount();
  }
}
```

**Invoice Creation Steps**:
1. **Customer Selection** - Choose customer/company
2. **Invoice Details** - Basic information, dates, terms
3. **Items/Services** - Add line items with pricing
4. **Currency & Exchange Rate** - Set currency and conversion rate
5. **Preview & Generate** - Review and create invoice

**API Integration**:
```javascript
// Create invoice
POST /invoices
Request: {
  customer: "company_id",
  currency: "USD",
  conversion_rate: 3.67,
  base_currency: "AED",
  items: [...],
  sub_total: 1000,
  total: 1000
}
```

### 3. Invoice Preview Panel (`previewPanel.vue`)

**Location**: `components/invoice/previewPanel.vue`

**Purpose**: Invoice preview and action management

**Key Features**:
- Invoice preview with PDF rendering
- Payment recording interface
- Credit/Debit note creation
- Invoice editing capabilities
- Email sending functionality
- Payment history display

**Action Buttons**:
```javascript
// Available actions based on invoice status
actions: {
  edit: !['Paid', 'Partially Paid'].includes(status),
  creditNote: !['Unapproved', 'Paid'].includes(status) && !is_draft,
  debitNote: !['Unapproved', 'Paid'].includes(status) && !is_draft,
  createPayment: !['Unapproved', 'Paid'].includes(status) && !is_draft,
  approve: status === 'Unapproved' && !is_draft
}
```

**Payment Integration**:
```javascript
// Emit payment creation event
emitAction('add-payment', invoiceData)

// Handle payment recording
handleRecordPayment(invoiceData) {
  this.$emit('add-payment', invoiceData);
}
```

### 4. Bulk Payments Component (`bulkPayments.vue`)

**Location**: `components/Billings/bulkPayments.vue`

**Purpose**: Process multiple invoice payments simultaneously

**Key Features**:
- Multi-invoice selection
- Currency filtering
- Payment method selection
- Bank charge handling
- Reference tracking
- Document upload support

**Payment Processing**:
```javascript
// Payment details structure
paymentDetails: {
  customer: '',
  total_payment_amount: '0.00',
  payment_date: '',
  payment_mode: '',
  invoices: [],
  reference: '',
  charges: '0.00',
  bank_name: '',
  payment_link: '',
  // Currency fields
  currency: 'AED',
  conversion_rate: 1.0,
  base_currency: 'AED',
  converted_amount_aed: 0
}

// Payment method options
paymentMethodList: [
  'Cash', 'Cheque', 'Credit Card', 'Direct Debit',
  'Bank Transfer', 'Payment Link', 'Others'
]

// Generate bulk payment
async generatePayment() {
  const obj = {
    customer: this.paymentDetails.customer,
    total_payment_amount: Number(this.paymentDetails.total_payment_amount).toFixed(2),
    invoices: this.invoice_amounts_mapping.map(el => ({
      _id: el._id,
      amount: Number(el.amount).toFixed(2)
    })),
    currency: this.selectedCurrency || 'AED',
    conversion_rate: this.getConversionRate(this.selectedCurrency),
    base_currency: 'AED',
    converted_amount_aed: this.calculateConvertedAmountAED()
  };
  
  await this.$axios.$post('/invoice/record/multiple/payments', obj);
}
```

### 5. Credit Note Dialog (`creditNoteDialog.vue`)

**Location**: `components/Dialogs/creditNoteDialog.vue`

**Purpose**: Create and manage credit notes for invoice adjustments

**Key Features**:
- Credit note creation wizard
- Item-based adjustments
- Reason tracking
- Currency inheritance from invoice
- PDF generation
- Status management (Draft, Unapproved, Approved)

**Credit Note Creation**:
```javascript
// Credit note data structure
creditNoteObj: {
  invoice_id: '',
  customer: '',
  reason: '',
  items: [],
  sub_total: 0,
  vat_total: 0,
  total: 0,
  currency: '', // Inherited from invoice
  conversion_rate: 0,
  base_currency: 'AED',
  converted_amount_aed: 0
}

// Save credit note
async saveCreditNote() {
  const creditNoteData = {
    ...this.creditNoteObj,
    invoice_id: this.originalInvoice?._id,
    customer: this.creditNoteObj.customer,
    company: this.creditNoteObj.customer,
    invoice: this.originalInvoice?._id
  };
  
  const response = await this.$axios.$post('/credit/notes/create', creditNoteData);
}
```

### 6. Debit Note Dialog (`debitNoteDialog.vue`)

**Location**: `components/Dialogs/debitNoteDialog.vue`

**Purpose**: Create and manage debit notes for additional charges

**Key Features**:
- Debit note creation wizard
- Additional charge items
- Reason documentation
- Currency support
- Status workflow management

**Debit Note Processing**:
```javascript
// Debit note creation
async createDebitNote() {
  await this.updateDebitNote(true); // true for final creation
}

// Update debit note
async updateDebitNote(final = false) {
  const updateData = {
    ...this.debitNoteObj,
    invoice_id: this.originalInvoice?._id,
    is_draft: !final,
    status: !final ? 'Draft' : 'Unapproved',
    total: this.debitNoteObj.total,
    debit_amount: this.debitNoteObj.total,
    balance_due: this.debitNoteObj.total
  };
  
  const response = await this.$axios.$post('/debit/notes/generate', updateData);
}
```

## Payment Processing System

### 1. Payment Recording (`createInvoicePaymentRecord.vue`)

**Location**: `components/Dialogs/createInvoicePaymentRecord.vue`

**Purpose**: Record individual invoice payments

**Key Features**:
- Payment amount validation
- Payment method selection
- Bank charge handling
- Reference tracking
- Currency conversion
- Payment date management

**Payment Data Structure**:
```javascript
paymentDetails: {
  customer: '',
  invoice: '',
  amount: '0.00',
  payment_date: '',
  payment_mode: '',
  reference: '',
  charges: '0.00',
  bank_name: '',
  payment_link: '',
  // Currency information
  currency: '',
  conversion_rate: 0,
  base_currency: 'AED',
  converted_amount_aed: 0
}
```

**Payment Generation**:
```javascript
async generatePayment() {
  const obj = {
    customer: this.paymentDetails.customer,
    invoice: this.invoice_id,
    amount: this.paymentDetails.amount,
    invoice_number: this.paymentDetails.invoice_number,
    reference: this.paymentDetails.invoice_ref_number,
    bank_charge: this.paymentDetails.charges || 0,
    bank_name: this.paymentDetails?.bank_name || '',
    payment_link: this.paymentDetails?.payment_link || '',
    payment_date: this.paymentDetails.payment_date,
    payment_mode: this.paymentDetails.payment_method,
    notes: this.paymentDetails.payment_method === 'Others' ? this.paymentDetails.remarks : '',
    // Currency information
    currency: this.invoiceCurrency,
    conversion_rate: this.conversionRate,
    base_currency: this.invoiceBaseCurrency || 'AED',
    converted_amount_aed: this.calculateConvertedAmountAED()
  };
  
  await this.$axios.$post('/invoice/record/payment', obj);
}
```

### 2. Payment Validation and Processing

**Backend Payment Processing** (`invoice.controller.js`):
```javascript
const recordPayment = catchAsync(async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const invoice = await invoiceService.getInvoiceById(invoiceId);
      
      // Extract currency information from invoice
      const invoiceCurrency = invoice.currency || 'AED';
      const invoiceConversionRate = invoice.conversion_rate || 1.0;
      const invoiceBaseCurrency = invoice.base_currency || 'AED';
      
      // Calculate converted amounts to AED for reporting
      const paymentAmount = Number(newBody.amount);
      const bankCharge = Number(newBody.bank_charge || 0);
      const convertedAmountAED = paymentAmount * invoiceConversionRate;
      const convertedBankChargeAED = bankCharge * invoiceConversionRate;
      const totalConvertedAED = convertedAmountAED + convertedBankChargeAED;
      
      // Add currency information to payment payload
      body.currency = invoiceCurrency;
      body.conversion_rate = invoiceConversionRate;
      body.base_currency = invoiceBaseCurrency;
      body.converted_amount_aed = totalConvertedAED;
      
      // Validate payment amount
      const alreadySettled = Number(invoice.partial_amount || 0);
      const totalDueNum = Number(invoice.balance_due);
      
      if (paymentAmount + bankCharge > totalDueNum - alreadySettled) {
        throw new Error('Payment amount exceeds remaining balance');
      }
      
      // Record payment
      const payment = await paymentService.createPayment(body, session);
      
      // Update invoice balance
      await invoiceService.updateInvoiceBalance(invoiceId, paymentAmount, session);
    });
    
    res.status(200).json({ success: true, message: 'Payment recorded successfully' });
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
});
```

## Currency System

### 1. Exchange Rate Management

**Exchange Rate Service** (`exchangeRate.service.js`):
```javascript
// Fetch latest exchange rates
const getLatestRates = async () => {
  const rates = await ExchangeRate.findOne()
    .sort({ createdAt: -1 })
    .lean();
  
  return rates ? rates.rates : { AED: 1.0, USD: 3.67, EUR: 4.02 };
};

// Save exchange rates
const saveExchangeRates = async (ratesData) => {
  const exchangeRate = await ExchangeRate.create({
    base: 'AED',
    rates: ratesData,
    date: new Date()
  });
  
  return exchangeRate;
};
```

**API Endpoints**:
```javascript
// Get latest exchange rates
GET /exchange-rates/latest
Response: {
  "success": true,
  "data": {
    "USD": 3.67,
    "EUR": 4.02,
    "AED": 1.0
  }
}

// Fetch and save exchange rates (admin)
POST /exchange-rates/fetch
Response: {
  "success": true,
  "message": "Exchange rates saved successfully",
  "data": {
    "_id": "rate_id",
    "base": "AED",
    "rates": { "USD": 3.67, "EUR": 4.02, "AED": 1.0 },
    "date": "2024-01-15T00:00:00.000Z"
  }
}
```

### 2. Currency Conversion Logic

**Frontend Currency Handling**:
```javascript
// Currency conversion methods
updateConvertedAmount() {
  // Calculate AED equivalent based on current total and exchange rate
  if (this.invoiceObj.total && this.invoiceObj.conversion_rate) {
    this.invoiceObj.converted_amount_aed = 
      this.invoiceObj.total * this.invoiceObj.conversion_rate;
  }
}

calculateConvertedAmountAED() {
  const amount = Number(this.paymentDetails.total_payment_amount || 0);
  const rate = this.getConversionRate(this.selectedCurrency);
  return amount * rate;
}

getConversionRate(currency) {
  if (currency === 'AED') return 1.0;
  // Fetch from exchange rates or use default
  return this.exchangeRates[currency] || 1.0;
}
```

**Backend Currency Processing**:
```javascript
// Currency validation schema
const invoiceSchema = Joi.object().keys({
  currency: Joi.string().valid('AED', 'USD', 'EUR').required(),
  conversion_rate: Joi.number().min(0).required(),
  base_currency: Joi.string().valid('AED').required(),
  converted_amount_aed: Joi.number().min(0).required(),
  // ... other fields
});

// Payment currency validation
const recordPayment = {
  body: Joi.object().keys({
    // ... other fields
    currency: Joi.string().valid('AED', 'USD', 'EUR').optional().allow('', null),
    conversion_rate: Joi.number().min(0).optional().allow(null),
    base_currency: Joi.string().valid('AED').optional().allow(null),
    converted_amount_aed: Joi.number().min(0).optional().allow(null),
  }),
};
```

## API Endpoints Reference

### Invoice Management
```javascript
// Create invoice
POST /invoices
Request: {
  customer: "company_id",
  currency: "USD",
  conversion_rate: 3.67,
  base_currency: "AED",
  items: [...],
  sub_total: 1000,
  total: 1000
}

// Update invoice
PUT /invoices/:id
Request: { /* updated invoice data */ }

// Get invoice by ID
GET /invoices/:id
Response: {
  "_id": "invoice_id",
  "invoice_number": "INV-001",
  "currency": "USD",
  "conversion_rate": 3.67,
  "converted_amount_aed": 3670,
  "balance_due": 1000,
  "status": "Draft"
}

// List invoices with filters
POST /invoice/list
Request: {
  page: 1,
  limit: 50,
  status: ["Draft", "Sent"],
  company_id: "company_id",
  currency: "USD"
}
```

### Payment Processing
```javascript
// Record single payment
POST /invoice/record/payment
Request: {
  invoice: "invoice_id",
  amount: 500,
  currency: "USD",
  conversion_rate: 3.67,
  payment_date: "2024-01-15",
  payment_mode: "Bank Transfer",
  bank_charge: 10,
  reference: "REF123"
}

// Record multiple payments (bulk)
POST /invoice/record/multiple/payments
Request: {
  customer: "company_id",
  total_payment_amount: 1500,
  invoices: [
    { _id: "invoice1", amount: 500 },
    { _id: "invoice2", amount: 1000 }
  ],
  currency: "USD",
  conversion_rate: 3.67,
  payment_date: "2024-01-15",
  payment_mode: "Bank Transfer"
}

// Update payment
PATCH /invoice/update/payment/:paymentId
Request: { /* updated payment data */ }
```

### Credit/Debit Notes
```javascript
// Create credit note
POST /credit/notes/create
Request: {
  invoice_id: "invoice_id",
  total_credit_amount: 200,
  reason: "Service adjustment",
  items: [...]
}

// Update credit note
PUT /credit/notes/update/:id
Request: { /* updated credit note data */ }

// Create debit note
POST /debit/notes/generate
Request: {
  invoice_id: "invoice_id",
  total_debit_amount: 150,
  reason: "Additional charges",
  items: [...]
}

// Update debit note
PUT /debit/notes/update/:id
Request: { /* updated debit note data */ }
```

## Data Flow Architecture

### 1. Invoice Creation Flow
```
1. User navigates to Billings → billingsInvoiceWrapper.vue
2. Clicks "Custom Invoice" → Opens generalInvoiceDialog.vue
3. Selects customer → Fetches company details
4. Adds items/services → Calculates totals
5. Selects currency → Fetches exchange rate
6. Reviews preview → Generates PDF
7. Saves invoice → POST /invoices
8. Updates invoice list → Refreshes UI
```

### 2. Payment Processing Flow
```
1. User clicks "Create Payment" on invoice → Opens createInvoicePaymentRecord.vue
2. Enters payment details → Validates amount
3. Selects payment method → Adds bank charges
4. Submits payment → POST /invoice/record/payment
5. Backend validates → Updates invoice balance
6. Records payment → Updates payment history
7. Refreshes UI → Shows updated status
```

### 3. Bulk Payment Flow
```
1. User selects multiple invoices → Opens bulkPayments.vue
2. Filters by currency → Shows relevant invoices
3. Selects invoices → Calculates total amount
4. Enters payment details → Validates totals
5. Submits bulk payment → POST /invoice/record/multiple/payments
6. Backend processes each invoice → Updates balances
7. Records payment → Updates all invoice statuses
8. Refreshes UI → Shows updated statuses
```

### 4. Credit/Debit Note Flow
```
1. User clicks "Credit Note" on invoice → Opens creditNoteDialog.vue
2. Selects reason → Adds adjustment items
3. Calculates totals → Validates amounts
4. Saves credit note → POST /credit/notes/create
5. Backend creates note → Links to invoice
6. Updates invoice balance → Refreshes UI
```

## Key Features Summary

### Multi-Currency Support
- **Supported Currencies**: AED (base), USD, EUR
- **Real-time Exchange Rates**: Automatic fetching from API
- **Currency Conversion**: All amounts converted to AED for reporting
- **Currency Validation**: Strict validation on all currency fields

### Payment Methods
- **Cash**: Direct cash payments
- **Cheque**: Check payments with reference tracking
- **Credit Card**: Card payments with processing fees
- **Direct Debit**: Automated bank transfers
- **Bank Transfer**: Wire transfers with bank details
- **Payment Link**: Online payment processing
- **Others**: Custom payment methods with notes

### Invoice Status Management
- **Draft**: Work in progress, not sent
- **Sent**: Delivered to customer
- **Paid**: Fully paid
- **Partially Paid**: Partial payment received
- **Overdue**: Past due date
- **Unapproved**: Pending approval
- **Void**: Cancelled invoice

### Document Management
- **PDF Generation**: Automatic invoice PDF creation
- **Email Integration**: Send invoices via email
- **Document Upload**: Attach payment proofs
- **Print Support**: Direct printing functionality

### Reporting and Analytics
- **Currency Reporting**: All amounts in AED for consistency
- **Payment Tracking**: Complete payment history
- **Status Analytics**: Invoice status distribution
- **Customer Analytics**: Payment patterns per customer

## Security and Validation

### Frontend Validation
- **Form Validation**: Required field validation
- **Amount Validation**: Positive number validation
- **Date Validation**: Proper date format validation
- **Currency Validation**: Valid currency selection

### Backend Validation
- **Joi Schemas**: Comprehensive validation schemas
- **Currency Validation**: Strict currency field validation
- **Amount Validation**: Positive amount validation
- **Reference Validation**: Unique reference tracking

### Data Integrity
- **Transaction Support**: Database transactions for consistency
- **Currency Consistency**: All amounts stored with currency metadata
- **Audit Trail**: Complete payment and invoice history
- **Error Handling**: Comprehensive error handling and logging

## Integration Points

### External Services
- **Exchange Rate API**: Real-time currency conversion
- **Email Service**: Invoice delivery
- **PDF Generation**: Document creation
- **Payment Gateways**: Online payment processing

### Internal Systems
- **Customer Management**: Company and contact integration
- **Document Management**: File upload and storage
- **User Management**: Authentication and authorization
- **Reporting System**: Analytics and reporting integration

This comprehensive billing system provides a robust foundation for managing invoices, payments, and financial operations with full multi-currency support and advanced features for enterprise-level financial management.
