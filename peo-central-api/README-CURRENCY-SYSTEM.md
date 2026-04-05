# PeoCentral API - Currency Handling & Billing System Documentation

## Overview
The PeoCentral API provides comprehensive multi-currency billing functionality with real-time exchange rate integration, automated currency conversion, and robust financial transaction processing. The system supports AED (base currency), USD, and EUR with automatic conversion to AED for reporting and analytics.

## Core Models

### 1. Invoice Model (`invoice.model.js`)
**Location**: `src/models/invoice.model.js`

**Currency Fields**:
```javascript
currency: {
  type: String,
  enum: ['AED', 'USD', 'EUR'],
  default: 'AED',
},
conversion_rate: {
  type: Number,
  default: 1.0, // 1.0 for AED, actual rate for other currencies
},
base_currency: {
  type: String,
  default: 'AED', // Always AED as base currency
},
converted_amount_aed: {
  type: Number, // Amount converted to AED for reporting
},
```

**Key Features**:
- Multi-currency support with AED as base currency
- Automatic conversion rate storage
- AED equivalent calculation for reporting
- Currency validation and constraints

### 2. Exchange Rate Model (`ExchangeRate.model.js`)
**Location**: `src/models/ExchangeRate.model.js`

**Schema Structure**:
```javascript
const exchangeRateSchema = new mongoose.Schema({
  base: {
    type: String,
    default: "AED", // base currency
    required: true,
  },
  rates: {
    USD: { type: Number, required: true },
    EUR: { type: Number, required: true },
    AED: { type: Number, required: true },
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

// Unique index to prevent duplicate rates for same date
exchangeRateSchema.index({ base: 1, date: 1 }, { unique: true });
```

**Features**:
- Daily exchange rate storage
- Unique constraint on base currency and date
- Soft deletion support
- Timestamp tracking

### 3. Credit Note Model (`CreditNote.model.js`)
**Location**: `src/models/CreditNote.model.js`

**Currency Fields**:
```javascript
currency: {
  type: String,
  enum: ['AED', 'USD', 'EUR'],
  default: 'AED',
},
conversion_rate: {
  type: Number,
  default: 1.0,
},
base_currency: {
  type: String,
  default: 'AED',
},
converted_amount_aed: {
  type: Number,
  default: 0,
},
```

**Features**:
- Inherits currency from parent invoice
- Maintains conversion rates for accurate reporting
- Supports multi-currency credit applications

### 4. Debit Note Model (`debit_note.model.js`)
**Location**: `src/models/debit_note.model.js`

**Currency Fields**:
```javascript
currency: {
  type: String,
  enum: ['AED', 'USD', 'EUR'],
  default: 'AED',
},
conversion_rate: {
  type: Number,
  default: 1.0,
},
base_currency: {
  type: String,
  default: 'AED',
},
converted_amount_aed: {
  type: Number,
  default: 0,
},
```

**Features**:
- Currency inheritance from parent invoice
- Multi-currency debit note processing
- AED conversion for reporting

### 5. Payment Model (`payment.model.js`)
**Location**: `src/models/payment.model.js`

**Currency Fields**:
```javascript
currency: {
  type: String,
  enum: ['AED', 'USD', 'EUR'],
  default: 'AED',
},
conversion_rate: {
  type: Number,
  default: 1.0,
},
base_currency: {
  type: String,
  default: 'AED',
},
converted_amount_aed: {
  type: Number,
  default: 0,
},
bank_charge: {
  type: Number,
  default: 0,
},
```

**Features**:
- Multi-currency payment processing
- Bank charge handling with currency
- AED conversion for reporting
- Payment mode tracking

## Services

### 1. Exchange Rate Service (`exchangeRate.service.js`)
**Location**: `src/services/exchangeRate.service.js`

**Key Functions**:

#### `fetchAndSaveExchangeRates()`
```javascript
const fetchAndSaveExchangeRates = async () => {
  try {
    // Get current exchange rates from API
    const exchangeRates = await getExchangeRates();

    // Check if rates for today already exist
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingRate = await ExchangeRate.findOne({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
      is_deleted: false,
    });

    if (existingRate) {
      return {
        success: true,
        message: 'Exchange rates for today already exist',
        data: existingRate,
      };
    }

    // Create new exchange rate record
    const newExchangeRate = new ExchangeRate({
      base: 'AED',
      rates: {
        USD: exchangeRates.USD,
        EUR: exchangeRates.EUR,
        AED: exchangeRates.AED,
      },
      date: new Date(exchangeRates.date),
    });

    const savedRate = await newExchangeRate.save();
    return {
      success: true,
      message: 'Exchange rates saved successfully',
      data: savedRate,
    };
  } catch (error) {
    throw error;
  }
};
```

#### `getLatestExchangeRates()`
```javascript
const getLatestExchangeRates = async () => {
  try {
    const latestRates = await ExchangeRate.findOne({
      is_deleted: false,
    }).sort({ date: -1 });

    if (!latestRates) {
      // Return default rates if no rates found
      return {
        success: true,
        data: {
          USD: 3.67,
          EUR: 4.02,
          AED: 1.0,
        },
      };
    }

    return {
      success: true,
      data: latestRates.rates,
    };
  } catch (error) {
    throw error;
  }
};
```

### 2. Invoice Service (`invoice.service.js`)
**Location**: `src/services/invoice.service.js`

**Currency Processing**:
- Automatic currency conversion on invoice creation
- AED equivalent calculation
- Multi-currency payment processing
- Currency validation and constraints

### 3. Credit Note Service (`credit_note.service.js`)
**Location**: `src/services/credit_note.service.js`

**Currency Inheritance Logic**:
```javascript
const generateCreditNote = async reqBody => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Get parent invoice
    const parentInvoice = await Invoice.findById(reqBody.invoice_id).session(session);

    // Extract currency information from parent invoice
    const inheritedCurrency = parentInvoice.currency || 'AED';
    const inheritedConversionRate = parentInvoice.conversion_rate || 1.0;
    const inheritedBaseCurrency = parentInvoice.base_currency || 'AED';

    // Calculate converted amount to AED for reporting
    const totalAmount = reqBody.total || 0;
    const convertedAmountAED = totalAmount * inheritedConversionRate;

    // Add currency fields to request body
    reqBody.currency = inheritedCurrency;
    reqBody.conversion_rate = inheritedConversionRate;
    reqBody.base_currency = inheritedBaseCurrency;
    reqBody.converted_amount_aed = convertedAmountAED;

    // ... rest of credit note creation logic
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
```

### 4. Debit Note Service (`debit_note.service.js`)
**Location**: `src/services/debit_note.service.js`

**Currency Inheritance Logic**:
```javascript
const generateDebitNote = async (reqBody) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Get parent invoice
    const parentInvoice = await Invoice.findById(reqBody.invoice_id).session(session);

    // Extract currency information from parent invoice
    const inheritedCurrency = parentInvoice.currency || 'AED';
    const inheritedConversionRate = parentInvoice.conversion_rate || 1.0;
    const inheritedBaseCurrency = parentInvoice.base_currency || 'AED';

    // Calculate converted amount to AED for reporting
    const totalAmount = reqBody.total || 0;
    const convertedAmountAED = totalAmount * inheritedConversionRate;

    // Add currency fields to request body
    reqBody.currency = inheritedCurrency;
    reqBody.conversion_rate = inheritedConversionRate;
    reqBody.base_currency = inheritedBaseCurrency;
    reqBody.converted_amount_aed = convertedAmountAED;

    // ... rest of debit note creation logic
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
```

## Controllers

### 1. Invoice Controller (`invoice.controller.js`)
**Location**: `src/controllers/invoice.controller.js`

#### `recordPayment` Function
**Currency Processing Logic**:
```javascript
const recordPayment = catchAsync(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

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

    console.log('[recordPayment] Currency info:', {
      invoiceCurrency,
      invoiceConversionRate,
      paymentAmount,
      bankCharge,
      totalConvertedAED
    });

    // ... rest of payment processing logic
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});
```

## Helpers

### 1. Currency Conversion Helper (`currency_conversion_helper.js`)
**Location**: `src/helpers/currency_conversion_helper.js`

**Exchange Rate API Integration**:
```javascript
const axios = require("axios");

const getExchangeRates = async () => {
  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/AED');
    return {
      USD: response.data.rates.USD,
      EUR: response.data.rates.EUR,
      AED: 1.0,
      date: response.data.date
    };
  } catch (error) {
    console.error('Exchange rate API error:', error);
    // Fallback to default rates
    return {
      USD: 3.67, // Fallback rate
      EUR: 4.02, // Fallback rate
      AED: 1.0,
      date: new Date().toISOString().split('T')[0]
    };
  }
};

module.exports = { getExchangeRates };
```

**Features**:
- Real-time exchange rate fetching
- Fallback to default rates on API failure
- Error handling and logging
- AED-based rate calculation

## Validations

### 1. Invoice Validation (`invoice.validation.js`)
**Location**: `src/validations/invoice.validation.js`

**Currency Validation Rules**:
```javascript
const recordPayment = {
  body: Joi.object().keys({
    customer: Joi.string().custom(objectId).required(),
    invoice: Joi.string().custom(objectId).required(),
    amount: Joi.number().required(),
    invoice_number: Joi.string().required(),
    reference: Joi.string().required(),
    bank_charge: Joi.number().default(0),
    bank_name: Joi.string().allow('').default(''),
    payment_link: Joi.string().allow('').default(''),
    payment_date: Joi.date().required(),
    payment_mode: Joi.string().required(),
    notes: Joi.string().optional().allow(null, ''),
    is_thanks_required: Joi.number().default(1),
    // Currency fields (optional - will be populated from invoice if not provided)
    currency: Joi.string().valid('AED', 'USD', 'EUR').optional().allow('', null),
    conversion_rate: Joi.number().min(0).optional().allow(null),
    base_currency: Joi.string().valid('AED').optional().allow(null),
    converted_amount_aed: Joi.number().min(0).optional().allow(null),
  }),
};
```

### 2. Credit Note Validation (`creditNote.validations.js`)
**Location**: `src/validations/creditNote.validations.js`

**Currency Validation Rules**:
```javascript
const createCreditNote = {
  body: Joi.object().keys({
    invoice_number: Joi.string().required(),
    reason: Joi.string().required(),
    sub_total: Joi.number().required(),
    vat_total: Joi.number().required(),
    invoice_id: Joi.custom(objectId).required(),
    customer: Joi.custom(objectId).required(),
    company: Joi.custom(objectId).required(),
    total_credit_amount: Joi.number().min(1).required(),
    items: Joi.array().required(),
    // Currency fields for multi-currency support
    currency: Joi.string().valid('AED', 'USD', 'EUR').optional().allow('', null),
    conversion_rate: Joi.number().min(0).optional().allow(null),
    base_currency: Joi.string().valid('AED').optional().allow(null),
    converted_amount_aed: Joi.number().min(0).optional().allow(null),
  }),
};
```

## API Endpoints

### Exchange Rate Endpoints
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
    "rates": {
      "USD": 3.67,
      "EUR": 4.02,
      "AED": 1.0
    },
    "date": "2024-01-15T00:00:00.000Z"
  }
}
```

### Invoice Endpoints
```javascript
// Create invoice with currency
POST /invoices
Request: {
  "customer": "company_id",
  "currency": "USD",
  "conversion_rate": 3.67,
  "base_currency": "AED",
  "items": [...],
  "sub_total": 1000,
  "total": 1000
}
Response: {
  "success": true,
  "data": {
    "_id": "invoice_id",
    "invoice_number": "INV-001",
    "currency": "USD",
    "conversion_rate": 3.67,
    "converted_amount_aed": 3670,
    "balance_due": 1000,
    "status": "Draft"
  }
}

// Record payment with currency
POST /invoices/record-payment
Request: {
  "invoice": "invoice_id",
  "amount": 500,
  "currency": "USD",
  "conversion_rate": 3.67,
  "payment_date": "2024-01-15",
  "payment_mode": "Bank Transfer",
  "bank_charge": 10
}
Response: {
  "success": true,
  "data": {
    "payment_id": "payment_id",
    "amount": 500,
    "currency": "USD",
    "conversion_rate": 3.67,
    "converted_amount_aed": 1835,
    "bank_charge": 10,
    "converted_bank_charge_aed": 36.7
  }
}
```

### Credit/Debit Note Endpoints
```javascript
// Create credit note
POST /credit-notes
Request: {
  "invoice_id": "invoice_id",
  "total_credit_amount": 200,
  "reason": "Service adjustment",
  "items": [...]
}
Response: {
  "success": true,
  "data": {
    "_id": "credit_note_id",
    "credit_note_number": "CN-001",
    "currency": "USD", // Inherited from invoice
    "conversion_rate": 3.67,
    "converted_amount_aed": 734,
    "status": "Draft"
  }
}

// Create debit note
POST /debit-notes
Request: {
  "invoice_id": "invoice_id",
  "total_debit_amount": 150,
  "reason": "Additional charges",
  "items": [...]
}
Response: {
  "success": true,
  "data": {
    "_id": "debit_note_id",
    "debit_note_number": "DN-001",
    "currency": "USD", // Inherited from invoice
    "conversion_rate": 3.67,
    "converted_amount_aed": 550.5,
    "status": "Draft"
  }
}
```

## Currency Processing Flow

### 1. Invoice Creation Flow
```
1. User creates invoice with currency selection
2. System fetches current exchange rate
3. Conversion rate is applied to invoice
4. AED equivalent is calculated and stored
5. Invoice is created with currency metadata
6. PDF is generated with proper currency formatting
```

### 2. Payment Processing Flow
```
1. Payment is received with currency information
2. System validates currency against invoice
3. Amount is converted to AED using stored rate
4. Payment is recorded with currency metadata
5. Invoice balance is updated
6. Reporting data is updated with AED amounts
```

### 3. Credit/Debit Note Flow
```
1. Credit/Debit note is created for invoice
2. Currency information is inherited from parent invoice
3. Conversion rate is maintained from parent
4. AED equivalent is calculated
5. Note is applied to invoice balance
6. Reporting is updated with converted amounts
```

## Error Handling

### 1. Exchange Rate Errors
```javascript
// Fallback rates when API fails
const fallbackRates = {
  USD: 3.67,
  EUR: 4.02,
  AED: 1.0
};

// Error handling in service
try {
  const rates = await getExchangeRates();
  return rates;
} catch (error) {
  console.error('Exchange rate API error:', error);
  return fallbackRates;
}
```

### 2. Currency Validation Errors
```javascript
// Validation error handling
if (!['AED', 'USD', 'EUR'].includes(currency)) {
  throw new Error('Invalid currency code');
}

if (conversion_rate < 0) {
  throw new Error('Conversion rate must be positive');
}
```

### 3. Transaction Rollback
```javascript
// Transaction handling with rollback
const session = await mongoose.startSession();
try {
  session.startTransaction();
  // ... currency processing logic
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

## Database Indexes

### Exchange Rate Indexes
```javascript
// Unique index to prevent duplicate rates
exchangeRateSchema.index({ base: 1, date: 1 }, { unique: true });

// Index for efficient date-based queries
exchangeRateSchema.index({ date: -1 });
```

### Invoice Indexes
```javascript
// Currency-based queries
invoiceSchema.index({ currency: 1 });
invoiceSchema.index({ base_currency: 1 });

// Date-based queries
invoiceSchema.index({ invoice_date: -1 });
invoiceSchema.index({ due_date: -1 });
```

## Cron Jobs

### Exchange Rate Updates
```javascript
// Daily exchange rate update (runs at 9 AM UTC)
cron.schedule('0 9 * * *', async () => {
  try {
    await exchangeRateService.fetchAndSaveExchangeRates();
    console.log('Daily exchange rates updated successfully');
  } catch (error) {
    console.error('Failed to update exchange rates:', error);
  }
});
```

## Security Considerations

### 1. Currency Validation
- Strict currency code validation
- Conversion rate bounds checking
- Amount precision validation

### 2. Transaction Security
- Database transactions for currency operations
- Rollback on currency calculation errors
- Audit logging for currency changes

### 3. API Security
- Rate limiting for exchange rate API calls
- Input sanitization for currency fields
- Authorization checks for currency operations

## Performance Optimizations

### 1. Caching
- Exchange rate caching for 24 hours
- Currency conversion result caching
- Frequently accessed currency data caching

### 2. Database Optimization
- Proper indexing for currency queries
- Aggregation pipelines for currency reports
- Efficient currency-based filtering

### 3. API Optimization
- Batch currency operations
- Parallel exchange rate fetching
- Optimized currency conversion algorithms

## Monitoring and Logging

### 1. Currency Operations Logging
```javascript
// Log currency operations
console.log('[recordPayment] Currency info:', {
  invoiceCurrency,
  invoiceConversionRate,
  paymentAmount,
  bankCharge,
  totalConvertedAED
});
```

### 2. Exchange Rate Monitoring
- API response time monitoring
- Exchange rate accuracy tracking
- Currency conversion error logging

### 3. Performance Metrics
- Currency conversion processing time
- Exchange rate API success rate
- Database query performance for currency operations

## Testing

### 1. Unit Tests
- Currency conversion accuracy tests
- Exchange rate API integration tests
- Currency validation tests

### 2. Integration Tests
- End-to-end currency processing tests
- Multi-currency payment tests
- Credit/debit note currency inheritance tests

### 3. Performance Tests
- Exchange rate API load tests
- Currency conversion performance tests
- Database currency query performance tests

## Deployment Considerations

### 1. Environment Configuration
```javascript
// Production exchange rate API
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest/AED

// Fallback rates for production
FALLBACK_USD_RATE=3.67
FALLBACK_EUR_RATE=4.02
```

### 2. Database Migration
- Currency field additions to existing models
- Exchange rate collection creation
- Currency-based index creation

### 3. Monitoring Setup
- Exchange rate API monitoring
- Currency conversion error alerting
- Performance metrics collection

## Future Enhancements

### 1. Additional Currencies
- GBP (British Pound)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)
- Dynamic currency addition

### 2. Advanced Features
- Currency hedging
- Real-time exchange rate updates
- Multi-currency reporting
- Currency risk management

### 3. Technical Improvements
- WebSocket integration for real-time rates
- Advanced caching strategies
- Machine learning for rate prediction
- Enhanced error recovery mechanisms
