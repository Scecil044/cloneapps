<template>
    <client-only>
        <v-tooltip top color="primary">
            <template v-slot:activator="{ on, attrs }">
                <v-btn   @click.prevent="handleDownloadPayslip()" elevation="0" fab dark x-small color="grey lighten-3" class="mb-5 ml-3" v-bind="attrs" v-on="on">
                    <v-icon v-if="!loading" v-bind="attrs" v-on="on" color="purple"  >mdi-download-outline</v-icon>
                    <v-img v-bind="attrs" v-on="on" src="/animated/ripple.svg"  max-width="fit-content" height="fit-content" contain  v-else></v-img>
                </v-btn>
            </template>
            Download Consolidated Payslip
        </v-tooltip>
    </client-only>
    
</template>

<script>

// import 'jspdf-autotable'
import moment from 'moment'

export default {
props: ['allUsersPayslipData', 'users', 'fixed_salary_config', 'variable_salary_config',"company"],
data(){
    return{
        date: new Date().toISOString().substr(0, 10),
        menu2: false,
        menu3: false,
        menu4: false,
        modal: false,
        tel_dubai: "",
        office_email: "",
        website: "",
        off_address_dubai: "",
        companyData:[],
        companyLogo:"",
        loading: false
    }
},
mounted(){
    // this.getCompanyDetail()    
},
created() {
this.getCompanyDetail();
},
methods:{
    toDataURL(url, callback) {
    var XMLHttpRequest = require('xhr2');
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        var reader = new FileReader();
        reader.onload = function() {
        callback(reader.result);
        };
        reader.readAsDataURL(xhr.response);
    };

    xhr.open("GET", url+"?not-from-cache-please");
    xhr.responseType = "blob";
           
    xhr.send();
    },
    handleDownloadPayslip(){
        this.loading = true
        // this.downloadPDF_payslip()
    },
    getCompanyDetail(){
    const token = this.$store.getters.getToken;
    const AuthStr = "Bearer ".concat(token);
     this.$axios
    .$get("/companies/" , {
      headers: { Authorization: AuthStr },
    })
    .then((res) => {
      this.companyData = res.success ? res.data : [];
    })
    .catch();
    },
    getCompanyInformation(){
    let company = this.companyData.filter((a) => a._id == this.companyData[0]._id)
    return company.length>0 ? company[0] :''
    },
    // async downloadPDF_payslip() {
    //     if (process.browser) {
    //         const jsPDF = require('jspdf');
    //         var pdf = new jsPDF();
    //         var pdf = new jsPDF();

    //         let payMonth

    //         this.toDataURL("https://payroll-central-nathanhr.s3.amazonaws.com/companies/1708415861275-dynamic-new-logo.png", data => {
    //         this.companyLogo = data;
    //         });

    //         setTimeout(() => {
            
    //             for(const payslipData of this.allUsersPayslipData){
    //                 payMonth = payslipData.pay_month
    //                 // Header
    //                 let title =18;
    //                 let title_month = 14
    //                 let bodyFont = 10;
    //                 let footerFont = 7;
    //                 let headerFont = 7;
    //                 let extraMargin = 10;
    //                 let rectHeight = 50
    //                 let text = ''
    //                 let height_var = 80;

    //                 var PayslipDateFormatter = function(value) {
    //                     if (value) {
    //                         return moment(String(value), 'YYYY/MM').format('MMM, YYYY')
    //                     }
    //                     else{
    //                         return ""
    //                     }
    //                 }
    //                 var PayslipDateFormatter_1 = function(value) {
    //                     if (value) {
    //                         return moment(String(value), 'YYYY/MM/DD').format('DD MMM, YYYY')
    //                     }
    //                     else{
    //                         return ""
    //                     }
    //                 }
    //                 let amountFormatter = function(value) {
    //                     return parseFloat(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    //                 }

    //                 var logo = new Image();
    //                 logo.crossOrigin = 'anonymous'
    //                 logo.src = this.companyLogo;
    //                 pdf.addImage(logo, 'png', 12, 10, 50,15)
                    
    //                 pdf.setFontSize(headerFont)
    //                 pdf.setFontType('normal')
    //                 pdf.text('Classification : ', 169,15)
    //                 pdf.setFontType('bold')
    //                 pdf.text("Confidential", 185,15)

    //                 pdf.setFontSize(title)
    //                 pdf.setFontType('bold')
    //                 pdf.text("Payslip", 150,25)
    //                 pdf.setFontSize(title_month)
    //                 pdf.setFontType('normal')
    //                 pdf.text(PayslipDateFormatter(payslipData.pay_month), 175,25)

    //                 pdf.line(10, 35, 200, 35); 

    //                 pdf.setFontSize(bodyFont)
    //                 pdf.setFontType('bold')
    //                 pdf.text("Employee Name : ", 10,46)

    //                 pdf.setFontSize(bodyFont)
    //                 pdf.setFontType('normal')

    //                 let user = this.users.filter(a => a._id == payslipData.user_id)
    //                 if(user.length > 0){
    //                 pdf.text(user[0].first_name + " " + user[0].last_name, 41,46)
    //                 }
    //                 else{
    //                 pdf.text('', 41,46)
    //                 }

    //                 pdf.setFontSize(bodyFont)
    //                 pdf.setFontType('bold')
    //                 pdf.text("Designation : ", 10,52)

    //                 pdf.setFontSize(bodyFont)
    //                 pdf.setFontType('normal')
    //                 pdf.text(payslipData.designation, 33,52)

    //                 pdf.setFontSize(bodyFont)
    //                 pdf.setFontType('bold')
    //                 pdf.text("DOJ : ", 10,58)

    //                 pdf.setFontSize(bodyFont)
    //                 pdf.setFontType('normal')
    //                 pdf.text(PayslipDateFormatter_1(payslipData.date_of_joining), 20,58)

    //                 pdf.setFontSize(bodyFont)
    //                 pdf.setFontType('bold')
    //                 pdf.text("Total no. of days : ", 150,46)

    //                 pdf.setFontSize(bodyFont)
    //                 pdf.setFontType('normal')
    //                 pdf.text(payslipData.days_in_month.toString(), 187,46)

    //                 pdf.setFontSize(bodyFont)
    //                 pdf.setFontType('bold')
    //                 pdf.text("Absent Days : ", 150,52)

    //                 pdf.setFontSize(bodyFont)
    //                 pdf.setFontType('normal')
    //                 pdf.text(payslipData.absent_days.toString(), 175,52)

    //                 pdf.setFontSize(bodyFont)
    //                 pdf.setFontType('bold')
    //                 pdf.text("Present Days : ", 150,58)

    //                 pdf.setFontSize(bodyFont)
    //                 pdf.setFontType('normal')
    //                 pdf.text(payslipData.present_days.toString(), 175,58)

    //                 pdf.setFillColor(240,240,240);
    //                 pdf.rect(5, 64, 200, 10, "F");
    //                 pdf.setFontSize(bodyFont)
    //                 pdf.setFontType('bold')
    //                 pdf.text("Fixed Compensation (in AED)", 10,70)

    //                 for(const key of Object.keys(payslipData.fixed)) {
    //                     if(payslipData.fixed[key] === '0' || payslipData.fixed[key] === 0){
    //                         continue
    //                     }
    //                     pdf.setFontSize(bodyFont)
    //                     pdf.setFontType('normal')
    //                     pdf.text(this.fixed_salary_config[key], 10,height_var)

    //                     pdf.setFontSize(bodyFont)
    //                     pdf.setFontType('normal')
    //                     pdf.text(amountFormatter(payslipData.fixed[key]), 180,height_var)
    //                     height_var = height_var + 8
    //                 }

    //                 if(this.otherExpenseExists(payslipData.variable)){
    //                     pdf.setFillColor(240,240,240);
    //                     pdf.rect(5, height_var, 200, 10, "F");
    //                     pdf.setFontSize(bodyFont)
    //                     pdf.setFontType('bold')
    //                     pdf.setTextColor(0,0,0);
    //                     pdf.text("Addition and Deductions (in AED)", 10,height_var + 6)
    //                     height_var = height_var + 8
                        

    //                     for(const key of Object.keys(payslipData.variable)) {
    //                         if(payslipData.variable[key] === '0' || payslipData.variable[key] === 0){
    //                             continue
    //                         }
    //                         if(this.variable_salary_config[key]){
    //                             height_var = height_var + 8
    //                             pdf.setFontSize(bodyFont)
    //                             pdf.setFontType('normal')
    //                             pdf.text(this.variable_salary_config[key].toString(), 10,height_var)
    //                         }
    //                         if(amountFormatter(payslipData.variable[key])){
    //                             pdf.setFontSize(bodyFont)
    //                             pdf.setFontType('normal')
    //                             pdf.text(amountFormatter(payslipData.variable[key]).toString(), 180,height_var)
    //                         }
    //                     }
    //                 }

    //                 height_var = height_var + 8

    //                 pdf.setFillColor(240,240,240);
    //                 pdf.rect(5, height_var, 200, 10, "F");
    //                 pdf.setFontSize(bodyFont)
    //                 pdf.setFontType('bold')
    //                 pdf.setTextColor(0,0,0);
    //                 pdf.text("NET PAY AED: " + payslipData.total_salary_text, 10,height_var + 6)
    //                 pdf.text("AED: " + amountFormatter(payslipData.total_salary), 170,height_var + 6 )

    //                 // Footer
    //                 pdf.setDrawColor(25, 118, 210);
    //                 pdf.line(15,275,195,275)

                   

    //                 pdf.setFontSize(footerFont)
    //                 pdf.setFontType('normal')
    //                 pdf.setTextColor(0, 0, 0);
    //                 text = '*Note: This is a computer generated Payslip and does not require signature.'
    //                 pdf.text(text, 65,290)

    //                 pdf.addPage();

    //             }
    //             pdf.save(this.computedPayslipDocName+'.pdf')
    //             this.loading = false
    //         }, 2000)
    //     }
    // },
    otherExpenseExists(obj){
        let valExist = false
        if(obj === null || obj === undefined){
            return valExist
        }
        for (const key of Object.keys(obj)) {
            if(obj[key] !== 0 & obj[key] !== "0" && obj[key] !== undefined){
                valExist = true
                break
            }
        }
        return valExist
    }
},
computed:{
    computedPayslipDocName(){
        if(this.companyData && this.companyData.length>0){
            let company =  this.companyData.filter(a=>a._id == this.company)
            return company.length>0 ? company[0].company_name + " Payslips ( "+ moment(this.allUsersPayslipData[0].pay_month).format('MMM YYYY') + " )": " Payslips ( "+ moment(this.allUsersPayslipData[0].pay_month).format('MMM YYYY') + " )"
        }else return " Payslips ( "+ moment(this.allUsersPayslipData[0].pay_month).format('MMM YYYY') + " )"
    }

}
}
</script>

<style scoped>
.backgroundImg{
    background: url("/Dynamic_Employment_watermark.png") no-repeat center;
    margin-left: 20px;
    margin-right: 20px;
}
.outline{
border: 00.0312rem solid #DCDCDC;
}
</style>