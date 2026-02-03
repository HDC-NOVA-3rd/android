import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type Props = {
  items: string[];
  onPress: (text: string) => void;
};

export default function QuickReplies({ items, onPress }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="always"
      contentContainerStyle={{ paddingVertical: 4 }}
    >
      <View style={{ flexDirection: "row", gap: 8 }}>
        {items.map((text) => (
          <Pressable
            key={text}
            onPress={() => {
              console.log(" QuickReply pressed:", text);
              onPress(text);
            }}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: "#D0D5DD",
              borderRadius: 999,
              backgroundColor: "white",
            }}
          >
            <Text style={{ color: "#1D4ED8", fontWeight: "600" }}>{text}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
