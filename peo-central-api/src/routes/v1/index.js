const express = require('express');
const userRoute = require('./users.route');
const companyRoute = require('./companies.route');
const roleRoute = require('./roles.route');
const documentRoute = require('./documents.route');
const documentTypeRoute = require('./document_types.route');
const activityRoute = require('./activities.route');
const leadsRoute = require('./leads.route');
const onboardingRoute = require('./onboardings.route');
const accessRoute = require('./access.route');
const loggerRoute = require('./loggers.route');
const processesRoute = require('./processes.route');
const documentTemplateCloneRoute = require('./document_template_clone.route')
const documentTemplateRoute = require('./document_template.route');
const EmailTemplateRoute = require('./email_template.route');
const SMSTemplateRoute = require('./sms_template.route');
const EmailLogRoute = require('./email_log.route');
const VisaProcessRoute = require('./visaprocess.route');
const RenewalsProcessRoute = require('./renewals.route');
const OffboardingRoute = require('./offboardings.route');
const GenericRoute = require('./generic.route');
const StageRoute = require('./stages.route');
const PayItemsRoute = require('./pay_items.route');
const PayrollProcessRoute = require('./payrollprocess.route');
const PayslipsRoute = require('./payslips.route');
const PayrollRoute = require('./payroll.route')
const AccountingCompanyRoute = require('./accounting_company.route');
const InvoiceRoute = require('./invoice.route');
const TaxCodesRoute = require('./tax_codes.route');
const TermsRoute = require('./terms.route')
const InvoiceLogsRoute = require('./invoice_logs.route')
const formRoute = require('./form.route');
const configurationRoute = require('./configuration.route');
const emailTemplateClone = require('./email_template_clone.route');
const AzureRoute = require('./azure.routes');
const MsGraphRoute = require('./msgraph.routes');
const InsightsRoute = require('./insights.route')
const SmsRoute = require('./smsNotification.route')
const payrollconfigRoute = require('./payrollConfig.route')
const payslipsRoute = require('./payslips.route')
const NotificationsRoute = require('./notifications.route')
const FaqsRoute = require('./faq.routes')
const TicketRoutes = require('./ticketing.routes')
const LetterConfigRoutes = require('./letterConfig.route');
const claimRequestRoutes = require('./claim_request.route');
const claimConfigRoutes = require('./claim_config');
const emailConfigRoutes = require('./email_config.route');
const letterRequestRoutes = require('./letter_request.route')
const letterPreviewAndDownloadRoutes = require('./letter.route');
const lieuRequestRoutes = require('./lieu_request.route');
const invoiceInputsRoute = require('./invoiceInputs');
const invoiceUtilsRoute = require('./invoiceUtils');

const approvalsRoutes = require('./approvals.route');
const requestsRoute = require("./requests.route");
const newsRoutes = require('./news.routes');
const partnerRoutes = require('./partners.routes');
const wfhRequestRoute = require('./wfh_request.routes');
const creditNoteRoutes = require('./credit_note_routes');
const enrollmentsRoute = require('./enrollments.route');
const documentFolderRoutes = require("./documents_folder.routes");
const delependentRoutes = require("./dependents.routes")
const reportsConfiguratorRoute = require("./reports_configurator.route");
const paymentRoutes = require("./payment.routes");
const paymentReversalRoutes = require("./paymentReversal.routes");
const debitNoteRoutes = require("./debit_note.routes");

const inquiryRoutes = require('./inquiry.route');
const statementRoutes = require('./statement.route');
const exchangeRateRoutes = require('./exchangeRate.route');
const taskRoutes = require('./task.routes');
const industryRoutes = require("./industries.routes")
const apiKeyRoutes = require("./apikey.routes")
const externalRoutes = require("./external.routes");
const dahsboardRoutes = require('./dashboard.routes');
const pocRoutes = require("./points_of_contacts.routes.js")
const paymentProofsRoute = require('./payment_proofs.route');
const payrollManagementRoute = require('./payroll-management.route');
const kycEnrollmentsRoute = require('./kycEnrollments.route');



const router = express.Router();

const defaultRoutes = [
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/dependents',
    route: delependentRoutes,
  },
  {
    path: '/statements',
    route: statementRoutes,
  },
  {
    path: '/exchange-rates',
    route: exchangeRateRoutes,
  },
  {
    path: '/companies',
    route: companyRoute,
  },
  {
    path: '/roles',
    route: roleRoute,
  },
  {
    path: '/payrollconfig',
    route: payrollconfigRoute,
  },
  {
    path: '/documents',
    route: documentRoute,
  },
  {
    path: '/documenttypes',
    route: documentTypeRoute,
  },
  {
    path: '/activity',
    route: activityRoute,
  },
  {
    path: '/leads',
    route: leadsRoute,
  },
  {
    path: '/onboardings',
    route: onboardingRoute,
  },
  {
    path: '/access',
    route: accessRoute,
  },
  {
    path: '/logger',
    route: loggerRoute,
  },
  {
    path: '/processes',
    route: processesRoute,
  },
  {
    path: '/documenttemplateclone',
    route: documentTemplateCloneRoute,
  },
  {
    path: '/document_template',
    route: documentTemplateRoute,
  },
  {
    path: '/email_template',
    route: EmailTemplateRoute,
  },
  {
    path: '/sms_template',
    route: SMSTemplateRoute,
  },
  {
    path: '/emaillog',
    route: EmailLogRoute,
  },
  {
    path: '/visaprocess',
    route: VisaProcessRoute,
  },
  {
    path: '/renewals',
    route: RenewalsProcessRoute,
  },
  {
    path: '/offboardings',
    route: OffboardingRoute,
  },
  {
    path: '/generic',
    route: GenericRoute,
  },
  {
    path: '/stages',
    route: StageRoute,
  },
  {
    path: '/payitem',
    route: PayItemsRoute,
  },

  {
    path: '/payrollprocess',
    route: PayrollProcessRoute,
  },
  {
    path: '/payslips',
    route: PayslipsRoute,
  },
  {
    path: '/payroll',
    route: PayrollRoute,
  },
  {
    path: '/accounting/company',
    route: AccountingCompanyRoute,
  },
  {
    path: '/invoice',
    route: InvoiceRoute,
  },
  {
    path: '/taxcodes',
    route: TaxCodesRoute,
  },
  {
    path: '/terms',
    route: TermsRoute,
  },
  {
    path: '/invoicelogs',
    route: InvoiceLogsRoute,
  },
  {
    path: '/form',
    route: formRoute,
  },
  {
    path: '/configuration',
    route: configurationRoute,
  },
  {
    path: '/email/clone',
    route: emailTemplateClone,
  },
  {
    path: '/azure',
    route: AzureRoute,
  },
  {
    path: '/graph',
    route: MsGraphRoute,
  },
  {
    path: '/insights',
    route: InsightsRoute,
  },
  {
    path: '/sms',
    route: SmsRoute,
  },
  { path: '/payslip', route: payslipsRoute },
  {
    path: '/notifications',
    route: NotificationsRoute,
  },
  {
    path: '/faqs',
    route: FaqsRoute,
  },
  {
    path: '/tickets',
    route: TicketRoutes,
  },
  {
    path: '/letter/config',
    route: LetterConfigRoutes,
  },
  {
    path: '/claim/request',
    route: claimRequestRoutes,
  },
  {
    path: '/claim/config',
    route: claimConfigRoutes,
  },
  {
    path: '/email/config',
    route: emailConfigRoutes,
  },
  {
    path: '/letter/request',
    route: letterRequestRoutes,
  },
  {
    path: '/lieu/request',
    route: lieuRequestRoutes,
  },
  {
    path: '/letters',
    route: letterPreviewAndDownloadRoutes,
  },
  {
    path: '/approvals',
    route: approvalsRoutes,
  },
  {
    path: '/requests',
    route: requestsRoute,
  },
  {
    path: '/announcements',
    route: newsRoutes,
  },
  {
    path: '/partners',
    route: partnerRoutes,
  },
  {
    path: '/wfh/request',
    route: wfhRequestRoute,
  },
  {
    path: '/credit/notes',
    route: creditNoteRoutes,
  },
  {
    path: '/enrollments',
    route: enrollmentsRoute,
  },
  {
    path: '/document/folders',
    route: documentFolderRoutes,
  },
  {
    path: "/reports-configurators",
    route: reportsConfiguratorRoute
  }, ,
  {
    path: '/inquiry',
    route: inquiryRoutes,
  },
  {
    path: '/payments',
    route: paymentRoutes,
  },
  {
    path: '/payment-reversals',
    route: paymentReversalRoutes,
  },
  {
    path: '/debit/notes',
    route: debitNoteRoutes
  },
  {
    path: '/tasks',
    route: taskRoutes
  },
  {
    path: '/industries',
    route: industryRoutes
  },
  {
    path: '/apikeys',
    route: apiKeyRoutes
  },
  {
    path: '/external',
    route: externalRoutes
  },
  {
    path: '/api/v1/invoice-inputs',
    route: invoiceInputsRoute
  },
  {
    path: '/api/v1/invoice-utils',
    route: invoiceUtilsRoute
  },
  {
    path: '/dashboard',
    route: dahsboardRoutes
  },
  {
    path: '/points/of/contacts',
    route: pocRoutes
  },
  {
    path: '/payment-proofs',
    route: paymentProofsRoute
  },
  {
    path: '/payroll-management',
    route: payrollManagementRoute
  },
  {
    path: '/kyc-enrollments',
    route: kycEnrollmentsRoute
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});


module.exports = router;
