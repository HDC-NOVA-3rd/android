import { getMyApartmentInfo, getMyInfo } from "@/api/service/memberService";
import { User } from "@/app/types/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { styles } from "@/styles/tabs/mypage.styles";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyPageScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [profileData, apartmentData] = await Promise.all([getMyInfo(), getMyApartmentInfo()]);

      // Assuming the API responses map to the User interface fields
      // Adjust field mapping as necessary based on actual API response structure
      console.log("Profile Data:", profileData);
      console.log("Apartment Data:", apartmentData);
      const userData: User = {
        ...profileData,
        ...apartmentData,
      };
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user data", error);
      Alert.alert("오류", "사용자 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onLogout = () => {
    Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: () => {
          signOut();
        },
      },
    ]);
  };

  const getLoginMethodBadge = (method?: string) => {
    switch (method) {
      case "GOOGLE":
        return (
          <Badge variant="secondary" style={styles.googleBadge}>
            <Text style={styles.googleBadgeText}>Google 계정</Text>
          </Badge>
        );
      case "NAVER":
        return (
          <Badge variant="secondary" style={styles.naverBadge}>
            <Text style={styles.naverBadgeText}>NAVER 계정</Text>
          </Badge>
        );
      case "NORMAL":
      default:
        return (
          <Badge variant="secondary">
            <Text>일반 계정</Text>
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text>사용자 정보를 불러올 수 없습니다.</Text>
        <Button onPress={fetchUserData} style={{ marginTop: 20 }}>
          <Text>다시 시도</Text>
        </Button>
      </SafeAreaView>
    );
  }

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
                  <View style={{ marginTop: 8 }}>{getLoginMethodBadge(user.loginType)}</View>
                </View>
              </View>
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
                  <Text style={styles.infoValue}>{user.phoneNumber}</Text>
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
                  <Text style={styles.aptValue}>{user.apartmentName}</Text>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.residenceItem}>
                  <Feather name="home" size={20} color="#6b7280" />
                  <View>
                    <Text style={styles.infoLabel}>동</Text>
                    <Text style={styles.residenceValue}>{user.dongNo}</Text>
                  </View>
                </View>

                <View style={styles.residenceItem}>
                  <Feather name="home" size={20} color="#6b7280" />
                  <View>
                    <Text style={styles.infoLabel}>호수</Text>
                    <Text style={styles.residenceValue}>{user.hoNo}</Text>
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
              <Button variant="outline" style={styles.settingButton} onPress={() => router.push("/member/changePW")}>
                <Feather name="lock" size={16} color="black" style={styles.settingIcon} />
                <Text>비밀번호 변경</Text>
              </Button>

              <Button variant="outline" style={styles.settingButton}>
                <Feather name="mail" size={16} color="black" style={styles.settingIcon} />
                <Text>커뮤니티 예약내역 확인</Text>
              </Button>
              {/* <Button variant="outline" style={styles.settingButton}>
                <Feather name="phone" size={16} color="black" style={styles.settingIcon} />
                <Text>연락처 변경</Text>
              </Button> */}
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
