import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { styles } from "@/styles/login.styles";
import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const onOAuthLogin = (provider: "google" | "naver") => {
    Alert.alert("OAuth Login", `${provider} login 은 지원되지 않고있습니다.`);
  };

  const handleSubmit = () => {
    if (!loginId || !password) {
      Alert.alert("오류", "아이디과 비밀번호를 입력해주세요.");
      return;
    }
    onLogin(loginId, password);
  };

  const onLogin = (loginId: string, pass: string) => {
    // Mock login logic
    console.log("Login with:", loginId, pass);
    router.replace("/(tabs)");
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
                />
              </View>

              <View>
                <Label>비밀번호</Label>
                <Input
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <Button onPress={handleSubmit} style={styles.loginButton}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather name="log-in" size={16} color="white" />
                  <Text style={styles.buttonText}>로그인</Text>
                </View>
              </Button>
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
              <Text style={styles.signupText}>아직 계정이 없으신가요? </Text>
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
