export const formatPhoneNumber = (value: string) => {
  // 1. 숫자가 아닌 문자는 모두 제거
  const cleaned = value.replace(/[^0-9]/g, "");

  // 2. 길이에 따라 하이픈 추가 (010-0000-0000 패턴)
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 7) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  } else {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  }
};
