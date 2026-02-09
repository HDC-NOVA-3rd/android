import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const HOUR_WIDTH = 60;

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 16 },
  
  // Tabs
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  activeTab: {
    backgroundColor: "#111827",
  },
  tabText: { fontSize: 14, color: "#6b7280", fontWeight: "600" },
  activeTabText: { color: "white" },

  scrollContent: { paddingBottom: 100 },

  // Section
  section: {
    padding: 20,
    borderTopWidth: 8,
    borderTopColor: "#f9fafb",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  // Calendar
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

  // Time Bar
  timeBarWrapper: {
    marginTop: 10,
  },
  timeLabelRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  timeLabel: {
    width: HOUR_WIDTH,
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
  },
  timeSlotsRow: {
    flexDirection: "row",
    height: 40,
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

  // Summary
  selectionSummary: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
  },
  selectionTime: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  selectionDetail: { fontSize: 14, color: "#6b7280", marginTop: 4 },

  // Price Bottom Bar
  priceBottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 16, color: "#374151" },
  totalPrice: { fontSize: 20, fontWeight: "bold", color: "#ef4444" },
  
  submitButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },

  // Detail View Styles
  detailContainer: {
    padding: 20,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 16,
  },
  detailIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#111827",
    lineHeight: 24,
  },

  // Checkbox Style
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#4b5563",
  },

  // Other styles from original
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  form: { gap: 16, marginTop: 10 },
  inputGroup: { gap: 8 },
  paymentRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  paymentOption: { 
    flex: 1, 
    padding: 12, 
    borderWidth: 1, 
    borderColor: "#d1d5db", 
    borderRadius: 8, 
    alignItems: "center" 
  },
  paymentSelected: { backgroundColor: "#111827", borderColor: "#111827" },
  paymentText: { color: "#374151" },
  paymentTextSelected: { color: "white" },
});
