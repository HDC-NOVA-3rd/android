import client from "@/api/client";
import { API_PATHS } from "@/api/requests";

/**
 * [아파트 날씨 조회 API]
 * - apartmentId를 받아 외부 날씨 정보 조회
 */
export const getApartmentWeather = async (apartmentId: number) => {
  const res = await client.get(API_PATHS.APARTMENT.WEATHER(apartmentId));
  return res.data;
};

/**
 * [내 아파트 날씨 조회]
 * 1) axios Authorization 헤더에서 JWT를 꺼내고
 * 2) JWT payload에서 apartmentId를 직접 파싱해서
 * 3) 날씨 API를 호출한다
 */
export const getMyApartmentWeather = async () => {
  // 1. axios 기본 헤더에 설정된 Authorization 가져오기
  const authHeader = client.defaults.headers.common["Authorization"] as string | undefined;

  if (!authHeader) {
    throw new Error("Authorization 헤더가 없습니다. 로그인 상태를 확인하세요.");
  }

  // "Bearer xxx.yyy.zzz" → 토큰만 추출
  const token = authHeader.replace(/^Bearer\s+/i, "");

  // 2. JWT payload(Base64) 추출
  const payloadBase64 = token.split(".")[1];
  if (!payloadBase64) {
    throw new Error("JWT 형식이 올바르지 않습니다.");
  }

  // Base64 → JSON 문자열 변환
  const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
  const payloadJson = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  );

  // 3. payload 파싱
  const payload = JSON.parse(payloadJson);

  // 로그인 시 토큰에 포함된 apartmentId 사용
  const apartmentId = payload?.apartmentId;

  if (!apartmentId) {
    console.log("JWT payload:", payload);
    throw new Error("토큰 payload에 apartmentId가 없습니다.");
  }

  // 4. apartmentId로 날씨 조회
  return getApartmentWeather(Number(apartmentId));
};
