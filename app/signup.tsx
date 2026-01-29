import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { styles } from "@/styles/signup.styles";
import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// MockUp Data for Apartments
const apartments = ["래미안 아파트", "힐스테이트 아파트", "자이 아파트", "푸르지오 아파트", "아크로 아파트"];

export default function SignupScreen() {
  const router = useRouter();

  // Step 1: 인증 상태 관리 (false: 인증 전, true: 인증 완료)
  const [isVerified, setIsVerified] = useState(false);

  // 인증 후 서버로부터 받은 residentId 저장 (SignupRequest DTO에 필요)
  const [residentId, setResidentId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    // Step 1: 입주민 인증 데이터 (ResidentRequest)
    apartment: "",
    dong: "",
    hosu: "",
    name: "",
    phone: "",

    // Step 2: 회원 가입 데이터 (SignupRequest 추가 데이터)
    loginId: "",
    password: "",
    confirmPassword: "",
    email: "",
    birthDate: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 입주민 인증 (/api/resident/verify)
  const handleVerify = async () => {
    if (!formData.apartment || !formData.dong || !formData.hosu || !formData.name || !formData.phone) {
      Alert.alert("안내", "입주민 인증을 위해 거주지 정보와 개인 정보를 모두 입력해주세요.");
      return;
    }

    try {
      console.log("Verify Request:", {
        // 실제로는 아파트/동/호를 통해 DB의 hoId(Long)를 찾는 로직이 필요.
        // 현재는 UI 데모를 위해 가상의 hoId를 전송한다고 가정합니다.
        hoId: 1234,
        name: formData.name,
        phone: formData.phone,
      });

      // Mock Logic (테스트용)
      setResidentId(999); // 가상의 residentId
      setIsVerified(true);
      Alert.alert("인증 성공", "입주민 정보가 확인되었습니다.\n나머지 계정 정보를 입력해주세요.");
    } catch (error) {
      Alert.alert("오류", "입주민 정보를 찾을 수 없습니다.");
    }
  };

  // =회원가입 (/api/member/signup)
  const handleSignup = async () => {
    if (!formData.loginId || !formData.password || !formData.email || !formData.birthDate) {
      Alert.alert("오류", "계정 정보를 모두 입력해주세요.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const signupPayload = {
        residentId: residentId, // Step 1에서 획득
        loginId: formData.loginId,
        password: formData.password,
        email: formData.email,
        name: formData.name, // Step 1 데이터 재사용
        phoneNumber: formData.phone, // Step 1 데이터 재사용
        birthDate: formData.birthDate, // YYYY-MM-DD 형식 필요
        loginType: "NORMAL",
        profileImg: null,
      };

      console.log("Signup Request Payload:", signupPayload);

      Alert.alert("가입 완료", "회원가입이 성공적으로 완료되었습니다.", [
        { text: "로그인하러 가기", onPress: () => router.replace("/login") }, // back() 대신 login으로 이동
      ]);
    } catch (error) {
      Alert.alert("오류", "회원가입 중 문제가 발생했습니다.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Button variant="ghost" onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={16} color="black" style={{ marginRight: 8 }} />
          <Text>뒤로가기</Text>
        </Button>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <CardHeader>
            <CardTitle>회원가입</CardTitle>
            <CardDescription>
              {isVerified ? "계정 정보를 입력하여 가입을 완료하세요" : "입주민 정보를 먼저 인증해주세요"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Step 1: 거주지 정보 (인증 섹션) */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>거주지 및 개인 정보</Text>
                {isVerified && <Feather name="check-circle" size={18} color="green" />}
              </View>

              <View style={styles.field}>
                <Label>아파트 *</Label>
                {isVerified ? (
                  <Input
                    value={formData.apartment}
                    editable={false} // 수정 불가
                    style={styles.disabledInput} // 회색 배경 적용
                  />
                ) : (
                  <Select value={formData.apartment} onValueChange={(val) => handleChange("apartment", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="아파트를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {apartments.map((apt) => (
                        <SelectItem key={apt} value={apt}>
                          {apt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </View>

              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Label>동 *</Label>
                  <Input
                    placeholder="101동"
                    value={formData.dong}
                    onChangeText={(val) => handleChange("dong", val)}
                    editable={!isVerified} // 인증 완료 시 수정 불가
                    style={isVerified ? styles.disabledInput : undefined}
                  />
                </View>
                <View style={styles.halfField}>
                  <Label>호수 *</Label>
                  <Input
                    placeholder="1201호"
                    value={formData.hosu}
                    onChangeText={(val) => handleChange("hosu", val)}
                    editable={!isVerified}
                    style={isVerified ? styles.disabledInput : undefined}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Label>이름 *</Label>
                <Input
                  placeholder="홍길동"
                  value={formData.name}
                  onChangeText={(val) => handleChange("name", val)}
                  editable={!isVerified}
                  style={isVerified ? styles.disabledInput : undefined}
                />
              </View>

              <View style={styles.field}>
                <Label>연락처 *</Label>
                <Input
                  placeholder="010-1234-5678"
                  value={formData.phone}
                  onChangeText={(val) => handleChange("phone", val)}
                  keyboardType="phone-pad"
                  editable={!isVerified}
                  style={isVerified ? styles.disabledInput : undefined}
                />
              </View>

              {/* 인증 버튼 (인증 전일 때만 보임) */}
              {!isVerified && (
                <Button onPress={handleVerify} style={styles.verifyButton}>
                  <Text style={styles.buttonText}>입주민 인증하기</Text>
                </Button>
              )}
            </View>

            {isVerified && <Separator style={{ marginVertical: 24 }} />}

            {/* Step 2: 계정 정보 (가입 섹션 - 인증 후에만 보임) */}
            {isVerified && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>계정 정보 생성</Text>

                <View style={styles.field}>
                  <Label>아이디 *</Label>
                  <Input
                    placeholder="영문/숫자 조합"
                    value={formData.loginId}
                    onChangeText={(val) => handleChange("loginId", val)}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.row}>
                  <View style={styles.halfField}>
                    <Label>비밀번호 *</Label>
                    <Input
                      placeholder="6자 이상"
                      value={formData.password}
                      onChangeText={(val) => handleChange("password", val)}
                      secureTextEntry
                    />
                  </View>
                  <View style={styles.halfField}>
                    <Label>비밀번호 확인 *</Label>
                    <Input
                      placeholder="재입력"
                      value={formData.confirmPassword}
                      onChangeText={(val) => handleChange("confirmPassword", val)}
                      secureTextEntry
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <Label>이메일 *</Label>
                  <Input
                    placeholder="example@email.com"
                    value={formData.email}
                    onChangeText={(val) => handleChange("email", val)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.field}>
                  <Label>생년월일 *</Label>
                  <Input
                    placeholder="YYYY-MM-DD"
                    value={formData.birthDate}
                    onChangeText={(val) => handleChange("birthDate", val)}
                  />
                </View>

                {/* 약관 동의 문구 */}
                <View style={styles.termsContainer}>
                  <Text style={styles.termsText}>
                    가입 완료 시 <Text style={styles.linkText}>서비스 이용약관</Text>에 동의하게 됩니다.
                  </Text>
                </View>

                {/* 최종 가입 버튼 */}
                <Button onPress={handleSignup} style={styles.submitButton}>
                  <Feather name="user-plus" size={18} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.buttonText}>회원가입 완료</Text>
                </Button>
              </View>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
