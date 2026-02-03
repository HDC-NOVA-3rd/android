import { resetPassword } from "@/api/service/authService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { styles } from "@/styles/resetPW.styles";
import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Clipboard, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatPhoneNumber } from "@/utils/format";

export default function ResetPWScreen() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; tempPassword?: string } | null>(null);

  const handleSubmit = async () => {
    if (!loginId || !name || !phoneNumber) {
      Alert.alert("오류", "모든 정보를 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      setResult(null);

      const response = await resetPassword(loginId, name, phoneNumber);

      // ResetPWResponse: { tempPassword: "...", message: "..." }
      if (response) {
        setResult({
          message: response.message,
          tempPassword: response.tempPassword,
        });
      }
    } catch (error: any) {
      console.error("비밀번호 재설정 실패:", error);
      const errorMessage = error.response?.data?.message || "일치하는 회원 정보가 없습니다.";
      Alert.alert("실패", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.tempPassword) {
      Clipboard.setString(result.tempPassword);
      Alert.alert("복사 완료", "임시 비밀번호가 클립보드에 복사되었습니다.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoTitle}>비밀번호 재설정</Text>
          <Text style={styles.logoSubtitle}>본인 확인 후 임시 비밀번호를 발급합니다</Text>
        </View>

        <Card>
          <CardHeader>
            <CardTitle>정보 입력</CardTitle>
            <CardDescription>아이디, 이름, 휴대폰 번호를 입력하세요</CardDescription>
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
                  editable={!isLoading}
                />
              </View>

              <View>
                <Label>이름</Label>
                <Input
                  placeholder="이름을 입력하세요"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>

              <View>
                <Label>휴대폰 번호</Label>
                <Input
                  value={formatPhoneNumber(phoneNumber)}
                  onChangeText={(val) => {
                    const onlyNumbers = val.replace(/[^0-9]/g, "");
                    setPhoneNumber(onlyNumbers);
                  }}
                  keyboardType="number-pad"
                  maxLength={13} // 하이픈 포함 최대 길이 제한 (UX용)
                  editable={!isLoading}
                  placeholder="전화번호를 입력하세요"
                />
              </View>

              <Button onPress={handleSubmit} style={styles.submitButton} disabled={isLoading}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather name="refresh-cw" size={16} color="white" />
                  <Text style={styles.buttonText}>{isLoading ? "확인 중..." : "비밀번호 재설정"}</Text>
                </View>
              </Button>
            </View>

            {result && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>결과 확인</Text>
                <Text style={styles.resultText}>{result.message}</Text>
                {result.tempPassword && (
                  <>
                    <Text style={styles.tempPassword}>{result.tempPassword}</Text>
                    <Button variant="outline" onPress={copyToClipboard} style={{ marginTop: 12 }}>
                      <Text>비밀번호 복사하기</Text>
                    </Button>
                  </>
                )}
              </View>
            )}

            <View style={styles.backToLoginContainer}>
              <Text style={styles.backToLoginText}>로그인 화면으로 돌아가시겠습니까?</Text>
              <Button
                variant="link"
                onPress={() => router.replace("/login")}
                style={{ height: "auto", paddingHorizontal: 0, marginTop: 4 }}
              >
                <Text style={styles.backToLoginLink}>로그인하기</Text>
              </Button>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
