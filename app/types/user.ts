export interface User {
  id?: string;
  email: string;
  name: string;
  loginMethod?: "email" | "google" | "naver";
  phoneNumber: string;
  birthDate: string;
  apartmentName: string;
  dongNo: string;
  hoNo: string;
}
