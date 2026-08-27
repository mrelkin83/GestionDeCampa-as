/**
 * WebSocket Client para Preconteo
 * 
 * Ejemplo de uso del cliente Socket.io para conectarse al sistema
 * de preconteo electoral en tiempo real.
 * 
 * Uso:
 * ```javascript
 * const client = new PreconteoWebSocketClient('http://localhost:3000');
 * await client.connect('jwt-token-aqui');
 * client.subscribe('DEPARTAMENTO', 5, 1); // Antioquia, Alcaldía
 * client.onResultados = (data) => console.log('Resultados:', data);
 * ```
 */

class PreconteoWebSocketClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.socket = null;
    this.connected = false;
    this.subscriptions = new Set();
    
    // Callbacks
    this.onResultados = null;
    this.onProgreso = null;
    this.onAlerta = null;
    this.onNuevaActa = null;
    this.onActaValidada = null;
    this.onError = null;
  }

  /**
   * Conectar al servidor WebSocket
   */
  async connect(token) {
    return new Promise((resolve, reject) => {
      // Importar socket.io-client dinámicamente
      // En browser: <script src="/socket.io/socket.io.js"></script>
      // En Node.js: const io = require('socket.io-client');
      
      if (typeof io === 'undefined') {
        reject(new Error('Socket.io client no disponible. Incluye: <script src="/socket.io/socket.io.js"></script>'));
        return;
      }

      this.socket = io(`${this.serverUrl}/ws/preconteo`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Eventos de conexión
      this.socket.on('connect', () => {
        console.log('✅ Conectado al servidor de preconteo');
        this.connected = true;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Error de conexión:', error.message);
        this.connected = false;
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Desconectado:', reason);
        this.connected = false;
      });

      // Eventos del sistema
      this.socket.on('CONNECTED', (data) => {
        console.log('🔗 Conexión confirmada:', data);
      });

      this.socket.on('SUBSCRIBED', (data) => {
        console.log('📥 Suscrito a:', data.room);
      });

      this.socket.on('UNSUBSCRIBED', (data) => {
        console.log('📤 Desuscrito de:', data.room);
      });

      // Eventos de datos
      this.socket.on('RESULTADOS_ACTUALIZADOS', (data) => {
        console.log('📊 Resultados actualizados:', data);
        if (this.onResultados) this.onResultados(data);
      });

      this.socket.on('PROGRESO_MESAS', (data) => {
        console.log('📈 Progreso:', data.data.porcentaje_avance + '%');
        if (this.onProgreso) this.onProgreso(data);
      });

      this.socket.on('ALERTA', (data) => {
        console.log('🚨 Alerta [' + data.severidad + ']:', data.mensaje);
        if (this.onAlerta) this.onAlerta(data);
      });

      this.socket.on('NUEVA_ACTA', (data) => {
        console.log('📝 Nueva acta:', data);
        if (this.onNuevaActa) this.onNuevaActa(data);
      });

      this.socket.on('ACTA_VALIDADA', (data) => {
        console.log('✅ Acta validada:', data);
        if (this.onActaValidada) this.onActaValidada(data);
      });

      this.socket.on('ESTADO_ACTUAL', (data) => {
        console.log('📋 Estado actual:', data);
      });

      // Heartbeat
      this.socket.on('pong', (data) => {
        console.log('🏓 Pong:', data.timestamp);
      });

      // Errores
      this.socket.on('ERROR', (data) => {
        console.error('❌ Error del servidor:', data);
        if (this.onError) this.onError(data);
      });
    });
  }

  /**
   * Suscribirse a actualizaciones de un territorio
   */
  subscribe(scopeType, scopeId, electionPositionId) {
    if (!this.connected) {
      console.error('❌ No conectado. Llama a connect() primero.');
      return;
    }

    const subscriptionKey = `${scopeType}:${scopeId}:${electionPositionId}`;
    
    if (this.subscriptions.has(subscriptionKey)) {
      console.log('⚠️  Ya suscrito a:', subscriptionKey);
      return;
    }

    this.socket.emit('subscribe', {
      scope_type: scopeType,
      scope_id: scopeId,
      election_position_id: electionPositionId
    });

    this.subscriptions.add(subscriptionKey);
    console.log('📥 Suscribiendo a:', subscriptionKey);
  }

  /**
   * Desuscribirse de un territorio
   */
  unsubscribe(scopeType, scopeId, electionPositionId) {
    if (!this.connected) return;

    const subscriptionKey = `${scopeType}:${scopeId}:${electionPositionId}`;
    
    this.socket.emit('unsubscribe', {
      scope_type: scopeType,
      scope_id: scopeId,
      election_position_id: electionPositionId
    });

    this.subscriptions.delete(subscriptionKey);
    console.log('📤 Desuscribiendo de:', subscriptionKey);
  }

  /**
   * Enviar ping (heartbeat)
   */
  ping() {
    if (!this.connected) return;
    this.socket.emit('ping');
  }

  /**
   * Obtener estadísticas del servidor
   */
  getStats() {
    if (!this.connected) return;
    this.socket.emit('get_stats', (response) => {
      console.log('📊 Estadísticas:', response);
    });
  }

  /**
   * Desconectar
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
      this.subscriptions.clear();
      console.log('👋 Desconectado manualmente');
    }
  }
}

// Ejemplo de uso
async function ejemploUso() {
  const client = new PreconteoWebSocketClient('http://localhost:3000');

  // Configurar callbacks
  client.onResultados = (data) => {
    console.log('📊 Actualización de resultados:', data.data.resultados);
    // Actualizar UI con nuevos resultados
  };

  client.onProgreso = (data) => {
    console.log('📈 Avance:', data.data.porcentaje_avance + '%');
    // Actualizar barra de progreso
  };

  client.onAlerta = (data) => {
    console.log('🚨 Alerta:', data.mensaje);
    // Mostrar notificación de alerta
  };

  try {
    // Conectar con token JWT
    await client.connect('tu-jwt-token-aqui');

    // Suscribirse a resultados de Antioquia para Alcaldía
    client.subscribe('DEPARTAMENTO', 5, 1);

    // Suscribirse también a Medellín
    client.subscribe('MUNICIPIO', 5001, 1);

    // Ping cada 30 segundos para mantener conexión
    setInterval(() => client.ping(), 30000);

  } catch (error) {
    console.error('Error conectando:', error);
  }
}

// Exportar para usar en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PreconteoWebSocketClient };
}
