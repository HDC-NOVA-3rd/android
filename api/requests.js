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
  CHAT: {
    SEND: "/chat",
    SESSIONS: "/chat/sessions",
    SESSION_MESSAGES: (sessionId) => `/chat/sessions/${sessionId}/messages`,
  },
  HOME_ENV: {
    ROOMS_BY_HO: (hoId) => `/room/ho/${hoId}`,
    ROOMS_MY: "/room/my",
    ROOM_SNAPSHOT: (roomId) => `/room/${roomId}/snapshot`,
    DEVICE_STATE: (roomId) => `/room/${roomId}/devices/state`,
  },
  APARTMENT: {
    WEATHER: (apartmentId) => `/apartment/${apartmentId}/weather`,
  },
};
