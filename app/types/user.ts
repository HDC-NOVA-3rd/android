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
