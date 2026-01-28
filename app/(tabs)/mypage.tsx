import React from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User } from "@/app/types/user";
import { styles } from "@/styles/tabs/mypage.styles";

// Mock User Data
const mockUser: User = {
  id: "1",
  email: "hong@example.com",
  name: "홍길동",
  loginMethod: "google",
  phone: "010-1234-5678",
  birthDate: "1990-01-01",
  apartment: "래미안 아파트",
  dong: "101동",
  hosu: "1201호",
};

export default function MyPageScreen() {
  const router = useRouter();
  const user = mockUser; // In real app, get from context/store

  const onLogout = () => {
    Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: () => {
          // Clear session here
          router.replace("/login");
        },
      },
    ]);
  };

  const getLoginMethodBadge = (method?: string) => {
    switch (method) {
      case "google":
        return (
          <Badge variant="secondary" style={styles.googleBadge}>
            <Text style={styles.googleBadgeText}>Google 계정</Text>
          </Badge>
        );
      case "naver":
        return (
          <Badge variant="secondary" style={styles.naverBadge}>
            <Text style={styles.naverBadgeText}>네이버 계정</Text>
          </Badge>
        );
      case "email":
      default:
        return (
          <Badge variant="secondary">
            <Text>일반 계정</Text>
          </Badge>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <View style={styles.profileHeader}>
              <View style={styles.profileInfo}>
                <View style={styles.avatar}>
                  <Feather name="user" size={32} color="#2563eb" />
                </View>
                <View>
                  <CardTitle style={{ fontSize: 20 }}>{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                  <View style={{ marginTop: 8 }}>{getLoginMethodBadge(user.loginMethod)}</View>
                </View>
              </View>
              <Button variant="outline" size="sm">
                <Feather name="edit-2" size={14} color="black" style={{ marginRight: 6 }} />
                <Text>수정</Text>
              </Button>
            </View>
          </CardHeader>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>개인 정보</CardTitle>
            <CardDescription>회원님의 기본 정보입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <View style={styles.grid}>
              <View style={styles.infoItem}>
                <Feather name="mail" size={20} color="#6b7280" />
                <View>
                  <Text style={styles.infoLabel}>이메일</Text>
                  <Text style={styles.infoValue}>{user.email}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Feather name="phone" size={20} color="#6b7280" />
                <View>
                  <Text style={styles.infoLabel}>연락처</Text>
                  <Text style={styles.infoValue}>{user.phone}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Feather name="calendar" size={20} color="#6b7280" />
                <View>
                  <Text style={styles.infoLabel}>생년월일</Text>
                  <Text style={styles.infoValue}>{user.birthDate}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Feather name="user" size={20} color="#6b7280" />
                <View>
                  <Text style={styles.infoLabel}>이름</Text>
                  <Text style={styles.infoValue}>{user.name}</Text>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Residence Information */}
        <Card>
          <CardHeader>
            <CardTitle>거주지 정보</CardTitle>
            <CardDescription>현재 거주하시는 아파트 정보입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <View style={styles.residenceContainer}>
              <View style={styles.aptInfo}>
                <FontAwesome name="building" size={24} color="#2563eb" style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.aptLabel}>아파트</Text>
                  <Text style={styles.aptValue}>{user.apartment}</Text>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.residenceItem}>
                  <Feather name="home" size={20} color="#6b7280" />
                  <View>
                    <Text style={styles.infoLabel}>동</Text>
                    <Text style={styles.residenceValue}>{user.dong}</Text>
                  </View>
                </View>

                <View style={styles.residenceItem}>
                  <Feather name="home" size={20} color="#6b7280" />
                  <View>
                    <Text style={styles.infoLabel}>호수</Text>
                    <Text style={styles.residenceValue}>{user.hosu}</Text>
                  </View>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>계정 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.settingsList}>
              <Button variant="outline" style={styles.settingButton}>
                <Feather name="edit-2" size={16} color="black" style={styles.settingIcon} />
                <Text>프로필 수정</Text>
              </Button>
              <Button variant="outline" style={styles.settingButton}>
                <Feather name="mail" size={16} color="black" style={styles.settingIcon} />
                <Text>이메일 변경</Text>
              </Button>
              <Button variant="outline" style={styles.settingButton}>
                <Feather name="phone" size={16} color="black" style={styles.settingIcon} />
                <Text>연락처 변경</Text>
              </Button>
              <Separator />
              <Button variant="destructive" style={styles.settingButton} onPress={onLogout}>
                <Feather name="log-out" size={16} color="white" style={styles.settingIcon} />
                <Text style={{ color: "white" }}>로그아웃</Text>
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>문의사항이 있으시면 관리사무소로 연락해주세요</Text>
          <Text style={[styles.footerText, { marginTop: 4 }]}>📞 1588-0000</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
