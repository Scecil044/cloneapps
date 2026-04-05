<template>
  <div></div>
</template>

<script>
// import "jspdf-autotable";
import moment from "moment";
import { Letters } from "@nathangroup/letter";

export default {
  props: [
    "request",
    "invoice_num",
    "download_letter",
    "users",
    "user",
    "logos",
    "stampUrl",
    "footerLogo",
    "companyData",
    "pdfStyles",
    "letterImages",
    "signatory",
    "computedServiceList",
    "letterUpload",
  ],
  data() {
    return {
      companies: [],
      stamp: "",
      signature: "",
      signatureUrl: "",
      letterHead: "",
      watermark: "",
      rightSidebar: "",
      leftSidebar: "",
      logo: "",
      footer: "",
      loaded: false,
      companyLogo: "",
      date: new Date().toISOString().substr(0, 10),
      subject: [
        "No Objection Certificate",
        "Salary Certificate",
        "Salary Transfer Letter",
      ],
      configData: [],
      configuration: [],
    };
  },
  async asyncData({ app, store }) {},
  mounted() {
    this.getLetterConfiguration();
    // this.getCompanyDetail(),
    setTimeout(() => {
      this.download();
    }, 1000);
    this.getCompanies();
  },

  created() {
    this.signatureUrl = this.letterImages && this.letterImages.signatureLink;
    this.toDataURL(this.letterImages &&  this.letterImages.headerImageLink, (data) => {
      this.companyLogo = data;
      this.loaded = true;
    });
    this.toSignatureURL(this.signatureUrl, (data) => {
      this.signature = data;
    });
    this.toStampURL(this.letterImages && this.letterImages.companyStampLink, (data) => {
      this.stamp = data;
    });
    this.toFooterURL(this.letterImages && this.letterImages.footerImageLink, (data) => {
      this.footer = data;
    });
    this.toWatermarkURL(this.letterImages && this.letterImages.waterMarkLink, (data) => {
      this.watermark = data;
    });
    this.toLeftSideBar(this.letterImages && this.letterImages.leftSideBarLink, (data) => {
      this.leftSidebar = data;
    });
    this.toRighSidebar(this.letterImages && this.letterImages.rightSideBarLink, (data) => {
      this.rightSidebar = data;
    });
  },
  methods: {
    async getCompanies() {
      const token = this.$store.getters.getToken;
      const AuthStr = "Bearer ".concat(token);

      this.companies = await this.$axios.$get("companies", {
        headers: { Authorization: AuthStr },
      });
    },
    dateFormat(val) {
      if (val) {
        return moment(String(val)).format("DD MMMM YYYY");
      }
    },
    getLetterConfiguration() {
      const token = this.$store.getters.getToken;
      const AuthStr = "Bearer ".concat(token);
      this.$axios
        .$get("/configuration/all", {
          headers: { Authorization: AuthStr },
        })
        .then((res) => {
          this.configData = res;
          this.configuration = this.configData;
        })
        .catch();
    },
    download() {
      if (this.download_letter == true && this.request.letter_type == "NOC") {
        if (this.request.letter_sub_type == "Travel") {
          let subjectXaxis = 90;
          let bodyXaxis = 110;
          let signatoryxAxis = 215;
          let singnatureXaxis = 180;
          let stampXaxis = 180;
          this.download_letter_pdf(
            subjectXaxis,
            bodyXaxis,
            signatoryxAxis,
            singnatureXaxis,
            stampXaxis
          );
        } else {
          let subjectXaxis = 90;
          let bodyXaxis = 110;
          let signatoryxAxis = 205;
          let singnatureXaxis = 170;
          let stampXaxis = 165;
          this.download_letter_pdf(
            subjectXaxis,
            bodyXaxis,
            signatoryxAxis,
            singnatureXaxis,
            stampXaxis
          );
        }
        // let subjectXaxis = 90;
        // let bodyXaxis = 110;
        // let signatoryxAxis = 205;
        // let singnatureXaxis = 170;
        // let stampXaxis = 165;
        // this.download_letter_pdf(
        //   subjectXaxis,
        //   bodyXaxis,
        //   signatoryxAxis,
        //   singnatureXaxis,
        //   stampXaxis
        // );
      } else if (
        this.download_letter == true &&
        this.request.letter_type == "Salary Certificate"
      ) {
        let subjectXaxis = 100;
        let bodyXaxis = 120;
        let signatoryxAxis = 215;
        let singnatureXaxis = 180;
        let stampXaxis = 175;
        this.download_letter_pdf(
          subjectXaxis,
          bodyXaxis,
          signatoryxAxis,
          singnatureXaxis,
          stampXaxis
        );
      } else if (
        this.download_letter == true &&
        this.request.letter_type == "Salary Transfer Letter"
      ) {
        let subjectXaxis = 100;
        let bodyXaxis = 120;
        let signatoryxAxis = 225;
        let singnatureXaxis = 190;
        let stampXaxis = 185;
        this.download_letter_pdf(
          subjectXaxis,
          bodyXaxis,
          signatoryxAxis,
          singnatureXaxis,
          stampXaxis
        );
      } else if (
        this.download_letter == true &&
        this.request.letter_type == "Custom Letter Requests"
      ) {
        let subjectXaxis = 90;
        let bodyXaxis = 110;
        let signatoryxAxis = 205;
        let singnatureXaxis = 170;
        let stampXaxis = 165;
        this.download_letter_pdf(
          subjectXaxis,
          bodyXaxis,
          signatoryxAxis,
          singnatureXaxis,
          stampXaxis
        );
      } else if (
        this.download_letter == true &&
        this.request.letter_type == "Employment Certificate"
      ) {
        let subjectXaxis = 90;
        let bodyXaxis = 110;
        let signatoryxAxis = 205;
        let singnatureXaxis = 170;
        let stampXaxis = 165;
        this.download_letter_pdf(
          subjectXaxis,
          bodyXaxis,
          signatoryxAxis,
          singnatureXaxis,
          stampXaxis
        );
      }
    },
    toWatermarkURL(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
          callback(reader.result);
        };
        reader.readAsDataURL(xhr.response);
      };

      xhr.open("GET", url + "?not-from-cache-please");
      xhr.responseType = "blob";

      xhr.send();
    },
    toLeftSideBar(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
          callback(reader.result);
        };
        reader.readAsDataURL(xhr.response);
      };

      xhr.open("GET", url + "?not-from-cache-please");
      xhr.responseType = "blob";

      xhr.send();
    },
    toRighSidebar(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
          callback(reader.result);
        };
        reader.readAsDataURL(xhr.response);
      };

      xhr.open("GET", url + "?not-from-cache-please");
      xhr.responseType = "blob";

      xhr.send();
    },
    toDataURL(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
          callback(reader.result);
        };
        reader.readAsDataURL(xhr.response);
      };

      xhr.open("GET", url + "?not-from-cache-please");
      xhr.responseType = "blob";

      xhr.send();
    },
    toFooterURL(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
          callback(reader.result);
        };
        reader.readAsDataURL(xhr.response);
      };

      xhr.open("GET", url + "?not-from-cache-please");
      xhr.responseType = "blob";

      xhr.send();
    },
    toSignatureURL(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
          callback(reader.result);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.open("GET", url + "?not-from-cache-please");
      xhr.responseType = "blob";
      xhr.send();
    },
    toStampURL(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
          callback(reader.result);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.open("GET", url + "?not-from-cache-please");
      xhr.responseType = "blob";
      xhr.send();
    },
    async download_letter_pdf(
      subjectXaxis,
      bodyXaxis,
      signatoryxAxis,
      singnatureXaxis,
      stampXaxis
    ) {
      // this.companyLogo = '/logo/docib-group-LetterHead.png'
      // if (process.browser) {
      //   let bodyFont = 10;
      //   let footerFont = 7;
      //   let headerFont = 7;
      //   let whitespace = 15;

      //   const jsPDF = require("jspdf");
      //   var pdf = new jsPDF({ lineHeight: 1.5, compress: true });

      //   // Header
      //   if(this.request.pdfStyles){
      //   if (this.request.pdfStyles.header) {
      //     var logo = new Image();
      //     if (this.companyLogo) {
      //       logo.crossOrigin = "anonymous";
      //       //logo.crossOrigin = "Use-Credentials";
      //       logo.src = this.companyLogo;
      //       //  pdf.addImage(logo, 'png', 10, 10);
      //       pdf.addImage(logo, "png", 20, 10, 170, 20);
      //     }
      //   }

      //   //This is watermark
      //   if (this.request.pdfStyles.watermark) {
      //     var backgrnd = new Image();
      //     if (this.watermark) {
      //       backgrnd.crossOrigin = "anonymous";
      //       backgrnd.src = this.watermark;
      //       pdf.addImage(backgrnd, "png", 0, 115, 210, 80);
      //     }
      //   }
      //   }

      //   pdf.setFontSize(headerFont);
      //   pdf.setFontType("normal");

      //   pdf.setFontSize(bodyFont);
      //   pdf.setFontType("bold");

      //   pdf.setFontSize(bodyFont);
      //   pdf.setFont("Courier-BoldOblique", "bold");
      //   //This is Date
      //   if(this.request.pdfStyles){
      //   if (this.request.pdfStyles.date_position == "text_alignment_left") {
      //     pdf.text(
      //       "Date : " +
      //         moment(String(this.request.date_created)).format(
      //           this.request.pdfStyles.date_format
      //         ),
      //       20,
      //       62
      //     );
      //   } else if (
      //     this.request.pdfStyles.date_position == "text_alignment_right"
      //   ) {
      //     pdf.text(
      //       "Date : " +
      //         moment(String(this.request.date_created)).format(
      //           this.request.pdfStyles.date_format
      //         ),
      //       160,
      //       62
      //     );
      //   } else {
      //     pdf.text(
      //       "Date : " +
      //         moment(String(this.request.date_created)).format(
      //           this.request.pdfStyles.date_format
      //         ),
      //       80,
      //       62
      //     );
      //   }
      //   }

      //   pdf.setFontSize(bodyFont);
      //   pdf.setFont("Courier-BoldOblique", "bold");
      //   // pdf.setFontType('bold')

      //   var source = this.replaceHeader();
      //   var elementHandler = {
      //     "#ignorePDF": function (element, renderer) {
      //       return true;
      //     },
      //   };

      //   //This is Addressee
      //    if (
      //     this.request.pdfStyles
      //   ) {
      //   if (
      //     this.request.pdfStyles.addressee_position == "text_alignment_left"
      //   ) {
      //     pdf.fromHTML(source, 20, 60, {
      //       width: 175,
      //       elementHandlers: elementHandler,
      //     });
      //   } else if (
      //     this.request.pdfStyles.addressee_position == "text_alignment_right"
      //   ) {
      //     pdf.fromHTML(source, 160, 60, {
      //       width: 175,
      //       elementHandlers: elementHandler,
      //     });
      //   } else {
      //     pdf.fromHTML(source, 80, 60, {
      //       width: 175,
      //       elementHandlers: elementHandler,
      //     });
      //   }
      //   }

      //   pdf.setFontSize(bodyFont);
      //   pdf.setFont("Courier-BoldOblique", "bold");

      //   //This is Subject
      //   let text = "";
      //   pdf.setFontSize(bodyFont);
      //   pdf.setFont("Courier-BoldOblique", "bold");
      //   if(this.request.pdfStyles){
      //   if (this.request.pdfStyles.subject_position == "text_alignment_left") {
      //     text = this.request.letter_fields.subject;
      //     pdf.fromHTML(text, 20, subjectXaxis, {
      //       width: 175,
      //       elementHandlers: elementHandler,
      //     });
      //   } else if (
      //     this.request.pdfStyles.subject_position == "text_alignment_right"
      //   ) {
      //     text = this.request.letter_fields.subject;
      //     pdf.fromHTML(text, 160, subjectXaxis, {
      //       width: 175,
      //       elementHandlers: elementHandler,
      //     });
      //   } else {
      //     text = this.request.letter_fields.subject;

      //     pdf.fromHTML(text, 80, subjectXaxis, {
      //       width: 175,
      //       elementHandlers: elementHandler,
      //     });
      //   }
      //   }
      //   //This is Body
      //   pdf.setFontSize(bodyFont);
      //   pdf.setFont("Courier-BoldOblique", "normal");
      //   var source1 = this.replaceLetterkey(this.request.letter_fields.body);
      //   pdf.fromHTML(
      //     '<div style="Nunito, sans-serif;">' + source1 + "</div>",
      //     20,
      //     bodyXaxis,
      //     {
      //       width: 175,
      //       elementHandlers: elementHandler,
      //     }
      //   );

      //   //This is signatureif 
      //   if(this.request.pdfStyles){
      //   if (this.request.pdfStyles.signature) {
      //     var backgrnd = new Image();
      //     if (this.signature) {
      //       backgrnd.crossOrigin = "anonymous";
      //       backgrnd.src = this.signature;
      //       pdf.addImage(
      //         backgrnd,
      //         "png",
      //         15,
      //         singnatureXaxis + whitespace,
      //         40,
      //         20
      //       );
      //       //pdf.addImage(backgrnd, 'png', 50, 170 + whitespace , 38,33)
      //     }
      //   }

      //   // This is stamp
      //   if (this.request.pdfStyles.stamp) {
      //     var backgrnd = new Image();
      //     if (this.stampUrl) {
      //       backgrnd.crossOrigin = "anonymous";
      //       backgrnd.src = this.stamp;
      //       pdf.addImage(backgrnd, "png", 80, stampXaxis + whitespace, 38, 33);
      //     }
      //   }

      //   // This is signatory
      //   if (this.request.pdfStyles.signatory) {
      //     //Name
      //     let splitTitle = "";
      //     pdf.setFontSize(bodyFont);
      //     pdf.setFont("Courier-BoldOblique", "bold");
      //     let text5 = this.signatory.name;
      //     splitTitle = pdf.splitTextToSize(text5, 180);
      //     pdf.text(splitTitle, 20, signatoryxAxis + whitespace);

      //     //Designation
      //     let text = "";
      //     pdf.setFontSize(bodyFont);
      //     pdf.setFont("Courier-BoldOblique", "bold");
      //     text = this.signatory.designation;
      //     splitTitle = pdf.splitTextToSize(text, 180);
      //     pdf.text(splitTitle, 20, signatoryxAxis + 5 + whitespace);
      //   }

      //   //This is right sidebar
      //   if (this.request.pdfStyles.right_sideBar) {
      //     var backgrnd = new Image();
      //     if (this.rightSidebar) {
      //       backgrnd.crossOrigin = "anonymous";
      //       backgrnd.src = this.rightSidebar;
      //       pdf.addImage(backgrnd, "png", 200, 60, 5, 210);
      //     }
      //   }

      //   //This is left sidebar
      //   if (this.request.pdfStyles.left_sideBar) {
      //     var backgrnd = new Image();
      //     if (this.leftSidebar) {
      //       backgrnd.crossOrigin = "anonymous";
      //       backgrnd.src = this.leftSidebar;
      //       pdf.addImage(backgrnd, "png", 10, 60, 5, 210);
      //     }
      //   }

      //   // This is footer
      //   if (this.request.pdfStyles.footer) {
      //     var backgrnd = new Image();
      //     if (this.footer) {
      //       backgrnd.crossOrigin = "anonymous";
      //       backgrnd.src = this.footer;
      //       pdf.addImage(backgrnd, "png", 25, 265, 160, 25);
      //     }
      //   }
      //   }

      //   const token = this.$store.getters.getToken;
      //   const AuthStr = "Bearer ".concat(token);
      //   let blob = pdf.output(
      //     "blob",
      //     this.getUserDetails().first_name +
      //       " " +
      //       this.request.letter_type +
      //       ".pdf"
      //   );
      //   // Upload the file
      //   const fd = new FormData();
      //   fd.append("a", blob);
      //   fd.append("folder", "letters");
      //   fd.append(
      //     "b",
      //     this.getUserDetails().first_name +
      //       " " +
      //       this.request.letter_type +
      //       "-" +
      //       new Date().getTime() / 1000 +
      //       ".pdf"
      //   );
      //   this.$axios
      //     .$post("/requests/upload-file", fd, {
      //       headers: { Authorization: AuthStr },
      //     })
      //     .then((res) => {
      //       this.request.pdf_url = res.url;
      //       this.$nuxt.$emit("letterUrl", res.url);
            
      //       this.$axios
      //         .$put(
      //           "requests/update-letters/" + this.request._id,
      //           this.request,
      //           { headers: { Authorization: AuthStr } }
      //         )
      //         .then((res) => {
      //         })
      //         .catch((e) => console.log(e));
      //     })
      //     .catch((e) => console.log(e));
      // }
    },

    filterLetterFormats() {
      let result = this.configuration[0].letterRequest.filter((a) => {
        if (a.letterDescription.requestSubType == "") {
          return a.letterDescription.requestType == this.request.letter_type;
        } else {
          return (
            a.letterDescription.requestSubType ==
              this.request.letter_sub_type &&
            a.letterDescription.requestType == this.request.letter_type
          );
        }
      });
      return result[0];
    },
    replaceLetterkey(data) {
      // if (this.companyData.length > 0) {
      const letterClass = new Letters();
      let obj_userInfo = this.getUserDetails();
      let obj_letterInfo = this.request;
      let obj_requestInfo = this.request;
      let bln_newLetter = false;
      let arr_companies = [this.getCompanyInformation()];
      let body = letterClass.computeLetterContent(
        obj_userInfo,
        obj_letterInfo,
        obj_requestInfo,
        bln_newLetter,
        arr_companies
      );
      let words = body.split("</p><p>");
      let str_body = "";
      for (var i = 0; i < words.length; i++) {
        str_body = str_body + words[i] + "<br>";
      }
      return body;
      // } else {
      //   return 'test';
      // }
    },

    replaceHeader() {
      const letterClass = new Letters();
      let obj_userInfo = this.getUserDetails();
      let obj_letterInfo = this.request;
      let obj_requestInfo = this.request;
      let bln_newLetter = false;
      let arr_companies = [this.getCompanyInformation()];
      let addresse = letterClass.computeLetterAddressee(
        obj_userInfo,
        obj_letterInfo,
        obj_requestInfo,
        bln_newLetter,
        arr_companies
      );

      let words = addresse.split("</p><p>");
      let str_addressee = "";
      for (var i = 0; i < words.length; i++) {
        str_addressee = str_addressee + words[i] + "<br>";
      }
      return str_addressee;
    },
    getUserDetails() {
      let abc = this.user.filter((a) => a._id == this.request.user_id);
      return abc[0];
    },
    getManagerDetails(id) {
      if (id) {
        let employee = this.user.filter((a) => a._id == id);
        let manager = [];
        if (employee.length > 0) {
          manager = this.user.filter(
            (a) => a.emp_id == employee[0].reporting.letterSignatoryName
          );
        }
        let result =
          manager.length > 0
            ? manager[0]
            : {
                first_name: "",
                last_name: "",
                personal: { designation: "", empolyeeSignature: "" },
              };
        return result;
      }
    },
    getCompanyInformation() {
      let company = this.companies.filter(
        (a) => a._id == this.getUserDetails().company_ID
      );
      return company.length > 0 ? company[0] : "";
    },
    getSignatoryDetails() {
      let user = this.users.filter((a) => a._id == this.request.user_id);
      if (user.length > 0) {
        let filterReportingManager = this.users.filter(
          (a) => a.emp_id == user[0].reporting.letterSignatoryName
        );
        return filterReportingManager.length > 0
          ? filterReportingManager[0]
          : "";
      }
    },
    getCompanyName(val) {
      if (val == "" || val == undefined || val == null) {
        return "";
      } else {
        let abc = this.companyData.filter((a) => a._id == val);
        if (abc.length > 0) {
          return abc[0].company_name;
        } else {
          return "";
        }
      }
    },
  },
  computed: {},
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@1,700&family=Rock+3D&display=swap");
.backgroundImg {
  margin-left: 20px;
  margin-right: 20px;
}
.v-application p {
  margin-bottom: 0;
}
p {
  margin-bottom: 0 !important;
}
</style>