import client from "@/api/client";
import { getRefreshToken, removeRefreshToken, setRefreshToken } from "@/api/tokenStorage";
import { useRouter, useSegments } from "expo-router";
import { refresh } from "@/api/service/authService";
import React, { createContext, useContext, useEffect, useState } from "react";

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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  // 1. 초기 로딩: Refresh Token으로 Access Token 발급 시도 (자동 로그인)
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedRefreshToken = await getRefreshToken();

        if (storedRefreshToken) {
          // 백엔드에 Refresh Token을 보내고 새 Access Token을 요청하는 API 호출
          // 예: POST /auth/refresh { refreshToken: ... }
          // 여기서는 가상의 함수 fetchNewAccessToken을 사용한다고 가정합니다.
          const response = await refresh(storedRefreshToken);
          const newAccessToken = response.accessToken;

          setAccessToken(newAccessToken);
          // API 헤더에 기본 토큰 설정 (선택 사항)
          client.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        }
      } catch (error) {
        console.error("세션 복구 실패 (토큰 만료 등):", error);
        // 복구 실패 시 스토리지 비우기 (로그아웃 처리)
        await removeRefreshToken();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // 2. 리다이렉트 로직 (이전과 동일하지만 accessToken 감지)
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(tabs)";
    const inPublicGroup = segments[0] === "login" || segments[0] === "signup";

    if (!accessToken && !inPublicGroup) {
      router.replace("/login");
    } else if (accessToken && !inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [accessToken, segments, isLoading]);

  // 3. 로그인 함수
  const signIn = async (newAccessToken: string, newRefreshToken: string) => {
    try {
      await setRefreshToken(newRefreshToken); // SecureStore에 저장 (Refresh Token)
      setAccessToken(newAccessToken); // State(메모리)에 저장 (Access Token)
      client.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
    } catch (e) {
      console.error(e);
    }
  };

  // 4. 로그아웃 함수
  const signOut = async () => {
    await removeRefreshToken(); // SecureStore 삭제
    setAccessToken(null); // State 초기화
    delete client.defaults.headers.common["Authorization"];
    router.replace("/login"); // 강제 이동
  };

  return <AuthContext.Provider value={{ accessToken, isLoading, signIn, signOut }}>{children}</AuthContext.Provider>;
};
