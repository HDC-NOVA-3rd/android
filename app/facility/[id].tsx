import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { facilities } from "@/app/data/mockData";
import { styles } from "@/styles/facility/detail.styles";
import { Room } from "@/app/types/facility";

export default function FacilityDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const facility = facilities.find((f) => f.id === id);

  if (!facility) {
    return (
      <View style={styles.container}>
        <Text>시설을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const onSelectRoom = (room: Room) => {
    // Reservation logic would go here
    console.log("Selected room:", room);
  };

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
              <View style={styles.statItem}>
                <Feather name="dollar-sign" size={20} color="#2563eb" />
                <View style={styles.statTextContainer}>
                  <Text style={styles.statLabel}>시간당 요금</Text>
                  <Text style={styles.statValue}>{facility.pricePerHour.toLocaleString()}원</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Room Selection */}
        <View>
          <Text style={styles.sectionTitle}>이용 가능한 공간</Text>
          <View style={styles.roomGrid}>
            {facility.rooms.map((room) => (
              <Card key={room.id} style={styles.roomCard}>
                <View style={styles.roomCardHeader}>
                  <Feather name="map-pin" size={20} color="#2563eb" />
                  <Text style={styles.roomTitle}>{room.name}</Text>
                </View>
                <View style={styles.roomCardContent}>
                  <View style={styles.roomInfoRow}>
                    <View style={styles.roomInfoItem}>
                      <Feather name="users" size={16} color="#4b5563" />
                      <Text style={styles.roomInfoText}>최대 {room.capacity}명</Text>
                    </View>
                  </View>
                  <View style={styles.roomInfoRow}>
                    <View style={styles.roomInfoItem}>
                      <Feather name="dollar-sign" size={16} color="#4b5563" />
                      <Text style={styles.roomInfoText}>{room.pricePerHour.toLocaleString()}원/시간</Text>
                    </View>
                  </View>
                  <Button style={styles.roomButton} onPress={() => onSelectRoom(room)}>
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
