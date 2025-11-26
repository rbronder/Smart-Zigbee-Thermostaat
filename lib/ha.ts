import { 
  getAuth, 
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
  } as unknown as Auth; // Casting because the library expects a slightly different internal structure for OAuth
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
}

export const haService = new HaService();