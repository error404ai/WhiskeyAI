/* eslint-disable @typescript-eslint/no-explicit-any */
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

class TelegramService {
  private apiId: number;
  private apiHash: string;
  private stringSession: StringSession;
  private client: TelegramClient;
  private isConnected: boolean = false;

  constructor() {
    this.apiId = Number(process.env.TELEGRAM_APP_API_ID!);
    this.apiHash = process.env.TELEGRAM_API_HASH!;
    this.stringSession = new StringSession(process.env.TELEGRAM_SESSION || ""); // Load existing session
    this.client = new TelegramClient(this.stringSession, this.apiId, this.apiHash, {
      connectionRetries: 5,
    });
  }

  async connect(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.client.connect();
        this.isConnected = true;
        if (!this.client.session.authKey) {
          console.warn("No Telegram session found. Public channel access might be limited.");
          return true; // Allow connection for public data retrieval attempts
        } else {
          console.log("Connected to Telegram with existing session.");
          return true;
        }
      } else {
        console.log("Already connected to Telegram.");
        return true;
      }
    } catch (error) {
      console.error("Error connecting to Telegram:", error);
      this.isConnected = false;
      return false;
    }
  }

  async getEntity(username: string | number): Promise<any | null> {
    if (!this.isConnected && !(await this.connect())) {
      console.error("Not connected to Telegram.");
      return null;
    }
    try {
      return await this.client.getEntity(username);
    } catch (error) {
      console.error(`Error getting entity "${username}":`, error);
      return null;
    }
  }

  async getChannelMessages(channelUsername: string, limit: number = 100): Promise<any[]> {
    if (!this.isConnected && !(await this.connect())) {
      console.error("Not connected to Telegram.");
      return [];
    }
    try {
      const channel = await this.getEntity(channelUsername);
      if (!channel) {
        console.error(`Channel "${channelUsername}" not found.`);
        return [];
      }
      const result = await this.client.getMessages(channel, { limit });
      return result;
    } catch (error) {
      console.error(`Error getting messages from channel "${channelUsername}":`, error);
      return [];
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
      console.log("Disconnected from Telegram.");
    }
  }
}

const telegramService = new TelegramService();
export default telegramService;
