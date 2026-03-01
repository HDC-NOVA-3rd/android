import client from "../client";
import { API_PATHS } from "../requests";

export interface NoticeItem {
  noticeId: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
}

/**
 * 내 공지사항 목록 조회
 */
export const getNoticeList = async (): Promise<NoticeItem[]> => {
  try {
    const response = await client.get(API_PATHS.NOTICE.LIST);
    return response.data;
  } catch (error) {
    console.error("공지사항 목록 조회 실패:", error);
    throw error;
  }
};
