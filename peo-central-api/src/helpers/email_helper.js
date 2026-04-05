const AWS = require('aws-sdk');

const ses = new AWS.SES({
    // accessKeyId: process.env.SECRET_ID_AWS,
    // secretAccessKey: process.env.SECRET_KEY_AWS,
    region: "eu-central-1"
})

module.exports = {
    sendEmail: (email, subject, body, from = "donotreply@nathanhr.ae") => {
        let emailStatus = false;
        let emails = []

        if (typeof email == 'string') {
            emails.push(email)
        }
        else emails = email.filter(a => a != '')
        const params = {
            Source: from,
            Destination: {
                //ToAddresses: emails
                ToAddresses: emails
            },
            Message: {
                Body: {
                    Html: {
                        Data: body,
                        Charset: "UTF-8"
                    },
                    Text: {
                        Data: subject,
                        Charset: "UTF-8"
                    }
                },
                Subject: {
                    Data: subject,
                    Charset: "UTF-8"
                }
            },
        }

        ses.sendEmail(params, function (err, data) {
            if (err) {
                throw err
            } else {
                //let notification_obj = {
                // notification_type: 'email',
                //notification_details: { ...req.body }
                // }
                //const notificationlogs = NotificationLogsModel({ ...notification_obj })
                //notificationlogs.save()
                //res.json({ message: 'success' })
                emailStatus = true;
            }
        })
        return emailStatus;
    },
    getUserTitle: (obj_userInfo) => {
        var _a, _b, _c;
        if (
          ((_a = obj_userInfo === null || obj_userInfo === void 0 ? void 0 : obj_userInfo.personal) === null || _a === void 0
            ? void 0
            : _a.gender) == 'Male'
        ) {
          return 'Mr.';
        } else if (
          ((_b = obj_userInfo === null || obj_userInfo === void 0 ? void 0 : obj_userInfo.personal) === null || _b === void 0
            ? void 0
            : _b.gender) == 'Female'
        ) {
          if (
            ((_c = obj_userInfo === null || obj_userInfo === void 0 ? void 0 : obj_userInfo.personal) === null || _c === void 0
              ? void 0
              : _c.marital_status) == 'Married'
          ) {
            return 'Mrs.';
          } else {
            return 'Ms.';
          }
        } else {
          return 'Mr.';
        }
      },
      getUserName: (obj_userInfo) => {
        var name = '';
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
      },
      getApprovers: (arr_approvers, arr_users) => {
        var approvers_name = '';
        var _loop_1 = function (element) {
          if (Array.isArray(element.approver_id) && element.approver_id.length > 0) {
            var approverNames = element.approver_id.map(function (item) {
              var approver = arr_users.find(function (ele) {
                return ele._id == item;
              });
              return approver ? approver.first_name : '';
            });
            approvers_name +=
              approverNames
                .filter(function (name) {
                  return name !== '';
                })
                .join(', ') + ', ';
          } else if (typeof element.approver_id === 'string') {
            var approver = arr_users.find(function (ele) {
              return ele._id == element.approver_id;
            });
            approvers_name += approver ? approver.first_name + ', ' : '';
          }
        };
        for (var _i = 0, arr_approvers_1 = arr_approvers; _i < arr_approvers_1.length; _i++) {
          var element = arr_approvers_1[_i];
          _loop_1(element);
        }
        approvers_name = approvers_name.slice(0, -2);
        return approvers_name;
      },
    
}