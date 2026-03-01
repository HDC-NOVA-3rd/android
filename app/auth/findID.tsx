import { findId } from "@/api/service/authService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { styles } from "@/styles/findId.styles";
import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatPhoneNumber } from "@/utils/format";

export default function FindIdScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name || !phoneNumber) {
      Alert.alert("오류", "이름과 휴대폰 번호를 모두 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      setResultMessage(null);

      const response = await findId(name, phoneNumber);

      // FindIdResponse: { loginType: "...", message: "..." }
      if (response && response.message) {
        setResultMessage(response.message);
      } else {
        setResultMessage("회원 정보를 찾을 수 없습니다.");
      }
    } catch (error: any) {
      console.error("아이디 찾기 실패:", error);
      const errorMessage = error.response?.data?.message || "일치하는 회원 정보가 없습니다.";
      Alert.alert("실패", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoTitle}>아이디 찾기</Text>
          <Text style={styles.logoSubtitle}>가입 시 등록한 정보를 입력해주세요</Text>
        </View>

        <Card>
          <CardHeader>
            <CardTitle>정보 입력</CardTitle>
            <CardDescription>이름과 휴대폰 번호로 아이디를 찾습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <View style={styles.formSpace}>
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
                  keyboardType="number-pad" // 숫자 키패드 제공
                  maxLength={13} // 하이픈 포함 최대 길이 제한 (UX용)
                  editable={!isLoading}
                  placeholder="전화번호를 입력하세요"
                />
              </View>

              <Button onPress={handleSubmit} style={styles.submitButton} disabled={isLoading}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather name="search" size={16} color="white" />
                  <Text style={styles.buttonText}>{isLoading ? "찾는 중..." : "아이디 찾기"}</Text>
                </View>
              </Button>
            </View>

            {resultMessage && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>조회 결과</Text>
                <Text style={styles.resultText}>{resultMessage}</Text>
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
