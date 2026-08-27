import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * Hook: useWebSocket
 * 
 * Maneja la conexión WebSocket con el backend NestJS para
 * recibir actualizaciones en tiempo real del preconteo.
 * 
 * @param token JWT token para autenticación
 * @returns Estado de conexión y funciones para interactuar
 */
interface WebSocketState {
  connected: boolean;
  authenticated: boolean;
  error: string | null;
  stats: {
    connectedClients: number;
    rooms: string[];
  } | null;
}

interface WebSocketEvents {
  onResultadosActualizados?: (data: any) => void;
  onProgresoMesas?: (data: any) => void;
  onNuevaActa?: (data: any) => void;
  onActaValidada?: (data: any) => void;
  onAlerta?: (data: any) => void;
}

export function useWebSocket(
  token: string | null,
  events?: WebSocketEvents
): WebSocketState & {
  subscribe: (scopeType: string, scopeId: number) => void;
  unsubscribe: (scopeType: string, scopeId: number) => void;
  getStats: () => void;
} {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    authenticated: false,
    error: null,
    stats: null,
  });

  // Conectar al WebSocket
  useEffect(() => {
    if (!token) {
      setState(prev => ({ ...prev, error: 'Token no disponible' }));
      return;
    }

    // backend-diad escucha por defecto en el puerto 3000 (ver
    // backend-diad/.env y el mapeo "3000:3000" en docker-compose.yml).
    // VITE_WS_URL nunca se define en ningún .env de este repo, así que el
    // fallback SIEMPRE es lo que realmente se usaba -y apuntaba al puerto
    // 3001, que ningún servicio real escucha-, dejando el dashboard de
    // Día D permanentemente desconectado del WebSocket.
    const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

    // PreconteoGateway declara '/ws/preconteo' como NAMESPACE de Socket.IO
    // (@WebSocketGateway({ namespace: '/ws/preconteo' })), no como el
    // 'path' del transporte engine.io (que sigue siendo el default
    // '/socket.io'). Pasarlo aquí como `path` conectaba al namespace raíz
    // ('/') en una ruta HTTP que el servidor nunca expone -404 en todo
    // intento de conexión, con cualquier puerto-. El namespace va en la
    // URL, igual que en las otras gateways de backend-diad (ActasGateway,
    // AlertasGateway, etc.), todas sin `path` propio.
    const socket = io(`${WS_URL}/ws/preconteo`, {
      transports: ['websocket'],
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Eventos de conexión
    socket.on('connect', () => {
      console.log('🔌 WebSocket conectado');
      setState(prev => ({ ...prev, connected: true, error: null }));
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket desconectado:', reason);
      setState(prev => ({ 
        ...prev, 
        connected: false, 
        authenticated: false 
      }));
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión WebSocket:', error);
      setState(prev => ({ 
        ...prev, 
        connected: false, 
        error: error.message 
      }));
    });

    // Eventos del servidor
    socket.on('CONNECTED', (data) => {
      console.log('✅ Autenticado:', data);
      setState(prev => ({ ...prev, authenticated: true }));
    });

    socket.on('SUBSCRIBED', (data) => {
      console.log('📡 Suscrito a:', data.room);
    });

    socket.on('RESULTADOS_ACTUALIZADOS', (data) => {
      console.log('📊 Resultados actualizados:', data);
      events?.onResultadosActualizados?.(data);
    });

    socket.on('PROGRESO_MESAS', (data) => {
      console.log('📈 Progreso mesas:', data);
      events?.onProgresoMesas?.(data);
    });

    socket.on('NUEVA_ACTA', (data) => {
      console.log('📝 Nueva acta:', data);
      events?.onNuevaActa?.(data);
    });

    socket.on('ACTA_VALIDADA', (data) => {
      console.log('✅ Acta validada:', data);
      events?.onActaValidada?.(data);
    });

    socket.on('ALERTA', (data) => {
      console.log('🚨 Alerta:', data);
      events?.onAlerta?.(data);
    });

    socket.on('STATS_RESPONSE', (data) => {
      setState(prev => ({ ...prev, stats: data }));
    });

    socket.on('ERROR', (error) => {
      console.error('❌ Error del servidor:', error);
      setState(prev => ({ ...prev, error: error.message }));
    });

    // Cleanup
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  // Función para suscribirse a un territorio
  const subscribe = useCallback((scopeType: string, scopeId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe', { scope_type: scopeType, scope_id: scopeId });
    }
  }, []);

  // Función para desuscribirse
  const unsubscribe = useCallback((scopeType: string, scopeId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('unsubscribe', { scope_type: scopeType, scope_id: scopeId });
    }
  }, []);

  // Función para obtener estadísticas
  const getStats = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('get_stats');
    }
  }, []);

  return {
    ...state,
    subscribe,
    unsubscribe,
    getStats,
  };
}

export default useWebSocket;
