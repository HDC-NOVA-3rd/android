import { useState, useCallback } from "react";
import { parseISO } from "date-fns";
import { OccupiedReservation } from "@/api/service/reservationService";

interface UseTimeRangeSelectionProps {
  occupiedSlots: OccupiedReservation[];
}

export function useTimeRangeSelection({ occupiedSlots }: UseTimeRangeSelectionProps) {
  const [startIdx, setStartIdx] = useState<number | null>(null);
  const [endIdx, setEndIdx] = useState<number | null>(null);

  const resetSelection = useCallback(() => {
    setStartIdx(null);
    setEndIdx(null);
  }, []);

  const selectTimeSlot = useCallback(
    (hour: number, isOccupied: boolean) => {
      if (isOccupied) return;

      // 1. 처음 선택하거나, 이미 범위가 완성된 상태에서 새로 선택할 때
      if (startIdx === null || (startIdx !== null && endIdx !== null)) {
        setStartIdx(hour);
        setEndIdx(null);
      } else {
        // 2. 시작 시간이 선택된 상태에서 두 번째 시간 선택
        if (hour < startIdx) {
          // 시작 시간보다 이전 시간을 누르면 그 시간을 새로운 시작 시간으로 변경
          setStartIdx(hour);
        } else {
          // 3. 점유된 슬롯이 중간에 끼어있는지 확인
          const hasOccupiedInRange = occupiedSlots.some((slot) => {
            const s = parseISO(slot.startTime).getHours();
            const e = parseISO(slot.endTime).getHours();
            // 예약은 [start, end) 개념이므로, slot의 시간대가 선택 범위 [startIdx, hour] 사이에 걸치는지 확인
            // slot start가 선택된 startIdx보다 크고 hour보다 작으면 중간에 낀 것
            // slot end도 고려해야 하지만, 일단 단순화하여 시작 시간 기준으로 판단
            return s >= startIdx && s < hour;
          });

          if (hasOccupiedInRange) {
            // 중간에 예약된 시간이 있으면 범위를 만들 수 없으므로, 해당 시간을 새로운 시작 시간으로 설정
            setStartIdx(hour);
            setEndIdx(null);
          } else {
            // 정상적인 범위 선택 완료
            setEndIdx(hour);
          }
        }
      }
    },
    [startIdx, endIdx, occupiedSlots]
  );

  return {
    startIdx,
    endIdx,
    selectTimeSlot,
    resetSelection,
  };
}
