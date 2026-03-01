import client from "@/api/client";
import { refresh } from "@/api/service/authService";
import { registerPushToken, removePushToken } from "@/api/service/memberService";
import { getRefreshToken, removeRefreshToken, setRefreshToken } from "@/api/tokenStorage";
import { useRouter, useSegments } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { registerForPushNotificationsAsync } from "@/utils/notification";

// AccessToken 에 따라 로그인, 로그아웃 처리
type AuthContextType = {
  accessToken: string | null;
  isLoading: boolean;
  signIn: (accessToken: string, refreshToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// 기본값 설정
const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [devicePushToken, setDevicePushToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  // 1. 초기 로딩: Refresh Token으로 Access Token 발급 시도 (자동 로그인)
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          setDevicePushToken(token);
          console.log("Device Token 확보:", token);
        }
      } catch (err) {
        console.error("토큰 발급 실패:", err);
      }

      try {
        const storedRefreshToken = await getRefreshToken();

        if (storedRefreshToken) {
          // 백엔드에 Refresh Token을 보내고 새 Access Token을 요청하는 API 호출
          // POST /api/member/refresh -> TokenResponse 반환
          const response = await refresh(storedRefreshToken);

          await setRefreshToken(response.refreshToken);
          const newAccessToken = response.accessToken;
          setAccessToken(newAccessToken);
          // API 헤더에 기본 토큰 설정
          client.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        }
      } catch (error) {
        console.error("세션 복구 실패 (토큰 만료 등):", error);
        // 복구 실패 시 SecureStore 저장된 refreshToken 비우기 (로그아웃 처리)
        await removeRefreshToken();
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, []);
  // 이 useEffect는 로그인(signIn), 자동 로그인(restore), 토큰 발급 완료 시점마다 실행되어 동기화를 맞춥니다.
  useEffect(() => {
    const syncTokenToServer = async () => {
      if (accessToken && devicePushToken) {
        try {
          await registerPushToken(devicePushToken);
          console.log("서버에 푸시 토큰 등록 완료");
        } catch (error) {
          console.error("푸시 토큰 서버 등록 실패:", error);
        }
      }
    };
    syncTokenToServer();
  }, [accessToken, devicePushToken]);
  // 2. 리다이렉트 로직 (이전과 동일하지만 accessToken 변경되는 경우 실행)
  useEffect(() => {
    if (isLoading) return;

    const inPublicGroup = segments[0] === "login" || segments[0] === "signup" || segments[0] === "auth";

    // 1. 로그인이 안 되어 있는데, 로그인/회원가입 페이지가 아닌 곳(보호된 페이지)에 접근하려 할 때
    // -> 로그인 페이지로 쫓아냄
    if (!accessToken && !inPublicGroup) {
      router.replace("/login");
    }
    // 2. 이미 로그인을 했는데, 굳이 로그인/회원가입 페이지에 들어오려 할 때
    // -> 메인(Tabs)으로 돌려보냄
    else if (accessToken && inPublicGroup) {
      router.replace("/(tabs)");
    }
    // 3. 그 외의 경우 (정상 접근)
    // - 로그인 O + 보호된 페이지 (tabs, facility 등) -> 통과 (OK)
    // - 로그인 X + 로그인 페이지 -> 통과 (OK)
  }, [accessToken, segments, isLoading]);

  // 3. 로그인 처리
  const signIn = async (newAccessToken: string, newRefreshToken: string) => {
    try {
      await setRefreshToken(newRefreshToken); // SecureStore에 저장 (Refresh Token)
      setAccessToken(newAccessToken); // State(메모리)에 저장 (Access Token)
      client.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
    } catch (e) {
      console.error(e);
    }
  };

  // 4. 로그아웃 처리
  const signOut = async () => {
    try {
      // 로그아웃 전 서버에서 토큰 삭제 (알림 오지 않게 하기 위함)
      if (accessToken && devicePushToken) {
        await removePushToken();
      }
    } catch (e) {
      console.warn("서버 토큰 삭제 실패 (네트워크 오류 등):", e);
    } finally {
      // 서버 통신 실패 여부와 상관없이 클라이언트 로그아웃 진행
      await removeRefreshToken();
      setAccessToken(null);
      delete client.defaults.headers.common["Authorization"];
      router.replace("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ accessToken, isLoading, signIn, signOut }}>
      {isLoading ? null : children}
    </AuthContext.Provider>
  );
};
