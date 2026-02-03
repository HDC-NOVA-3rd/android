import client from "@/api/client";
import { refresh } from "@/api/service/authService";
import { getRefreshToken, removeRefreshToken, setRefreshToken } from "@/api/tokenStorage";
import { useRouter, useSegments } from "expo-router";
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

  // 2. 리다이렉트 로직 (이전과 동일하지만 accessToken 감지해 경로 변경)
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
