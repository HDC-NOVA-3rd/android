// styles/login.styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    padding: 16,
    justifyContent: "center",
    minHeight: "100%",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111827",
  },
  logoSubtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  formSpace: {
    gap: 16,
  },
  loginButton: {
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
  },
  // iconRight는 제거되었습니다 (gap 사용으로 불필요)
  dividerContainer: {
    position: "relative",
    marginVertical: 24,
    justifyContent: "center",
  },
  orLabelContainer: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "white",
    paddingHorizontal: 8,
  },
  orLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  socialButtons: {
    gap: 12,
  },
  signupContainer: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  signupText: {
    fontSize: 14,
    color: "#4b5563",
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    textDecorationLine: "underline",
  },
});
