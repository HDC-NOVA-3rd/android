import { GestureHandlerRootView } from "react-native-gesture-handler";

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { AuthProvider } from "../context/AuthContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // 알림 클릭 리스너 설정
  useEffect(() => {
    // [공통 함수] 알림 객체 받아서 URL로 이동
    const handleNotification = (notification: Notifications.Notification) => {
      const url = notification.request.content.data?.url;
      // url이 문자열 형태로 왔을 때만 이동 (예: "/member/notifications")
      if (typeof url === "string") {
        console.log("알림 라우팅 이동:", url);
        router.push(url);
      }
    };

    // 1. [Cold Start] 앱이 꺼진 상태에서 알림 눌러서 켰을 때
    const checkInitialNotification = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response?.notification) {
        handleNotification(response.notification);
      }
    };
    checkInitialNotification();

    // 2. [Foreground/Background] 앱이 켜져 있을 때 알림 눌렀을 때
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotification(response.notification);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    // Wrap your app with GestureHandlerRootView
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ title: "회원가입" }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="room/[roomId]" options={{ title: "방" }} />

            <Stack.Screen name="facility/[facilityId]" options={{ title: "시설 상세", headerShown: false }} />
            <Stack.Screen name="facility/reservation/[spaceId]" options={{ title: "예약하기", headerShown: false }} />

            <Stack.Screen name="member/changePW" options={{ title: "비밀번호 변경" }} />
            <Stack.Screen name="member/reservations" options={{ title: "예약 내역", headerShown: false }} />

            <Stack.Screen name="notice/[noticeId]" options={{ title: "공지사항 상세", headerShown: false }} />

            <Stack.Screen 
              name="complaint/[complaintId]" 
              options={{ title: "민원 상세", headerShown: false }} 
            />
            <Stack.Screen 
              name="complaint/create" 
              options={{ title: "민원 신청", headerShown: false, presentation: "modal" }} 
            />

            <Stack.Screen name="auth/findID" options={{ title: "아이디 찾기" }} />
            <Stack.Screen name="auth/resetPW" options={{ title: "비밀번호 재설정" }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
