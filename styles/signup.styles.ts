// styles/signup.styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    justifyContent: "flex-start",
    paddingHorizontal: 0,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  field: {
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
    marginBottom: 16,
  },
  disabledInput: {
    backgroundColor: "#f3f4f6", // 회색 배경 처리
    color: "#9ca3af",
  },
  verifyButton: {
    marginTop: 8,
    backgroundColor: "#4b5563", // 인증 버튼 색상
  },
  termsContainer: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  termsText: {
    fontSize: 12,
    color: "#4b5563",
    lineHeight: 18,
  },
  linkText: {
    color: "#2563eb",
    fontWeight: "600",
  },
  submitButton: {
    height: 48,
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
