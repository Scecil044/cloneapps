// module.exports = {
//     funEligibleclaimTypes(obj_user, claimTypes) {
//         try {
//             var arr_eligible_claim_types = [];
//             for (var index = 0; index < claimTypes.length; index++) {
//                 var claimType = claimTypes[index];
//                 var claim_type_eligibilty = this.funCheckUseraccess(obj_user, claimType);
//                 if (claim_type_eligibilty) {
//                     arr_eligible_claim_types.push(claimType);
//                 }
//             }
            
//             return arr_eligible_claim_types;
//         }
//         catch (error) {
//             return error;
//         }
//     },
//     funCheckUseraccess(obj_user, claimType) {
//         var arr_claim_category = claimType.category;
//         var add_flag = false;

//         if (claimType.access.toLowerCase() == "all") {
//             add_flag = true;
//         }
//         else {
//             if (claimType.access.toLowerCase() == "department") {
//                 var matchUser = arr_claim_category.filter(function (ele) { return ele == obj_user.reporting.department; });
//                 if (matchUser && matchUser.length > 0)
//                     add_flag = true;
//             }
//             else if (claimType.access.toLowerCase() == "designation") {
//                 var matchUser = arr_claim_category.filter(function (ele) { return ele == obj_user.personal.designation; });
//                 if (matchUser && matchUser.length > 0)
//                     add_flag = true;
//             }
//             else if (claimType.access.toLowerCase() == "cost center") {
//                 var matchUser = arr_claim_category.filter(function (ele) { return ele == obj_user.personal.cost_center; });
//                 if (matchUser && matchUser.length > 0)
//                     add_flag = true;
//             }
//             else if (claimType.access.toLowerCase() == "teams") {
//                 var matchUser = arr_claim_category.filter(function (ele) { return ele == obj_user.reporting.team; });
//                 if (matchUser && matchUser.length > 0)
//                     add_flag = true;
//             }
//             else if (claimType.access.toLowerCase() == "employee type") {
//                 var matchUser = arr_claim_category.filter(function (ele) { return ele == obj_user.reporting.type; });
//                 if (matchUser && matchUser.length > 0)
//                     add_flag = true;
//             }
//             else if (claimType.access.toLowerCase() == "gender") {
//                 var matchUser = arr_claim_category.filter(function (ele) { return ele == obj_user.personal.gender; });
//                 if (matchUser && matchUser.length > 0)
//                     add_flag = true;
//             }
//             else if (claimType.access.toLowerCase() == "religion") {
//                 var matchUser = arr_claim_category.filter(function (ele) { return ele == obj_user.personal.religion; });
//                 if (matchUser && matchUser.length > 0)
//                     add_flag = true;
//             }
//             else if (claimType.access.toLowerCase() == "department payroll") {
//                 var matchUser = arr_claim_category.filter(function (ele) { return ele == obj_user.reporting.department_payroll; });
//                 if (matchUser && matchUser.length > 0)
//                     add_flag = true;
//             }
//         }
//         return add_flag;
//     }
// };
module.exports = {
    commonFieldsValidation: (claim_keys) => {
        let validate = { status: true, msg: '' }
        for (let i = 0; i < claim_keys.length; i++) {
            const { name, type, required, value } = claim_keys[i]
            if (type === "Text Field" && required === true && !(/^[a-zA-Z0-9\s]+$/).test(value)) {
                validate = { status: false, message: `Invalid value in ${name} field.`, data: {} }
                return validate
            } else if (type === "Number Field" && required === true && !(/^[0-9]+$/).test(value)) {
                validate = { status: false, message: `Invalid value in ${name} field.`, data: {} }
                return validate
            } else if (type === "Date Picker" && required === true && !(/^(19[1-9][0-9]|20[0-9][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/).test(value)) {
                validate = { status: false, message: `Invalid value in ${name} field.`, data: {} }
                return validate
            }
        }
        return validate
    },
    dynamicFieldsValidation: (claim_keys) => {
        let validate = { status: true, msg: '' }
        for (let i = 0; i < claim_keys.length; i++) {
            const { name, type, required, value } = claim_keys[i]
            if(type === "Attachments" && required === true && value == "")
                continue;
            else if (claim_keys[i].hasOwnProperty('required') && required === true && (value == "" || value == null)) {
                validate = { status: false, message: `Required field is empty "${name}".`, data: {} }
                return validate
            } else if (type === "Text Field" && required === true && !(/^[a-zA-Z0-9\s]+$/).test(value)) {
                validate = { status: false, message: `Invalid value in text field.`, data: {} }
                return validate
            } else if (type === "Number Field" && required === true && !(/^[0-9]+$/).test(value) && claim_keys[i].isCalculationNeeded === false) {
                validate = { status: false, message: `Invalid value in number field.`, data: {} }
                return validate
            } else if (type === "Date Picker" && required === true && !(/^(19[1-9][0-9]|20[0-9][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/).test(value)) {
                validate = { status: false, message: `Invalid value in date field.`, data: {} }
                return validate
            } else if (type === "Number Field" && required === true && claim_keys[i].isCalculationNeeded === true) {
                let expression = claim_keys[i].expression.replace("x", claim_keys[i].inputvalue);
                const calc = eval(expression);
                if (calc !== value) {
                    validate = { status: false, message: `Incorrect calculated value for ${name}.`, data: { expectedResult: calc, actualResult: value } }
                    return validate
                }
            }
        }
        return validate
    },
    funEligibleclaimTypes(obj_user, claimTypes) {
        try {
            var arr_eligible_claim_types = [];
            for (var index = 0; index < claimTypes.length; index++) {
                var claimType = claimTypes[index];
                var claim_type_eligibilty = this.funCheckUseraccess(obj_user, claimType);
                if (claim_type_eligibilty) {
                    arr_eligible_claim_types.push(claimType);
                }
            }

            return arr_eligible_claim_types;
        }
        catch (error) {
            return error;
        }
    },
    funCheckUseraccess(obj_user, claimType) {
        var arr_claim_category = claimType.category;
        var add_flag = false;

        if (claimType.claimType.toLowerCase() === "expense claim") {
            if (obj_user.employment.grade < 9 || obj_user.employment.grade > 11) {
                return false; 
            }
        }

        if (claimType.access.toLowerCase() == "all") {
            add_flag = true;
        }
        else {
            if (claimType.access.toLowerCase() == "department") {
                var matchUser = arr_claim_category.filter(function (ele) { return ele == obj_user.reporting.department; });
                if (matchUser && matchUser.length > 0)
                    add_flag = true;
            }
            else if (claimType.access.toLowerCase() == "designation") {
                var matchUser = arr_claim_category.filter(function (ele) { return ele == obj_user.personal.designation; });
                if (matchUser && matchUser.length > 0)
                    add_flag = true;
            }
            else if (claimType.access.toLowerCase() == "cost center") {
                var matchUser = arr_claim_category.filter(function (ele) { return ele == obj_user.personal.cost_center; });
                if (matchUser && matchUser.length > 0)
                    add_flag = true;
            }
            else if (claimType.access.toLowerCase() == "teams") {
                var matchUser = arr_claim_category.filter(function (ele) { return ele == obj_user.reporting.team; });
                if (matchUser && matchUser.length > 0)
                    add_flag = true;
            }
            else if (claimType.access.toLowerCase() == "employee type") {
                var matchUser = arr_claim_category.filter(function (ele) { return ele == obj_user.reporting.type; });
                if (matchUser && matchUser.length > 0)
                    add_flag = true;
            }
            else if (claimType.access.toLowerCase() == "gender") {
                var matchUser = arr_claim_category.filter(function (ele) { return ele == obj_user.personal.gender; });
                if (matchUser && matchUser.length > 0)
                    add_flag = true;
            }
            else if (claimType.access.toLowerCase() == "religion") {
                var matchUser = arr_claim_category.filter(function (ele) { return ele == obj_user.personal.religion; });
                if (matchUser && matchUser.length > 0)
                    add_flag = true;
            }
            else if (claimType.access.toLowerCase() == "department payroll") {
                var matchUser = arr_claim_category.filter(function (ele) { return ele == obj_user.reporting.department_payroll; });
                if (matchUser && matchUser.length > 0)
                    add_flag = true;
            }
        }
        return add_flag;
    }
}