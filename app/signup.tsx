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
import { ScrollView, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSignupForm } from "@/hooks/use-signup-form";

export default function SignupScreen() {
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    formData,
    updateFields,
    apartmentList,
    dongList,
    hoList,
    isVerified,
    onApartmentChange,
    onDongChange,
    onHoChange,
    handleVerify,
    handleSignup,
  } = useSignupForm();

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
            <CardTitle>회원가입</CardTitle>
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
                />
              </View>
              <View style={styles.field}>
                <Label>연락처 *</Label>
                <Input
                  value={formData.phone}
                  onChangeText={(val) => updateFields({ phone: val })}
                  editable={!isVerified}
                  style={isVerified ? styles.disabledInput : undefined}
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
                <View style={styles.field}>
                  <Label>이메일 *</Label>
                  <Input
                    value={formData.email}
                    onChangeText={(val) => updateFields({ email: val })}
                    autoCapitalize="none"
                  />
                </View>
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
                    회원가입 시 <Text style={styles.linkText}>서비스 이용약관</Text> 및{" "}
                    <Text style={styles.linkText}>개인정보 처리방침</Text>에 동의하는 것으로 간주됩니다.
                  </Text>
                </View>
                {/* 가입 완료 버튼 */}
                <Button onPress={() => handleSignup(() => router.replace("/login"))} style={styles.submitButton}>
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
