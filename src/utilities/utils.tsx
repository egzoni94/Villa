export const isNumericInput = (value: string) => {
  return /^\d*$/.test(value); // allows empty or digits only
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // Months are 0-based
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
