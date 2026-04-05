module.exports = {
    commonFieldsValidation: (claim_keys) => {
        let validate = { status: true, msg: ''}
        for(let i=0; i<claim_keys.length; i++) {
            const { name, type, required, value } = claim_keys[i]
            if (type === "Text Field" && required === true && !(/^[a-zA-Z0-9\s]+$/).test(value)) {
                validate = { status: false, message: `Invalid value in ${name} field.`, data: {}}
                return validate
            } else if (type === "Number Field" && required === true && !(/^[0-9]+$/).test(value)) {
                validate = { status: false, message: `Invalid value in ${name} field.`, data: {}}
                return validate
            } else if (type === "Date Picker" && required === true && !(/^(19[1-9][0-9]|20[0-9][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/).test(value)) {
                validate = { status: false, message: `Invalid value in ${name} field.`, data: {}}
                return validate 
            }
        }
        return validate
    },
    dynamicFieldsValidation: (claim_keys) => {
        let validate = { status: true, msg: ''}
        for(let i=0; i<claim_keys.length; i++) {
            const { name, type, required, value } = claim_keys[i]
            if (claim_keys[i].hasOwnProperty('required') && required === true && (value == "" || value == null) ) { 
                validate = { status: false, message: `Required field is empty "${name}".`, data: {}}
                return validate
            } else if (type === "Text Field" && required === true && !(/^[a-zA-Z0-9\s]+$/).test(value)) {
                validate = { status: false, message: `Invalid value in text field.`, data: {}}
                return validate
            } else if (type === "Number Field" && required === true && !(/^[0-9]+$/).test(value) && claim_keys[i].isCalculationNeeded === false) {
                validate = { status: false, message: `Invalid value in number field.`, data: {}}
                return validate
            } else if (type === "Date Picker" && required === true && !(/^(19[1-9][0-9]|20[0-9][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/).test(value)) {
                validate = { status: false, message: `Invalid value in date field.`, data: {}}
                return validate
            } else if (type === "Number Field" && required === true && claim_keys[i].isCalculationNeeded === true) {
                let expression = claim_keys[i].expression.replace("x", claim_keys[i].inputvalue);
                const calc = eval(expression);
                if(calc !== value) {
                    validate = { status: false, message: `Incorrect calculated value for ${name}.`, data: { expectedResult: calc, actualResult: value }}
                    return validate
                }
            }
        }
        return validate
    },
}
