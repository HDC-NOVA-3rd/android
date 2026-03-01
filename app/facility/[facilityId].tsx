import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatTime } from "@/utils/date";
import { getFacilityDetail, getFacilitySpaces } from "@/api/service/facilityService";
import { Facility, Space } from "@/app/types/facility";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { styles } from "@/styles/facility/detail.styles";
import { BASE_URL } from "@/api/client";
import { Alert, Dimensions } from "react-native";
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function FacilityDetailScreen() {
  const { facilityId } = useLocalSearchParams();
  const router = useRouter();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = BASE_URL.replace("/api", ""); // BASE_URL에서 /api 부분 제거

  useEffect(() => {
    const fetchData = async () => {
      if (!facilityId) return;

      try {
        const [detailData, spacesData] = await Promise.all([
          getFacilityDetail(facilityId),
          getFacilitySpaces(facilityId),
        ]);

        const spaces: Space[] = spacesData.map((space: any) => ({
          id: space.id.toString(),
          name: space.name,
          maxCapacity: space.maxCapacity,
          minCapacity: space.minCapacity,
          pricePerHour: space.price,
        }));

        let images: string[] = [];
        if (detailData.imageUrls && detailData.imageUrls.length > 0) {
          images = detailData.imageUrls.map((url: string) => (url.startsWith("http") ? url : `${BACKEND_URL}${url}`));
        } else {
          // 임시/기본 이미지
          images = [`${BACKEND_URL}/images/studyRoom.jpg`];
        }

        const mappedFacility: Facility = {
          facilityId: detailData.facilityId.toString(),
          capacity:
            detailData.minCapacity === detailData.maxCapacity
              ? `${detailData.minCapacity}`
              : `${detailData.minCapacity} ~ ${detailData.maxCapacity}`,
          name: detailData.name,
          description: detailData.description,
          category: "공용", // API 미제공
          operatingHours: `${formatTime(detailData.startHour)} - ${formatTime(detailData.endHour)}`,
          imageUrls: images,
          spaces: spaces,
          reservationAvailable: detailData.reservationAvailable,
        };
        console.log(mappedFacility);

        setFacility(mappedFacility);
      } catch (error) {
        console.error("Failed to fetch facility details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [facilityId]);

  const onSelectRoom = (space: Space) => {
    // Reservation logic would go here
    console.log("Selected space:", space);
    if (facility?.reservationAvailable === false) {
      Alert.alert("예약 불가", "현재 예약이 불가능한 시설입니다.");
      return;
    }
    router.push(`/facility/reservation/${space.id}`);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!facility) {
    return (
      <View style={styles.container}>
        <Text>시설을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color="#111827" />
          <Text style={styles.backButtonText}>목록으로</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.mainCard}>
          {/* [변경] 기존 Image 태그 대신 ImageCarousel 사용 */}
          <ImageCarousel
            images={facility.imageUrls || []}
            // 상세화면은 카드 내부 패딩이 없는 경우 꽉 채우거나, 패딩이 있다면 계산 필요
            // 예: mainCard에 패딩이 없다면 SCREEN_WIDTH - (마진)
            width={SCREEN_WIDTH - 32} // styles.content padding 등에 맞춰 조절
            height={250} // 상세화면이니까 좀 더 크게
            imageStyle={{
              borderRadius: 12, // 상세화면 스타일
            }}
            // 상세화면에서는 이미지를 눌러도 아무 동작 안 함 (onPress 제거)
          />
          <View style={{ padding: 16 }}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{facility.name}</Text>
                <Text style={styles.description}>{facility.description}</Text>
              </View>
              <Badge variant="secondary">{facility.category}</Badge>
            </View>
          </View>

          <View style={{ padding: 16, paddingTop: 0 }}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Feather name="users" size={20} color="#2563eb" />
                <View style={styles.statTextContainer}>
                  <Text style={styles.statLabel}>이용 가능 인원</Text>
                  <Text style={styles.statValue}>{facility.capacity}명</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <Feather name="clock" size={20} color="#2563eb" />
                <View style={styles.statTextContainer}>
                  <Text style={styles.statLabel}>운영 시간</Text>
                  <Text style={styles.statValue}>{facility.operatingHours}</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Room Selection */}
        <View>
          <Text style={styles.sectionTitle}>이용 가능한 공간</Text>
          <View style={styles.roomGrid}>
            {facility.spaces.map((space) => (
              <Card key={space.id} style={styles.roomCard}>
                <View style={styles.roomCardHeader}>
                  <Feather name="map-pin" size={20} color="#2563eb" />
                  <Text style={styles.roomTitle}>{space.name}</Text>
                </View>
                <View style={styles.roomCardContent}>
                  <View style={styles.roomInfoRow}>
                    <View style={styles.roomInfoItem}>
                      <Feather name="users" size={16} color="#4b5563" />
                      <Text style={styles.roomInfoText}>{space.minCapacity}</Text>
                      <Text style={styles.roomInfoText}>~ {space.maxCapacity}명</Text>
                    </View>
                  </View>
                  <View style={styles.roomInfoRow}>
                    <View style={styles.roomInfoItem}>
                      <Feather name="dollar-sign" size={16} color="#4b5563" />
                      <Text style={styles.roomInfoText}>{space.pricePerHour.toLocaleString()}원/시간</Text>
                    </View>
                  </View>
                  <Button style={styles.roomButton} onPress={() => onSelectRoom(space)}>
                    <Text style={{ color: "white" }}>이 공간 예약하기</Text>
                  </Button>
                </View>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
