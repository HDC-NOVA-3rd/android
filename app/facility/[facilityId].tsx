import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getFacilityDetail, getFacilitySpaces } from "@/api/service/facilityService";
import { Facility, Space } from "@/app/types/facility";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { styles } from "@/styles/facility/detail.styles";

export default function FacilityDetailScreen() {
  const { facilityId } = useLocalSearchParams();
  const router = useRouter();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);

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

        const mappedFacility: Facility = {
          facilityId: detailData.facilityId.toString(),
          capacity: 0,
          name: detailData.name,
          description: detailData.description,
          category: "공용", // API 미제공
          operatingHours: `${detailData.startHour} - ${detailData.endHour}`,
          imageUrl: "https://via.placeholder.com/300", // 기본 이미지
          spaces: spaces,
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
          <Image source={{ uri: facility.imageUrl }} style={styles.mainImage} resizeMode="cover" />
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
                  <Text style={styles.statLabel}>최대 수용 인원</Text>
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
