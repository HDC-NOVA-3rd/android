export interface User {
  id?: string;
  email: string;
  name: string;
  loginMethod?: 'email' | 'google' | 'naver';
  phone: string;
  birthDate: string;
  apartment: string;
  dong: string;
  hosu: string;
}
