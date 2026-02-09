export interface User {
  email: string;
  name: string;
  loginType?: "email" | "google" | "naver";
  phoneNumber: string;
  birthDate: string;
  apartmentName: string;
  dongNo: string;
  hoNo: string;
  profileImage: string;
}

export interface AuthExchangeResponse {
  type: "LOGIN" | "REGISTER";
  tokenResponse?: {
    accessToken: string;
    refreshToken: string;
    memberId: number;
    name: string;
    email?: string;
    profileUrl?: string;
  };
  registerToken?: string;
}
