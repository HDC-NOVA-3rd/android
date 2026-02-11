import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View, Dimensions, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatTime } from "@/utils/date";
import { getFacilityList } from "@/api/service/facilityService";
import { Facility } from "@/app/types/facility";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { useAuth } from "@/context/AuthContext";
import { styles } from "@/styles/facility/list.styles";
import { BASE_URL } from "@/api/client";

// [추가] 카드 내부 이미지 가로 너비 (Card 패딩 등을 고려해서 조정 필요)
const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - 32; // 좌우 패딩 16 * 2 제외 (styles.container 패딩 확인 필요)

export default function FacilityListScreen() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = BASE_URL.replace("/api", ""); // BASE_URL에서 /api 부분 제거

  useEffect(() => {
    const fetchFacilities = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const decoded: any = jwtDecode(accessToken);
        const apartmentId = decoded.apartmentId;

        if (apartmentId) {
          const data = await getFacilityList(apartmentId);
          const mappedFacilities: Facility[] = data.map((item: any) => {
            // [핵심 로직] 이미지 URL 매핑
            // API가 주는 imageUrls 리스트가 있으면 도메인을 붙여서 배열로 만듦
            // 만약 API가 상대경로(/images/a.jpg)를 준다면 BACKEND_DOMAIN을 붙임
            let processedImages: string[] = [];

            if (item.imageUrls && item.imageUrls.length > 0) {
              processedImages = item.imageUrls.map((url: string) =>
                url.startsWith("http") ? url : `${BACKEND_URL}${url}`,
              );
            } else {
              // 이미지가 없으면 기본 이미지 하나 넣어줌
              processedImages = [`${BACKEND_URL}/images/studyRoom.jpg`];
            }
            return {
              facilityId: item.facilityId.toString(),
              name: item.name,
              description: item.description,
              category: "공용",
              capacity:
                item.minCapacity === item.maxCapacity
                  ? `${item.minCapacity}`
                  : `${item.minCapacity} ~ ${item.maxCapacity}`,
              operatingHours: `${formatTime(item.startHour)} - ${formatTime(item.endHour)}`,
              imageUrls: processedImages, // [변경] 배열로 저장
            };
          });
          setFacilities(mappedFacilities);
        }
      } catch (error) {
        console.error("Failed to fetch facilities", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [accessToken]);

  const categories = ["전체", ...Array.from(new Set(facilities.map((f) => f.category)))];

  const filteredFacilities = facilities.filter((facility) => {
    const matchesSearch =
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "전체" || facility.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const onSelectFacility = (facility: Facility) => {
    router.push(`/facility/${facility.facilityId}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>커뮤니티 시설 예약</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <Input
            placeholder="시설 검색..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
          style={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryButton, selectedCategory === category && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {filteredFacilities.map((facility) => (
          <Card key={facility.facilityId} style={styles.card}>
            <ImageCarousel
              images={facility.imageUrls}
              onPress={() => onSelectFacility(facility)}
              width={CARD_WIDTH} // 카드의 너비 전달
              height={200}
              imageStyle={{
                borderTopLeftRadius: 10, // 카드 스타일에 맞게 둥글기 적용
                borderTopRightRadius: 10,
              }}
            />
            <Pressable onPress={() => onSelectFacility(facility)}>
              <CardHeader style={styles.cardHeader}>
                <View style={styles.cardHeaderTop}>
                  <CardTitle style={styles.cardTitle}>{facility.name}</CardTitle>
                  <Badge variant="secondary">{facility.category}</Badge>
                </View>
                <CardDescription style={styles.cardDescription}>{facility.description}</CardDescription>
              </CardHeader>
              <CardContent style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Feather name="users" size={16} color="#4b5563" />
                  <Text style={styles.infoText}>{facility.capacity}명</Text>
                </View>
                <View style={styles.infoRow}>
                  <Feather name="clock" size={16} color="#4b5563" />
                  <Text style={styles.infoText}>{facility.operatingHours}</Text>
                </View>
                <Button style={styles.bookButton} onPress={() => onSelectFacility(facility)}>
                  <Text style={{ color: "white" }}>예약하기</Text>
                </Button>
              </CardContent>
            </Pressable>
          </Card>
        ))}

        {filteredFacilities.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
