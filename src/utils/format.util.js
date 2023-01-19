export const formatNumber = (
  value,
  maximumFractionDigits = 0,
  options = {},
) => {
  const numberFormat = new Intl.NumberFormat('en-En', {
    maximumFractionDigits,
    ...options,
  });
  return numberFormat.format(value);
};

export const formatCurrency = (
  value,
  currency = 'USD',
  maximumFractionDigits = 2,
  options,
) => {
  if (currency === 'VND') {
    maximumFractionDigits = 0;
  }
  return formatNumber(value, maximumFractionDigits, {
    style: 'currency',
    currency,
    ...options,
  });
};

export const formatId = id => {
  if (!id) {
    return id;
  }
  return `#${id}`;
};

const MONTH_TYPE = [
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
  'December',
];

// Format: kk:mm, MMMM dd, YYYY
export const formatDate = date => {
  if (!date) return '';
  const newDate = new Date(date);
  const hours = (newDate.getHours() < 10 ? '0' : '') + newDate.getHours();
  const minutes = (newDate.getMinutes() < 10 ? '0' : '') + newDate.getMinutes();
  const day = newDate.getDate();
  const month = MONTH_TYPE[newDate.getMonth()];
  const year = newDate.getFullYear();
  return `${hours}:${minutes}, ${month} ${day}, ${year}`;
};

//Format dd/mm/yyyy
const month_number = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
];
export const formatDateString = date => {
  const day = date.getDate();
  const month = month_number[date.getMonth()];
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const bigNumberFormat = (
  num = 0,
  currency = 'USD',
  digits = 2,
  options,
) => {
  if (currency === 'VND') {
    digits = 0;
  }

  let bigNumber = formatNumber(num, digits, {
    currency,
    ...options,
  });

  const newNum = Number(bigNumber.replace(/,/g, ''));

  if (newNum >= 1e9) {
    const newNumber = Math.round(num / 1e9);
    if (newNum <= 1e12) {
      bigNumber = Number(newNumber.toString().slice(0, 5));
    } else {
      bigNumber = parseInt(newNumber);
    }
    bigNumber =
      formatNumber(bigNumber, digits, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        ...options,
      }) + 'B';
  } else {
    if (currency !== 'VND') {
      digits = getMinimumFractionDigits(num);
    }
    bigNumber = formatNumber(newNum, digits, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      ...options,
    });
  }

  return bigNumber;
};

const getMinimumFractionDigits = num => {
  if (typeof num === 'number') {
    if (num <= 1e7) {
      return 2;
    }
    if (num <= 1e8) {
      return 1;
    }
  }
  return 0;
};
