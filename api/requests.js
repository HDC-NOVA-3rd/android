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
};
