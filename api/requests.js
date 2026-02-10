export const API_PATHS = {
  AUTH: {
    APTLIST: "/apartment",
    DONGLIST: "/apartment/{apartmentId}/dong",
    HOLIST: "/apartment/dong/{dongId}/ho",
    VERIFY: "/resident/verify",
    SIGNUP: "/member/signup",
    LOGIN: "/member/login",
    REFRESH: "/member/refresh",
    FIND_ID: "/member/findInfo",
    RESET_PW: "/member/resetPW",
  },
  MEMBER: {
    PROFILE: "/member/profile",
    APARTMENT: "/member/apartment",
    CHANGE_PW: "/member/password",
  },
  FACILITY: {
    FACILITY_LIST: "/apartment/{apartmentId}/facility",
    DETAIL: "/facility/{facilityId}",
    SPACES: "/facility/{facilityId}/space",
    SPACE_DETAIL: "/facility/space/{spaceId}",
  },
  RESERVATION: {
    CREATE: "/reservation",
    MY_LIST: "/reservation/me",
    DETAIL: "/reservation/{reservationId}",
    CANCEL: "/reservation/{reservationId}/cancel",
    OCCUPIED: "/reservation/availability",
  },
  CHAT: {
    SEND: "/chat",
    SESSIONS: "/chat/sessions",
    SESSION_MESSAGES: (sessionId) => `/chat/sessions/${sessionId}/messages`,
    DELETE_SESSION: (sessionId) => `/chat/sessions/${sessionId}`,
    DELETE_ALL_SESSIONS: "/chat/sessions",
  },
  NOTICE: {
    LIST: "/notice",
  },
};
