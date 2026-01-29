import client from "../backendServer";
import { API_PATHS } from "../requests";
// 아파트 전체 목록 조회
export const getApartmentList = async () => {
  try {
    const response = await client.get(API_PATHS.AUTH.APTLIST);
    return response.data;
  } catch (error) {
    console.error("아파트 목록 조회 API 에러:", error);
    throw error;
  }
};

// 아파트 ID 기반 동 목록 조회
export const getDongList = async (apartmentId) => {
  try {
    // URL의 {apartmentId} 부분을 실제 파라미터 값으로 치환
    const path = API_PATHS.AUTH.DONGLIST.replace("{apartmentId}", apartmentId);
    console.log(apartmentId);
    const response = await client.get(path);
    return response.data;
  } catch (error) {
    console.error("동 목록 조회 API 에러:", error);
    throw error;
  }
};

// 동 ID 기반 호 목록 조회
export const getHoList = async (dongId) => {
  try {
    // URL의 {dongId} 부분을 실제 파라미터 값으로 치환
    const path = API_PATHS.AUTH.HOLIST.replace("{dongId}", dongId);

    const response = await client.get(path);
    return response.data;
  } catch (error) {
    console.error("호 목록 조회 API 에러:", error);
    throw error;
  }
};

// 입주민 검증 요청
export const verify = async (residentRequest) => {
  try {
    const response = await client.post(API_PATHS.AUTH.VERIFY, residentRequest);
    return response.data;
  } catch (error) {
    console.error("입주민 검증 API 에러:", error);
    throw error;
  }
};

// 회원가입 요청
export const signup = async (signupRequest) => {
  try {
    const response = await client.post(API_PATHS.AUTH.SIGNUP, signupRequest);
    return response.data;
  } catch (error) {
    console.error("회원가입 API 에러:", error);
    throw error;
  }
};

// 로그인 요청
export const login = async (loginRequest) => {
  try {
    const response = await client.post(API_PATHS.AUTH.LOGIN, loginRequest);
    return response.data;
  } catch (error) {
    console.error("로그인 API 에러:", error);
    throw error;
  }
};
