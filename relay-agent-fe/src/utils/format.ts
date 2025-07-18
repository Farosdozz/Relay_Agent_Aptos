export function formatEllipsisText(
  text: string | `0x${string}`,
  leftChars: number = 6,
  rightChars: number = 6,
): string {
  if (!text) return '';
  if (text.length <= leftChars + rightChars) {
    return text;
  }

  const leftPart = text.slice(0, leftChars);
  const rightPart = text.slice(-rightChars);

  return `${leftPart}...${rightPart}`;
}

export const formatNumber = (number: number, decimalPlaces: number = 3) => {
  return number.toLocaleString(navigator.language, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
};

export const roundBalance = (rawBalance: number | string, decimalPlaces = 4) => {
  const p = Math.pow(10, decimalPlaces);
  const n = parseFloat(rawBalance.toString()) * p * (1 + Number.EPSILON);
  return (Math.round(n) / p).toString();
};
