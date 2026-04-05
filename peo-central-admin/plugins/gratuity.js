import moment from 'moment'

export default {
  getGratuityCalculations(
    users,
    to_date_current,
    payrollLastMonthData,
    exit_status
  ) {
    let gratuityReportArray = []
    var dateFormat = function (value) {
      if (value) {
        return moment(String(value)).format('YYYY-MM-DD')
      }
      return null
    }

    for (let index = 0; index < users.length; index++) {
      let abc = users[index]
      var gratuityReport = {
        user_id: '',
        emp_id: '',
        department: '',
        full_name: '',
        designation: '',
        date_of_joining: '',
        email: '',
        employer: '',
        mol: '',
        site: '',
        project: '',
        basic_salary: '0',
        days_last_month: '0',
        days_current_month: '0',
        month_due_last_month: '0',
        month_due_current_month: '0',
        gratuity_amount_last_month: 0,
        gratuity_amount_current_month: 0,
        gratuity_amount: 0,
      }

      var no_of_days_current_month = 0
      var gratuity_amount_current_month = 0

      if (
        abc.employment &&
        abc.date_of_joining &&
        !isNaN(new Date(abc.date_of_joining).getTime())
      ) {
        var from_date = abc.date_of_joining
        no_of_days_current_month =
          (new Date(to_date_current).getTime() -
            new Date(from_date).getTime()) /
            (1000 * 3600 * 24) +
          1

        if (no_of_days_current_month <= 1825) {
          gratuity_amount_current_month = parseFloat(
            ((((abc.salary.basic_salary * 12) / 365) * 21) / 365) *
              no_of_days_current_month
          ).toFixed(2)
        } else {
          let greaterThanFiveYearDays = no_of_days_current_month - 1825
          if (greaterThanFiveYearDays > 0) {
            gratuity_amount_current_month = parseFloat(
              ((((abc.salary.basic_salary * 12) / 365) * 21) / 365) * 1825 +
                ((((abc.salary.basic_salary * 12) / 365) * 30) / 365) *
                  greaterThanFiveYearDays
            ).toFixed(2)
          }
        }
      }

      let gratuity_amount_last_month = 0
      var no_of_days_last_month = 0

      if (
        payrollLastMonthData &&
        payrollLastMonthData.length > 0 &&
        payrollLastMonthData[0].gratuityReportArray
      ) {
        let lastMonthData = payrollLastMonthData[0].gratuityReportArray.filter(
          (a) => a.user_id == abc.id
        )
        if (lastMonthData.length > 0) {
          no_of_days_last_month = lastMonthData[0].days_current_month
          gratuity_amount_last_month =
            lastMonthData[0].gratuity_amount_current_month
        }
      }

      gratuityReport.user_id = abc.id || ''
      gratuityReport.emp_id = abc.emp_id || ''
      gratuityReport.department = abc.department || ''
      gratuityReport.full_name = `${abc.first_name || ''} ${
        abc.last_name || ''
      }`
      gratuityReport.designation = abc.employment?.designation || ''
      gratuityReport.date_of_joining = dateFormat(abc.date_of_joining)
      gratuityReport.basic_salary = abc.salary?.basic_salary || '0'
      gratuityReport.days_current_month = no_of_days_current_month || 0
      gratuityReport.gratuity_amount_current_month =
        gratuity_amount_current_month || 0
      gratuityReport.days_last_month = no_of_days_last_month || 0
      gratuityReport.gratuity_amount_last_month =
        gratuity_amount_last_month || 0

      gratuityReportArray.push({ ...gratuityReport })
    }
    return gratuityReportArray
  },
  calculateGratuityFromDate(basicSalary, joiningDateString) {
    const joiningDate = new Date(joiningDateString)
    const today = new Date()

    const diffTime = Math.abs(today - joiningDate)
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const yearsOfService = totalDays / 365

    if (yearsOfService < 1) {
      return {
        daysWorked: totalDays,
        years: yearsOfService.toFixed(2),
        amount: 0,
        eligible: false,
      }
    }

    let gratuity = 0

    if (yearsOfService >= 1 && yearsOfService < 5) {
      gratuity = ((basicSalary * 21) / 30) * yearsOfService
    } else if (yearsOfService >= 5) {
      const firstFive = ((basicSalary * 21) / 30) * 5
      const additionalYears = yearsOfService - 5
      const additionalGratuity = ((basicSalary * 30) / 30) * additionalYears
      gratuity = firstFive + additionalGratuity

      // Cap at 2 years' basic salary
      const maxGratuity = basicSalary * 24
      if (gratuity > maxGratuity) {
        gratuity = maxGratuity
      }
    }

    return {
      daysWorked: totalDays,
      years: yearsOfService.toFixed(2),
      amount: gratuity.toFixed(2),
      eligible: true,
    }
  },
}
