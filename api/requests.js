export const API_PATHS = {
  AUTH: {
    APTLIST: "/apartment",
    DONGLIST: "/apartment/{apartmentId}/dong",
    HOLIST: "/apartment/dong/{dongId}/ho",
    VERIFY: "/resident/verify",
    SIGNUP: "/member/signup",
    LOGIN: "/member/login",
    REFRESH: "/member/refresh",
  },
  MEMBER: {
    PROFILE: "/member/profile",
    APARTMENT: "/member/apartment",
  },
  CHAT: {
    SEND: "/chat",
  },
};
