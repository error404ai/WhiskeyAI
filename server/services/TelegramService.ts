/* eslint-disable @typescript-eslint/no-explicit-any */
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { sleep } from "telegram/Helpers";

class TelegramService {
  private apiId: number;
  private apiHash: string;
  private stringSession: StringSession;
  private client: TelegramClient;
  private isConnected: boolean = false;
  private connectionRetries: number = 3;
  private connectionRetryDelay: number = 1000; // 1 second

  constructor() {
    this.apiId = Number(process.env.TELEGRAM_APP_API_ID!);
    this.apiHash = process.env.TELEGRAM_API_HASH!;
    this.stringSession = new StringSession(process.env.TELEGRAM_SESSION || ""); // Load existing session
    this.client = new TelegramClient(this.stringSession, this.apiId, this.apiHash, {
      connectionRetries: 5,
      useWSS: true, // Try using WebSocket Secure connection
      maxConcurrentDownloads: 1, // Lower concurrent operations
    });
  }

  async connect(): Promise<boolean> {
    if (this.isConnected) {
      return true;
    }

    // Retry connection multiple times
    for (let attempt = 1; attempt <= this.connectionRetries; attempt++) {
      try {
        await this.client.connect();
        this.isConnected = true;
        return true;
      } catch (error) {
        console.error(`Error connecting to Telegram (attempt ${attempt}/${this.connectionRetries}):`, error);
        
        // If this is the final attempt, fail
        if (attempt === this.connectionRetries) {
          this.isConnected = false;
          return false;
        }
        
        // Wait before retrying
        await sleep(this.connectionRetryDelay);
      }
    }
    
    return false;
  }

  async checkAuth(): Promise<any | null> {
    if (!this.isConnected && !(await this.connect())) {
      throw new Error("Failed to connect to Telegram");
    }
    
    try {
      const me = await this.client.getMe();
      return me;
    } catch (error) {
      console.error("Authentication check failed:", error);
      return null;
    }
  }

  async getEntity(username: string | number): Promise<any | null> {
    if (!this.isConnected && !(await this.connect())) {
      throw new Error("Failed to connect to Telegram");
    }
    
    try {
      // Add a timeout to prevent hanging
      const entity = await Promise.race([
        this.client.getEntity(username),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error("Operation timed out")), 10000)
        )
      ]);
      
      if (!entity) {
        throw new Error(`Entity "${username}" not found`);
      }
      
      return entity;
    } catch (error) {
      console.error(`Error getting entity "${username}":`, error);
      throw error;
    }
  }

  async getChannelMessages(channelUsername: string, limit: number = 100): Promise<any[]> {
    if (!this.isConnected && !(await this.connect())) {
      throw new Error("Failed to connect to Telegram");
    }
    
    try {
      const channel = await this.getEntity(channelUsername);
      
      // Add a timeout to prevent hanging
      const result = await Promise.race([
        this.client.getMessages(channel, { limit }),
        new Promise<[]>((_, reject) => 
          setTimeout(() => reject(new Error("Operation timed out")), 15000)
        )
      ]);
      
      if (!result || result.length === 0) {
        throw new Error(`No messages found for channel "${channelUsername}"`);
      }
      
      return result;
    } catch (error) {
      console.error(`Error getting messages from channel "${channelUsername}":`, error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      try {
        await this.client.disconnect();
      } catch (error) {
        console.error("Error disconnecting from Telegram:", error);
      } finally {
        this.isConnected = false;
      }
    }
  }
}

const telegramService = new TelegramService();
export default telegramService;
