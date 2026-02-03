import client from "../client";
import { API_PATHS } from "../requests";

/** 챗봇 관련 API 목록 */
export const sendChat = async (chatRequest) => {
  try {
    const response = await client.post(API_PATHS.CHAT.SEND, chatRequest);
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const data = error?.response?.data;
    console.error("챗봇 전송 API 에러:", status, data || error.message);
    throw error;
  }
};
