import { Pressable, ScrollView, Text } from "react-native";

export default function QuickReplies({
  items,
  onPress,
}: {
  items: string[];
  onPress: (text: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
    >
      {items.map((t) => (
        <Pressable
          key={t}
          onPress={() => onPress(t)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "#D0D5DD",
            backgroundColor: "white",
          }}
        >
          <Text style={{ color: "#175CD3" }}>{t}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
