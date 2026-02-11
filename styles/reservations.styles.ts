import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 16, 
    backgroundColor: "white", 
    borderBottomWidth: 1, 
    borderBottomColor: "#e5e7eb" 
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 16 },
  tabBar: { 
    flexDirection: "row", 
    backgroundColor: "white", 
    padding: 4, 
    borderRadius: 8, 
    margin: 16, 
    borderWidth: 1, 
    borderColor: '#e5e7eb' 
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 6 },
  activeTab: { backgroundColor: "#eff6ff" },
  tabText: { fontSize: 14, color: "#6b7280", fontWeight: "500" },
  activeTabText: { color: "#2563eb", fontWeight: "bold" },
  scrollContent: { padding: 16 },
  card: { marginBottom: 16, backgroundColor: "white" },
  cardHeader: { paddingBottom: 8 },
  cardHeaderTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardTitle: { fontSize: 16, fontWeight: "bold" },
  badgeText: { color: "white", fontSize: 10, fontWeight: "bold" },
  cardContent: { paddingTop: 8 },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 6, width: "45%" },
  infoText: { fontSize: 13, color: "#4b5563" },
  priceRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingTop: 12, 
    borderTopWidth: 1, 
    borderTopColor: "#f3f4f6" 
  },
  priceLabel: { fontSize: 14, color: "#6b7280" },
  priceValue: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  qrButton: { marginTop: 16, height: 40, gap: 8 },
  qrButtonText: { fontWeight: "600" },
  emptyState: { alignItems: "center", marginTop: 80, gap: 12 },
  emptyText: { color: "#9ca3af", fontSize: 16 },
});
