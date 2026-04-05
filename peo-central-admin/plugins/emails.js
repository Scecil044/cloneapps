export default {
    getEmailTemplateForComapny: function (company, user) {
      let emailBody = {};
      let password = user.first_name.substr(0, 4) + user.date_of_joining.substr(5,).replace('-', '')
      emailBody.subjectMsg = 'Welcome Onboard'
      emailBody.emailBody = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
      <html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">
          <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
            <!--[if !mso]><!-->
            <meta http-equiv="X-UA-Compatible" content="IE=Edge">
            <!--<![endif]-->
            <!--[if (gte mso 9)|(IE)]>
            <xml>
              <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
            <!--[if (gte mso 9)|(IE)]>
        <style type="text/css">
          body {width: 650px;margin: 0 auto;}
          table {border-collapse: collapse;}
          table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}
          img {-ms-interpolation-mode: bicubic;}
        </style>
      <![endif]-->
            <style type="text/css">
          body, p, div {
            font-family: arial,helvetica,sans-serif;
            font-size: 14px;
          }
          body {
            color: #000000;
          }
          body a {
            color: #1188E6;
            text-decoration: none;
          }
          p { margin: 0; padding: 0; }
          table.wrapper {
            width:100% !important;
            table-layout: fixed;
            -webkit-font-smoothing: antialiased;
            -webkit-text-size-adjust: 100%;
            -moz-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
          img.max-width {
            max-width: 100% !important;
          }
          .column.of-2 {
            width: 50%;
          }
          .column.of-3 {
            width: 33.333%;
          }
          .column.of-4 {
            width: 25%;
          }
          ul ul ul ul  {
            list-style-type: disc !important;
          }
          ol ol {
            list-style-type: lower-roman !important;
          }
          ol ol ol {
            list-style-type: lower-latin !important;
          }
          ol ol ol ol {
            list-style-type: decimal !important;
          }
          @media screen and (max-width:480px) {
            .preheader .rightColumnContent,
            .footer .rightColumnContent {
              text-align: left !important;
            }
            .preheader .rightColumnContent div,
            .preheader .rightColumnContent span,
            .footer .rightColumnContent div,
            .footer .rightColumnContent span {
              text-align: left !important;
            }
            .preheader .rightColumnContent,
            .preheader .leftColumnContent {
              font-size: 80% !important;
              padding: 5px 0;
            }
            table.wrapper-mobile {
              width: 100% !important;
              table-layout: fixed;
            }
            img.max-width {
              height: auto !important;
              max-width: 100% !important;
            }
            a.bulletproof-button {
              display: block !important;
              width: auto !important;
              font-size: 80%;
              padding-left: 0 !important;
              padding-right: 0 !important;
            }
            .columns {
              width: 100% !important;
            }
            .column {
              display: block !important;
              width: 100% !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
              margin-left: 0 !important;
              margin-right: 0 !important;
            }
            .social-icon-column {
              display: inline-block !important;
            }
          }
        </style>
          <style>
            @media screen and (max-width:480px) {
              table\0 {
                width: 480px !important;
                }
            }
          </style>
            <!--user entered Head Start--><!--End Head user entered-->
          </head>
          <body>
            <center class="wrapper" data-link-color="#1188E6" data-body-style="font-size:14px; font-family:arial,helvetica,sans-serif; color:#000000; background-color:#f1f1f1;">
              <div class="webkit">
                <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#f1f1f1">
                  <tr>
                    <td valign="top" bgcolor="#f1f1f1" width="100%">
                      <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td width="100%">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td>
                                  <!--[if mso]>
          <center>
          <table><tr><td width="650">
        <![endif]-->
                                          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:650px;" align="center">
                                            <tr>
                                              <td role="modules-container" style="padding:6px 24px 6px 24px; color:#000000; text-align:left;" bgcolor="#FFFFFF" width="100%" align="left"><table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%" style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
          <tr>
            <td role="module-content">
              <p></p>
            </td>
          </tr>
        </table><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="f6d20c8f-722f-4327-815c-45ee262d4d3d">
          <tbody>
            <tr>
              <td style="font-size:6px; line-height:10px; padding:12px 0px 12px 0px;" valign="top" align="center">
                <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:100% !important; width:100%; height:auto !important;" width="602" alt="" data-proportionally-constrained="true" data-responsive="true" src="http://cdn.mcauto-images-production.sendgrid.net/4bc998d78c1a22f8/3e5ae066-2902-4c7b-a6c7-46dfbdc1a8ff/1355x470.jpg">
              </td>
            </tr>
          </tbody>
        </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c40d3590-b44b-4eaa-a539-2c510bf0fa43" data-mc-module-version="2019-10-22">
          <tbody>
            <tr>
              <td style="padding:12px 0px 12px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: start"><span style="box-sizing: border-box; padding-top: 0cm; padding-right: 0cm; padding-bottom: 0cm; padding-left: 0cm; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; font-style: inherit; font-variant-caps: inherit; font-weight: inherit; font-stretch: inherit; line-height: inherit; vertical-align: baseline; border-top-width: 1pt; border-right-width: 1pt; border-bottom-width: 1pt; border-left-width: 1pt; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-top-color: windowtext; border-right-color: windowtext; border-bottom-color: windowtext; border-left-color: windowtext; border-image-source: initial; border-image-slice: initial; border-image-width: initial; border-image-outset: initial; border-image-repeat: initial; caret-color: rgb(32, 31, 30); color: #201f1e; letter-spacing: normal; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration: none; background-color: white; font-family: verdana, geneva, sans-serif; font-size: 14px">Dear </span><span style="box-sizing: border-box; padding-top: 0cm; padding-right: 0cm; padding-bottom: 0cm; padding-left: 0cm; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; font-style: inherit; font-variant-caps: inherit; font-weight: inherit; font-stretch: inherit; line-height: inherit; vertical-align: baseline; border-top-width: 1pt; border-right-width: 1pt; border-bottom-width: 1pt; border-left-width: 1pt; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-top-color: windowtext; border-right-color: windowtext; border-bottom-color: windowtext; border-left-color: windowtext; border-image-source: initial; border-image-slice: initial; border-image-width: initial; border-image-outset: initial; border-image-repeat: initial; caret-color: rgb(32, 31, 30); color: #201f1e; letter-spacing: normal; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration: none; background-color: white; font-family: verdana, geneva, sans-serif; font-size: 14px"><strong>${user.first_name + ' ' + user.last_name};</strong></span><span style="box-sizing: border-box; padding-top: 0cm; padding-right: 0cm; padding-bottom: 0cm; padding-left: 0cm; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; font-style: inherit; font-variant-caps: inherit; font-weight: inherit; font-stretch: inherit; line-height: inherit; vertical-align: baseline; border-top-width: 1pt; border-right-width: 1pt; border-bottom-width: 1pt; border-left-width: 1pt; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-top-color: windowtext; border-right-color: windowtext; border-bottom-color: windowtext; border-left-color: windowtext; border-image-source: initial; border-image-slice: initial; border-image-width: initial; border-image-outset: initial; border-image-repeat: initial; caret-color: rgb(32, 31, 30); color: #201f1e; letter-spacing: normal; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration: none; background-color: white; font-family: verdana, geneva, sans-serif; font-size: 14px">,</span></div>
      <div style="font-family: inherit; text-align: start"><br></div>
      <div style="font-family: inherit; text-align: inherit"><span style="box-sizing: border-box; padding-top: 0cm; padding-right: 0cm; padding-bottom: 0cm; padding-left: 0cm; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; font-style: inherit; font-variant-caps: inherit; font-weight: inherit; font-stretch: inherit; line-height: inherit; vertical-align: baseline; border-top-width: 1pt; border-right-width: 1pt; border-bottom-width: 1pt; border-left-width: 1pt; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-top-color: windowtext; border-right-color: windowtext; border-bottom-color: windowtext; border-left-color: windowtext; border-image-source: initial; border-image-slice: initial; border-image-width: initial; border-image-outset: initial; border-image-repeat: initial; caret-color: rgb(32, 31, 30); color: #201f1e; letter-spacing: normal; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration: none; background-color: white; font-family: verdana, geneva, sans-serif; font-size: 14px">Hope this mail finds you well.</span></div>
      <div style="font-family: inherit; text-align: inherit"><br></div>
      <div style="font-family: inherit; text-align: inherit"><span style="box-sizing: border-box; padding-top: 0cm; padding-right: 0cm; padding-bottom: 0cm; padding-left: 0cm; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; font-style: inherit; font-variant-caps: inherit; font-weight: inherit; font-stretch: inherit; line-height: inherit; vertical-align: baseline; border-top-width: 1pt; border-right-width: 1pt; border-bottom-width: 1pt; border-left-width: 1pt; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-top-color: windowtext; border-right-color: windowtext; border-bottom-color: windowtext; border-left-color: windowtext; border-image-source: initial; border-image-slice: initial; border-image-width: initial; border-image-outset: initial; border-image-repeat: initial; caret-color: rgb(32, 31, 30); color: #201f1e; letter-spacing: normal; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration: none; background-color: white; font-family: verdana, geneva, sans-serif; font-size: 14px">My name is Sahiba, and I will be your Account Manager ensuring&nbsp;you have a great employee onboarding experience. I am delighted to confirm that we have registered </span><span style="box-sizing: border-box; padding-top: 0cm; padding-right: 0cm; padding-bottom: 0cm; padding-left: 0cm; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; font-style: inherit; font-variant-caps: inherit; font-weight: inherit; font-stretch: inherit; line-height: inherit; vertical-align: baseline; border-top-width: 1pt; border-right-width: 1pt; border-bottom-width: 1pt; border-left-width: 1pt; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-top-color: windowtext; border-right-color: windowtext; border-bottom-color: windowtext; border-left-color: windowtext; border-image-source: initial; border-image-slice: initial; border-image-width: initial; border-image-outset: initial; border-image-repeat: initial; caret-color: rgb(32, 31, 30); color: #201f1e; letter-spacing: normal; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration: none; background-color: white; font-family: verdana, geneva, sans-serif; font-size: 14px"><strong>${company.company_name}</strong></span><span style="box-sizing: border-box; padding-top: 0cm; padding-right: 0cm; padding-bottom: 0cm; padding-left: 0cm; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; font-style: inherit; font-variant-caps: inherit; font-weight: inherit; font-stretch: inherit; line-height: inherit; vertical-align: baseline; border-top-width: 1pt; border-right-width: 1pt; border-bottom-width: 1pt; border-left-width: 1pt; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-top-color: windowtext; border-right-color: windowtext; border-bottom-color: windowtext; border-left-color: windowtext; border-image-source: initial; border-image-slice: initial; border-image-width: initial; border-image-outset: initial; border-image-repeat: initial; caret-color: rgb(32, 31, 30); color: #201f1e; letter-spacing: normal; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration: none; background-color: white; font-family: verdana, geneva, sans-serif; font-size: 14px"> as a client in our Employee Management Portal.&nbsp;</span></div><div></div></div></td>
            </tr>
          </tbody>
        </table><table class="module" role="module" data-type="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="775d4774-e488-4f1c-9480-8067e23b3663">
          <tbody>
            <tr>
              <td style="padding:12px 0px 12px 0px;" role="module-content" height="100%" valign="top" bgcolor="">
                <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" height="1px" style="line-height:1px; font-size:1px;">
                  <tbody>
                    <tr>
                      <td style="padding:0px 0px 1px 0px;" bgcolor="#000000"></td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="3388afb3-7b78-4e2c-a570-bb59859f8e84" data-mc-module-version="2019-10-22">
          <tbody>
            <tr>
              <td style="padding:12px 0px 12px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: start"><span style="box-sizing: border-box; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; font-style: inherit; font-variant-caps: inherit; font-weight: bold; font-stretch: inherit; line-height: inherit; font-size: 18px; vertical-align: baseline; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-top-style: initial; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-image-source: initial; border-image-slice: initial; border-image-width: initial; border-image-outset: initial; border-image-repeat: initial; caret-color: rgb(247, 178, 0); letter-spacing: normal; text-align: start; text-indent: 0px; text-transform: none; white-space: pre-wrap; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; background-color: rgb(255, 255, 255); float: none; display: inline; color: #062d6e; font-family: verdana, geneva, sans-serif">The Employee Management Portal</span><span style="color: #062d6e; font-family: verdana, geneva, sans-serif">&nbsp;</span></div>
      <div style="font-family: inherit; text-align: start"><br></div>
      <div style="font-family: inherit; text-align: inherit"><span style="caret-color: rgb(32, 31, 30); color: #201f1e; font-family: verdana, geneva, sans-serif; font-size: 14px; font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration: none; float: none; display: inline">Since you are our point of contact,&nbsp;you will be given access to the portal as </span><span style="caret-color: rgb(32, 31, 30); color: #201f1e; font-family: verdana, geneva, sans-serif; font-size: 14px; font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration: none; float: none; display: inline"><strong>Admin Role</strong></span><span style="caret-color: rgb(32, 31, 30); color: #201f1e; font-family: verdana, geneva, sans-serif; font-size: 14px; font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration: none; float: none; display: inline">. This enables you to raise new employment requests, track your employees' complete visa process, access resources, raise support request and seek online assistance if needed. &nbsp;&nbsp;</span></div><div></div></div></td>
            </tr>
          </tbody>
        </table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:0px 0px 12px 0px;" bgcolor="#FFFFFF" data-distribution="1,1,1,1">
          <tbody>
            <tr role="module-content">
              <td height="100%" valign="top"><table width="135" style="width:135px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
            <tbody>
              <tr>
                <td style="padding:0px;margin:0px;border-spacing:0;"><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="podDV4pjDG3YuKG6ZCbAKH.1">
          <tbody>
            <tr>
              <td style="font-size:6px; line-height:10px; padding:12px 0px 0px 0px;" valign="top" align="center">
                <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:50% !important; width:50%; height:auto !important;" width="68" alt="" data-proportionally-constrained="true" data-responsive="true" src="http://cdn.mcauto-images-production.sendgrid.net/4bc998d78c1a22f8/1e988fa0-6912-464c-bb49-c5a309ba3186/418x418.jpg">
              </td>
            </tr>
          </tbody>
        </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="rxCoX1PZHRFY42cf5YqfHs.2" data-mc-module-version="2019-10-22">
          <tbody>
            <tr>
              <td style="padding:6px 0px 12px 0px; line-height:15px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="color: #404040; font-size: 12px; font-family: verdana, geneva, sans-serif">Track Employee's Visa Process</span></div><div></div></div></td>
            </tr>
          </tbody>
        </table></td>
              </tr>
            </tbody>
          </table><table width="135" style="width:135px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-1">
            <tbody>
              <tr>
                <td style="padding:0px;margin:0px;border-spacing:0;"><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="podDV4pjDG3YuKG6ZCbAKH.1.3">
          <tbody>
            <tr>
              <td style="font-size:6px; line-height:10px; padding:12px 0px 0px 0px;" valign="top" align="center">
                <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:50% !important; width:50%; height:auto !important;" width="68" alt="" data-proportionally-constrained="true" data-responsive="true" src="http://cdn.mcauto-images-production.sendgrid.net/4bc998d78c1a22f8/2c86b19f-fe01-4899-bdc2-fff1366f183a/418x418.jpg">
              </td>
            </tr>
          </tbody>
        </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="rxCoX1PZHRFY42cf5YqfHs.1.1" data-mc-module-version="2019-10-22">
          <tbody>
            <tr>
              <td style="padding:6px 0px 12px 0px; line-height:15px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="font-family: verdana, geneva, sans-serif; font-size: 12px; color: #404040">Raise New Employment request</span></div><div></div></div></td>
            </tr>
          </tbody>
        </table></td>
              </tr>
            </tbody>
          </table><table width="135" style="width:135px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-2">
            <tbody>
              <tr>
                <td style="padding:0px;margin:0px;border-spacing:0;"><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="podDV4pjDG3YuKG6ZCbAKH.1.2">
          <tbody>
            <tr>
              <td style="font-size:6px; line-height:10px; padding:12px 0px 0px 0px;" valign="top" align="center">
                <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:50% !important; width:50%; height:auto !important;" width="68" alt="" data-proportionally-constrained="true" data-responsive="true" src="http://cdn.mcauto-images-production.sendgrid.net/4bc998d78c1a22f8/1ec61f21-3b10-4214-abdc-9b1e4df6c121/418x418.jpg">
              </td>
            </tr>
          </tbody>
        </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="rxCoX1PZHRFY42cf5YqfHs.1.1.2" data-mc-module-version="2019-10-22">
          <tbody>
            <tr>
              <td style="padding:6px 0px 12px 0px; line-height:15px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="caret-color: rgb(0, 0, 0); font-family: verdana, geneva, sans-serif; font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-align: start; text-indent: 0px; text-transform: none; white-space: pre-wrap; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline; font-size: 12px; color: #404040">Access Company Resources</span></div><div></div></div></td>
            </tr>
          </tbody>
        </table></td>
              </tr>
            </tbody>
          </table><table width="135" style="width:135px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-3">
            <tbody>
              <tr>
                <td style="padding:0px;margin:0px;border-spacing:0;"><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="podDV4pjDG3YuKG6ZCbAKH.1.1">
          <tbody>
            <tr>
              <td style="font-size:6px; line-height:10px; padding:12px 0px 0px 0px;" valign="top" align="center">
                <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:50% !important; width:50%; height:auto !important;" width="68" alt="" data-proportionally-constrained="true" data-responsive="true" src="http://cdn.mcauto-images-production.sendgrid.net/4bc998d78c1a22f8/0efd06d0-def6-4996-8514-a2f0974c4739/418x418.jpg">
              </td>
            </tr>
          </tbody>
        </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="rxCoX1PZHRFY42cf5YqfHs.1.1.1" data-mc-module-version="2019-10-22">
          <tbody>
            <tr>
              <td style="padding:6px 0px 12px 0px; line-height:15px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="caret-color: rgb(0, 0, 0); font-family: verdana, geneva, sans-serif; font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-align: start; text-indent: 0px; text-transform: none; white-space: pre-wrap; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline; font-size: 12px; color: #404040">Raise and Track Support Requests</span></div><div></div></div></td>
            </tr>
          </tbody>
        </table></td>
              </tr>
            </tbody>
          </table></td>
            </tr>
          </tbody>
        </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="3388afb3-7b78-4e2c-a570-bb59859f8e84.1" data-mc-module-version="2019-10-22">
          <tbody>
            <tr>
              <td style="padding:12px 0px 6px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: inherit"><span style="font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration: none; caret-color: rgb(32, 31, 30); color: #201f1e; font-size: 14px; text-align: left; background-color: rgb(255, 255, 255); float: none; display: inline; font-family: verdana, geneva, sans-serif">Login to the portal&nbsp;using the credentials given below to experience a new generation of employee onboarding experience.</span></div><div></div></div></td>
            </tr>
          </tbody>
        </table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:6px 0px 0px 0px;" bgcolor="#FFFFFF" data-distribution="1,1">
          <tbody>
            <tr role="module-content">
              <td height="100%" valign="top"><table width="286" style="width:286px; border-spacing:0; border-collapse:collapse; margin:0px 15px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
            <tbody>
              <tr>
                <td style="padding:0px;margin:0px;border-spacing:0;"><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="rxCoX1PZHRFY42cf5YqfHs.3" data-mc-module-version="2019-10-22">
          <tbody>
            <tr>
              <td style="padding:0px 0px 12px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: inherit"><span style="caret-color: rgb(0, 0, 0); color: #000000; font-size: 14px; font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-align: start; text-indent: 0px; text-transform: none; white-space: pre-wrap; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline; font-family: verdana, geneva, sans-serif">Username:</span></div>
      <div style="font-family: inherit; text-align: inherit"><span style="caret-color: rgb(0, 0, 0); font-size: 14px; font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-align: start; text-indent: 0px; text-transform: none; white-space: pre-wrap; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline; color: #000000; font-family: verdana, geneva, sans-serif"><strong>${user.email}</strong></span></div><div></div></div></td>
            </tr>
          </tbody>
        </table></td>
              </tr>
            </tbody>
          </table><table width="286" style="width:286px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 15px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-1">
            <tbody>
              <tr>
                <td style="padding:0px;margin:0px;border-spacing:0;"><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="rxCoX1PZHRFY42cf5YqfHs.3.1" data-mc-module-version="2019-10-22">
          <tbody>
            <tr>
              <td style="padding:0px 0px 12px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: inherit"><span style="caret-color: rgb(0, 0, 0); color: #000000; font-size: 14px; font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-align: start; text-indent: 0px; text-transform: none; white-space: pre-wrap; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline; font-family: verdana, geneva, sans-serif">Password:&nbsp;</span></div>
      <div style="font-family: inherit; text-align: inherit"><span style="caret-color: rgb(0, 0, 0); font-size: 14px; font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-align: start; text-indent: 0px; text-transform: none; white-space: pre-wrap; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline; color: #000000; font-family: verdana, geneva, sans-serif"><strong>${password}</strong></span></div><div></div></div></td>
            </tr>
          </tbody>
        </table></td>
              </tr>
            </tbody>
          </table></td>
            </tr>
          </tbody>
        </table><table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="054cdb5d-8d89-4030-bcea-596c31fb1fd0">
            <tbody>
              <tr>
                <td align="left" bgcolor="" class="outer-td" style="padding:12px 0px 12px 0px;">
                  <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
                    <tbody>
                      <tr>
                      <td align="center" bgcolor="#062d6e" class="inner-td" style="border-radius:6px; font-size:16px; text-align:left; background-color:inherit;">
                        <a href="https://hrdirect-staging.devnhr.com/" style="background-color:#062d6e; border:1px solid #ffffff; border-color:#ffffff; border-radius:3px; border-width:1px; color:#ffffff; display:inline-block; font-size:12px; font-weight:bold; letter-spacing:0px; line-height:normal; padding:12px 18px 12px 18px; text-align:center; text-decoration:none; border-style:solid; font-family:inherit;" target="_blank">CLICK HERE TO LOGIN</a>
                      </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table><table class="module" role="module" data-type="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="ffdab61c-2899-4035-ade5-a113714280db.1.1.1">
          <tbody>
            <tr>
              <td style="padding:12px 0px 12px 0px;" role="module-content" height="100%" valign="top" bgcolor="">
                <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" height="1px" style="line-height:1px; font-size:1px;">
                  <tbody>
                    <tr>
                      <td style="padding:0px 0px 1px 0px;" bgcolor="#000000"></td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="b59ba6fb-0a11-44d5-a6d8-c3ea78ed2ad8.2" data-mc-module-version="2019-10-22">
          <tbody>
            <tr>
              <td style="padding:12px 0px 12px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: left"><span style="caret-color: rgb(247, 178, 0); font-style: normal; font-variant-caps: normal; font-weight: bold; letter-spacing: normal; text-align: start; text-indent: 0px; text-transform: none; white-space: pre-wrap; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline; color: #062d6e; font-size: 18px; font-family: verdana, geneva, sans-serif">Happy to help</span></div>
      <div style="font-family: inherit; text-align: center"><br></div>
      <div style="font-family: inherit; text-align: inherit"><span style="caret-color: rgb(36, 36, 36); color: #242424; font-family: verdana, geneva, sans-serif; font-size: 14px; font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration: none; float: none; display: inline">We thank &lt;Client Name&gt; for choosing Nathan &amp; Nathan as its Employer of Record partner.</span> <span style="font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration: none; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-top-style: initial; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-image-source: initial; border-image-slice: initial; border-image-width: initial; border-image-outset: initial; border-image-repeat: initial; font-stretch: inherit; line-height: inherit; vertical-align: baseline; text-align: left; color: black; background-color: white; font-size: 14px; font-family: verdana, geneva, sans-serif">We are happy to help you with any assistance. Please reach out to us on</span><span style="font-size: 14px; font-family: verdana, geneva, sans-serif"> </span><a href="tel:+97143544466"><span style="font-size: 14px; font-family: verdana, geneva, sans-serif; color: #000000"><strong>+971 4 354 4466</strong></span></a><span style="font-size: 14px; font-family: verdana, geneva, sans-serif"> </span><span style="font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration: none; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-top-style: initial; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-image-source: initial; border-image-slice: initial; border-image-width: initial; border-image-outset: initial; border-image-repeat: initial; font-stretch: inherit; line-height: inherit; vertical-align: baseline; text-align: left; color: black; background-color: white; font-size: 14px; font-family: verdana, geneva, sans-serif">or </span><a href="mailto:sahiba@nathanhr.com?subject=&amp;body="><span style="font-size: 14px; color: #201f1e; font-family: verdana, geneva, sans-serif"><strong>sahiba@nathanhr.com</strong></span></a></div><div></div></div></td>
            </tr>
          </tbody>
        </table><table class="module" role="module" data-type="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="ffdab61c-2899-4035-ade5-a113714280db.1.1.1.1">
          <tbody>
            <tr>
              <td style="padding:12px 0px 12px 0px;" role="module-content" height="100%" valign="top" bgcolor="">
                <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" height="1px" style="line-height:1px; font-size:1px;">
                  <tbody>
                    <tr>
                      <td style="padding:0px 0px 1px 0px;" bgcolor="#b6b6b6"></td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:0px 0px 0px 0px;" bgcolor="#FFFFFF" data-distribution="1,1">
          <tbody>
            <tr role="module-content">
              <td height="100%" valign="top"><table width="291" style="width:291px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
            <tbody>
              <tr>
                <td style="padding:0px;margin:0px;border-spacing:0;"><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="fc6a9a52-53bf-432c-b6da-cdc476a29609">
          <tbody>
            <tr>
              <td style="font-size:6px; line-height:10px; padding:12px 0px 12px 0px;" valign="top" align="left">
                
              <a href="www.nathanhr.com"><img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:60% !important; width:60%; height:auto !important;" width="175" alt="" data-proportionally-constrained="true" data-responsive="true" src="http://cdn.mcauto-images-production.sendgrid.net/4bc998d78c1a22f8/b23887d2-0662-4d3c-9ec7-226da927182d/4575x480.jpg"></a></td>
            </tr>
          </tbody>
        </table></td>
              </tr>
            </tbody>
          </table><table width="291" style="width:291px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-1">
            <tbody>
              <tr>
                <td style="padding:0px;margin:0px;border-spacing:0;"><table class="module" role="module" data-type="social" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="905b8a23-3215-4f75-829c-bc036a80d1f6">
          <tbody>
            <tr>
              <td valign="top" style="padding:12px 0px 24px 0px; font-size:6px; line-height:10px;" align="right">
                <table align="right" style="-webkit-margin-start:auto;-webkit-margin-end:auto;">
                  <tbody><tr align="right"><td style="padding: 0px 5px;" class="social-icon-column">
            <a role="social-icon-link" href="https://www.instagram.com/nathanhr/" target="_blank" alt="Instagram" title="Instagram" style="display:inline-block; background-color:#000000; height:25px; width:25px; border-radius:12px; -webkit-border-radius:12px; -moz-border-radius:12px;">
              <img role="social-icon" alt="Instagram" title="Instagram" src="https://mc.sendgrid.com/assets/social/white/instagram.png" style="height:25px; width:25px;" height="25" width="25">
            </a>
          </td><td style="padding: 0px 5px;" class="social-icon-column">
            <a role="social-icon-link" href="https://www.linkedin.com/company/nathan-&-nathan/" target="_blank" alt="LinkedIn" title="LinkedIn" style="display:inline-block; background-color:#000000; height:25px; width:25px; border-radius:12px; -webkit-border-radius:12px; -moz-border-radius:12px;">
              <img role="social-icon" alt="LinkedIn" title="LinkedIn" src="https://mc.sendgrid.com/assets/social/white/linkedin.png" style="height:25px; width:25px;" height="25" width="25">
            </a>
          </td></tr></tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table></td>
              </tr>
            </tbody>
          </table></td>
            </tr>
          </tbody>
        </table></td>
                                            </tr>
                                          </table>
                                          <!--[if mso]>
                                        </td>
                                      </tr>
                                    </table>
                                  </center>
                                  <![endif]-->
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
            </center>
          </body>
        </html>`
  
      return emailBody
    },
    getEmailTemplateForUser: function (computeUserDetails, users, process_name, configuration, companies) {
      let emailBody = {};
      let processname = 'employment  visa'
      if (users.process_type == 'Labour Card Request') processname = 'work permit (labour contract)'
      if (process_name == 'Initiate') {
        let company = companies.filter(company => company._id == users.company_ID)[0];
        let password = users.first_name.substr(0, 4) + users.date_of_joining.substr(5,).replace('-', '')
        // emailBody.subjectMsg = 'Welcome to Nathan & Nathan ' + users.first_name + ' ' + users.last_name;
        emailBody.subjectMsg = 'Welcome Onboard'
        emailBody.emailBody = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
        <html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">
            <head>
              <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
              <!--[if !mso]><!-->
              <meta http-equiv="X-UA-Compatible" content="IE=Edge">
              <!--<![endif]-->
              <!--[if (gte mso 9)|(IE)]>
              <xml>
                <o:OfficeDocumentSettings>
                  <o:AllowPNG/>
                  <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
              </xml>
              <![endif]-->
              <!--[if (gte mso 9)|(IE)]>
          <style type="text/css">
            body {width: 650px;margin: 0 auto;}
            table {border-collapse: collapse;}
            table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}
            img {-ms-interpolation-mode: bicubic;}
          </style>
        <![endif]-->
              <style type="text/css">
            body, p, div {
              font-family: arial,helvetica,sans-serif;
              font-size: 14px;
            }
            body {
              color: #000000;
            }
            body a {
              color: #1188E6;
              text-decoration: none;
            }
            p { margin: 0; padding: 0; }
            table.wrapper {
              width:100% !important;
              table-layout: fixed;
              -webkit-font-smoothing: antialiased;
              -webkit-text-size-adjust: 100%;
              -moz-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
            }
            img.max-width {
              max-width: 100% !important;
            }
            .column.of-2 {
              width: 50%;
            }
            .column.of-3 {
              width: 33.333%;
            }
            .column.of-4 {
              width: 25%;
            }
            ul ul ul ul  {
              list-style-type: disc !important;
            }
            ol ol {
              list-style-type: lower-roman !important;
            }
            ol ol ol {
              list-style-type: lower-latin !important;
            }
            ol ol ol ol {
              list-style-type: decimal !important;
            }
            @media screen and (max-width:480px) {
              .preheader .rightColumnContent,
              .footer .rightColumnContent {
                text-align: left !important;
              }
              .preheader .rightColumnContent div,
              .preheader .rightColumnContent span,
              .footer .rightColumnContent div,
              .footer .rightColumnContent span {
                text-align: left !important;
              }
              .preheader .rightColumnContent,
              .preheader .leftColumnContent {
                font-size: 80% !important;
                padding: 5px 0;
              }
              table.wrapper-mobile {
                width: 100% !important;
                table-layout: fixed;
              }
              img.max-width {
                height: auto !important;
                max-width: 100% !important;
              }
              a.bulletproof-button {
                display: block !important;
                width: auto !important;
                font-size: 80%;
                padding-left: 0 !important;
                padding-right: 0 !important;
              }
              .columns {
                width: 100% !important;
              }
              .column {
                display: block !important;
                width: 100% !important;
                padding-left: 0 !important;
                padding-right: 0 !important;
                margin-left: 0 !important;
                margin-right: 0 !important;
              }
              .social-icon-column {
                display: inline-block !important;
              }
            }
          </style>
              
              <!--user entered Head Start--><!--End Head user entered-->
            </head>
            <body>
              <center class="wrapper" data-link-color="#1188E6" data-body-style="font-size:14px; font-family:arial,helvetica,sans-serif; color:#000000; background-color:#f1f1f1;">
                <div class="webkit">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#f1f1f1">
                    <tr>
                      <td valign="top" bgcolor="#f1f1f1" width="100%">
                        <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td width="100%">
                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td>
                                    <!--[if mso]>
            <center>
            <table><tr><td width="650">
          <![endif]-->
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:650px;" align="center">
                                              <tr>
                                                <td role="modules-container" style="padding:6px 24px 6px 24px; color:#000000; text-align:left;" bgcolor="#FFFFFF" width="100%" align="left"><table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%" style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
            <tr>
              <td role="module-content">
                <p></p>
              </td>
            </tr>
          </table><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="f6d20c8f-722f-4327-815c-45ee262d4d3d">
            <tbody>
              <tr>
                <td style="font-size:6px; line-height:10px; padding:12px 0px 12px 0px;" valign="top" align="center">
                  <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:100% !important; width:100%; height:auto !important;" width="602" alt="" data-proportionally-constrained="true" data-responsive="true" src="http://cdn.mcauto-images-production.sendgrid.net/4bc998d78c1a22f8/3e5ae066-2902-4c7b-a6c7-46dfbdc1a8ff/1355x470.jpg">
                </td>
              </tr>
            </tbody>
          </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="b59ba6fb-0a11-44d5-a6d8-c3ea78ed2ad8" data-mc-module-version="2019-10-22">
            <tbody>
              <tr>
                <td style="padding:12px 0px 12px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                  <div>
                    <div style="font-family: inherit; text-align: left">
                      <span style="font-style: inherit; font-variant-caps: inherit; font-weight: inherit; letter-spacing: normal; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration: none; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; font-size: 10.5pt; font-family: Verdana, sans-serif; caret-color: rgb(32, 31, 30); color: #201f1e; text-align: left; padding-top: 0cm; padding-right: 0cm; padding-bottom: 0cm; padding-left: 0cm; border-top-width: 1pt; border-right-width: 1pt; border-bottom-width: 1pt; border-left-width: 1pt; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-top-color: windowtext; border-right-color: windowtext; border-bottom-color: windowtext; border-left-color: windowtext; border-image-source: initial; border-image-slice: initial; border-image-width: initial; border-image-outset: initial; border-image-repeat: initial; font-stretch: inherit; line-height: inherit; vertical-align: baseline; background-color: white">Dear </span>
                      <span style="font-style: inherit; font-variant-caps: inherit; font-weight: inherit; letter-spacing: normal; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration: none; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; font-size: 10.5pt; font-family: Verdana, sans-serif; caret-color: rgb(32, 31, 30); text-align: left; padding-top: 0cm; padding-right: 0cm; padding-bottom: 0cm; padding-left: 0cm; border-top-width: 1pt; border-right-width: 1pt; border-bottom-width: 1pt; border-left-width: 1pt; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-top-color: windowtext; border-right-color: windowtext; border-bottom-color: windowtext; border-left-color: windowtext; border-image-source: initial; border-image-slice: initial; border-image-width: initial; border-image-outset: initial; border-image-repeat: initial; font-stretch: inherit; line-height: inherit; vertical-align: baseline; background-color: white; color: #1e64a2">${users.first_name}</span>
                    </div>
                    <div style="font-family: inherit; text-align: left"><br></div>
                    <div style="font-family: inherit; text-align: left">
                      <span style="font-style: inherit; font-variant-caps: inherit; font-weight: inherit; letter-spacing: normal; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration: none; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; font-size: 10.5pt; font-family: Verdana, sans-serif; caret-color: rgb(32, 31, 30); color: #201f1e; text-align: left; padding-top: 0cm; padding-right: 0cm; padding-bottom: 0cm; padding-left: 0cm; border-top-width: 1pt; border-right-width: 1pt; border-bottom-width: 1pt; border-left-width: 1pt; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-top-color: windowtext; border-right-color: windowtext; border-bottom-color: windowtext; border-left-color: windowtext; border-image-source: initial; border-image-slice: initial; border-image-width: initial; border-image-outset: initial; border-image-repeat: initial; font-stretch: inherit; line-height: inherit; vertical-align: baseline; background-color: white; color: black">Congratulations! </span>
                    </div>
                    <div style="font-family: inherit; text-align: left"><br></div>
    	              <div style="font-family: inherit; text-align: left">
                      <span style="font-style: inherit; font-variant-caps: inherit; font-weight: inherit; letter-spacing: normal; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration: none; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; font-size: 10.5pt; font-family: Verdana, sans-serif; caret-color: rgb(32, 31, 30); color: #201f1e; text-align: left; padding-top: 0cm; padding-right: 0cm; padding-bottom: 0cm; padding-left: 0cm; border-top-width: 1pt; border-right-width: 1pt; border-bottom-width: 1pt; border-left-width: 1pt; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-top-color: windowtext; border-right-color: windowtext; border-bottom-color: windowtext; border-left-color: windowtext; border-image-source: initial; border-image-slice: initial; border-image-width: initial; border-image-outset: initial; border-image-repeat: initial; font-stretch: inherit; line-height: inherit; vertical-align: baseline; background-color: white">
                        We are excited to welcome you on board <span style="font-style: inherit; font-variant-caps: inherit; font-weight: inherit; letter-spacing: normal; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration: none; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; font-size: 10.5pt; font-family: Verdana, sans-serif; caret-color: rgb(32, 31, 30); text-align: left; padding-top: 0cm; padding-right: 0cm; padding-bottom: 0cm; padding-left: 0cm; border-top-width: 1pt; border-right-width: 1pt; border-bottom-width: 1pt; border-left-width: 1pt; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-top-color: windowtext; border-right-color: windowtext; border-bottom-color: windowtext; border-left-color: windowtext; border-image-source: initial; border-image-slice: initial; border-image-width: initial; border-image-outset: initial; border-image-repeat: initial; font-stretch: inherit; line-height: inherit; vertical-align: baseline; background-color: white; color: #1e64a2">${company.company_name}</span> and we can't wait to collaborate with you.
                      </span>
                    </div>
                    <div style="font-family: inherit; text-align: left">&nbsp;</div>
                    <div style="font-family: inherit; text-align: left">
                      <span style="font-style: inherit; font-variant-caps: inherit; font-weight: inherit; letter-spacing: normal; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration: none; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; font-size: 10.5pt; font-family: Verdana, sans-serif; caret-color: rgb(32, 31, 30); color: #201f1e; text-align: left; padding-top: 0cm; padding-right: 0cm; padding-bottom: 0cm; padding-left: 0cm; border-top-width: 1pt; border-right-width: 1pt; border-bottom-width: 1pt; border-left-width: 1pt; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-top-color: windowtext; border-right-color: windowtext; border-bottom-color: windowtext; border-left-color: windowtext; border-image-source: initial; border-image-slice: initial; border-image-width: initial; border-image-outset: initial; border-image-repeat: initial; font-stretch: inherit; line-height: inherit; vertical-align: baseline; background-color: white">
                        We are here to guide you through your initial onboarding process leading up to your start date. If you have any questions at any stage, please do not hesitate to contact us and we will be happy to help.
                      </span>
                    <div style="font-family: inherit; text-align: left">&nbsp;</div>
                    <div></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <table class="module" role="module" data-type="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="775d4774-e488-4f1c-9480-8067e23b3663">
            <tbody>
              <tr>
                <td style="padding:12px 0px 12px 0px;" role="module-content" height="100%" valign="top" bgcolor="">
                  <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" height="1px" style="line-height:1px; font-size:1px;">
                    <tbody>
                      <tr>
                        <td style="padding:0px 0px 1px 0px;" bgcolor="#000000"></td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
            <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="3388afb3-7b78-4e2c-a570-bb59859f8e84" data-mc-module-version="2019-10-22">
              <tbody>
                <tr>
                  <td style="padding:12px 0px 12px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                    <div>
                      <div style="font-family: inherit; text-align: start">
                        <span style="box-sizing: border-box; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; font-family: helvetica, sans-serif; font-style: inherit; font-variant-caps: inherit; font-weight: bold; font-stretch: inherit; line-height: inherit; font-size: 18px; vertical-align: baseline; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-top-style: initial; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-image-source: initial; border-image-slice: initial; border-image-width: initial; border-image-outset: initial; border-image-repeat: initial; caret-color: rgb(247, 178, 0); letter-spacing: normal; text-align: start; text-indent: 0px; text-transform: none; white-space: pre-wrap; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; background-color: rgb(255, 255, 255); float: none; display: inline; color: #062d6e">The Onboarding Portal</span><span style="color: #062d6e">&nbsp;</span></div>
        <div style="font-family: inherit; text-align: start"><br></div>
        <div style="font-family: inherit; text-align: inherit"><span style="font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration: none; caret-color: rgb(32, 31, 30); color: #201f1e; font-family: Verdana, sans-serif; font-size: 14px; text-align: left; background-color: rgb(255, 255, 255); float: none; display: inline">The onboarding portal enables you to track your complete visa process, access resources, raise support request and seek online assistance at every stage of the Visa process.</span></div><div></div></div></td>
              </tr>
            </tbody>
          </table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:0px 0px 12px 0px;" bgcolor="#FFFFFF" data-distribution="1,1,1,1">
            <tbody>
              <tr role="module-content">
                <td height="100%" valign="top"><table width="135" style="width:135px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
              <tbody>
                <tr>
                  <td style="padding:0px;margin:0px;border-spacing:0;"><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="podDV4pjDG3YuKG6ZCbAKH.1">
            <tbody>
              <tr>
                <td style="font-size:6px; line-height:10px; padding:12px 0px 0px 0px;" valign="top" align="center">
                  <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:50% !important; width:50%; height:auto !important;" width="68" alt="" data-proportionally-constrained="true" data-responsive="true" src="http://cdn.mcauto-images-production.sendgrid.net/4bc998d78c1a22f8/1e988fa0-6912-464c-bb49-c5a309ba3186/418x418.jpg">
                </td>
              </tr>
            </tbody>
          </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="rxCoX1PZHRFY42cf5YqfHs.2" data-mc-module-version="2019-10-22">
            <tbody>
              <tr>
                <td style="padding:6px 0px 12px 0px; line-height:15px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="color: #404040; font-family: verdana, geneva, sans-serif; font-size: 12px">Track Visa Status&nbsp;</span></div>
        <div style="font-family: inherit; text-align: center"><span style="color: #404040; font-family: verdana, geneva, sans-serif; font-size: 12px">at every stage</span></div><div></div></div></td>
              </tr>
            </tbody>
          </table></td>
                </tr>
              </tbody>
            </table><table width="135" style="width:135px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-1">
              <tbody>
                <tr>
                  <td style="padding:0px;margin:0px;border-spacing:0;"><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="podDV4pjDG3YuKG6ZCbAKH.1.3">
            <tbody>
              <tr>
                <td style="font-size:6px; line-height:10px; padding:12px 0px 0px 0px;" valign="top" align="center">
                  <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:50% !important; width:50%; height:auto !important;" width="68" alt="" data-proportionally-constrained="true" data-responsive="true" src="http://cdn.mcauto-images-production.sendgrid.net/4bc998d78c1a22f8/2c86b19f-fe01-4899-bdc2-fff1366f183a/418x418.jpg">
                </td>
              </tr>
            </tbody>
          </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="rxCoX1PZHRFY42cf5YqfHs.1.1" data-mc-module-version="2019-10-22">
            <tbody>
              <tr>
                <td style="padding:6px 0px 12px 0px; line-height:15px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="font-family: verdana, geneva, sans-serif; font-size: 12px; color: #404040">Know your Contact and access Support</span></div><div></div></div></td>
              </tr>
            </tbody>
          </table></td>
                </tr>
              </tbody>
            </table><table width="135" style="width:135px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-3">
              <tbody>
                <tr>
                  <td style="padding:0px;margin:0px;border-spacing:0;"><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="podDV4pjDG3YuKG6ZCbAKH.1.1">
            <tbody>
              <tr>
                <td style="font-size:6px; line-height:10px; padding:12px 0px 0px 0px;" valign="top" align="center">
                  <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:50% !important; width:50%; height:auto !important;" width="68" alt="" data-proportionally-constrained="true" data-responsive="true" src="http://cdn.mcauto-images-production.sendgrid.net/4bc998d78c1a22f8/0efd06d0-def6-4996-8514-a2f0974c4739/418x418.jpg">
                </td>
              </tr>
            </tbody>
          </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="rxCoX1PZHRFY42cf5YqfHs.1.1.1" data-mc-module-version="2019-10-22">
            <tbody>
              <tr>
                <td style="padding:6px 0px 12px 0px; line-height:15px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="caret-color: rgb(0, 0, 0); font-family: verdana, geneva, sans-serif; font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-align: start; text-indent: 0px; text-transform: none; white-space: pre-wrap; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline; font-size: 12px; color: #404040">Access Company Resources</span></div><div></div></div></td>
              </tr>
            </tbody>
          </table></td>
                </tr>
              </tbody>
            </table></td>
              </tr>
            </tbody>
          </table><table class="module" role="module" data-type="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="775d4774-e488-4f1c-9480-8067e23b3663.1">
            <tbody>
              <tr>
                <td style="padding:12px 0px 12px 0px;" role="module-content" height="100%" valign="top" bgcolor="">
                  <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" height="1px" style="line-height:1px; font-size:1px;">
                    <tbody>
                      <tr>
                        <td style="padding:0px 0px 1px 0px;" bgcolor="#000000"></td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="3388afb3-7b78-4e2c-a570-bb59859f8e84.1" data-mc-module-version="2019-10-22">
            <tbody>
              <tr>
                <td style="padding:12px 0px 6px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: start"><span style="box-sizing: border-box; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; font-family: helvetica, sans-serif; font-style: inherit; font-variant-caps: inherit; font-weight: bold; font-stretch: inherit; line-height: inherit; font-size: 18px; vertical-align: baseline; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-top-style: initial; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-image-source: initial; border-image-slice: initial; border-image-width: initial; border-image-outset: initial; border-image-repeat: initial; caret-color: rgb(247, 178, 0); letter-spacing: normal; text-align: start; text-indent: 0px; text-transform: none; white-space: pre-wrap; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; background-color: rgb(255, 255, 255); float: none; display: inline; color: #062d6e">Login to the Onboarding portal</span><span style="color: #062d6e">&nbsp;</span></div>
        <div style="font-family: inherit; text-align: start"><br></div>
        <div style="font-family: inherit; text-align: inherit"><span style="font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration: none; caret-color: rgb(32, 31, 30); color: #201f1e; font-family: Verdana, sans-serif; font-size: 14px; text-align: left; background-color: rgb(255, 255, 255); float: none; display: inline">Click on the button below to login to the portal. Your login credentials are as follows:</span></div><div></div></div></td>
              </tr>
            </tbody>
          </table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:6px 0px 0px 0px;" bgcolor="#FFFFFF" data-distribution="1,1">
            <tbody>
              <tr role="module-content">
                <td height="100%" valign="top"><table width="286" style="width:286px; border-spacing:0; border-collapse:collapse; margin:0px 15px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
              <tbody>
                <tr>
                  <td style="padding:0px;margin:0px;border-spacing:0;"><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="rxCoX1PZHRFY42cf5YqfHs.3" data-mc-module-version="2019-10-22">
            <tbody>
              <tr>
                <td style="padding:0px 0px 12px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: inherit"><span style="caret-color: rgb(0, 0, 0); color: #000000; font-family: verdana, geneva, sans-serif; font-size: 14px; font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-align: start; text-indent: 0px; text-transform: none; white-space: pre-wrap; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline">Username:</span></div>
        <div style="font-family: inherit; text-align: inherit"><span style="caret-color: rgb(0, 0, 0); font-family: verdana, geneva, sans-serif; font-size: 14px; font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-align: start; text-indent: 0px; text-transform: none; white-space: pre-wrap; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline; color: #000000"><strong>${users.email}</strong></span></div><div></div></div></td>
              </tr>
            </tbody>
          </table></td>
                </tr>
              </tbody>
            </table><table width="286" style="width:286px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 15px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-1">
              <tbody>
                <tr>
                  <td style="padding:0px;margin:0px;border-spacing:0;"><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="rxCoX1PZHRFY42cf5YqfHs.3.1" data-mc-module-version="2019-10-22">
            <tbody>
              <tr>
                <td style="padding:0px 0px 12px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: inherit"><span style="caret-color: rgb(0, 0, 0); color: #000000; font-family: verdana, geneva, sans-serif; font-size: 14px; font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-align: start; text-indent: 0px; text-transform: none; white-space: pre-wrap; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline">Password:&nbsp;</span></div>
        <div style="font-family: inherit; text-align: inherit"><span style="caret-color: rgb(0, 0, 0); font-family: verdana, geneva, sans-serif; font-size: 14px; font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-align: start; text-indent: 0px; text-transform: none; white-space: pre-wrap; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline; color: #000000"><strong>${password}</strong></span></div><div></div></div></td>
              </tr>
            </tbody>
          </table></td>
                </tr>
              </tbody>
            </table></td>
              </tr>
            </tbody>
          </table><table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="054cdb5d-8d89-4030-bcea-596c31fb1fd0">
              <tbody>
                <tr>
                  <td align="left" bgcolor="" class="outer-td" style="padding:12px 0px 12px 0px;">
                    <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
                      <tbody>
                        <tr>
                        <td align="center" bgcolor="#062d6e" class="inner-td" style="border-radius:6px; font-size:16px; text-align:left; background-color:inherit;">
                          <a href="https://hrdirect-staging.devnhr.com/" style="background-color:#062d6e; border:1px solid #ffffff; border-color:#ffffff; border-radius:3px; border-width:1px; color:#ffffff; display:inline-block; font-size:12px; font-weight:bold; letter-spacing:0px; line-height:normal; padding:12px 18px 12px 18px; text-align:center; text-decoration:none; border-style:solid; font-family:verdana,geneva,sans-serif;" target="_blank">CLICK HERE TO LOGIN</a>
                        </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="3388afb3-7b78-4e2c-a570-bb59859f8e84.1.1" data-mc-module-version="2019-10-22">
            <tbody>
              <tr>
                <td style="padding:12px 0px 6px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: inherit"><span style="font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration: none; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0cm; padding-right: 0cm; padding-bottom: 0cm; padding-left: 0cm; border-top-width: 1pt; border-right-width: 1pt; border-bottom-width: 1pt; border-left-width: 1pt; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-top-color: windowtext; border-right-color: windowtext; border-bottom-color: windowtext; border-left-color: windowtext; border-image-source: initial; border-image-slice: initial; border-image-width: initial; border-image-outset: initial; border-image-repeat: initial; font-family: Verdana, sans-serif; font-size: 10.5pt; font-stretch: inherit; line-height: inherit; vertical-align: baseline; caret-color: rgb(32, 31, 30); text-align: left; color: #201f1e; background-color: white">After you have successfully logged into the portal, please fill in the necessary information in the application form and upload the documents as per the submission guidelines mentioned in the portal.</span></div><div></div></div></td>
              </tr>
            </tbody>
          </table><table class="module" role="module" data-type="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="ffdab61c-2899-4035-ade5-a113714280db.1.1.1">
            <tbody>
              <tr>
                <td style="padding:12px 0px 12px 0px;" role="module-content" height="100%" valign="top" bgcolor="">
                  <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" height="1px" style="line-height:1px; font-size:1px;">
                    <tbody>
                      <tr>
                        <td style="padding:0px 0px 1px 0px;" bgcolor="#000000"></td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="b59ba6fb-0a11-44d5-a6d8-c3ea78ed2ad8.2" data-mc-module-version="2019-10-22">
            <tbody>
              <tr>
                <td style="padding:12px 0px 12px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                  <div>
                    <div style="font-family: inherit; text-align: inherit">
                      <span style="font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration: none; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-top-style: initial; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-image-source: initial; border-image-slice: initial; border-image-width: initial; border-image-outset: initial; border-image-repeat: initial; font-stretch: inherit; line-height: inherit; vertical-align: baseline; text-align: left; color: black; background-color: white; font-family: verdana, geneva, sans-serif; font-size: 14px">
                        We wish you every success in your new role.
                      </span>
                      <div style="font-family: inherit; text-align: center"><br></div>

                      <span style="font-family: verdana, geneva, sans-serif; font-size: 14px">Regards,</span><br>
                      <span style="font-family: verdana, geneva, sans-serif; font-size: 14px;background-color: white; color: #1e64a2"">
                        ${company.company_name}
                      </span><br>
                      <span style="font-family: verdana, geneva, sans-serif; font-size: 14px">
                        <p style='vertical-align:middle; margin: 0px'><img width='18' height='18' style='vertical-align:middle' src='https://nn-hr-extra.s3.eu-central-1.amazonaws.com/hr-direct/loc-icon.png' alt=''>: ${company.company_address}</p>
                        <p style='vertical-align:middle; margin: 0px'><img  width='18' height='18' style='vertical-align:middle' src='https://nn-hr-extra.s3.eu-central-1.amazonaws.com/hr-direct/phone-icon.png' alt=''>: ${company.company_phone}</p>
                        <img height='auto' width='30%' src=${company.letterDetail.companyLogoLink}><br><br><br><br>
                        <i>Note: you are receiving this system-generated e-mail since you are listed as a user in HR Direct software. For questions, please contact your HR Department.</i>
                      </span>
                    </div>
                    <div></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
                                    </tr>
                                  </table>
                                  <!--[if mso]>
                                </td>
                              </tr>
                            </table>
                          </center>
                          <![endif]-->
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </center>
  </body>
</html>`
        // emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
        //   'Hope this mail finds you well.' + '<br><br>' +
        //   'By way of introduction, Nathan & Nathan handles the PEO services for ' + company.company_name + ', which means that Nathan & Nathan will be your employer of record in UAE while you will be fully working and reporting to ' + company.company_name + ', We will be handling your legal visa process,  your salary payments each month, any letter that you require such as salary certificate, no objection letter or any HR related queries that you may have. <br><br>' +
        //   'To get you started we have attached the below details for your reference:<br><br>' +
        //   '<ol>' +
        //   '<li> A short Welcome Pack for your reference which contains key information about the UAE. <b>(<a href="https://nathanhr-omnipresent.s3.eu-central-1.amazonaws.com/onboarding/Employee+Welcome+Pack.pdf"> Employee Welcome Pack.pdf</a>)</b></li>' +
        //   '<li> Document Required for visa application – Please upload all the relevant documents on the portal for our review <b>(<a href="https://nathanhr-omnipresent.s3.eu-central-1.amazonaws.com/onboarding/N%26N%20Documents%20Required%2001_03.pdf"> N&N Documents Required 01_03.pdf)</a></b></li>' +
        //   '<li> Visa Process Timeline  <b>(<a href="https://nathanhr-omnipresent.s3.eu-central-1.amazonaws.com/onboarding/N%26N%20Visa%20Process_Dubai.pdf"> N&N Visa Process_Dubai.pdf</a>)</b></li>' +
        //   '</ol><br><br>' +
        //   "<i><font size='-1'>Note: Once we start your employment visa process, you are not allowed to exit the country until your visa stamping is not completed. So, if you do have any travel plans, please let us know in advance.</i></font><br><br>" +
        //   'Portal Link: <a href="https://peo-central.nathanhr.com/">peo-central.nathanhr.com</a>' + '<br>' +
        //   'Username: ' + users.email + '<br>' +
        //   'Password: ' + password + '<br><br>' +
        //   'Welcome aboard!' + '<br><br>' +
        //   'Regards,<br>' +
        //   'Nathan & Nathan HR Team';
      }
      if (process_name == 'Application Return') {
        emailBody.subjectMsg = 'Application Returned ' + users.first_name + ' ' + users.last_name
        emailBody.emailBody = 'Dear <b>' + users.first_name + '</b>,<br><br>' +
          'We have reviewed the documents and have noticed that the below documents are unclear:<br><br>' +
          '<ol>[unclearstring]</ol>' +
          'Kindly refer to the <a href="https://nathanhr-omnipresent.s3.eu-central-1.amazonaws.com/onboarding/N%26N%20Documents%20Required%2001_03.pdf">document guidelines</a> attached and re-upload the documents to proceed further with your process.<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team'
      }
      if (process_name == 'Documents Received') {
        emailBody.subjectMsg = 'Documents Received'
        emailBody.emailBody = 'Dear <b>' + users.first_name + '</b>,<br><br>' +
          'Thank you for updating your information on the portal.<br><br>' +
          'We are currently reviewing your documents and shall get back to you shortly if we need anything further.<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team'
      }
      if (process_name == 'MOL Offer Letter') {
        let password = users.first_name.substr(0, 4) + users.date_of_joining.substr(5,).replace('-', '')
        emailBody.subjectMsg = 'Employment Visa Process Initiated'
        emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
          'This is in reference to your ' + processname + ' application at ' + 'Nathan & Nathan HR Team' + '.<br><br>' +
          'Your Ministry of Labour contract has been typed and is sent for pre- approval. You can view & download a copy of the same by accessing your online portal. <br><br>' +
          'Kindly sign the contract as per the signature guidelines below and upload a clear scanned copy of your signed contract on the online Portal.<br><br>' +
          'Signature Guidelines:<br>' +
          '1. Kindly sign within the signature box on the last page of the contract if you have submitted your attested degree.<br>' +
          '2. Kindly affix your thumb impression within the signature box on the last page of the contract if you did not submit your attested degree.<br><br>' +
          // 'Portal Link: <a href="https://peo-central.nathanhr.com/">peo-central.nathanhr.com</a>' + '<br>' +
          // 'Username: ' + users.email + '<br>' +
          // 'Password: ' + password + '<br><br>' +
          'Note: You will be notified once we received your pre-approval.' + '<br><br>' +
          'Thank you and have a nice day.<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team';
      }
      if (process_name == 'User Acceptance of Job Offer') {
        emailBody.subjectMsg = 'Signed MOL Offer Accepted'
        emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
          'Your signed Ministry of Labour Offer Letter has been accpeted.<br><br>' +
          'The onboarding team will be in touch with you on the next steps in your employment process.<br><br>' +
          'Thank you and have a nice day.' + '<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team';
      }
      if (process_name == 'MOL - Pre Approval') {
        emailBody.subjectMsg = 'Pre-Approval Received'
        emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
          'We are pleased to inform you that your application has been pre-approved by the Ministry of labour.<br><br>' +
          'You will be notified with next steps shortly.<br><br>' +
          'Thank you and have a nice day.' + '<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team';
      }
      if (process_name == 'MOL Approval') {
        emailBody.subjectMsg = 'Labour Approval Received'
        emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
          'We are glad to inform that your Ministry of Labour approval has been received.<br><br>' +
          'Your visa application is now being initiated in the Immigration system.<br><br>' +
          'Please expect your E-visa to be issued within 5 working days.<br><br>' +
          'Thank you and have a nice day.' + '<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team';
      }
      if (process_name == 'eVisa application' && users.onboarding.user_location == 'Inside UAE') {
        emailBody.subjectMsg = 'E-Visa Issued'
        emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
          'We are happy to inform that your electronic visa (E-visa) has been issued.<br><br>' +
          'You can view and download a copy of your E-visa from the online portal.<br><br>' +
          'We will shortly apply for your Change of Status. It takes 24- 48 working hours for Change of Status to be approved.<br><br>' +
          'Thank you and have a nice day.' + '<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team';
      }
      if (process_name == 'eVisa application' && users.onboarding.user_location == 'Outside UAE') {
        emailBody.subjectMsg = 'E-Visa Issued'
        emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
          'We are happy to inform that your electronic visa (E-visa) has been issued.<br><br>' +
          'You can view and download a copy of your E-visa from the online portal.<br><br>' +
          'Kindly print and carry the hard copy of your E-visa when travelling to the UAE.<br><br>' +
          'Upon arrival, you will be required to present this document at the immigration counter, please ensure to get an entry stamp on your Evisa.<br><br>' +
          'Once you have received your stamped eVisa, kindly log into the portal and click on ‘Stamped Evisa’ and upload a copy so we can proceed next steps.<br><br>' +
          'Thank you and have a nice day.' + '<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team';
      }
      if (process_name == 'Change of Status') {
        emailBody.subjectMsg = 'Status Change Completed'
        emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
          'We are pleased to inform you that your Change of Status is approved.<br><br>' +
          'You can view and download a copy of your Change of Status from the online portal.<br><br>' +
          'The next step is to complete your medical test. It takes 24- 48 working hours to prepare your medical test application.<br><br>' +
          'Thank you and have a nice day.' + '<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team';
      }
      if (process_name == 'Entry Stamp Accepted') {
        emailBody.subjectMsg = 'Entry Stamp Accepted'
        emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
          'We are pleased to inform you that your entry stamped visa page has been accepted.<br><br>' +
          'The next step is to complete your medical test. It will take 24- 48 working hours to prepare your medical test application.<br><br>' +
          'Thank you and have a nice day.' + '<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team';
      }
      if (process_name == 'Medical Test App.') {
        let medicalCenter = {
          name: '',
          address: '',
          timings: '',
          location: ''
        }
        let medicalCenters = configuration.medical_centers.filter(a => a.name == users.onboarding.medical_center)
        if (medicalCenters.length > 0) medicalCenter = medicalCenters[0]
        emailBody.subjectMsg = 'Medical Test Appointment'
        emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
          'We are pleased to inform that your medical test application is ready to be taken at ' + users.onboarding.medical_center + '.<br><br>' +
          'You will be required to carry your original passport and print the below documents before visiting the medical center.<br><br>' +
          'These documents are available on your online portal for printing.<br>' +
          '1. E-Visa<br>' +
          '2. Change of status<br>' +
          '3. Medical test application reference number<br><br>' +
          'Location Details:<br>' +
          'Medical Center Name: ' + users.onboarding.medical_center + '<br>' +
          'Address: ' + medicalCenter.address + '<br>' +
          'Timings: ' + medicalCenter.timings + '</br>' +
          'Location: <a href ="' + medicalCenter.location + '">Google Map Location</a><br><br>' +
          'Note: Prior appointment is not required, you may simply walk-in to the medical center. We do however recommend that you visit the medical center in the morning working hours to avoid long queues.<br><br>' +
          'Once you have taken the medical test, kindly log in to the portal and click on ‘Medical Test completed’ so we can proceed with next steps.<br><br>' +
          'Thank you and have a nice day.' + '<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team';
      }
      if (process_name == 'Medical Test Result') {
        emailBody.subjectMsg = 'Medical Test Result'
        emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
          'We are pleased to notify you that we have received your medical test results. You can view and download a copy of your medical test result from the online portal.<br><br>' +
          'We will now type your Emirates ID application within 24-48 hours and guide you on the next steps.<br><br>' +
          'Thank you and have a nice day.' + '<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team';
      }
      if (process_name == 'Tawjeeh Training') {
        let labourCardNumber = 'XXXXXXX'
        if (users.documents.labourcard.tawjeeh_labour_number) labourCardNumber = users.documents.labourcard.tawjeeh_labour_number
        emailBody.subjectMsg = 'Tawjeeh Training'
        emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
          'Please find your labour contract atatched for Tawjeeh training.<br><br>' +
          'You will be required to carry your original passport and print the below documents before visiting the training center. These documents are available on your online portal for printing.<br><br>' +
          '1. E-Visa<br>' +
          '2. Change of status<br>' +
          '3. Tawjeeh Contract<br>' +
          'Upon request you must inform the officer your labour card number which is <b>' + labourCardNumber + '</b><br><br>' +
          'Location Details:<br>' +
          'Address: D63, Al Barsha 2, Dubai<br>' +
          'Timings: 08:00 AM – 06:00 PM Saturday to Thursday || 08:30 AM To 12:00 PM and 03:30 PM To 8:00 PM Friday<br>' +
          'Location: <a href="https://goo.gl/maps/TqJKGD1UfziYQ7Lc7">Google Map Location</a><br><br>' +
          'The formalities that must be completed are mentioned below:<br>' +
          '1. Signing the labour contract in front of the authorities (contract attached)<br>' +
          '2. Attending a one hour government orientation<br><br>' +
          'Tawjeeh Training will cost you an approximate of AED 160-165. Kindly pay and share a copy of your receipt for reimbursement.<br><br>' +
          'Thank you and have a nice day.' + '<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team';
      }
      if (process_name == 'EID Biometrics Completed') {
        emailBody.subjectMsg = 'EID Biometrics Completed'
        emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
          'Thank you for completing your Emirates ID biometrics (fingerprint) process.' +
          `The next step is to stamp your passport with the employment visa. Kindly drop your passport at <b>Marina Plaza, Office 1006</b> between <b>9:00 AM - 6:00 PM, Monday to Friday.</b><br><br>` +
  
          'Thank you and have a nice day.' + '<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team';
      }
      if (process_name == 'Emirates ID Reg.') {
        if (computeUserDetails.biometric == 'EID Fingerprint Required') {
          let loc_text = ''
          let eidCenter = {
            name: '',
            address: '',
            timings: '',
            location: ''
          }
          let eidCenters = configuration.eid_centers.filter(a => a.name == users.onboarding.eid_center)
          if (eidCenters.length > 0) eidCenter = eidCenters[0]
  
          loc_text = '<b>Location Details:</b><br>' +
            'EID Center Name: ' + eidCenter.name + '<br>' +
            'Address: ' + eidCenter.address + '<br>' +
            `Location: <a href=${eidCenter.location}>Google Map Location</a><br><br>`
          emailBody.subjectMsg = 'Emirates ID Application Uploaded'
          emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
            'We are pleased to inform  that your Emirates ID application is ready. <b>Kindly check your application form for the appointment date and time </b> and visit the ' + eidCenter.name + ' to complete your finger printing process.<br>' +
            'You will be required to carry your original passport and print the below documents before visiting the emirates ID center. These documents are available on your online portal for printing.<br><br>' +
            '1.	E-Visa' + '<br>' +
            '2.	Change of status' + '<br>' +
            '3.	Emirates ID application' + '<br>' +
            '3.	Medical Test Result' + '<br><br>' +
            loc_text +
            `<b>Important Note: As per the new regulation issued by the Emirates ID Authority centers, individuals who have not been fully vaccinated in the UAE must present a negative PCR test received within 48 hours and and should be shown through AlHosn application. </b><br><br>You can click <a href='https://alhosnapp.ae/en/home/'>here</a> to download the AlHosn application. Please register using your E-visa UID number or Emirates ID card number.<br><br>` +
            'Once you have completed your finger printing process, kindly log in to the portal and click on <b>‘EID Biometrics Completed’</b> and upload a copy of your stamped Emirates ID application so we can proceed with next steps.<br>' +
            'Thank you and have a nice day.' + '<br><br>' +
            'Regards,<br>' +
            'Nathan & Nathan HR Team';
        }
        // if (computeUserDetails.biometric == 'EID Fingerprint Required') {
        //   let eidCenter = {
        //     name: '',
        //     address: '',
        //     timings: '',
        //     location: ''
        //   }
        //   let eidCenters = configuration.eid_centers.filter(a => a.name == users.onboarding.eid_center)
        //   if (eidCenters.length > 0) eidCenter = eidCenters[0]
        //   emailBody.subjectMsg = 'Emirates ID Application Uploaded'
        //   emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
        //     'Please see below details and proceed with your Emirates ID fingerprint registration.<br><br>' +
        //     '<font color="red" >Important Note</font>: As per the new regulation released out by the Emirates ID Authority centers recently, individuals can visit the center provided any one of the below requirements are met:<br><br>' +
        //     '<ul>' +
        //     '<li>Those who have received both doses of a Covid-19 vaccine, vaccines received out of UAE are not eligible.</li>' +
        //     '<li>Those who present a negative PCR test received within 48 hours and should be shown through AlHosn application.</li>' +
        //     '<li>Those who are below 16 years old.</li>' +
        //     '<li>Those who are exempted from the Covid-19 vaccine should present a negative PCR test received within 48 hours and should be shown through AlHosn App.</li>' +
        //     '</ul><br><br>' +
        //     'You can <a href="https://alhosnapp.ae/en/home/">click here</a> to download the AlHosn application. Please register using your E-visa, UID number or Emirates ID card number (if available)<br><br>' +
        //     'Kindly visit any (Location center to chosen) Emirates ID Authority Center to do the fingerprint registration<br><br>' +
        //     '<b>' + eidCenter.name + ' <a href="' + eidCenter.location + '">LOCATION</a></b><br><br>' +
        //     'Don’t forget to print the below documents from the online portal and observe proper dress code when you visit the center:<br><br>' +
        //     '<ul>' +
        //     '<li><b>Emirates ID application</b></li>' +
        //     '<li><b>Medical Certificate</b></li>' +
        //     '<li><b>E-visa</b></li>' +
        //     '<li><b>Original passport</b></li>' +
        //     '</ul><br><br>' +
        //     'Once you have completed the registration, please submit your original passport and the stamped Emirates ID application at <b>Marina Plaza, Office 1006</b> between <b>9:00 AM - 6:00 PM, Monday to Friday.</b><br><br>' +
        //     'Thank you and have a nice day.' + '<br><br>' +
        //     'Regards,<br>' +
        //     'Nathan & Nathan HR Team';
        // }
        else {
          emailBody.subjectMsg = 'Emirates ID Application Uploaded'
          emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
            'We would like to notify that your Emirates ID application is ready.<br><br>' +
            'This is for your information only and no action is required from your side.<br><br>' +
            'The next step is to stamp your passport with the residency visa. Kindly drop your passport at <b>Marina Plaza, Office 1006</b> between <b>9:00 AM - 6:00 PM, Monday to Friday.</b><br><br>' +
            'Thank you and have a nice day.' + '<br><br>' +
            'Regards,<br>' +
            'Nathan & Nathan HR Team';
        }
      }
      if (process_name == 'Biometrics') {
        emailBody.emailBody = 'Dear ' + users.first_name + ' ' + users.last_name + ',<br><br>' +
          'This is to inform you that we have typed your Emirates ID. If you previously have an Emirates ID you are not required to do the below, but if this is your first time please kindly follow the below steps.<br><br>' +
          'For the next step, you will need to get your biometrics scanned for your Emirates ID process. Please bring a copy of below documents mentioned below for your EID application process:<br><br>' +
          '<b><ol><li>Copy of your EID application (attached in PEO-Central portal)</li><li>Passport (you have this)</li></ol></b>' +
          'You can visit any of the Emirates ID Authority Centers located in:<br><br>' +
          '<b>Dubai Locations</b><br><br>' +
          '<b><ol><li>Al Yalayis Medical Fitness Center - Dubai Investment Park – 8 AM to 5 PM (Sun – Thu).</li><li>Al Nahda Medical Centre - Qusais - 10th St - Al Qusais – Dubai – 7 AM to 5 PM (Sun – Thu).</li></ol></b>' +
          '<b>Abu Dhabi Locations</b><br><br>' +
          '<b><ol><li>Emirates Identity Authority Mussafa - Besides Tas-heel building next to yellow duck supermarket 17 Sector 4 - Abu Dhabi</li><li>ICA Khalifa City A Happiness Center - 12th Street, Khalifa city - Abu Dhabi</li></ol></b>' +
          'Most EID cetres in Abu Dhabi are opened from 7 AM – 2 PM (Sun – Thu).<br><br>' +
          'Once you complete the biometrics, please upload the scanned copy of the stamped EID application<br><br>' +
          'If you need any help, please write to us at ryan@nathanhr.com or joanna@nathanhr.com. Hope you have a wonderful day.' + '<br><br>' +
          'Thanks & Regards, <br>' +
          'Nathan & Nathan HR Team';
      }
      if (process_name == 'Health Insurance') {
        emailBody.subjectMsg = 'Health Insurance Enrolled'
        emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
          'We are happy to inform you that we have enrolled you in your chosen health insurance plan.<br><br>' +
          'It takes 5-7 working days to complete health insurance enrollment.<br><br>' +
          'We will upload your electronic health insurance card to the portal once ready.<br><br>' +
          'Thank you and have a nice day.' + '<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team';
      }
      if (process_name == 'Passport Collections') {
        emailBody.subjectMsg = 'Passport Collected'
        emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
          'Thank you for visiting our offices and dropping your passport.It takes 5 working days to complete your passport stamping process.<br><br>' +
          'We will keep you updated.<br><br>' +
          'Note: VIP passport stamping is completed within 48 working hours.<br><br>' +
          'Thank you and have a nice day.' + '<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team';
      }
      if (process_name == 'Visa Stamping') {
        emailBody.subjectMsg = 'Passport Stamping Completed'
        emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
          'We are pleased to notify that your passport is stamped with your residencey visa.<br><br>' +
          'You can view/download a copy of your stamped passport through the portal.<br><br>' +
          'Kindly visit us at <b>Marina Plaza Office 1006</b> between <b>9:00 AM - 6:00 PM, Monday to Friday,</b> to collect your passport.<br><br>' +
          'Thank you and have a nice day.' + '<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team';
      }
      if (process_name == 'Passport stamped collection') {
        emailBody.subjectMsg = 'Passport Handover'
        emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
          'Thank you for collecting your stamped passport from our offices.<br><br>' +
          'You will shortly receive an SMS notification from Emirates ID Authority once your Emirates ID card is ready.<br><br>' +
          'You may receive one of the following options:<br>' +
          '1. Emirates ID card delivery: An SMS with a link to manage your Emirates ID card delivery will be sent to you. Kindly follow instructions in the SMS to arrange delivery of your card<br><br>' +
          '2. Emirates ID card collection - An SMS with instructions to collect your Emirates ID from the post office will be sent to you. Kindly inform us about this so we can help collect your Emirates ID from the post office.<br><br>' +
          'Once you have received your Emirates ID card, kindly log in to the portal and click on ‘Emirates ID Card’ and upload a copy of your Emirates ID.<br><br>' +
          'Thank you and have a nice day.' + '<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team';
      }
      if (process_name == 'Emirates ID Card Issuance') {
        emailBody.emailBody = 'Dear ' + users.first_name + ' ' + users.last_name + ',<br><br>' +
          'We are pleased to notify that your passport is stamped with your residencey visa.<br><br>' +
          'You can view/download a copy of your stamped passport through the porta<br><br>' +
          'Kindly visit <b>Marina Plaza Office 1006</b> between 9:00 AM - 6:00 PM, Monday to Friday, to collect your passport.<br><br>' +
          'Thanks & Regards, <br>' +
          'Nathan & Nathan HR Team';
      }
      if (process_name == 'Medical Card Issuance') {
        emailBody.subjectMsg = 'Insurance E-card Issued'
        emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
          'Your medical Heath Insurance E-card copy is now available to be viewed/downloaded from the online portal.<br><br>' +
          'Thank you and have a nice day.' + '<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team';
      }
      if (process_name == 'Labour Card & Contract') {
        emailBody.subjectMsg = 'Labour Card and Contract Issued'
        emailBody.emailBody = 'Dear ' + users.first_name + ',<br><br>' +
          'Your approved labour card and contract is now available to be viewed/downloaded from the online portal.<br><br>' +
          'Thank you and have a nice day.' + '<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team';
      }
      if (process_name == 'Completed') {
        emailBody.subjectMsg = 'Sgined MOL OL Received'
        emailBody.emailBody = 'Dear ' + users.first_name + ' ' + users.last_name + ',<br><br>' +
          'We are glad to inform you that your Emirates ID is now ready for collection. Kindly let us know if you are location in Dubai or Abu Dhabi, so we can arrange accordingly.<br>' +
          'Hope you had a smooth Onboarding experience through the portal.<br><br>' +
          'If you need any help, please write to us at ryan@nathanhr.com or joanna@nathanhr.com. Hope you have a wonderful day.' + '<br><br>' +
          'Thanks & Regards, <br>' +
          'Nathan & Nathan HR Team';
      }
      if (process_name == 'Initiate') return emailBody
      else {
        let htmlstring = `<center class="wrapper" data-link-color="#1188E6"
        data-body-style="font-size:14px; font-family:arial,helvetica,sans-serif; color:#000000; background-color:#f1f1f1;">
        <div class="webkit">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#f1f1f1">
            <tbody>
              <tr>
                <td valign="top" bgcolor="#f1f1f1" width="100%">
                  <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0"
                    border="0">
                    <tbody>
                      <tr>
                        <td width="100%">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tbody>
                              <tr>
                                <td>
                                  <!--[if mso]>
      <center>
      <table><tr><td width="650">
      <![endif]-->
                                  <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="width:100%; max-width:650px;" align="center">
                                    <tbody>
                                      <tr>
                                        <td role="modules-container"
                                          style="padding:6px 24px 6px 24px; color:#000000; text-align:left;" bgcolor="#FFFFFF"
                                          width="100%" align="left">
                                          <table class="module preheader preheader-hide" role="module" data-type="preheader"
                                            border="0" cellpadding="0" cellspacing="0" width="100%"
                                            style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
                                            <tbody>
                                              <tr>
                                                <td role="module-content">
                                                  <p></p>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                          <table class="wrapper" role="module" data-type="image" border="0" cellpadding="0"
                                            cellspacing="0" width="100%" style="table-layout: fixed;"
                                            data-muid="f6d20c8f-722f-4327-815c-45ee262d4d3d">
                                            <tbody>
                                              <tr>
                                                <td style="font-size:6px; line-height:10px; padding:12px 0px 12px 0px;"
                                                  valign="top" align="center">
                                                  <img class="max-width" border="0"
                                                    style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:100% !important; width:100%; height:auto !important;"
                                                    width="602" alt="" data-proportionally-constrained="true"
                                                    data-responsive="true"
                                                    src="http://cdn.mcauto-images-production.sendgrid.net/4bc998d78c1a22f8/3e5ae066-2902-4c7b-a6c7-46dfbdc1a8ff/1355x470.jpg">
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                          <table class="module" role="module" data-type="divider" border="0" cellpadding="0"
                                            cellspacing="0" width="100%" style="table-layout: fixed;"
                                            data-muid="775d4774-e488-4f1c-9480-8067e23b3663">
                                            <tbody>
                                              <tr>
                                                <td style="padding:12px 0px 12px 0px;" role="module-content" height="100%"
                                                  valign="top" bgcolor="">
                                                  <table border="0" cellpadding="0" cellspacing="0" align="center"
                                                    width="100%" height="1px" style="line-height:1px; font-size:1px;">
                                                    <tbody>
                                                      <tr>
                                                        <td style="padding:0px 0px 1px 0px;" bgcolor="#000000"></td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                          <div style="font-family: inherit; text-align: start"><span
                                              style="caret-color: rgb(50, 49, 48); font-style: inherit; font-variant-caps: inherit; font-weight: inherit; letter-spacing: normal; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-top-style: initial; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-image-source: initial; border-image-slice: initial; border-image-width: initial; border-image-outset: initial; border-image-repeat: initial; font-stretch: inherit; line-height: inherit; vertical-align: baseline; font-size: 14px; font-family: verdana, geneva, sans-serif">
      
      
                                            ${emailBody.emailBody}
      
      
      
      
                                            </span>
                                            <table class="module" role="module" data-type="divider" border="0" cellpadding="0"
                                              cellspacing="0" width="100%" style="table-layout: fixed;"
                                              data-muid="ffdab61c-2899-4035-ade5-a113714280db.1.1.1">
                                              <tbody>
                                                <tr>
                                                  <td style="padding:12px 0px 12px 0px;" role="module-content" height="100%"
                                                    valign="top" bgcolor="">
                                                    <table border="0" cellpadding="0" cellspacing="0" align="center"
                                                      width="100%" height="1px" style="line-height:1px; font-size:1px;">
                                                      <tbody>
                                                        <tr>
                                                          <td style="padding:0px 0px 1px 0px;" bgcolor="#000000"></td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                            <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%"
                                              role="module" data-type="columns" style="padding:12px 0px 0px 0px;"
                                              bgcolor="#FFFFFF" data-distribution="1,1">
                                              <tbody>
                                                <tr role="module-content">
                                                  <td height="100%" valign="top">
                                                    <table width="291"
                                                      style="width:291px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 0px;"
                                                      cellpadding="0" cellspacing="0" align="left" border="0" bgcolor=""
                                                      class="column column-0">
                                                      <tbody>
                                                        <tr>
                                                          <td style="padding:0px;margin:0px;border-spacing:0;">
                                                            <table class="wrapper" role="module" data-type="image" border="0"
                                                              cellpadding="0" cellspacing="0" width="100%"
                                                              style="table-layout: fixed;"
                                                              data-muid="fc6a9a52-53bf-432c-b6da-cdc476a29609">
                                                              <tbody>
                                                                <tr>
                                                                  <td
                                                                    style="font-size:6px; line-height:10px; padding:12px 0px 12px 0px;"
                                                                    valign="top" align="left">
      
                                                                    <a href="www.nathanhr.com"><img class="max-width"
                                                                        border="0"
                                                                        style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:70% !important; width:70%; height:auto !important;"
                                                                        width="204" alt=""
                                                                        data-proportionally-constrained="true"
                                                                        data-responsive="true"
                                                                        src="http://cdn.mcauto-images-production.sendgrid.net/4bc998d78c1a22f8/b23887d2-0662-4d3c-9ec7-226da927182d/4575x480.jpg"></a>
                                                                  </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                    <table width="291"
                                                      style="width:291px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 10px;"
                                                      cellpadding="0" cellspacing="0" align="left" border="0" bgcolor=""
                                                      class="column column-1">
                                                      <tbody>
                                                        <tr>
                                                          <td style="padding:0px;margin:0px;border-spacing:0;">
                                                            <table class="module" role="module" data-type="social"
                                                              align="center" border="0" cellpadding="0" cellspacing="0"
                                                              width="100%" style="table-layout: fixed;"
                                                              data-muid="905b8a23-3215-4f75-829c-bc036a80d1f6">
                                                              <tbody>
                                                                <tr>
                                                                  <td valign="top"
                                                                    style="padding:12px 0px 24px 0px; font-size:6px; line-height:10px;"
                                                                    align="right">
                                                                    <table align="right"
                                                                      style="-webkit-margin-start:auto;-webkit-margin-end:auto;">
                                                                      <tbody>
                                                                        <tr align="right">
                                                                          <td style="padding: 0px 5px;"
                                                                            class="social-icon-column">
                                                                            <a role="social-icon-link"
                                                                              href="https://www.instagram.com/nathanhr/"
                                                                              target="_blank" alt="Instagram"
                                                                              title="Instagram"
                                                                              style="display:inline-block; background-color:#000000; height:25px; width:25px; border-radius:12px; -webkit-border-radius:12px; -moz-border-radius:12px;">
                                                                              <img role="social-icon" alt="Instagram"
                                                                                title="Instagram"
                                                                                src="https://mc.sendgrid.com/assets/social/white/instagram.png"
                                                                                style="height:25px; width:25px;" height="25"
                                                                                width="25">
                                                                            </a>
                                                                          </td>
                                                                          <td style="padding: 0px 5px;"
                                                                            class="social-icon-column">
                                                                            <a role="social-icon-link"
                                                                              href="https://www.linkedin.com/company/nathan-&amp;-nathan/"
                                                                              target="_blank" alt="LinkedIn" title="LinkedIn"
                                                                              style="display:inline-block; background-color:#000000; height:25px; width:25px; border-radius:12px; -webkit-border-radius:12px; -moz-border-radius:12px;">
                                                                              <img role="social-icon" alt="LinkedIn"
                                                                                title="LinkedIn"
                                                                                src="https://mc.sendgrid.com/assets/social/white/linkedin.png"
                                                                                style="height:25px; width:25px;" height="25"
                                                                                width="25">
                                                                            </a>
                                                                          </td>
                                                                        </tr>
                                                                      </tbody>
                                                                    </table>
                                                                  </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <!--[if mso]>
                                  </td>
                                </tr>
                              </table>
                            </center>
                            <![endif]-->
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </center>`
        emailBody.emailBody = htmlstring
        return emailBody
      }
  
    },
    getEmailTemplateForAdmins: function (users, process_name) {
      let emailBody = {}
      let user_name = users.first_name + ' ' + users.last_name
      if (users.middle_name) user_name = users.first_name + ' ' + users.middle_name + ' ' + users.last_name
      if (process_name == 'User Acceptance of Job Offer') {
        emailBody.subjectMsg = 'Signed MOL OL Received - ' + user_name
        emailBody.emailBody = 'Dear HR Team,<br><br>' +
          user_name + ' has uploaded a copy of the signed MOL OL.Please log in to the online portal and take the process further.<br><br>' +
          'Thank you and have a nice day.<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team' + ' Onboarding Portal'
      }
      if (process_name == 'Stamped eVisa') {
        emailBody.subjectMsg = 'Entry Stamp Received - ' + user_name
        emailBody.emailBody = 'Dear HR Team,<br><br>' +
          user_name + ' has uploaded a copy of the entry stamped visa page.Please log in to the online portal and take the process further.<br><br>' +
          'Thank you and have a nice day.<br><br>' +
          'Regards,<br>' +
          'Nathan & Nathan HR Team' + ' Onboarding Portal'
      }
      if (process_name == 'initiated') {
        emailBody = 'Hi,<br><br>' +
          'A PRO request has been raised on the PEO-Central Onboarding portal.<br><br>' +
          'Please find below relevant information: <br>' +
          'Employee Name: ' + users.first_name + ' ' + users.last_name + '<br>' +
          'Inside/Outside Status: ' + users.onboarding.user_location + '<br>' +
          'Date Requested: ' + new Date() + '<br>' +
          'Process Type: ' + users.process_type + '<br><br>' +
          'You can access the application by clicking on the following link ' + 'https://adq.nathanhr.ae/ ' + '<br><br>' +
          'Regards,' + '<br>' +
          'Nathan & Nathan HR Team'
      }
      if (process_name == 'Completed') {
        emailBody = 'Hi,<br><br>' +
          'PRO request has been successfully completed on the PEO-Central Onboarding portal.<br><br>' +
          'Please find below relevant information: <br>' +
          'Employee Name: ' + users.first_name + ' ' + users.last_name + '<br>' +
          'Inside/Outside Status: ' + users.onboarding.user_location + '<br>' +
          'Date Requested: ' + new Date() + '<br>' +
          'Process Type: ' + users.process_type + '<br><br>' +
          'You can access the application by clicking on the following link ' + 'https://adq.nathanhr.ae/ ' + '<br><br>' +
          'Regards,' + '<br>' +
          'Nathan & Nathan HR Team'
      }
      return emailBody
    },
    // getEmailTemplateForAdmins: function (users, process_name) {
    // },
    getBulkPayslipEmailTemplate: function (login_url, payslip_month, username) {
      let emailBody = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
          <html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">
              <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
                <!--[if !mso]><!-->
                <meta http-equiv="X-UA-Compatible" content="IE=Edge">
                <!--<![endif]-->
                <!--[if (gte mso 9)|(IE)]>
                <xml>
                  <o:OfficeDocumentSettings>
                    <o:AllowPNG/>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                  </o:OfficeDocumentSettings>
                </xml>
                <![endif]-->
                <!--[if (gte mso 9)|(IE)]>
            <style type="text/css">
              body {width: 600px;margin: 0 auto;}
              table {border-collapse: collapse;}
              table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}
              img {-ms-interpolation-mode: bicubic;}
            </style>
          <![endif]-->
                <style type="text/css">
              body, p, div {
                font-family: inherit;
                font-size: 14px;
              }
              body {
                color: #000000;
              }
              body a {
                color: #000000;
                text-decoration: none;
              }
              p { margin: 0; padding: 0; }
              table.wrapper {
                width:100% !important;
                table-layout: fixed;
                -webkit-font-smoothing: antialiased;
                -webkit-text-size-adjust: 100%;
                -moz-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
              }
              img.max-width {
                max-width: 100% !important;
              }
              .column.of-2 {
                width: 50%;
              }
              .column.of-3 {
                width: 33.333%;
              }
              .column.of-4 {
                width: 25%;
              }
              ul ul ul ul  {
                list-style-type: disc !important;
              }
              ol ol {
                list-style-type: lower-roman !important;
              }
              ol ol ol {
                list-style-type: lower-latin !important;
              }
              ol ol ol ol {
                list-style-type: decimal !important;
              }
              @media screen and (max-width:480px) {
                .preheader .rightColumnContent,
                .footer .rightColumnContent {
                  text-align: left !important;
                }
                .preheader .rightColumnContent div,
                .preheader .rightColumnContent span,
                .footer .rightColumnContent div,
                .footer .rightColumnContent span {
                  text-align: left !important;
                }
                .preheader .rightColumnContent,
                .preheader .leftColumnContent {
                  font-size: 80% !important;
                  padding: 5px 0;
                }
                table.wrapper-mobile {
                  width: 100% !important;
                  table-layout: fixed;
                }
                img.max-width {
                  height: auto !important;
                  max-width: 100% !important;
                }
                a.bulletproof-button {
                  display: block !important;
                  width: auto !important;
                  font-size: 80%;
                  padding-left: 0 !important;
                  padding-right: 0 !important;
                }
                .columns {
                  width: 100% !important;
                }
                .column {
                  display: block !important;
                  width: 100% !important;
                  padding-left: 0 !important;
                  padding-right: 0 !important;
                  margin-left: 0 !important;
                  margin-right: 0 !important;
                }
                .social-icon-column {
                  display: inline-block !important;
                }
              }
            </style>
                <!--user entered Head Start--><link href="https://fonts.googleapis.com/css?family=Viga&display=swap" rel="stylesheet"><style>
              body {font-family: 'Viga', sans-serif;}
          </style><!--End Head user entered-->
              </head>
              <body>
                <center class="wrapper" data-link-color="#000000" data-body-style="font-size:14px; font-family:inherit; color:#000000; background-color:#FFFFFF;">
                  <div class="webkit">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#FFFFFF">
                      <tr>
                        <td valign="top" bgcolor="#FFFFFF" width="100%">
                          <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="100%">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td>
                                      <!--[if mso]>
              <center>
              <table><tr><td width="600">
            <![endif]-->
                                              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;" align="center">
                                                <tr>
                                                  <td role="modules-container" style="padding:0px 0px 0px 0px; color:#000000; text-align:left;" bgcolor="#FFFFFF" width="100%" align="left"><table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%" style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
              <tr>
                <td role="module-content">
                  <p></p>
                </td>
              </tr>
            </table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:0px 0px 0px 0px;" bgcolor="#dde6de" data-distribution="1">
              <tbody>
                <tr role="module-content">
                  <td height="100%" valign="top"><table width="580" style="width:580px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
                <tbody>
                  <tr>
                    <td style="padding:0px;margin:0px;border-spacing:0;"><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="10cc50ce-3fd3-4f37-899b-a52a7ad0ccce">
              <tbody>
                <tr>
                  <td style="padding:0px 0px 40px 0px;" role="module-content" bgcolor="">
                  </td>
                </tr>
              </tbody>
            </table><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="f8665f9c-039e-4b86-a34d-9f6d5d439327">
              <tbody>
                <tr>
                  <td style="font-size:6px; line-height:10px; padding:0px 0px 0px 0px;" valign="top" align="center">
                    <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px;" width="130" alt="" data-proportionally-constrained="true" data-responsive="false" src="https://omnipresent-nathanhr.s3.amazonaws.com/aljajal-header.png" height="33">
                  </td>
                </tr>
              </tbody>
            </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="10cc50ce-3fd3-4f37-899b-a52a7ad0ccce.1">
              <tbody>
                <tr>
                  <td style="padding:0px 0px 30px 0px;" role="module-content" bgcolor="">
                  </td>
                </tr>
              </tbody>
            </table></td>
                  </tr>
                </tbody>
              </table></td>
                </tr>
              </tbody>
            </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="bff8ffa1-41a9-4aab-a2ea-52ac3767c6f4" data-mc-module-version="2019-10-22">
              <tbody>
                <tr>
                  <td style="padding:18px 30px 18px 30px; line-height:40px; text-align:inherit; background-color:#dde6de;" height="100%" valign="top" bgcolor="#dde6de" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="color: #6fab81; font-size: 40px; font-family: inherit">Hey ${username},</span></div><div></div></div></td>
                </tr>
                <tr>
                  <td style="padding:18px 30px 18px 30px; line-height:40px; text-align:inherit; background-color:#dde6de;" height="100%" valign="top" bgcolor="#dde6de" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="color: #6fab81; font-size: 40px; font-family: inherit">Your Payslip for ${payslip_month} is ready for Download!</span></div><div></div></div></td>
                </tr>
              </tbody>
            </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="2f94ef24-a0d9-4e6f-be94-d2d1257946b0" data-mc-module-version="2019-10-22">
              <tbody>
                <tr>
                  <td style="padding:18px 50px 18px 50px; line-height:22px; text-align:inherit; background-color:#dde6de;" height="100%" valign="top" bgcolor="#dde6de" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="font-size: 16px; font-family: inherit">Please login to the portal using the below link.</span></div><div></div></div></td>
                </tr>
              </tbody>
            </table><table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="c7bd4768-c1ab-4c64-ba24-75a9fd6daed8">
                <tbody>
                  <tr>
                    <td align="center" bgcolor="#dde6de" class="outer-td" style="padding:10px 0px 20px 0px; background-color:#dde6de;">
                      <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
                        <tbody>
                          <tr>
                          <td align="center" bgcolor="#eac96c" class="inner-td" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;">
                            <a href="${login_url}" style="background-color:#eac96c; border:0px solid #333333; border-color:#333333; border-radius:0px; border-width:0px; color:#000000; display:inline-block; font-size:16px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:20px 30px 20px 30px; text-align:center; text-decoration:none; border-style:solid; font-family:inherit;" target="_blank">View Payslip</a>
                          </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="2f94ef24-a0d9-4e6f-be94-d2d1257946b0" data-mc-module-version="2019-10-22">
              <tbody>
                <tr>
                  <td style="padding:18px 50px 18px 50px; line-height:22px; text-align:inherit; background-color:#dde6de;" height="100%" valign="top" bgcolor="#dde6de" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="font-size: 16px; font-family: inherit">What else can you do on the portal?</span></div><div></div></div></td>
                </tr>
              </tbody>
            </table>
              <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:10px 30px 30px 30px;" bgcolor="#dde6de" data-distribution="1,1,1">
              <tbody>
                <tr role="module-content">
                  <td height="100%" valign="top"><table width="166" style="width:166px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
                <tbody>
                  <tr>
                    <td style="padding:0px;margin:0px;border-spacing:0;"><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="35f4b6e7-fc49-4a6f-a23c-e84ad33abca4">
              <tbody>
                <tr>
                  <td style="font-size:6px; line-height:10px; padding:0px 0px 0px 0px;" valign="top" align="center">
                    <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px;" width="80" alt="" data-proportionally-constrained="true" data-responsive="false" src="http://cdn.mcauto-images-production.sendgrid.net/954c252fedab403f/0394b217-16c4-49ae-b696-561adcd513aa/119x119.png" height="80">
                  </td>
                </tr>
              </tbody>
            </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="4f3e6dad-4d49-49b4-b842-97c93e43616f" data-mc-module-version="2019-10-22">
              <tbody>
                <tr>
                  <td style="padding:18px 0px 18px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: inherit"><span style="font-size: 14px">Keep track of your salaries.</span></div>
          <div style="font-family: inherit; text-align: inherit"><br></div>
          <div></div></div></td>
                </tr>
              </tbody>
            </table></td>
                  </tr>
                </tbody>
              </table><table width="166" style="width:166px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-1">
                <tbody>
                  <tr>
                    <td style="padding:0px;margin:0px;border-spacing:0;"><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="0cb2f52e-e1c0-4b42-a114-04aa36fe57f5">
              <tbody>
                <tr>
                  <td style="font-size:6px; line-height:10px; padding:0px 0px 0px 0px;" valign="top" align="center">
                    <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px;" width="80" alt="" data-proportionally-constrained="true" data-responsive="false" src="http://cdn.mcauto-images-production.sendgrid.net/954c252fedab403f/461a0641-b2b7-459c-ab49-ea560fc221f7/119x119.png" height="80">
                  </td>
                </tr>
              </tbody>
            </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="9bf90608-97e0-467e-a709-f45d87b0451b" data-mc-module-version="2019-10-22">
              <tbody>
                <tr>
                  <td style="padding:18px 0px 18px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: inherit"><span style="font-size: 14px">Recieve text or email alerts.</span></div>
          <div style="font-family: inherit; text-align: inherit"><br></div>
          <div></div></div></td>
                </tr>
              </tbody>
            </table></td>
                  </tr>
                </tbody>
              </table><table width="166" style="width:166px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-2">
                <tbody>
                  <tr>
                    <td style="padding:0px;margin:0px;border-spacing:0;"><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="231c1abd-75e6-4f22-a697-c5f3819b2b07">
              <tbody>
                <tr>
                  <td style="font-size:6px; line-height:10px; padding:0px 0px 0px 0px;" valign="top" align="center">
                    <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px;" width="80" alt="" data-proportionally-constrained="true" data-responsive="false" src="http://cdn.mcauto-images-production.sendgrid.net/954c252fedab403f/61f17ba7-b7af-4276-8e61-2501e525e4c3/119x119.png" height="80">
                  </td>
                </tr>
              </tbody>
            </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="e82d5e62-b94c-42bb-a289-4515ec9ecc85" data-mc-module-version="2019-10-22">
              <tbody>
                <tr>
                  <td style="padding:18px 0px 18px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: inherit"><span style="font-size: 14px">Raise Support tickets if you need help with your payslips.</span></div>
          <div style="font-family: inherit; text-align: inherit"><br></div>
          <div></div></div></td>
                </tr>
              </tbody>
            </table></td>
                  </tr>
                </tbody>
              </table></td>
                </tr>
              </tbody>
            </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="30d9a68c-ce13-4754-a845-6c3dc22721ee" data-mc-module-version="2019-10-22">
              <tbody>
                <tr>
                  <td style="padding:40px 40px 40px 40px; line-height:22px; text-align:inherit; background-color:#fe737c;" height="100%" valign="top" bgcolor="#fe737c" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="color: #ffffff; font-size: 16px">Need more help figuring things out?<br> Go to the support section on the portal and raise a Support request for Payroll.</span></div>
          <div style="font-family: inherit; text-align: center"><br></div>
          <div></div></div></td>
                </tr>
              </tbody>
            </table>
                </center>
              </body>
            </html>`
      return emailBody
    }
  }