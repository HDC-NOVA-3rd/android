import { BASE_URL } from "@/api/client";
import { exchangeAuthCode, login } from "@/api/service/authService";
import { setMemberId } from "@/api/memberStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { styles } from "@/styles/login.styles";
import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// 웹 브라우저가 앱 내에서 닫히지 않고 남아있는 경우를 방지
WebBrowser.maybeCompleteAuthSession();
const BACKEND_URL = BASE_URL.replace("/api", ""); // BASE_URL에서 /api 부분 제거

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onOAuthLogin = async (provider: "google" | "naver") => {
    try {
      setIsLoading(true);
      // 1. 앱으로 돌아올 리다이렉트 URL 생성
      // Expo Go 개발 환경에서는 보통 'exp://IP:8081/--/' 형태가 됨
      const redirectUri = Linking.createURL("/");

      // 2. 백엔드 OAuth 인증 시작 URL 생성
      // redirect_uri 파라미터 포함
      const authUrl = `${BACKEND_URL}/oauth2/authorization/${provider}?redirect_uri=${redirectUri}`;

      // 3. 인앱 브라우저 열기
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      // 4. 결과 처리
      if (result.type === "success" && result.url) {
        // 돌아온 URL 파싱 (예: exp://...?status=LOGIN&token=abcde...)
        const { queryParams } = Linking.parse(result.url);
        // 에러 상황 처리 (백엔드 OAuthFailureHandler에서 보낸 error 파라미터 확인)
        if (queryParams?.status === "FAIL") {
          // queryParams.error가 배열일 수도 있으므로 처리
          const errorMsg = Array.isArray(queryParams.error) ? queryParams.error[0] : queryParams.error;
          Alert.alert("소셜 로그인 실패", errorMsg || "알 수 없는 오류가 발생했습니다.");
          return;
        }
        const code = queryParams?.code; // [핵심] 1회용 인증 코드

        if (!code) {
          Alert.alert("오류", "인증 코드를 받아오지 못했습니다.");
          return;
        }

        // 5. 인증 코드를 서버로 보내서 실제 토큰으로 교환 (POST 요청)
        const data = await exchangeAuthCode(code);

        // 6. 교환 결과에 따른 OAUTH 분기 처리
        // [CASE 1] 로그인 성공 (이미 가입된 회원)
        if (data.type === "LOGIN" && data.tokenResponse) {
          const { accessToken, refreshToken } = data.tokenResponse;
          await signIn(accessToken, refreshToken); // Context 업데이트 및 로그인 처리
          Alert.alert("성공", "소셜 로그인되었습니다.");
        }
        // [CASE 2] 회원가입 필요 (신규 회원)
        // registerToken을 가지고 회원가입 화면으로 이동
        else if (data.type === "REGISTER" && data.registerToken) {
          router.push({
            pathname: "/signup",
            params: { registerToken: data.registerToken },
          });
          Alert.alert("안내", "추가 정보를 입력하여 가입을 완료해주세요.");
        } else {
          throw new Error("서버 응답 형식이 올바르지 않습니다.");
        }
      }
      // 사용자가 브라우저를 닫거나 취소한 경우 (result.type === 'cancel' or 'dismiss')
      else {
        console.log("OAuth Login Cancelled");
      }
    } catch (error: any) {
      console.error("OAuth Error:", error);
      const errorMessage = error.response?.data?.message || "소셜 로그인 중 문제가 발생했습니다.";
      Alert.alert("오류", errorMessage);
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  const handleSubmit = async () => {
    if (!loginId || !password) {
      Alert.alert("오류", "아이디과 비밀번호를 입력해주세요.");
      return;
    }
    await onLogin(loginId, password);
  };

  // [일반 로그인 핸들러]
  const onLogin = async (id: string, pass: string) => {
    try {
      setIsLoading(true); // 로딩 시작

      // 1. API 호출
      const response = await login({ loginId: id, password: pass });
      console.log("로그인 성공:", response);

      await setMemberId(response.memberId);
      // 2. 토큰 저장 및 자동 로그인 처리
      if (response.accessToken) {
        await signIn(response.accessToken, response.refreshToken);
      }
    } catch (error: any) {
      console.error("로그인 실패:", error);

      // [핵심] 백엔드 에러 코드에 따른 분기 처리
      // client.js에서 401 에러를 던져주면 여기서 잡습니다.
      const errorCode = error.response?.data?.code;

      // 백엔드에서 보내준 에러 메시지가 있다면 표시, 없다면 기본 메시지
      if (errorCode === "ADMIN_LOGIN_FAILED") {
        Alert.alert("로그인 실패", "아이디 또는 비밀번호가 일치하지 않습니다.");
      }
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  // 버튼 클릭 핸들러 추가
  const handleFindId = () => {
    router.push("/auth/findID");
  };

  const handleResetPassword = () => {
    router.push("/auth/resetPW");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoTitle}>커뮤니티 시설 예약</Text>
          <Text style={styles.logoSubtitle}>아파트 입주민 전용 서비스</Text>
        </View>

        <Card>
          <CardHeader>
            <CardTitle>로그인</CardTitle>
            <CardDescription>계정에 로그인하여 서비스를 이용하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <View style={styles.formSpace}>
              <View>
                <Label>아이디</Label>
                <Input
                  placeholder="아이디를 입력하세요"
                  value={loginId}
                  onChangeText={setLoginId}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading} // 로딩 중 입력 방지
                />
              </View>

              <View>
                <Label>비밀번호</Label>
                <Input
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading} // 로딩 중 입력 방지
                />
              </View>

              <Button onPress={handleSubmit} style={styles.loginButton} disabled={isLoading}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather name="log-in" size={16} color="white" />
                  <Text style={styles.buttonText}>{isLoading ? "로그인 중..." : "로그인"}</Text>
                </View>
              </Button>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 12,
                gap: 12,
              }}
            >
              <Pressable onPress={handleFindId}>
                <Text style={{ fontSize: 13, color: "#666" }}>아이디 찾기</Text>
              </Pressable>

              <View style={{ width: 1, height: 12, backgroundColor: "#DDD" }} />

              <Pressable onPress={handleResetPassword}>
                <Text style={{ fontSize: 13, color: "#666" }}>비밀번호 재설정</Text>
              </Pressable>
            </View>

            <View style={styles.dividerContainer}>
              <Separator />
              <View style={styles.orLabelContainer}>
                <Text style={styles.orLabel}>또는</Text>
              </View>
            </View>

            <View style={styles.socialButtons}>
              <Button variant="outline" onPress={() => onOAuthLogin("google")}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Image
                    source={require("@/assets/images/google.png")}
                    style={{ width: 18, height: 18 }}
                    resizeMode="contain"
                  />
                  <Text>Google 로그인</Text>
                </View>
              </Button>

              <Button
                style={{ backgroundColor: "#03C75A", borderColor: "#03C75A" }}
                onPress={() => onOAuthLogin("naver")}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ color: "white", fontWeight: "bold" }}>N</Text>
                  <Text style={{ color: "white" }}>네이버 로그인</Text>
                </View>
              </Button>
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>아직 계정이 없으신가요?</Text>
              <Button
                variant="link"
                onPress={() => router.push("/signup")}
                style={{ height: "auto", paddingHorizontal: 0 }}
              >
                <Text style={styles.signupLink}>회원가입</Text>
              </Button>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
