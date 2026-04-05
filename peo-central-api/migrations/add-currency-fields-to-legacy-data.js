#!/usr/bin/env node

/**
 * Migration Script: Add Currency Fields to Legacy Data
 *
 * This script adds missing currency fields to all legacy records in:
 * - Invoice model
 * - Payment model
 * - Credit Note model
 * - Debit Note model
 *
 * Legacy records will be updated with:
 * - currency: 'AED' (default)
 * - conversion_rate: 1.0 (default for AED)
 * - base_currency: 'AED' (always AED)
 * - converted_amount_aed: calculated from existing amount fields
 *
 * Usage: node migrations/add-currency-fields-to-legacy-data.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Invoice = require('../src/models/invoice.model');
const Payment = require('../src/models/payment.model');
const CreditNote = require('../src/models/CreditNote.model');
const DebitNote = require('../src/models/debit_note.model');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL || process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Disconnect from database
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
};

/**
 * Update legacy invoices with currency fields
 */
const migrateInvoices = async () => {
  console.log('\n🔄 Starting Invoice migration...');

  try {
    // Find invoices missing currency fields
    const invoicesToUpdate = await Invoice.find({
      $or: [
        { conversion_rate: { $exists: false } },
        { base_currency: { $exists: false } },
        { converted_amount_aed: { $exists: false } },
        { currency: { $exists: false } }
      ]
    });

    console.log(`📊 Found ${invoicesToUpdate.length} invoices to update`);

    if (invoicesToUpdate.length === 0) {
      console.log('✅ No invoices need updating');
      return { updated: 0, skipped: 0 };
    }

    let updated = 0;
    let skipped = 0;

    // Process invoices in batches
    const batchSize = 100;
    for (let i = 0; i < invoicesToUpdate.length; i += batchSize) {
      const batch = invoicesToUpdate.slice(i, i + batchSize);

      const bulkOps = batch.map(invoice => {
        // Determine currency (default to AED if not set)
        const currency = invoice.currency || 'AED';
        const conversionRate = currency === 'AED' ? 1.0 : (invoice.conversion_rate || 1.0);

        // Calculate AED equivalent
        const convertedAmountAED = invoice.converted_amount_aed ||
          (invoice.total ? invoice.total * conversionRate : 0);

        return {
          updateOne: {
            filter: { _id: invoice._id },
            update: {
              $set: {
                currency: currency,
                conversion_rate: conversionRate,
                base_currency: 'AED',
                converted_amount_aed: convertedAmountAED
              }
            }
          }
        };
      });

      const result = await Invoice.bulkWrite(bulkOps);
      updated += result.modifiedCount;

      console.log(`📝 Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(invoicesToUpdate.length/batchSize)} - Updated ${result.modifiedCount} invoices`);
    }

    console.log(`✅ Invoice migration completed: ${updated} updated, ${skipped} skipped`);
    return { updated, skipped };

  } catch (error) {
    console.error('❌ Error migrating invoices:', error);
    throw error;
  }
};

/**
 * Update legacy payments with currency fields
 */
const migratePayments = async () => {
  console.log('\n🔄 Starting Payment migration...');

  try {
    // Find payments missing currency fields
    const paymentsToUpdate = await Payment.find({
      $or: [
        { currency: { $exists: false } },
        { conversion_rate: { $exists: false } },
        { base_currency: { $exists: false } },
        { converted_amount_aed: { $exists: false } }
      ]
    });

    console.log(`📊 Found ${paymentsToUpdate.length} payments to update`);

    if (paymentsToUpdate.length === 0) {
      console.log('✅ No payments need updating');
      return { updated: 0, skipped: 0 };
    }

    let updated = 0;
    let skipped = 0;

    // Process payments in batches
    const batchSize = 100;
    for (let i = 0; i < paymentsToUpdate.length; i += batchSize) {
      const batch = paymentsToUpdate.slice(i, i + batchSize);

      const bulkOps = batch.map(payment => {
        // Determine currency (default to AED if not set)
        const currency = payment.currency || 'AED';
        const conversionRate = currency === 'AED' ? 1.0 : (payment.conversion_rate || 1.0);

        // Calculate AED equivalent (amount + bank_charge)
        const amount = payment.amount || 0;
        const bankCharge = payment.bank_charge || 0;
        const totalAmount = amount + bankCharge;
        const convertedAmountAED = payment.converted_amount_aed || (totalAmount * conversionRate);

        return {
          updateOne: {
            filter: { _id: payment._id },
            update: {
              $set: {
                currency: currency,
                conversion_rate: conversionRate,
                base_currency: 'AED',
                converted_amount_aed: convertedAmountAED
              }
            }
          }
        };
      });

      const result = await Payment.bulkWrite(bulkOps);
      updated += result.modifiedCount;

      console.log(`📝 Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(paymentsToUpdate.length/batchSize)} - Updated ${result.modifiedCount} payments`);
    }

    console.log(`✅ Payment migration completed: ${updated} updated, ${skipped} skipped`);
    return { updated, skipped };

  } catch (error) {
    console.error('❌ Error migrating payments:', error);
    throw error;
  }
};

/**
 * Update legacy credit notes with currency fields
 */
const migrateCreditNotes = async () => {
  console.log('\n🔄 Starting Credit Note migration...');

  try {
    // Find credit notes missing currency fields
    const creditNotesToUpdate = await CreditNote.find({
      $or: [
        { currency: { $exists: false } },
        { conversion_rate: { $exists: false } },
        { base_currency: { $exists: false } },
        { converted_amount_aed: { $exists: false } }
      ]
    });

    console.log(`📊 Found ${creditNotesToUpdate.length} credit notes to update`);

    if (creditNotesToUpdate.length === 0) {
      console.log('✅ No credit notes need updating');
      return { updated: 0, skipped: 0 };
    }

    let updated = 0;
    let skipped = 0;

    // Process credit notes in batches
    const batchSize = 100;
    for (let i = 0; i < creditNotesToUpdate.length; i += batchSize) {
      const batch = creditNotesToUpdate.slice(i, i + batchSize);

      const bulkOps = batch.map(creditNote => {
        // Determine currency (default to AED if not set)
        const currency = creditNote.currency || 'AED';
        const conversionRate = currency === 'AED' ? 1.0 : (creditNote.conversion_rate || 1.0);

        // Calculate AED equivalent
        const totalAmount = creditNote.total_credit_amount || creditNote.total || 0;
        const convertedAmountAED = creditNote.converted_amount_aed || (totalAmount * conversionRate);

        return {
          updateOne: {
            filter: { _id: creditNote._id },
            update: {
              $set: {
                currency: currency,
                conversion_rate: conversionRate,
                base_currency: 'AED',
                converted_amount_aed: convertedAmountAED
              }
            }
          }
        };
      });

      const result = await CreditNote.bulkWrite(bulkOps);
      updated += result.modifiedCount;

      console.log(`📝 Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(creditNotesToUpdate.length/batchSize)} - Updated ${result.modifiedCount} credit notes`);
    }

    console.log(`✅ Credit Note migration completed: ${updated} updated, ${skipped} skipped`);
    return { updated, skipped };

  } catch (error) {
    console.error('❌ Error migrating credit notes:', error);
    throw error;
  }
};

/**
 * Update legacy debit notes with currency fields
 */
const migrateDebitNotes = async () => {
  console.log('\n🔄 Starting Debit Note migration...');

  try {
    // Find debit notes missing currency fields
    const debitNotesToUpdate = await DebitNote.find({
      $or: [
        { currency: { $exists: false } },
        { conversion_rate: { $exists: false } },
        { base_currency: { $exists: false } },
        { converted_amount_aed: { $exists: false } }
      ]
    });

    console.log(`📊 Found ${debitNotesToUpdate.length} debit notes to update`);

    if (debitNotesToUpdate.length === 0) {
      console.log('✅ No debit notes need updating');
      return { updated, skipped };
    }

    let updated = 0;
    let skipped = 0;

    // Process debit notes in batches
    const batchSize = 100;
    for (let i = 0; i < debitNotesToUpdate.length; i += batchSize) {
      const batch = debitNotesToUpdate.slice(i, i + batchSize);

      const bulkOps = batch.map(debitNote => {
        // Determine currency (default to AED if not set)
        const currency = debitNote.currency || 'AED';
        const conversionRate = currency === 'AED' ? 1.0 : (debitNote.conversion_rate || 1.0);

        // Calculate AED equivalent
        const totalAmount = debitNote.total_debit_amount || debitNote.total || 0;
        const convertedAmountAED = debitNote.converted_amount_aed || (totalAmount * conversionRate);

        return {
          updateOne: {
            filter: { _id: debitNote._id },
            update: {
              $set: {
                currency: currency,
                conversion_rate: conversionRate,
                base_currency: 'AED',
                converted_amount_aed: convertedAmountAED
              }
            }
          }
        };
      });

      const result = await DebitNote.bulkWrite(bulkOps);
      updated += result.modifiedCount;

      console.log(`📝 Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(debitNotesToUpdate.length/batchSize)} - Updated ${result.modifiedCount} debit notes`);
    }

    console.log(`✅ Debit Note migration completed: ${updated} updated, ${skipped} skipped`);
    return { updated, skipped };

  } catch (error) {
    console.error('❌ Error migrating debit notes:', error);
    throw error;
  }
};

/**
 * Verify migration results
 */
const verifyMigration = async () => {
  console.log('\n🔍 Verifying migration results...');

  try {
    // Check invoices
    const invoicesMissingFields = await Invoice.countDocuments({
      $or: [
        { conversion_rate: { $exists: false } },
        { base_currency: { $exists: false } },
        { converted_amount_aed: { $exists: false } }
      ]
    });

    // Check payments
    const paymentsMissingFields = await Payment.countDocuments({
      $or: [
        { currency: { $exists: false } },
        { conversion_rate: { $exists: false } },
        { base_currency: { $exists: false } },
        { converted_amount_aed: { $exists: false } }
      ]
    });

    // Check credit notes
    const creditNotesMissingFields = await CreditNote.countDocuments({
      $or: [
        { currency: { $exists: false } },
        { conversion_rate: { $exists: false } },
        { base_currency: { $exists: false } },
        { converted_amount_aed: { $exists: false } }
      ]
    });

    // Check debit notes
    const debitNotesMissingFields = await DebitNote.countDocuments({
      $or: [
        { currency: { $exists: false } },
        { conversion_rate: { $exists: false } },
        { base_currency: { $exists: false } },
        { converted_amount_aed: { $exists: false } }
      ]
    });

    console.log('\n📊 Migration Verification Results:');
    console.log(`   Invoices missing fields: ${invoicesMissingFields}`);
    console.log(`   Payments missing fields: ${paymentsMissingFields}`);
    console.log(`   Credit Notes missing fields: ${creditNotesMissingFields}`);
    console.log(`   Debit Notes missing fields: ${debitNotesMissingFields}`);

    const totalMissing = invoicesMissingFields + paymentsMissingFields + creditNotesMissingFields + debitNotesMissingFields;

    if (totalMissing === 0) {
      console.log('✅ All records have currency fields!');
    } else {
      console.log(`⚠️  ${totalMissing} records still missing currency fields`);
    }

    return {
      invoicesMissingFields,
      paymentsMissingFields,
      creditNotesMissingFields,
      debitNotesMissingFields,
      totalMissing
    };

  } catch (error) {
    console.error('❌ Error verifying migration:', error);
    throw error;
  }
};

/**
 * Generate migration summary report
 */
const generateSummaryReport = (results) => {
  console.log('\n📋 MIGRATION SUMMARY REPORT');
  console.log('=' .repeat(50));

  const totalUpdated = results.invoices.updated +
                      results.payments.updated +
                      results.creditNotes.updated +
                      results.debitNotes.updated;

  console.log(`📄 Invoices:     ${results.invoices.updated} updated, ${results.invoices.skipped} skipped`);
  console.log(`💳 Payments:    ${results.payments.updated} updated, ${results.payments.skipped} skipped`);
  console.log(`📝 Credit Notes: ${results.creditNotes.updated} updated, ${results.creditNotes.skipped} skipped`);
  console.log(`📄 Debit Notes:  ${results.debitNotes.updated} updated, ${results.debitNotes.skipped} skipped`);
  console.log('=' .repeat(50));
  console.log(`🎯 TOTAL: ${totalUpdated} records updated successfully`);

  if (results.verification.totalMissing === 0) {
    console.log('✅ Migration completed successfully - All records have currency fields!');
  } else {
    console.log(`⚠️  ${results.verification.totalMissing} records still need attention`);
  }

  console.log('\n📌 Next Steps:');
  console.log('   1. Test your application with the updated data');
  console.log('   2. Verify reports show currency information correctly');
  console.log('   3. Update any custom queries to use new currency fields');
  console.log('   4. Consider adding database indexes on currency fields for performance');
};

/**
 * Main migration function
 */
const runMigration = async () => {
  console.log('🚀 Starting Currency Fields Migration');
  console.log('=====================================');

  const startTime = Date.now();

  try {
    // Connect to database
    await connectDB();

    // Run migrations
    const results = {
      invoices: await migrateInvoices(),
      payments: await migratePayments(),
      creditNotes: await migrateCreditNotes(),
      debitNotes: await migrateDebitNotes(),
      verification: await verifyMigration()
    };

    // Generate summary report
    generateSummaryReport(results);

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`\n⏱️  Migration completed in ${duration.toFixed(2)} seconds`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
};

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Currency Fields Migration Script

Usage: node migrations/add-currency-fields-to-legacy-data.js [options]

Options:
  --help, -h     Show this help message
  --dry-run      Show what would be updated without making changes
  --verify-only  Only verify current state without making changes

This script adds missing currency fields to legacy records:
- currency: 'AED' (default)
- conversion_rate: 1.0 (default for AED)
- base_currency: 'AED' (always AED)
- converted_amount_aed: calculated from existing amount fields

Environment Variables:
  MONGODB_URL or DATABASE_URL - MongoDB connection string
  `);
  process.exit(0);
}

// Run migration
if (require.main === module) {
  runMigration();
}

module.exports = {
  runMigration,
  migrateInvoices,
  migratePayments,
  migrateCreditNotes,
  migrateDebitNotes,
  verifyMigration
};
