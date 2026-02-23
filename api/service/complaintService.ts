import client from "../client";
import { API_PATHS } from "../requests";

export interface ComplaintItem {
  complaintId: number;
  title: string;
  content: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED"; // 백엔드 ComplaintStatus 대응
  createdAt: string;
  authorName?: string;
}

// 상세 조회용 (필요시 추가 필드 정의)
export interface ComplaintDetail extends ComplaintItem {
  memberId: number;
  apartmentId: number;
  answer?: string; // 관리자 답변 등
}

/**
 * 내 민원 목록 조회
 */
export const getMyComplaints = async (): Promise<ComplaintItem[]> => {
  try {
    const response = await client.get(API_PATHS.COMPLAINT.MY_LIST);
    return response.data;
  } catch (error) {
    console.error("민원 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 민원 상세 조회
 */
export const getComplaintDetail = async (id: number): Promise<ComplaintDetail> => {
  const response = await client.get(API_PATHS.COMPLAINT.DETAIL(id));
  return response.data;
};

/**
 * 민원 등록
 */
export const createComplaint = async (title: string, content: string) => {
  return await client.post(API_PATHS.COMPLAINT.CREATE, { title, content });
};

/**
 * 민원 삭제
 */
export const deleteComplaint = async (id: number) => {
  return await client.delete(API_PATHS.COMPLAINT.DELETE(id));
};