import mqtt from "mqtt";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * MQTT 연결 상태를 화면이나 로직에서 확인하기 위한 타입
 */
type ConnectStatus = "connecting" | "connected" | "reconnecting" | "disconnected" | "error";
type LastMessage = { topic: string; message: string } | null;
const useMqtt = (brokerUrl: string) => {
  // MQTT 클라이언트 객체를 유지하기 위한 ref (렌더링과 무관)
  const clientRef = useRef<any>(null);

  // 현재 MQTT 연결 상태
  const [connectStatus, setConnectStatus] = useState<ConnectStatus>("connecting");
  const [lastMessage, setLastMessage] = useState<LastMessage>(null);
  /**
   * 1. brokerUrl이 바뀌거나 최초 마운트 시 실행
   *    → MQTT 브로커에 연결하고 이벤트 리스너 등록
   */
  useEffect(() => {
    // 브로커 주소가 없으면 연결하지 않음
    if (!brokerUrl) return;

    setConnectStatus("connecting");

    // MQTT 브로커에 WebSocket 방식으로 연결
    const client = mqtt.connect(brokerUrl, {
      clientId: `rn_client_${Math.random().toString(16).slice(2, 8)}`,
      clean: true,
      keepalive: 60,
      reconnectPeriod: 1000,
      connectTimeout: 30_000,
    });

    // ref에 저장 → publish에서 재사용
    clientRef.current = client;

    /**
     * 2. 브로커 연결 성공 시
     */
    client.on("connect", () => {
      console.log("[MQTT] connected");
      setConnectStatus("connected");
    });

    /**
     * 3. 재연결 시도 중
     */
    client.on("reconnect", () => {
      console.log("[MQTT] reconnecting...");
      setConnectStatus("reconnecting");
    });

    /**
     * 4. 연결 종료
     */
    client.on("close", () => {
      console.log("[MQTT] disconnected");
      setConnectStatus("disconnected");
    });

    /**
     * 5. 연결 에러 발생
     */
    client.on("error", (err: any) => {
      console.log("[MQTT] error:", err?.message ?? err);
      setConnectStatus("error");
    });
    //  추가: 수신 메시지 처리
    client.on("message", (topic: string, payload: any) => {
      const msg = payload?.toString?.() ?? String(payload);
      console.log("[MQTT] recv:", topic, msg);
      setLastMessage({ topic, message: msg });
    });

    /**
     * 6. 컴포넌트 언마운트 시 실행
     *    → MQTT 연결 정리
     */
    return () => {
      try {
        client.end(true);
      } catch (e) {
        // ignore
      }
      clientRef.current = null;
      setConnectStatus("disconnected");
    };
  }, [brokerUrl]);

  /**
   * 7. MQTT 메시지 발행 함수
   *    → 화면 컴포넌트에서 호출
   */
  const publish = useCallback((topic: string, message: string) => {
    const client = clientRef.current;
    if (!client) {
      console.log("[MQTT] publish 실패 - client 없음");
      return;
    }

    client.publish(topic, message, { qos: 0, retain: false });
    console.log("[MQTT] publish:", topic, message);
  }, []);

  // 추가: 구독/해제
  const subscribe = useCallback((topic: string) => {
    const client = clientRef.current;
    if (!client) return;
    client.subscribe(topic, { qos: 0 }, (err: any) => {
      if (err) console.log("[MQTT] subscribe error:", err);
      else console.log("[MQTT] subscribed:", topic);
    });
  }, []);

  const unsubscribe = useCallback((topic: string) => {
    const client = clientRef.current;
    if (!client) return;
    client.unsubscribe(topic, (err: any) => {
      if (err) console.log("[MQTT] unsubscribe error:", err);
      else console.log("[MQTT] unsubscribed:", topic);
    });
  }, []);
  // 화면에서 필요한 값만 외부로 제공
  return { connectStatus, publish, subscribe, unsubscribe, lastMessage };
};

export default useMqtt;
