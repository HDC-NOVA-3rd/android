// 핵심 수정: 'expo-file-system'이 아니라 'expo-file-system/legacy'에서 가져옵니다.
import { documentDirectory, downloadAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import client from "../client";
import { API_PATHS } from "../requests";

export const billService = {
  /**
   * 고지서 리스트 조회 (기존 유지)
   */
  getBills: async (page = 0, size = 10) => {
    try {
      const response = await client.get(API_PATHS.BILL.LIST, {
        params: { page, size, sort: "billMonth,desc" },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 고지서 상세 내역 조회 (기존 유지)
   */
  getBillDetail: async (billId) => {
    try {
      const response = await client.get(API_PATHS.BILL.DETAIL(billId));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 고지서 PDF 다운로드 및 열기
   */
  downloadBillPdf: async (billId, billMonth) => {
    try {
      const filename = `bill_${billMonth}.pdf`;
      const fileUri = `${documentDirectory}${filename}`;
      
      // 주의: baseURL이 전체 주소(http://...)인지 꼭 확인하세요!
      const downloadUrl = `${client.defaults.baseURL}${API_PATHS.BILL.PDF(billId)}`;

      // legacy 경로에서 가져온 downloadAsync를 사용합니다.
      const downloadResult = await downloadAsync(
        downloadUrl,
        fileUri,
        {
          headers: {
            Authorization: client.defaults.headers.common['Authorization'],
          },
        }
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadResult.uri);
      } else {
        console.log("공유 기능을 사용할 수 없는 기기입니다.");
      }
      
      return downloadResult.uri;
    } catch (error) {
      console.error("PDF 다운로드 실패:", error);
      throw error;
    }
  },
};