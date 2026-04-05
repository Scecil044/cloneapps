# Currency Fields Migration

This migration script adds missing currency fields to all legacy records in your database.

## What it does

The script updates legacy records in these models:
- **Invoice model** - Adds currency fields to old invoices
- **Payment model** - Adds currency fields to old payments
- **Credit Note model** - Adds currency fields to old credit notes
- **Debit Note model** - Adds currency fields to old debit notes

## Fields Added

For each legacy record, the script adds:
- `currency: 'AED'` (defaults to AED for legacy data)
- `conversion_rate: 1.0` (1.0 for AED, preserves existing rates if present)
- `base_currency: 'AED'` (always AED as base currency)
- `converted_amount_aed: calculated_value` (AED equivalent of the amount)

## Usage

### Prerequisites
1. Ensure your MongoDB connection is configured in environment variables
2. Make sure you have a backup of your database
3. Run this during maintenance hours

### Run the Migration

```bash
# Navigate to your API directory
cd peo-central-api

# Run the migration
node migrations/add-currency-fields-to-legacy-data.js
```

### Options

```bash
# Show help
node migrations/add-currency-fields-to-legacy-data.js --help

# Dry run (show what would be updated without making changes)
node migrations/add-currency-fields-to-legacy-data.js --dry-run

# Verify only (check current state without making changes)
node migrations/add-currency-fields-to-legacy-data.js --verify-only
```

## Environment Variables

Make sure these are set in your `.env` file:
```bash
MONGODB_URL=mongodb://localhost:27017/your-database
# OR
DATABASE_URL=mongodb://localhost:27017/your-database
```

## What the Script Does

### 1. **Invoice Migration**
- Finds invoices missing currency fields
- Sets `currency: 'AED'` for legacy invoices
- Calculates `converted_amount_aed` from `total` field
- Preserves existing currency values if present

### 2. **Payment Migration**
- Finds payments missing currency fields
- Sets `currency: 'AED'` for legacy payments
- Calculates `converted_amount_aed` from `amount + bank_charge`
- Preserves existing currency values if present

### 3. **Credit Note Migration**
- Finds credit notes missing currency fields
- Sets `currency: 'AED'` for legacy credit notes
- Calculates `converted_amount_aed` from `total_credit_amount`
- Preserves existing currency values if present

### 4. **Debit Note Migration**
- Finds debit notes missing currency fields
- Sets `currency: 'AED'` for legacy debit notes
- Calculates `converted_amount_aed` from `total_debit_amount`
- Preserves existing currency values if present

## Safety Features

- **Batch Processing**: Updates records in batches of 100 to avoid memory issues
- **Progress Tracking**: Shows progress for each batch
- **Error Handling**: Comprehensive error handling with rollback capability
- **Verification**: Verifies migration results after completion
- **Dry Run**: Test mode to see what would be updated

## Sample Output

```
🚀 Starting Currency Fields Migration
=====================================
✅ Connected to MongoDB

🔄 Starting Invoice migration...
📊 Found 1250 invoices to update
📝 Processed batch 1/13 - Updated 100 invoices
📝 Processed batch 2/13 - Updated 100 invoices
...
✅ Invoice migration completed: 1250 updated, 0 skipped

🔄 Starting Payment migration...
📊 Found 3400 payments to update
📝 Processed batch 1/34 - Updated 100 payments
...
✅ Payment migration completed: 3400 updated, 0 skipped

🔄 Starting Credit Note migration...
📊 Found 45 credit notes to update
...
✅ Credit Note migration completed: 45 updated, 0 skipped

🔄 Starting Debit Note migration...
📊 Found 12 debit notes to update
...
✅ Debit Note migration completed: 12 updated, 0 skipped

🔍 Verifying migration results...
📊 Migration Verification Results:
   Invoices missing fields: 0
   Payments missing fields: 0
   Credit Notes missing fields: 0
   Debit Notes missing fields: 0
✅ All records have currency fields!

📋 MIGRATION SUMMARY REPORT
==================================================
📄 Invoices:     1250 updated, 0 skipped
💳 Payments:    3400 updated, 0 skipped
📝 Credit Notes: 45 updated, 0 skipped
📄 Debit Notes:  12 updated, 0 skipped
==================================================
🎯 TOTAL: 4707 records updated successfully
✅ Migration completed successfully - All records have currency fields!

⏱️  Migration completed in 45.23 seconds
```

## After Migration

1. **Test your application** to ensure everything works correctly
2. **Verify reports** show currency information properly
3. **Update any custom queries** to use the new currency fields
4. **Consider adding database indexes** on currency fields for better performance

## Rollback (if needed)

If you need to rollback the migration:

```javascript
// Remove currency fields (use with caution!)
db.invoices.updateMany(
  { currency: 'AED', conversion_rate: 1.0 },
  { $unset: { currency: 1, conversion_rate: 1, base_currency: 1, converted_amount_aed: 1 } }
);

db.payments.updateMany(
  { currency: 'AED', conversion_rate: 1.0 },
  { $unset: { currency: 1, conversion_rate: 1, base_currency: 1, converted_amount_aed: 1 } }
);

db.creditnotes.updateMany(
  { currency: 'AED', conversion_rate: 1.0 },
  { $unset: { currency: 1, conversion_rate: 1, base_currency: 1, converted_amount_aed: 1 } }
);

db.debitnotes.updateMany(
  { currency: 'AED', conversion_rate: 1.0 },
  { $unset: { currency: 1, conversion_rate: 1, base_currency: 1, converted_amount_aed: 1 } }
);
```

## Troubleshooting

### Common Issues

1. **Connection Error**: Check your MongoDB connection string
2. **Permission Error**: Ensure your database user has write permissions
3. **Memory Error**: The script processes in batches, but very large datasets might need smaller batch sizes

### Getting Help

If you encounter issues:
1. Check the error messages in the console output
2. Verify your database connection
3. Ensure you have proper permissions
4. Check if the models are correctly imported

## Performance Notes

- **Batch Size**: Default is 100 records per batch (adjustable in script)
- **Memory Usage**: Minimal memory footprint due to batch processing
- **Execution Time**: Depends on dataset size (typically 1-2 seconds per 1000 records)
- **Database Load**: Minimal impact due to efficient bulk operations
