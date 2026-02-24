import client from "../client";
import { API_PATHS } from "../requests";

export interface ComplaintItem {
  complaintId: number; 
  title: string;
  content: string;
  status: "RECEIVED" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED"; 
  createdAt: string;
  type: string; 
}

export interface ComplaintAnswer {
  id: number;
  adminId: number;
  resultContent: string; 
  createdAt: string;
}

export interface ComplaintDetail extends ComplaintItem {
  complaintId: number;
  memberId: number;
  adminId?: number;
  adminName?: string;
  apartmentId: number;
  answer?: ComplaintAnswer; 
  hasReview: boolean;
  resolvedAt?: string;
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
export const createComplaint = async (title: string, content: string, type: string) => {
  return await client.post(API_PATHS.COMPLAINT.CREATE, { title, content, type });
};

/**
 * 민원 수정 
 */
export const updateComplaint = async (complaintId: number, title: string, content: string, type: string) => {
  return await client.put(API_PATHS.COMPLAINT.UPDATE(complaintId), { title, content, type });
};

/**
 * 민원 삭제
 */
export const deleteComplaint = async (id: number) => {
  return await client.delete(API_PATHS.COMPLAINT.DELETE(id));
};