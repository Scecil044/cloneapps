export default {
  getNotificationTemplateForUser: async function (users, configuration, companies,step_id) {
    return new Promise(resolve => {
      const token =  app.__vue__.$root.$store.getters.getToken
      const AuthStr = 'Bearer '.concat(token)
      app.__vue__.$root.$axios.$get('/notificationtemplates/getcontent/'+step_id, {headers: { Authorization: AuthStr }})
        .then(res => {
          if(res.length > 0){
            let return_obj = {
              'email' : {'subject':'Not Configured','content':'Not Configured'}, 'sms' : {'content':"Not Configured"}
            }
            let email = res.filter(item => item.notification_type == 'email')[0]
            let sms = res.filter(data => data.notification_type == 'sms')[0]
            if(email) {
              return_obj.email = email
              return_obj.email.content = this.replaceContent(users, configuration, companies, return_obj.email.content)
              return_obj.email.content = this.appendHeader(return_obj.email.content)
            }
            if(sms) {
              return_obj.sms.content = this.replaceContent(users, configuration, companies,sms.content)
            }
            resolve( return_obj)
          }
          resolve( {'email' : {'subject':'Not Configured','content':'Not Configured'}, 'sms' : {'content':"Not Configured"}})
        })
        .catch( err => {
          resolve( {'email' : {'subject':'Unable to Fetch Data','content':'Unable to Fetch Data'}, 'sms' : {'content':"Unable to Fetch Data"}})
          console.log(err)
        })
      })
    },
    getUserFullName: function(obj_userInfo){ 
        if(obj_userInfo) {
            var name = "";
            if (obj_userInfo.first_name != undefined) {
                name += obj_userInfo.first_name + ' ';
            }
            if (obj_userInfo.middle_name != undefined) {
                name += obj_userInfo.middle_name + ' ';
            }
            if (obj_userInfo.last_name != undefined) {
                name += obj_userInfo.last_name;
            }
            return name;
        }
        else{
            return "";
        }
    },
    appendHeader: function(conent){
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
    
    
                                          ${conent}
    
    
    
    
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

    return htmlstring
    },
    replaceContent: function(users, configuration, companies,content){
      let company = companies.filter(company => company._id == users.company_ID)[0];
      let medicalCenter = {
          name: '',
          address: '',
          timings: '',
          location: ''
        }
      let eidCenter = {
        name: '',
        address: '',
        timings: '',
        location: ''
        }
      if( users.onboarding) {
        let medicalCenters = configuration.medical_centers.filter(a => a.name == users.onboarding.medical_center)
        if (medicalCenters.length > 0) medicalCenter = medicalCenters[0]
        let eidCenters = configuration.eid_centers.filter(a => a.name == users.onboarding.eid_center)
        if (eidCenters.length > 0) eidCenter = eidCenters[0]
      }

      content = content.replaceAll('[full_name]', this.getUserFullName(users));
      content = content.replaceAll('[first_name]', users.first_name);
      content = content.replaceAll('[last_name]', users.last_name);
      content = content.replaceAll('[company_name]', company.company_name);
      if(medicalCenter){
        content = content.replaceAll('[medical_center_name]', medicalCenter.name);
        content = content.replaceAll('[medical_center_address]', medicalCenter.address);
        content = content.replaceAll('[medical_center_timing]', medicalCenter.timings);
        content = content.replaceAll('[medical_center_location]', medicalCenter.location);
      }
      if(eidCenter){
        content = content.replaceAll('[eid_center_name]', eidCenter.name);
        content = content.replaceAll('[eid_center_address]', eidCenter.address);
        content = content.replaceAll('[eid_center_location]', eidCenter.location);
      }
      return content
    }
}