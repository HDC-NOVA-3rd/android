// api/client.ts
import { API_PATHS } from "@/api/requests";
import axios from "axios";
import { router } from "expo-router";
import { Platform } from "react-native";
import { getRefreshToken, removeRefreshToken, setRefreshToken } from "./tokenStorage";

export const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  Platform.select({
    // iOS 시뮬레이터용 (localhost 사용 가능)
    ios: "http://localhost:8080/api",
    // 안드로이드 에뮬레이터용 (10.0.2.2가 내 컴퓨터를 가리킴)
    android: "http://10.0.2.2:8080/api",
  })
)
  ?.trim()
  .replace(/\/+$/, "");

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// [요청 인터셉터] 모든 요청 전에 실행 -> client 요청 전에 토큰 첨부 (없으면 헤더에 토큰 없이 전송)
client.interceptors.request.use(
  async (config) => {
    try {
      const authHeader = client.defaults.headers.common["Authorization"];

      if (authHeader) {
        config.headers.Authorization = authHeader;
      }
    } catch (error) {
      console.error("토큰 로드 실패:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// [응답 인터셉터] 공통 에러 처리 (선택 사항)
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized 에러이고, 아직 재시도(_retry)하지 않은 요청이라면
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 루프 방지

      try {
        console.log("Access Token 만료 감지. 토큰 갱신 시도...");

        // 1. SecureStore에서 Refresh Token 가져오기
        const refreshToken = await getRefreshToken();

        if (!refreshToken) throw new Error("Refresh Token이 없습니다.");

        // 2. 토큰 갱신 API 호출 (요청 시 순수 axios 사용 -> Header에 Access Token 포함 X)
        const { data } = await axios.post(
          `${BASE_URL}${API_PATHS.AUTH.REFRESH}`,
          {
            refreshToken,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const newAccessToken = data.accessToken;

        // (옵션) Refresh Token Rotation을 사용한다면 새 RT 저장
        if (data.refreshToken) {
          await setRefreshToken(data.refreshToken);
        }

        // 3. 새 토큰으로 설정 갱신
        // [중요] 메모리(axios defaults)에 새 토큰 장착 -> 이후 요청부터는 이거 씀
        client.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

        // 4. 실패했던 원래 요청의 헤더를 바꿔서 재요청
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        console.log("토큰 갱신 성공. 원래 요청 재시도.");
        return client(originalRequest);
      } catch (refreshError) {
        // Refresh Token도 만료되었거나 갱신 실패 시
        console.error("세션 만료 (갱신 실패):", refreshError);

        // 데이터 정리 및 강제 로그아웃
        await removeRefreshToken();
        delete client.defaults.headers.common["Authorization"];

        router.replace("/login");

        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default client;
