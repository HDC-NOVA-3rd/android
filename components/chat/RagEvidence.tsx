import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

type RagChunk = {
  id: string;
  score: number;
  sourceType?: string; // "NOTICE" | "RULE" | "EVENT" | ...
  title?: string;
  text: string;
  metadata?: Record<string, any>; // { noticeId, facilityId, roomId ... }
};

export default function RagEvidence({ chunks }: { chunks?: RagChunk[] }) {
  const [open, setOpen] = useState(false);

  const bestScore = useMemo(() => {
    if (!chunks?.length) return 0;
    return Math.max(...chunks.map((c) => c.score ?? 0));
  }, [chunks]);

  if (!chunks || chunks.length === 0) return null;

  const scoreLabel = bestScore >= 0.85 ? "높음" : bestScore >= 0.6 ? "보통" : "낮음";

  const canNavigate = (c: RagChunk) => {
    const m = c.metadata ?? {};
    if (c.sourceType === "NOTICE" && m.noticeId) return true;
    if (c.sourceType === "FACILITY" && m.facilityId) return true;
    if (c.sourceType === "ROOM" && m.roomId) return true;
    return false;
  };

  const handlePressChunk = (c: RagChunk) => {
    const m = c.metadata ?? {};

    // NOTICE 상세
    if (c.sourceType === "NOTICE" && m.noticeId) {
      router.push(`/notice/${m.noticeId}`);
      return;
    }

    // FACILITY 상세
    if (c.sourceType === "FACILITY" && m.facilityId) {
      router.push(`/facility/${m.facilityId}`);
      return;
    }

    // ROOM 상세
    if (c.sourceType === "ROOM" && m.roomId) {
      router.push(`/room/${m.roomId}`);
      return;
    }

    // 그 외는 이동 없음
  };

  return (
    <View style={{ marginTop: 8 }}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={{
          alignSelf: "flex-start",
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 12,
          backgroundColor: "#F2F4F7",
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: "700", color: "#111" }}>
          근거 {open ? "접기" : "보기"} · 신뢰도 {scoreLabel} · {chunks.length}건
        </Text>
      </Pressable>

      {open && (
        <View style={{ marginTop: 8, gap: 8 }}>
          {chunks.map((c, idx) => {
            const nav = canNavigate(c);

            return (
              <Pressable
                key={`${c.id}_${idx}`}
                onPress={() => (nav ? handlePressChunk(c) : undefined)}
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  backgroundColor: "#fff",
                  borderRadius: 14,
                  padding: 12,
                  opacity: nav ? 1 : 0.92,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 12, fontWeight: "800", color: "#111" }}>
                    [{c.sourceType ?? "RAG"}] {c.title ?? c.id}
                    {nav ? "  → 상세보기" : ""}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#6B7280" }}>
                    {Number(c.score ?? 0).toFixed(3)}
                  </Text>
                </View>

                <View style={{ height: 6 }} />

                <Text style={{ fontSize: 12, color: "#111", lineHeight: 16 }} numberOfLines={8}>
                  {c.text}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
