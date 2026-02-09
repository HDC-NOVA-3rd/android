import client from "../client";
import { API_PATHS } from "../requests";

export const getFacilityList = async (apartmentId) => {
  try {
    const url = API_PATHS.FACILITY.FACILITY_LIST.replace("{apartmentId}", apartmentId);
    const response = await client.get(url);
    return response.data;
  } catch (error) {
    console.error("커뮤니티 시설 목록 조회 실패:", error);
    throw error;
  }
};

export const getFacilityDetail = async (facilityId) => {
  try {
    const url = API_PATHS.FACILITY.DETAIL.replace("{facilityId}", facilityId);
    const response = await client.get(url);
    return response.data;
  } catch (error) {
    console.error("시설 상세 정보 조회 실패:", error);
    throw error;
  }
};

export const getFacilitySpaces = async (facilityId, capacity = null) => {
  try {
    let url = API_PATHS.FACILITY.SPACES.replace("{facilityId}", facilityId);
    if (capacity) {
      url += `?capacity=${capacity}`;
    }
    const response = await client.get(url);
    return response.data;
  } catch (error) {
    console.error("시설 공간 목록 조회 실패:", error);
    throw error;
  }
};

export const getSpaceDetail = async (spaceId) => {
  try {
    const url = API_PATHS.FACILITY.SPACE_DETAIL.replace("{spaceId}", spaceId);
    const response = await client.get(url);
    return response.data;
  } catch (error) {
    console.error("공간 상세 정보 조회 실패:", error);
    throw error;
  }
};
