import React, { useState } from "react";
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ImageStyle,
  ViewStyle,
} from "react-native";

interface ImageCarouselProps {
  images: string[];
  height?: number;
  width?: number; // 캐러셀의 전체 너비
  onPress?: () => void;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  placeholderUrl?: string;
}

const SCREEN_WIDTH = Dimensions.get("window").width;

export const ImageCarousel = ({
  images,
  height = 200,
  width = SCREEN_WIDTH - 32, // 기본값: 양쪽 패딩 16씩 뺀 너비
  onPress,
  containerStyle,
  imageStyle,
  placeholderUrl = "https://via.placeholder.com/300",
}: ImageCarouselProps) => {
  const [activePage, setActivePage] = useState(0);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
    if (slide !== activePage) {
      setActivePage(slide);
    }
  };

  // 이미지가 없거나 빈 배열일 경우 처리
  const displayImages = images && images.length > 0 ? images : [placeholderUrl];

  return (
    <View style={[styles.container, containerStyle]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ width: width, height: height }}
        contentContainerStyle={{ width: width * displayImages.length }}
      >
        {displayImages.map((url, index) => (
          <Pressable
            key={index}
            onPress={onPress}
            disabled={!onPress} // onPress가 없으면 클릭 비활성화
          >
            <Image
              source={{ uri: url }}
              style={[
                { width: width, height: height },
                imageStyle, // 부모에서 전달받은 스타일 적용 (borderRadius 등)
              ]}
              resizeMode="cover"
            />
          </Pressable>
        ))}
      </ScrollView>

      {/* 페이지 인디케이터 (이미지가 2장 이상일 때만 표시) */}
      {displayImages.length > 1 && (
        <View style={styles.pagination}>
          {displayImages.map((_, index) => (
            <Text
              key={index}
              style={[styles.paginationDot, { color: activePage === index ? "#fff" : "rgba(255, 255, 255, 0.5)" }]}
            >
              ●
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.2)", // 배경을 살짝 어둡게 해서 점이 잘 보이게 함
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  paginationDot: {
    fontSize: 8,
    marginHorizontal: 3,
  },
});
