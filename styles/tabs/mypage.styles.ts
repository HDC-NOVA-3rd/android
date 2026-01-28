import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  profileInfo: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  googleBadge: {
    backgroundColor: "#dbeafe",
  },
  googleBadgeText: {
    color: "#1d4ed8",
  },
  naverBadge: {
    backgroundColor: "#dcfce7",
  },
  naverBadgeText: {
    color: "#15803d",
  },
  grid: {
    gap: 16,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    width: "100%",
  },
  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  infoValue: {
    fontWeight: "600",
    color: "#111827",
  },
  residenceContainer: {
    gap: 16,
  },
  aptInfo: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  aptLabel: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 4,
  },
  aptValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e3a8a",
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  residenceItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  residenceValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  settingsList: {
    gap: 12,
  },
  settingButton: {
    width: "100%",
    justifyContent: "flex-start",
    height: 48,
  },
  settingIcon: {
    marginRight: 8,
  },
  footerInfo: {
    padding: 16,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#4b5563",
  },
});
