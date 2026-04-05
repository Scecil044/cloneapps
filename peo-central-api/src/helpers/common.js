const moment = require('moment-timezone');

module.exports = {
  pad(n, length = 1) {
    let v = Math.pow(10, length);
    let zero = '';
    for (i = 0; i < length; i++) {
      zero += '0';
    }
    return n < v ? zero + n : n;
  },
  formatDate(val) {
    return val ? moment(val).format('DD-MMM-YYYY') : '';
  },
  formatDateOneMonthLater(val) {
    return val ? moment(val).add(1, 'months').format('DD-MMM-YYYY') : '';
  },
  getCurrentTimeStamp() {
    let CurrentTime = new Date();
    /*let date = new Date(
          new Date(CurrentTime).setHours(CurrentTime.getHours() + 4)
        );*/

    let date = new Date(new Date(CurrentTime));
    return date.toISOString();
  },

  GetFormatdDate(date, format) {
    var OutPutstring = false;
    if (format == 'MM dd yyyy') {
      var date = new Date(date);
      var months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];

      var monthName = months[date.getMonth()];
      var mydate = date.getDate();
      var mymonth = date.getFullYear();

      OutPutstring = monthName + ' ' + mydate + ' ' + mymonth;
    }

    if (format == 'dd MM yyyy') {
      var date = new Date(date);
      var months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];

      var monthName = months[date.getMonth()];
      var mydate = date.getDate();
      var mymonth = date.getFullYear();

      OutPutstring = mydate + ' ' + monthName + ' ' + mymonth;
    }
    return OutPutstring;
  },
  capitalize(string) {
    return string
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },
  singular(string) {
    if (string.endsWith('s')) return string.slice(0, -1);
    return string;
  },
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
  },
  // thousandSeparator(value, sep) {
  //   if (value && Number(value) !== 0) {
  //     // Parse value as float and fix to two decimal places
  //     let newValue = parseFloat(value).toFixed(2);
      
  //     // Format the number with commas as thousand separators
  //     const numberFormatter = new Intl.NumberFormat('en-US', {
  //       maximumFractionDigits: 2,
  //       minimumFractionDigits: 2
  //     });
      
  //     // Apply formatting
  //     const formatted = numberFormatter.format(newValue);
  
  //     return formatted;
  //   } else if (Number(value) === 0) {
  //     return '0.00';
  //   } else {
  //     return '0.00';
  //   }
  // },
  thousandSeparator(value, sep = ',') {
  if (value && Number(value) !== 0) {
    // Round properly to 2 decimal places
    let newValue = Math.round((parseFloat(value) + Number.EPSILON) * 100) / 100;

    const numberFormatter = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });

    return numberFormatter.format(newValue);
  } else if (Number(value) === 0) {
    return '0.00';
  } else {
    return '0.00';
  }
},
  
  calculateTotalFixed(salary){
    if (!salary || typeof salary !== 'object') return 0;
  
    const validKeys = [
      'basic_salary',
      'housing_allowance',
      'hra_allowance',
      'other_allowance',
      'food_allowance',
      'transportation_allowance',
      'car_allowance',
      'petrol_allowance'
    ];
  
    let totalFixed = 0;
  
    validKeys.forEach((key) => {
      const value = parseFloat(salary[key]);  // Use parseFloat instead of Number
      console.log(`Calculating for ${key}: ${value}`); // Log value for each field
      if (!isNaN(value)) {
        totalFixed += value;
      }
    });
  
    console.log(`Total fixed calculated: ${totalFixed}`); // Log the final total
    return totalFixed;
  },
};
