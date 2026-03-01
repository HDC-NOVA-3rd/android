import React from "react";
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  startOfHour,
  addMonths,
  subMonths,
} from "date-fns";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ReservationCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  currentMonth: Date;
  onChangeMonth: (date: Date) => void;
}

export function ReservationCalendar({
  selectedDate,
  onSelectDate,
  currentMonth,
  onChangeMonth,
}: ReservationCalendarProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <View style={styles.calendarContainer}>
      {/* Header */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={() => onChangeMonth(subMonths(currentMonth, 1))}>
          <Feather name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.monthText}>{format(currentMonth, "yyyy.M")}</Text>
        <TouchableOpacity onPress={() => onChangeMonth(addMonths(currentMonth, 1))}>
          <Feather name="chevron-right" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Week Days Row */}
      <View style={styles.weekRow}>
        {weekDays.map((day) => (
          <Text key={day} style={styles.weekText}>
            {day}
          </Text>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.daysGrid}>
        {calendarDays.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = day.getMonth() === monthStart.getMonth();
          const isPast = day < startOfHour(new Date()) && !isToday(day);

          return (
            <TouchableOpacity
              key={i}
              style={[styles.dayCell, isSelected && styles.selectedDay]}
              disabled={!isCurrentMonth || isPast}
              onPress={() => onSelectDate(day)}
            >
              <Text
                style={[
                  styles.dayText,
                  !isCurrentMonth && { opacity: 0 },
                  isPast && styles.disabledDayText,
                  isSelected && styles.selectedDayText,
                ]}
              >
                {format(day, "d")}
              </Text>
              {isToday(day) && (
                <Text style={[styles.todayText, isSelected && { color: "white" }]}>오늘</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarContainer: {
    paddingBottom: 10,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginBottom: 20,
  },
  monthText: { fontSize: 18, fontWeight: "bold" },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  weekText: {
    width: (SCREEN_WIDTH - 40) / 7,
    textAlign: "center",
    fontSize: 12,
    color: "#9ca3af",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: (SCREEN_WIDTH - 40) / 7,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  selectedDay: {
    backgroundColor: "#10b981",
    borderRadius: 8,
  },
  todayText: {
    color: "#10b981",
    fontSize: 10,
    marginTop: 2,
  },
  dayText: { fontSize: 15, color: "#374151" },
  selectedDayText: { color: "white", fontWeight: "bold" },
  disabledDayText: { color: "#d1d5db" },
});
