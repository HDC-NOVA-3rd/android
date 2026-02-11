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
    ios: "http://localhost:/api",
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

// [추가] 토큰 갱신 중인지 확인하는 플래그
let isRefreshing = false;
// [추가] 갱신 중 들어온 요청들을 대기시킬 큐
let refreshSubscribers = [];

// 대기 중인 요청들을 처리하는 함수
const onRefreshed = (accessToken) => {
  refreshSubscribers.map((callback) => callback(accessToken));
  refreshSubscribers = [];
};

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
    const response = error.response;
    // 1. 응답이 아예 없는 경우 (네트워크 오류 등)
    if (!response) {
      return Promise.reject(error);
    }
    // 백엔드에서 보내준 커스텀 에러 코드 추출 ({ code: "ACCESS_TOKEN_EXPIRED", message: "..." })
    const errorCode = response.data?.code;
    const status = response.status;

    // ------------------------------------------------------------------
    // [Case 1] Access Token 만료 -> 갱신 시도 (Silent Refresh)
    // 조건: 401 에러이고, 코드가 'ACCESS_TOKEN_EXPIRED' 일 때만 실행
    // ------------------------------------------------------------------
    if (status === 401 && errorCode === "ACCESS_TOKEN_EXPIRED" && !originalRequest._retry) {
      // 1. 이미 갱신 중이라면? -> 큐에 넣고 대기
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((accessToken) => {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            resolve(client(originalRequest));
          });
        });
      }

      isRefreshing = true; // 갱신 중 플래그 설정
      originalRequest._retry = true; // 무한 루프 방지

      try {
        console.log("Access Token 만료 감지. 토큰 갱신 시도...");
        // 1. SecureStore에서 Refresh Token 가져오기
        const refreshToken = await getRefreshToken();

        if (!refreshToken) throw new Error("Refresh Token이 없습니다.");

        // 2. 토큰 갱신 API 호출 (요청 시 순수 axios 사용 -> Header에 Access Token 포함 X)
        const { data } = await axios.post(
          `${BASE_URL}${API_PATHS.AUTH.REFRESH}`,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const newAccessToken = data.accessToken;

        // Refresh Token Rotation을 사용 -> 새 RT 저장
        if (data.refreshToken) {
          await setRefreshToken(data.refreshToken);
        }

        // 3. 새 토큰으로 설정 갱신
        // [중요] 메모리(axios defaults)에 새 토큰 장착 -> 이후 요청부터는 이거 씀
        client.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        console.log("갱신된 Access Token:", newAccessToken);
        // 대기 중이던 요청들 재실행
        onRefreshed(newAccessToken);

        // 4. 실패했던 원래 요청의 헤더를 바꿔서 재요청
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        // ------------------------------------------------------------------
        // [Case 3] 리프레시 토큰 만료/위조 -> 강제 로그아웃
        // ------------------------------------------------------------------
        // Refresh Token도 만료되었거나 갱신 실패 시
        console.error("세션 만료 (갱신 실패):", refreshError);
        // 데이터 정리 및 강제 로그아웃
        await removeRefreshToken();
        delete client.defaults.headers.common["Authorization"];

        router.replace("/login");

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false; // 갱신 종료 (성공이든 실패든)
      }
    }
    // ------------------------------------------------------------------
    // [Case 2] 단순 로그인 실패, 비번 틀림 등 -> 그냥 에러 던짐 (화면에서 처리)
    // 401이지만 토큰 만료가 아닌 경우 (예: LOGIN_FAILED)
    // ------------------------------------------------------------------
    if (status === 401 && errorCode !== "ACCESS_TOKEN_EXPIRED") {
      console.log("🚫 인증 실패 (로그인 오류):", errorCode);
      // 여기서 갱신 로직을 타지 않고 바로 reject 하므로 무한 루프가 방지됩니다.
    }
    return Promise.reject(error);
  },
);

export default client;
