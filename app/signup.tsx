import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useSignupForm } from "@/hooks/use-signup-form";
import { styles } from "@/styles/signup.styles";
import { formatPhoneNumber } from "@/utils/format";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { registerToken } = params;
  // [추가] 소셜 회원가입 여부 판단 플래그 (토큰이 있으면 소셜)
  const isSocialSignup = !!registerToken;
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    formData,
    apartmentList,
    dongList,
    hoList,
    isVerified,
    updateFields,
    onApartmentChange,
    onDongChange,
    onHoChange,
    handleVerify,
    handleSignup,
  } = useSignupForm();

  // [변경 4] 토큰 해독 및 폼 데이터 초기화 로직
  useEffect(() => {
    if (registerToken) {
      try {
        // 1. 토큰 해독
        const decoded: any = jwtDecode(registerToken as string);
        console.log("Social Signup Info:", decoded);

        // 2. 폼 데이터 업데이트
        // 백엔드 JwtProvider에서 넣은 키값: email, name, provider, providerId
        updateFields({
          name: decoded.name || "", // 실명 (입주민 인증용)
          email: decoded.email || "", // 이메일 (계정 정보용)
          // 주의: useSignupForm의 formData 구조에 아래 필드들이 정의되어 있어야 합니다.
          // 만약 없다면 hooks/use-signup-form.ts 에 필드를 추가해야 합니다.
          registerToken: registerToken as string,
          login_type: decoded.provider,
          providerId: decoded.providerId,
          phone: decoded.phone || "", // 네이버에서 받은 0108485...
          birthDate: decoded.birthDate || "", // 1999-07-21
        });
      } catch (error) {
        console.error("Token decode error:", error);
      }
    }
  }, [registerToken]);

  // 날짜 선택 UI 핸들러 (View 전용 로직)
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      updateFields({ birthDate: `${year}-${month}-${day}` });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        // iOS는 padding으로 밀어올리고, Android는 height로 높이 조절
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        // 헤더나 상단 여백이 있다면 그만큼 오프셋을 줘야 정확히 밀어올려짐 (필요시 조절)
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* 헤더 영역 생략 (기존과 동일) */}
        <View style={styles.header}>
          <Button variant="ghost" onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={16} color="black" style={{ marginRight: 8 }} />
            <Text>뒤로가기</Text>
          </Button>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card>
            <CardHeader>
              <CardTitle>{isSocialSignup ? "소셜 회원가입" : "회원가입"}</CardTitle>
              <CardDescription>
                {isVerified ? "계정 정보를 입력하여 가입을 완료하세요" : "입주민 정보를 먼저 인증해주세요"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Step 1: 거주지 정보 */}
              <View style={styles.section}>
                {/* ... 섹션 헤더 ... */}

                {/* 아파트 선택 */}
                <View style={styles.field}>
                  <Label>아파트 *</Label>
                  {isVerified ? (
                    <Input value={formData.apartmentName} editable={false} style={styles.disabledInput} />
                  ) : (
                    // onValueChange에 Hook 함수 연결
                    <Select value={formData.apartmentName} onValueChange={onApartmentChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="아파트를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {apartmentList.map((apt) => (
                          <SelectItem key={apt.id} value={apt.name || String(apt.id)}>
                            {apt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </View>

                {/* 동/호수 선택 */}
                <View style={styles.row}>
                  <View style={styles.halfField}>
                    <Label>동 *</Label>
                    {isVerified ? (
                      <Input value={formData.dongNo} editable={false} style={styles.disabledInput} />
                    ) : (
                      <Select value={formData.dongNo} onValueChange={onDongChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="동 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {dongList.map((dong) => (
                            <SelectItem key={dong.id} value={dong.dongNo}>
                              {dong.dongNo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </View>
                  <View style={styles.halfField}>
                    <Label>호수 *</Label>
                    {isVerified ? (
                      <Input value={formData.hoNo} editable={false} style={styles.disabledInput} />
                    ) : (
                      // onHoChange 연결
                      <Select value={formData.hoNo} onValueChange={onHoChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="호 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {hoList.map((ho) => (
                            <SelectItem key={ho.id} value={ho.hoNo}>
                              {ho.hoNo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </View>
                </View>

                {/* 이름/연락처 입력 (updateFields 사용) */}
                <View style={styles.field}>
                  <Label>이름 *</Label>
                  <Input
                    value={formData.name}
                    onChangeText={(val) => updateFields({ name: val })}
                    editable={!isVerified}
                    style={isVerified ? styles.disabledInput : undefined}
                    placeholder="이름 입력"
                  />
                </View>
                <View style={styles.field}>
                  <Label>연락처 *</Label>
                  <Input
                    value={formatPhoneNumber(formData.phone)}
                    onChangeText={(val) => {
                      const onlyNumbers = val.replace(/[^0-9]/g, "");
                      updateFields({ phone: onlyNumbers });
                    }}
                    editable={!isVerified}
                    style={isVerified ? styles.disabledInput : undefined}
                    keyboardType="number-pad" // 숫자 키패드 제공
                    maxLength={13} // 하이픈 포함 최대 길이 제한 (UX용)
                    placeholder="전화번호 입력"
                  />
                </View>
                {!isVerified && (
                  <Button onPress={handleVerify} style={styles.verifyButton}>
                    <Text style={styles.buttonText}>입주민 인증하기</Text>
                  </Button>
                )}
              </View>

              {isVerified && <Separator style={{ marginVertical: 24 }} />}

              {/* Step 2: 계정 정보 */}
              {isVerified && (
                <View style={styles.section}>
                  {/* [변경] 일반 회원가입일 때만 ID/PW 입력창 표시 */}
                  {!isSocialSignup && (
                    <>
                      <View style={styles.field}>
                        <Label>아이디 *</Label>
                        <Input
                          value={formData.loginId}
                          onChangeText={(val) => updateFields({ loginId: val })}
                          autoCapitalize="none"
                        />
                      </View>
                      <View style={styles.field}>
                        <Label>비밀번호 *</Label>
                        <Input
                          value={formData.password}
                          onChangeText={(val) => updateFields({ password: val })}
                          autoCapitalize="none"
                          secureTextEntry
                        />
                      </View>
                      <View style={styles.field}>
                        <Label>비밀번호 확인*</Label>
                        <Input
                          value={formData.confirmPassword}
                          onChangeText={(val) => updateFields({ confirmPassword: val })}
                          autoCapitalize="none"
                          secureTextEntry
                        />
                      </View>
                    </>
                  )}
                  {/* 이메일 (소셜일 경우 자동입력 및 수정불가) */}
                  <View style={styles.field}>
                    <Label>이메일 *</Label>
                    <Input
                      value={formData.email}
                      onChangeText={(val) => updateFields({ email: val })}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      // 소셜 가입이면 수정 불가능하게 막음 (토큰 정보 신뢰)
                      editable={!isSocialSignup}
                      style={isSocialSignup ? styles.disabledInput : undefined}
                    />
                  </View>
                  {/* 생년월일 (공통) */}
                  <View style={styles.field}>
                    <Label>생년월일 *</Label>
                    <Pressable onPress={() => setShowDatePicker(true)}>
                      <View pointerEvents="none">
                        <Input placeholder="YYYY-MM-DD" value={formData.birthDate} editable={false} />
                      </View>
                    </Pressable>
                    {showDatePicker && (
                      <DateTimePicker
                        value={formData.birthDate ? new Date(formData.birthDate) : new Date()}
                        mode="date"
                        onChange={onDateChange}
                      />
                    )}
                  </View>
                  <View style={styles.termsContainer}>
                    <Text style={styles.termsText}>
                      회원가입 시 <Text style={styles.linkText}>서비스 이용약관</Text>및
                      <Text style={styles.linkText}>개인정보 처리방침</Text>에 동의하는 것으로 간주됩니다.
                    </Text>
                  </View>
                  <Button onPress={() => handleSignup(() => router.replace("/"))} style={styles.submitButton}>
                    <Text style={styles.buttonText}>{isSocialSignup ? "소셜 회원가입 완료" : "회원가입 완료"}</Text>
                  </Button>{" "}
                </View>
              )}
            </CardContent>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
