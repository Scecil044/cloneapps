<template>
    <div class="align-right">
        <!-- {{payslip}} -->
        <client-only>
            <v-tooltip top color="pink">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon small color="pink" @click.prevent="downloadPDF_payslip" class="" v-bind="attrs" v-on="on">
                        <v-icon>mdi-download-outline</v-icon>
                    </v-btn>
                </template>
                Download Payslip
            </v-tooltip>
        </client-only>
    </div>
</template>

<script>

// import 'jspdf-autotable'
import moment from 'moment'

export default {
    props: ['payslip', 'userData', 'fixed_salary_config', 'variable_salary_config'],
    data() {
        return {
            date: new Date().toISOString().substr(0, 10),
            menu2: false,
            menu3: false,
            menu4: false,
            modal: false,
            tel_dubai: "+971 4 454 2466  +971 4 2555 143",
            office_email: "erp@nathanhr.com",
            website: "http://www.nathanhr.com/",
            off_address_dubai: "1004-1106, Marina Plaza, Dubai Marina, Dubai. UAE"
        }
    },
    methods: {
        async downloadPDF_payslip() {

        const token = this.$store.getters.getToken
        const AuthStr = 'Bearer '.concat(token)

        if (this.payslip && this.payslip.hasOwnProperty('payslip_url') && this.payslip.payslip_url.length > 0) {
          window.open(this.payslip.payslip_url)
        } else {
            await this.$axios.$get('payslip/downloadPaySlip/' + this.payslip._id, { headers: { Authorization: AuthStr } })
            .then(res => {
              if (res && res.hasOwnProperty('payslip_url') && res.payslip_url.length > 0) {
                window.open(res.payslip_url)
                // this.overlay_dialog = false
                // this.$router.go()
              }
            }).catch(e => console.log(e));
        }


 
            // console.log(this.payslip , "PAySLip")
            // if (process.browser) {
            //     // Header
            //     let title = 18;
            //     let title_month = 14
            //     let bodyFont = 10;
            //     let footerFont = 7;
            //     let headerFont = 7;
            //     let extraMargin = 10;
            //     let rectHeight = 50
            //     let text = ''
            //     let height_var = 80;

            //     var PayslipDateFormatter = function (value) {
            //         if (value) {
            //             return moment(String(value), 'YYYY/MM').format('MMM, YYYY')
            //         }
            //     }
            //     var PayslipDateFormatter_1 = function (value) {
            //         if (value) {
            //             return moment(String(value), 'YYYY/MM/DD').format('DD MMM, YYYY')
            //         }
            //     }
            //     let amountFormatter = function (value) {
            //         return parseFloat(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
            //     }

            //     const jsPDF = require('jspdf');
            //     var pdf = new jsPDF();

            //     // Header
            //     var logo = new Image();
            //     logo.src = '/logo/NNHR.png';
            //     pdf.addImage(logo, 'jpg', 10, 10, 70, 15)

            //     let payslipData = this.payslip
            //     // console.log(payslipData, "payslipData")

            //     pdf.setFontSize(headerFont)
            //     pdf.setFontType('normal')
            //     pdf.text('Classification : ', 169, 15)
            //     pdf.setFontType('bold')
            //     pdf.text("Confidential", 185, 15)

            //     pdf.setFontSize(title)
            //     pdf.setFontType('bold')
            //     pdf.text("Payslip", 150, 25)
            //     pdf.setFontSize(title_month)
            //     pdf.setFontType('normal')
            //     pdf.text(PayslipDateFormatter(payslipData.pay_month), 175, 25)

            //     pdf.line(10, 35, 200, 35);

            //     pdf.setFontSize(bodyFont)
            //     pdf.setFontType('bold')
            //     pdf.text("Employee Name : ", 10, 46)

            //     pdf.setFontSize(bodyFont)
            //     pdf.setFontType('normal')
            //     pdf.text(this.userData.first_name, 41, 46)

            //     pdf.setFontSize(bodyFont)
            //     pdf.setFontType('bold')
            //     pdf.text("Designation : ", 10, 52)

            //     pdf.setFontSize(bodyFont)
            //     pdf.setFontType('normal')
            //     pdf.text(payslipData.designation, 33, 52)

            //     pdf.setFontSize(bodyFont)
            //     pdf.setFontType('bold')
            //     pdf.text("DOJ : ", 10, 58)

            //     pdf.setFontSize(bodyFont)
            //     pdf.setFontType('normal')
            //     pdf.text(PayslipDateFormatter_1(payslipData.date_of_joining), 20, 58)

            //     pdf.setFontSize(bodyFont)
            //     pdf.setFontType('bold')
            //     pdf.text("Total Working Days : ", 150, 46)

            //     pdf.setFontSize(bodyFont)
            //     pdf.setFontType('normal')
            //     pdf.text(payslipData.days_in_month.toString(), 187, 46)

            //     pdf.setFontSize(bodyFont)
            //     pdf.setFontType('bold')
            //     pdf.text("Present Days : ", 150, 52)

            //     pdf.setFontSize(bodyFont)
            //     pdf.setFontType('normal')
            //     pdf.text(payslipData.present_days.toString(), 175, 52)

            //     pdf.setFontSize(bodyFont)
            //     pdf.setFontType('bold')
            //     pdf.text("Absent Days : ", 150, 58)

            //     pdf.setFontSize(bodyFont)
            //     pdf.setFontType('normal')
            //     pdf.text(payslipData.absent_days.toString(), 175, 58)

            //     pdf.setFillColor(240, 240, 240);
            //     pdf.rect(5, 64, 200, 10, "F");
            //     pdf.setFontSize(bodyFont)
            //     pdf.setFontType('bold')
            //     pdf.text("Fixed Compensation (in AED)", 10, 70)

            //     for (const key of Object.keys(payslipData.fixed)) {
            //         if (payslipData.fixed[key] === '0' || payslipData.fixed[key] === 0) {
            //             continue
            //         }
            //         pdf.setFontSize(bodyFont)
            //         pdf.setFontType('normal')
            //         pdf.text(this.fixed_salary_config[key], 10, height_var)

            //         pdf.setFontSize(bodyFont)
            //         pdf.setFontType('normal')
            //         pdf.text(amountFormatter(payslipData.fixed[key]), 180, height_var)
            //         height_var = height_var + 8
            //     }

            //     if (this.otherExpenseExists(payslipData.variable)) {
            //         pdf.setFillColor(240, 240, 240);
            //         pdf.rect(5, height_var, 200, 10, "F");
            //         pdf.setFontSize(bodyFont)
            //         pdf.setFontType('bold')
            //         pdf.setTextColor(0, 0, 0);
            //         pdf.text("Other expenses (in AED)", 10, height_var + 6)
            //         height_var = height_var + 8


            //         for (const key of Object.keys(payslipData.variable)) {
            //             if (payslipData.variable[key] === '0' || payslipData.variable[key] === 0) {
            //                 continue
            //             }
            //             // console.log(key, 'key')
            //             height_var = height_var + 8
            //             pdf.setFontSize(bodyFont)
            //             pdf.setFontType('normal')
            //             pdf.text(this.variable_salary_config[key], 10, height_var)

            //             pdf.setFontSize(bodyFont)
            //             pdf.setFontType('normal')
            //             pdf.text(amountFormatter(payslipData.variable[key]), 180, height_var)
            //         }
            //     }

            //     height_var = height_var + 8

            //     pdf.setFillColor(240, 240, 240);
            //     pdf.rect(5, height_var, 200, 10, "F");
            //     pdf.setFontSize(bodyFont)
            //     pdf.setFontType('bold')
            //     pdf.setTextColor(0, 0, 0);
            //     pdf.text("NET PAY AED: " + payslipData.total_salary_text, 10, height_var + 6)
            //     pdf.text("AED: " + amountFormatter(payslipData.total_salary), 170, height_var + 6)

            //     // Footer
            //     pdf.setDrawColor(25, 118, 210);
            //     pdf.line(15, 275, 195, 275)

            //     pdf.setFontSize(footerFont)
            //     pdf.setFontType('normal')
            //     pdf.setTextColor(25, 118, 210);
            //     text = '+971 4 454 2466  +971 4 2555 143 |  erp@nathanhr.com |  http://www.nathanhr.com/'
            //     pdf.text(text, 60, 280)

            //     pdf.setFontSize(footerFont)
            //     pdf.setFontType('normal')
            //     pdf.setTextColor(25, 118, 210);
            //     text = '1004-1106, Marina Plaza, Dubai Marina, Dubai. UAE'
            //     pdf.text(text, 50, 283)

            //     pdf.setFontSize(footerFont)
            //     pdf.setFontType('normal')
            //     pdf.setTextColor(0, 0, 0);
            //     text = '*Note: This is a computer generated Payslip and does not require signature.'
            //     pdf.text(text, 10, 290)

            //     // var string = pdf.output('datauristring');
            //     // var iframe = "<iframe width='100%' height='100%' src='" + string + "'></iframe>"
            //     // var x = window.open();
            //     // x.document.open();
            //     // x.document.write(iframe);
            //     // x.document.close(); 
            //     pdf.save(PayslipDateFormatter(payslipData.pay_month) + '_' + this.userData.first_name + '.pdf')
            // }
        },
        otherExpenseExists(obj) {
            let valExist = false
            if (obj === null || obj === undefined) {
                return valExist
            }
            for (const key of Object.keys(obj)) {
                if (obj[key] !== 0 & obj[key] !== "0" && obj[key] !== undefined) {
                    valExist = true
                    break
                }
            }
            return valExist
        }
    }
}
</script>

<style scoped>
.backgroundImg {
    background: url("/Dynamic_Employment_watermark.png") no-repeat center;
    margin-left: 20px;
    margin-right: 20px;
}

.outline {
    border: 00.0312rem solid #DCDCDC;
}
</style>