import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getFacilityList } from "@/api/service/facilityService";
import { Facility } from "@/app/types/facility";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { styles } from "@/styles/facility/list.styles";

export default function FacilityListScreen() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

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
          const mappedFacilities: Facility[] = data.map((item: any) => ({
            facilityId: item.facilityId.toString(),
            name: item.name,
            description: item.description,
            category: "공용", // API에서 카테고리를 제공하지 않으므로 기본값 설정
            capacity: 0, // 기본값
            operatingHours: `${item.startHour} - ${item.endHour}`,
            imageUrl: "https://via.placeholder.com/300", // 기본 이미지
          }));
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
          <TouchableOpacity key={facility.facilityId} activeOpacity={0.9} onPress={() => onSelectFacility(facility)}>
            <Card style={styles.card}>
              <Image source={{ uri: facility.imageUrl }} style={styles.cardImage} resizeMode="cover" />
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
                  <Text style={styles.infoText}>최대 {facility.capacity}명</Text>
                </View>
                <View style={styles.infoRow}>
                  <Feather name="clock" size={16} color="#4b5563" />
                  <Text style={styles.infoText}>{facility.operatingHours}</Text>
                </View>
                <Button style={styles.bookButton} onPress={() => onSelectFacility(facility)}>
                  <Text style={{ color: "white" }}>예약하기</Text>
                </Button>
              </CardContent>
            </Card>
          </TouchableOpacity>
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
