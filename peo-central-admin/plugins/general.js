import moment from 'moment'

export default {
    dateConvert(str) {
        var date = new Date(str),
        mnth = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
        return [date.getFullYear(), mnth, day].join("-");
    },
    getUserFullName(val, users){
        let abc = users.filter(a => a._id == val)
        return abc.length > 0 ? abc[0].first_name + " "+ abc[0].middle_name + " " + abc[0].last_name : ''
    },
    getUserFirstName(val, users){
        let abc = users.filter(a => a._id == val)
        return abc.length > 0 && abc[0].first_name ? abc[0].first_name : ''
    },
    getPaymentMode(id,users){
        let user = users.filter(a=>a._id ==id)
        return user.length > 0 && user[0].employment && user[0].bank.salary_payment_mode ? user[0].bank.salary_payment_mode : ''
    },
    getAvatar(val, users){
        let abc = users.filter(a => a._id == val)
        return abc.length > 0 ? abc[0].image_url : 'https://nathanhroperations.s3.amazonaws.com/profile_pics/Sahiba_T/avatar-7.png'
    },
    isObjectEmpty(obj) {
        return Object.keys(obj).length === 0;
    },
    getFixedSalaryConfig(configuration){
        var tolower = function (val){
            return val.replace(/(?: |&)/g,"_").toLowerCase()
        }

        let fixed_salary_config = {}

        for(const config of configuration[0].fixed){
            fixed_salary_config[tolower(config)] = config
        }

        return fixed_salary_config
    },
    variableSalaryConfig(configuration){
        var tolower = function (val){
            return val.replace(/(?: |&)/g,"_").toLowerCase()
        }

        let variable_salary_config = {}

        for(const config of configuration[0].earning){
            variable_salary_config[tolower(config) + "_earning"] = config
        }
        for(const config of configuration[0].deduction){
            variable_salary_config[tolower(config) + "_deduction"] = config
        }
        for(const config of configuration[0].recurring_earning){
            variable_salary_config[tolower(config) + "_recurring_earning"] = config
        }
        for(const config of configuration[0].recurring_deduction){
            variable_salary_config[tolower(config) + "_recurring_deduction"] = config
        }

        return variable_salary_config
    },
    payitemTextUpdate(val){
        if(val == 'active') return 'Approved'
        else return val
    },
    getChipColor(val){
        return val == 'active' ? 'teal' : val == 'cancelled' ? 'red' : 'amber'
    },
    getChipColorSalaryAdjustment(val){
        return val == 'Withdrawn' || val =="Cancelled" || val == 'Rejected' ? 'red' : val == 'Active' ? 'teal' : 'amber'
    },
    getAmountColor(val){
        return val == 'Earning' ? 'green--text' : val == 'Deduction' ? 'red--text' : 'amber--text'
    },
    getPayrollProcessStatus(val,process){
        if(val == 'inactive') return 'Closed'
        else{
            if(process.submit_for_approval=== 'false') return 'Open'
            else{
                let abc = process.approvals.filter(a => a.status == 'Pending')
                if(abc.length > 0) return 'Submitted For Approval'
                if(abc.length == 0) return 'Approved'
            }
        }
    },
    formatDate(value,format) {
        if (value) {
            return moment(String(value)).format(format)
        }
    },
    keyNameRegexPayroll(val){
        return val ? _.startCase(val.replace(/_/g," ").replace('earning','').replace('deduction','')) : ''
    },
    getPriorityColor(data){
        if(data == 'High') return '#f98283'
        else if(data == 'Medium') return '#f0bd41'
        else return '#40e99b'  
    },
    getStatusColor(data){
        if (data == 'Created') return 'color:#0064D7;'
        else if (data == 'InProgress' || data == 'Hold' || data == 'Review') return 'color:#EAAE00'
        else if (data == 'Completed') return 'color:#32B56F'
        else if (data == 'Cancelled' || data == 'Stuck') return 'color:#FF335A;'
        else return 'grey'
    },
    getPriorityFlagImage(data){
        if(data == 'Medium') return "/gen-2-theme/Priority flags/priority-medium.svg"
        else if(data == 'High') return "/gen-2-theme/Priority flags/priority-high.svg"
        else return "/gen-2-theme/Priority flags/priority-low.svg"
    },
    getPriorityColorText(priority){
        if(priority == 'High') return "red--text"
        else if(priority == 'Medium') return "amber--text text-lighten-2"
        else return "green--text text--lighten-2"
    },

    getStatusBorderColor(val){
        if (val == 'Processing' || val == 'processing' ) return 'border-left: #F2B626 solid 3px;'
        else if (val == 'Completed' || val == 'completed') return 'border-left: #00E67A solid 3px;'
        else if (val == 'Cancelled' || val == 'cancelled') return 'border-left: #FD5959 solid 3px;'
        else return 'border-left: grey solid 3px;'
    },
    getTextColor(val){
        if (val == 'Submitted') return 'teal'
        else if (val == 'Processing' || val == 'processing') return 'color:#EAAE00'
        else if (val == 'Completed'|| val == 'completed' || val == 'Approved' ||val == 'Approved by Admin') return 'color:#0DC98A'
        else if (val == 'Cancelled'|| val == 'cancelled' || val == 'Rejected') return 'color:#E5252A'
        else return 'color:#516A81'

    },
    getLeaveImage(val){
        if (val == 'Annual Leave' || val == 'Annual Leaves') return '/hr/annual.svg'
        else if (val == 'Medical Leaves') return '/hr/medical.svg'
        else return '/hr/other_leave.svg'
    },
    getStatusColorTooltip(status){
        if (status == 'Completed') return 'teal'
        else if (status == 'Processing') return 'amber'
        else if (status == 'Cancelled') return 'red'
        else return 'grey'
    },
    getLeaveColor(val){
        if(val == "Annual Leave" || val == "Annual Leaves") return '#5C7EEF'
        if(val == "Medical Leave" || val == "Medical Leaves") return '#6869AC'
        if(val == "Emergency Leave" || val == "Emergency Leaves") return '#7B658B'
        if(val == "Parental Leave" || val == "Parental Leaves") return '#978E9A'
        if(val == "Maternity Leave" || val == "Maternity Leaves") return '#958E9A'
    },
    changeName(status){
        if(status =='Completed') return 'Approved'
        if(status =='Cancelled') return 'Rejected'
        if(status =='Processing') return 'In Progress'
        if(status =='Withdrawn') return 'Withdrawn'
    },
    numberFormat(n){
        return parseInt(n) > 9 ? parseInt(n) : parseInt(n) < 1 ? n : ("0" + parseInt(n));
    },
    getImage(val, users){
        let image = 'https://nathanhroperations.s3.amazonaws.com/profile_pics/Sahiba_T/avatar-7.png'
        if(users.length > 0){
            let abc = users.filter(a => a._id == val)
            if(abc.length > 0){
                if(abc[0].hasOwnProperty('image_url')){
                    if(abc[0].image_url != '') image = abc[0].image_url
                }
            }
        }
        return image
    },
    checkImage(val){
        return val ? val : 'https://nathanhroperations.s3.amazonaws.com/profile_pics/Sahiba_T/avatar-7.png'
    },
    getEmployeeID(val, users){
        let abc = users.filter(a => a._id == val)
        return abc.length > 0 ? abc[0].emp_id:''
    },
    getUserName(val, users){
        let abc = users.filter(a => a._id == val)
        return abc.length > 0 ? abc[0].first_name + " " + abc[0].last_name : ''
    },
    getUserDetails(val, users){
        let abc = users.filter(a => a._id == val)
        return abc.length > 0 ? abc[0] : {}
    },
    getPerformanceStatusColor(status){
        if (status == 'Created') return 'primary'
        if (status == 'Initiated') return 'orange'
        else if (status == 'Inprogress') return 'amber'
        else if (status == 'Submitted') return 'indigo'
        else if (status == 'Under Review') return 'purple'
        else if (status == 'Completed') return 'teal'
        else if (status == 'Cancelled') return 'red'
        else return 'grey'
    },
    getPerformanceReviewStatusColor(status){
        if (status == 'Pending') return 'primary'
        if (status == 'Initiated') return 'orange'
        else if (status == 'Reviewing') return 'amber'
        else if (status == 'Submitted') return 'indigo'
        else if (status == 'Under Review') return 'purple'
        else if (status == 'Completed') return 'teal'
        else if (status == 'Locked') return 'red'
        else if (status == 'Reviewed') return 'green'
        else return 'grey'
    },
    getTaskStatusColor(status){
        if (status == "Created") return '#1425f6'
        else if (status == "InProgress" || status == 'In Progress' || status == 'In progress') return 'orange'
        else if (status == "Hold") return 'red'
        else if (status == "Stuck") return 'red'
        else if (status == "Completed") return '#00E67A'
    },
    getUserStatusChipColor(user_status){
        if (user_status == "Active") return 'teal'
        else if (user_status == "Hold") return 'orange'
        else if (user_status == "Onboadrding") return 'pink'
        else if (user_status == "Inactive") return 'red'
        else return 'grey'
    },
    keyNameRegex(val){
        if(val != undefined){
            return _.startCase(val.replace(/_/g," "))
        }
        else{
            return ''
        }
    },
    getRankingImage(index){
        return index == 1 ? '/performance/gold_crown1.svg' : index == 2 ? '/performance/silver_crown2.svg' : index == 3 ? '/performance/bronze_crown3.svg' : ''
    },
    getRankingPercentage(index){
        return index == 1 ? '97' : index == 2 ? '96.3' : index == 3 ? '96.1' : index == 4 ? '95.3' : ''
    },
    getIconForTaskStatus(status){
        if(status == 'Total') return '/assets/asset.svg'
        else if(status == 'Created') return '/performance/New.svg'
        else if(status == 'InProgress') return '/performance/Inprogress.svg'
        else if(status == 'Hold') return '/performance/Hold.svg'
        else if(status == 'Review') return '/performance/Review.svg'
        else if(status == 'Completed') return '/performance/Completed.svg'
        else return '/assets/asset.svg'
    },
    thousandSeparator(value, sep) {
        if (value && Number(value) !== 0) {
            let newValue = parseFloat(value).toFixed(2)
            const numberFormatter = Intl.NumberFormat('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2, });
            const formatted = numberFormatter.format(newValue); 
            return formatted
        } else if (Number(value) == 0) {
            return 0.00
        } else return 0.00
    },

    getLetterObject(data){
        
        function thousandSeparator(value, sep) {
            if(value && Number(value) !== 0){
                let newValue  = parseFloat(value).toFixed(2)
                const numberFormatter = Intl.NumberFormat('en-US',{ 
                    maximumFractionDigits: 2, 
                    minimumFractionDigits: 2, 
                });
                const formatted = numberFormatter.format(newValue);
                return formatted
            }else if(Number(value) == 0 ){
                return 0.00
            }else return 0.00
        }

        function computeDateNewRequest(date){
            if(date == undefined || date == null || date == "") return ""
            else return moment(new Date(date).toISOString().substr(0,10)).format('DD MMMM, YYYY')
        }
        // let data = this.data
        let textArray = []
        for (const property in data.letter_fields) {
            if(property == 'date'){
                let iterationObj = {
                    "key": '[date]',
                    "value": computeDateNewRequest(data.letter_fields[property])
                }
            textArray.push(iterationObj)
            }
            else if(property == 'transfer_bank_name'){
                // let iterationObj = {
                //     "key": '[transfer_bank_name]',
                //     "value": data.letter_fields.transfer_bank_name['bank_name']
                // }
                // textArray.push(iterationObj)
            }
            else{
                let iterationObj = {
                    "key": '['+property+']',
                    "value": data.letter_fields[property]
                }
                textArray.push(iterationObj)
                if(property == 'gender'){
                    if( data.letter_fields[property] == 'Male'){
                        let iterationObj1 = {
                            "key": '[him/her]',
                            "value": 'him'
                        }
                        textArray.push(iterationObj1)
                    }
                    else{
                        let iterationObj1 = {
                            "key": '[him/her]',
                            "value": 'her'
                        }
                        textArray.push(iterationObj1)
                    }

                    if( data.letter_fields[property] == 'Male'){
                        let iterationObj2 = {
                            "key": '[he/she]',
                            "value": 'he'
                        }
                        textArray.push(iterationObj2)
                    }
                    else{
                        let iterationObj2 = {
                            "key": '[he/she]',
                            "value": 'she'
                        }
                        textArray.push(iterationObj2)
                    }

                    if( data.letter_fields[property] == 'Male'){
                        let iterationObj3 = {
                            "key": '[his/her]',
                            "value": 'his'
                        }
                        textArray.push(iterationObj3)
                    }
                    else{
                        let iterationObj3 = {
                            "key": '[his/her]',
                            "value": 'her'
                        }
                        textArray.push(iterationObj3)
                    }
                }
                // if(property == 'user_name'){
                //     let iterationObj = {
                //         "key": '[name]',
                //         "value": data.letter_fields[property]
                //     }
                // textArray.push(iterationObj)
                // }
                else if(property == 'role'){
                    let iterationObj = {
                        "key": '[designation]',
                        "value": data.letter_fields[property]
                    }
                textArray.push(iterationObj)
                }
                else if(property == 'loan_amount_word'){
                    let iterationObj = {
                        "key": '[loanAmountInWords]',
                        "value": data.letter_fields[property]
                    }
                textArray.push(iterationObj)
                }
                else if(property == 'work_start_date'){
                    let iterationObj = {
                        "key": '[doj]',
                        "value": computeDateNewRequest(data.letter_fields[property])
                    }
                    textArray.push(iterationObj)
                }
                else if(property == 'total_fixed_word'){
                    let iterationObj = {
                        "key": '[totalFixedWord]',
                        "value": data.letter_fields[property]
                    }
                    textArray.push(iterationObj)
                    iterationObj = {
                        "key": '[salaryInWords]',
                        "value": data.letter_fields[property]
                    }
                    textArray.push(iterationObj)
                }
                else if(property == 'total_fixed'){
                    let iterationObj = {
                        "key": '[empTotalFixed]',
                        "value": thousandSeparator(data.letter_fields[property])
                    }
                    textArray.push(iterationObj)
                    iterationObj = {
                        "key": '[totalFixed]',
                        "value": thousandSeparator(data.letter_fields[property])
                    }
                    textArray.push(iterationObj)
                }
                else if(property == 'basic_salary_word'){
                    let iterationObj = {
                        "key": '[basicSalaryInWords]',
                        "value": data.letter_fields[property]
                    }
                    textArray.push(iterationObj)
                }
                else if(property == 'basic_salary'){
                    let iterationObj = {
                        "key": '[empBasicSalary]',
                        "value":thousandSeparator( data.letter_fields[property])
                    }
                    textArray.push(iterationObj)
                    iterationObj = {
                        "key": '[basicSalary]',
                        "value":thousandSeparator( data.letter_fields[property])
                    }
                    textArray.push(iterationObj)
                }
                else if(property == 'accommodation_allowance'){
                    let iterationObj = {
                        "key": '[accommodation_allowance]',
                        "value":thousandSeparator( data.letter_fields[property])
                    }
                    textArray.push(iterationObj)
                    iterationObj = {
                        "key": '[accommodationallowance]',
                        "value":thousandSeparator( data.letter_fields[property])
                    }
                    textArray.push(iterationObj)
                }
                else if(property == 'medical_allowance'){
                    let iterationObj = {
                        "key": '[medical_allowance]',
                        "value":thousandSeparator( data.letter_fields[property])
                    }
                    textArray.push(iterationObj)
                    iterationObj = {
                        "key": '[medicalallowance]',
                        "value":thousandSeparator( data.letter_fields[property])
                    }
                    textArray.push(iterationObj)
                }
                else if(property == 'transport_allowance'){
                    let iterationObj = {
                        "key": '[transport_allowance]',
                        "value":thousandSeparator( data.letter_fields[property])
                    }
                    textArray.push(iterationObj)
                    iterationObj = {
                        "key": '[transportallowance]',
                        "value":thousandSeparator( data.letter_fields[property])
                    }
                    textArray.push(iterationObj)
                }
                else if(property == 'other_allowance'){
                    let iterationObj = {
                        "key": '[other_allowance]',
                        "value":thousandSeparator( data.letter_fields[property])
                    }
                    textArray.push(iterationObj)
                    iterationObj = {
                        "key": '[otherallowance]',
                        "value":thousandSeparator( data.letter_fields[property])
                    }
                    textArray.push(iterationObj)
                }
            }
        }
        for (let index = 0; index < data.letter_keys.length; index++) {
            const element = data.letter_keys[index];
            if(element.value){
                if(element.name.key == '[newAllowance]'){
                    let iterationObj = {
                       "key": element.name.key,
                       "value": thousandSeparator(parseFloat(element.value))
                   }
                   textArray.push(iterationObj)
               }
               else if(element.name.key == '[currentAllowance]'){
                    let iterationObj = {
                       "key": element.name.key,
                       "value": thousandSeparator(parseFloat(element.value))
                   }
                   textArray.push(iterationObj)
               }
               else if(element.name.key == '[newEmpBasicSalary]'){
                    let iterationObj = {
                       "key": element.name.key,
                       "value": thousandSeparator(parseFloat(element.value))
                   }
                   textArray.push(iterationObj)
               }
               else if(element.type == 'Date Picker'){
                   let iterationObj = {
                       "key": element.name.key,
                       "value": computeDateNewRequest(element.value)
                   }
                   textArray.push(iterationObj)
               }
               else{
                   let iterationObj = {
                       "key": element.name.key,
                       "value": element.value
                   }
                   textArray.push(iterationObj)
               }
            }
            else{
                let iterationObj = {
                    "key": element.name.key,
                    "value": ""
                }
                textArray.push(iterationObj)
            }
            
        }
        let obj = {
            "replaceText":JSON.stringify(textArray),
            "replaceTable":JSON.stringify([{tablename:"Products",table:[{description:"item1",quantity:"42"}]}]),
            "replaceImage":JSON.stringify([{key:"logo",value:data.letterImages && data.letterImages.signatureLink ? data.letterImages.signatureLink :"https://coolbackgrounds.io/images/backgrounds/white/pure-white-background-85a2a7fd.jpg"},{key:"stamp",value:data.letterImages && data.letterImages.companyStampLink ? data.letterImages.companyStampLink :"https://coolbackgrounds.io/images/backgrounds/white/pure-white-background-85a2a7fd.jpg"}]),
            "content": data.content
        }
        return obj
    },
    getRatedWeight(weight, rating) {
        return weight && rating ? parseFloat((((rating * 20) / 100) * weight).toFixed(2)) : 0
    },

}   