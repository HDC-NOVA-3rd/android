// styles/resetPW.styles.ts
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
  submitButton: {
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
  },
  resultContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#fff7ed",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f97316",
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#c2410c",
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: "#9a3412",
    marginBottom: 4,
  },
  tempPassword: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ea580c",
    marginTop: 8,
    textAlign: "center",
    letterSpacing: 2,
  },
  backToLoginContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  backToLoginText: {
    fontSize: 14,
    color: "#4b5563",
  },
  backToLoginLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    textDecorationLine: "underline",
  },
});
