// string format function
export default function stringFormat(format, args) {
  return format.replace(/{(\d+)}/g, (match, number) => {
    return typeof args[number] !== 'undefined' ? args[number] : match;
  });
}
