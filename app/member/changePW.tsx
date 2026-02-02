import { changePassword } from "@/api/service/memberService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { styles } from "@/styles/changePW.styles";
import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChangePWScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("오류", "모든 정보를 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("오류", "새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert("오류", "새 비밀번호는 현재 비밀번호와 달라야 합니다.");
      return;
    }

    try {
      setIsLoading(true);
      
      await changePassword(currentPassword, newPassword);
      
      Alert.alert("성공", "비밀번호가 변경되었습니다.", [
        {
          text: "확인",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("비밀번호 변경 실패:", error);
      const errorMessage = error.response?.data?.message || "비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.";
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
          <Text style={styles.logoTitle}>비밀번호 변경</Text>
          <Text style={styles.logoSubtitle}>계정을 안전하게 보호하세요</Text>
        </View>

        <Card>
          <CardHeader>
            <CardTitle>비밀번호 변경</CardTitle>
            <CardDescription>현재 비밀번호와 새로운 비밀번호를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <View style={styles.formSpace}>
              <View>
                <Label>현재 비밀번호</Label>
                <Input
                  placeholder="현재 비밀번호를 입력하세요"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              <View>
                <Label>새 비밀번호</Label>
                <Input
                  placeholder="새로운 비밀번호를 입력하세요"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              <View>
                <Label>새 비밀번호 확인</Label>
                <Input
                  placeholder="새로운 비밀번호를 다시 입력하세요"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              <Button onPress={handleSubmit} style={styles.submitButton} disabled={isLoading}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather name="check-circle" size={16} color="white" />
                  <Text style={styles.buttonText}>{isLoading ? "변경 중..." : "비밀번호 변경"}</Text>
                </View>
              </Button>
            </View>

            <View style={styles.backContainer}>
              <Button
                variant="link"
                onPress={() => router.back()}
                style={{ height: "auto", paddingHorizontal: 0 }}
              >
                <Text style={styles.backLink}>취소하고 돌아가기</Text>
              </Button>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
