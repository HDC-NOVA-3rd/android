import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { parseISO } from "date-fns";
import { OccupiedReservation } from "@/api/service/reservationService";

const HOUR_WIDTH = 60;

const START_HOUR = 0;
const END_HOUR = 24;

interface TimeRangePickerProps {
  occupiedSlots: OccupiedReservation[];
  startIdx: number | null;
  endIdx: number | null;
  onSelectSlot: (hour: number, isOccupied: boolean) => void;
}

export function TimeRangePicker({ occupiedSlots, startIdx, endIdx, onSelectSlot }: TimeRangePickerProps) {
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
  const labels = [...hours]; // 0시부터 24시까지 라벨 생성

  return (
    <View style={styles.timeBarWrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 10 }}>
          <View style={styles.timeLabelRow}>
            {labels.map((h) => (
              <View key={h} style={styles.timeLabelContainer}>
                <Text style={styles.timeLabel}>{h}시</Text>
              </View>
            ))}
          </View>
          <View style={styles.timeSlotsRow}>
            {hours.map((hour) => {
              const isOccupied = occupiedSlots.some((slot) => {
                const s = parseISO(slot.startTime).getHours();
                const e = parseISO(slot.endTime).getHours();
                return hour >= s && hour < e;
              });

              const isSelectedStart = startIdx === hour;
              const isSelectedEnd = endIdx === hour;
              const isInRange = startIdx !== null && endIdx !== null && hour > startIdx && hour < endIdx;

              return (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.timeSlot,
                    isOccupied && styles.occupiedSlot,
                    (isSelectedStart || isSelectedEnd) && styles.selectedSlot,
                    isInRange && styles.inRangeSlot,
                  ]}
                  onPress={() => onSelectSlot(hour, isOccupied)}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: "#d1d5db" }]} />
          <Text style={styles.legendText}>마감</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: "#10b981" }]} />
          <Text style={styles.legendText}>선택</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  timeBarWrapper: {
    marginTop: 10,
  },
  timeLabelRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  timeLabelContainer: {
    width: HOUR_WIDTH,
    alignItems: "flex-start",
  },
  timeLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginLeft: -4, // 글자 시작점을 경계선에 더 가깝게 밀착
  },
  timeSlotsRow: {
    flexDirection: "row",
    height: 32,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    overflow: "hidden",
  },
  timeSlot: {
    width: HOUR_WIDTH,
    height: "100%",
    borderRightWidth: 1,
    borderRightColor: "white",
  },
  occupiedSlot: {
    backgroundColor: "#d1d5db",
  },
  selectedSlot: {
    backgroundColor: "#10b981",
  },
  inRangeSlot: {
    backgroundColor: "#10b981",
    opacity: 0.7,
  },
  legendRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: { fontSize: 12, color: "#9ca3af" },
});
