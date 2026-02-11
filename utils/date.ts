export const formatDateToYYYYMMDD = (dateString: string) => {
  if (/^\d{8}$/.test(dateString)) {
    return dateString.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
  }
  return dateString;
};

/**
 * "HH:MM:SS" 형태의 시간 문자열을 받아 "HH:MM"으로 변환합니다.
 * @param time - 시간 문자열 (예: "09:00:00")
 * @returns 포맷팅된 시간 문자열 (예: "09:00")
 */
export const formatTime = (time: string | null | undefined): string => {
  if (!time) return "";
  // 문자열이 충분히 길다면 앞 5자리만 자름 ("09:00:00" -> "09:00")
  return time.length >= 5 ? time.substring(0, 5) : time;
};
