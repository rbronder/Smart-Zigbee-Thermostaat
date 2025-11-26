import { 
  createConnection, 
  subscribeEntities, 
  callService,
  Connection, 
  Auth,
  HassEntities
} from "home-assistant-js-websocket";

// Helper to create a long-lived token auth object directly
function createLongLivedTokenAuth(url: string, token: string): Auth {
  return {
    data: {
      hassUrl: url,
      clientId: null,
      expires: 0,
      refresh_token: '',
      access_token: token,
      expires_in: -1,
    },
    wsUrl: url.replace('http', 'ws') + '/api/websocket',
    accessToken: token,
    expired: false,
    refreshAccessToken: async () => '',
  } as unknown as Auth; 
}

export class HaService {
  private connection: Connection | null = null;
  private unsubscribeEntities: (() => void) | null = null;

  async connect(url: string, token: string, onEntitiesChanged: (entities: HassEntities) => void) {
    if (this.connection) {
      this.disconnect();
    }

    try {
      const auth = createLongLivedTokenAuth(url, token);
      this.connection = await createConnection({ auth });
      
      this.unsubscribeEntities = subscribeEntities(
        this.connection,
        (entities) => onEntitiesChanged(entities)
      );
      
      console.log("Connected to Home Assistant");
      return true;
    } catch (err) {
      console.error("Failed to connect to Home Assistant:", err);
      return false;
    }
  }

  disconnect() {
    if (this.unsubscribeEntities) {
      this.unsubscribeEntities();
      this.unsubscribeEntities = null;
    }
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
  }

  async setSwitch(entityId: string, turnOn: boolean) {
    if (!this.connection) return;
    
    const domain = entityId.split('.')[0];
    const service = turnOn ? 'turn_on' : 'turn_off';
    
    await callService(this.connection, domain, service, {
      entity_id: entityId
    });
  }

  async fetchHistory(url: string, token: string, entityIds: string[]) {
    try {
      // Calculate start time (24 hours ago)
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - 24);
      const isoStart = startTime.toISOString();

      // Use REST API for history as it is simpler for bulk data retrieval than WS
      // Endpoint: /api/history/period/<timestamp>?filter_entity_id=...
      const filter = entityIds.join(',');
      const apiUrl = `${url}/api/history/period/${isoStart}?filter_entity_id=${filter}&minimal_response&end_time=${new Date().toISOString()}`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`History fetch failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data; // Returns array of arrays (one inner array per entity)
    } catch (error) {
      console.error("Error fetching history:", error);
      return [];
    }
  }
}

export const haService = new HaService();