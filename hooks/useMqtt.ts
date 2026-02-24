import mqtt from "mqtt";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ConnectStatus = "connecting" | "connected" | "reconnecting" | "disconnected" | "error";
type LastMessage = { topic: string; message: string } | null;

type MqttOptions = {
  clientId?: string;
  username?: string;
  password?: string;
};

const useMqtt = (brokerUrl: string, options?: MqttOptions) => {
  const clientRef = useRef<mqtt.MqttClient | null>(null);

  const [connectStatus, setConnectStatus] = useState<ConnectStatus>("disconnected");
  const [lastMessage, setLastMessage] = useState<LastMessage>(null);

  // 구독 목록 유지 (재연결 시 자동 구독용)
  const subscribedTopicsRef = useRef<Set<string>>(new Set());

  // 옵션이 변경될 때만 connectOptions 재계산
  const connectOptions = useMemo(() => {
    return {
      clientId: options?.clientId ?? `rn_client_${Math.random().toString(16).slice(2, 8)}`,
      clean: true,
      keepalive: 60,
      reconnectPeriod: 2000,
      connectTimeout: 30_000,
      username: options?.username,
      password: options?.password,
    } as mqtt.IClientOptions;
  }, [options?.clientId, options?.username, options?.password]);

  useEffect(() => {
    if (!brokerUrl) return;

    // 기존 연결이 있다면 정리
    if (clientRef.current) {
      clientRef.current.end(true);
      clientRef.current = null;
    }

    setConnectStatus("connecting");
    const client = mqtt.connect(brokerUrl, connectOptions);
    clientRef.current = client;

    const resubscribeAll = () => {
      const topics = Array.from(subscribedTopicsRef.current);
      if (!topics.length) return;
      client.subscribe(topics, { qos: 0 });
    };

    client.on("connect", () => {
      console.log(`[MQTT] Connected: ${connectOptions.clientId}`);
      setConnectStatus("connected");
      resubscribeAll();
    });

    client.on("reconnect", () => {
      setConnectStatus("reconnecting");
    });

    client.on("close", () => {
      setConnectStatus("disconnected");
    });

    client.on("error", (err: any) => {
      console.error("[MQTT] Connection Error:", err?.message ?? err);
      setConnectStatus("error");
    });

    client.on("message", (topic: string, payload: any) => {
      const msg = payload?.toString?.() ?? String(payload);
      setLastMessage({ topic, message: msg });
    });

    return () => {
      if (client) {
        console.log(`[MQTT] Cleanup: Disconnecting ${connectOptions.clientId}`);
        client.removeAllListeners();
        client.end(true);
      }
      clientRef.current = null;
    };
  }, [brokerUrl, connectOptions]);

  const publish = useCallback((topic: string, message: string) => {
    const client = clientRef.current;
    if (client?.connected) {
      client.publish(topic, message, { qos: 0, retain: false });
    }
  }, []);

  const subscribe = useCallback((topic: string) => {
    subscribedTopicsRef.current.add(topic);
    const client = clientRef.current;
    if (client?.connected) {
      client.subscribe(topic);
    }
  }, []);

  const unsubscribe = useCallback((topic: string) => {
    subscribedTopicsRef.current.delete(topic);
    const client = clientRef.current;
    if (client?.connected) {
      client.unsubscribe(topic);
    }
  }, []);

  return { connectStatus, publish, subscribe, unsubscribe, lastMessage };
};

export default useMqtt;
