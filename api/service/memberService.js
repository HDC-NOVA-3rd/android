import client from "../client";
import { API_PATHS } from "../requests";

/** 회원 정보 조회 관련 API 목록 */

// 내 정보 조회
export const getMyInfo = async () => {
  try {
    const response = await client.get(API_PATHS.MEMBER.PROFILE);
    return response.data;
  } catch (error) {
    console.error("내 정보 조회 API 에러:", error);
    throw error;
  }
};

// 내 아파트 정보 조회
export const getMyApartmentInfo = async () => {
  try {
    const response = await client.get(API_PATHS.MEMBER.APARTMENT);
    return response.data;
  } catch (error) {
    console.error("내 아파트 정보 조회 API 에러:", error);
    throw error;
  }
};

// 비밀번호 변경
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await client.put(API_PATHS.MEMBER.CHANGE_PW, {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("비밀번호 변경 API 에러:", error);
    throw error;
  }
};
