export const formatDateToYYYYMMDD = (dateString: string) => {
  if (/^\d{8}$/.test(dateString)) {
    return dateString.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
  }
  return dateString;
};
