// api/client.ts
import axios from "axios";
import { router } from "expo-router";
import { Platform } from "react-native";
import { getToken } from "./tokenStorage";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Platform.select({
    // iOS 시뮬레이터용 (localhost 사용 가능)
    ios: "http://localhost:8080/api",
    // 안드로이드 에뮬레이터용 (10.0.2.2가 내 컴퓨터를 가리킴)
    android: "http://10.0.2.2:8080/api",
  });

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// [요청 인터셉터] 모든 요청 전에 실행
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("토큰 가져오기 실패:", error);
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
  (error) => {
    // 예: 토큰 만료(401) 시 로그인 페이지로 이동시키는 로직을 이곳에 작성 가능
    if (error.response && error.response.status === 401) {
      console.error("인증 실패: 로그인이 필요합니다.");
      router.replace("/login");
    }
    return Promise.reject(error);
  },
);

export default client;
