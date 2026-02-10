import { GestureHandlerRootView } from "react-native-gesture-handler";

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "../context/AuthContext";
export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // Wrap your app with GestureHandlerRootView
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ title: "회원가입" }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            <Stack.Screen
              name="facility/[facilityId]"
              options={{ title: "시설 상세", headerShown: false }}
            />
            <Stack.Screen
              name="facility/reservation/[spaceId]"
              options={{ title: "예약하기", headerShown: false }}
            />

            <Stack.Screen name="member/changePW" options={{ title: "비밀번호 변경" }} />
            <Stack.Screen
              name="member/reservations"
              options={{ title: "예약 내역", headerShown: false }}
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
