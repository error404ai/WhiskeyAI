/* eslint-disable @typescript-eslint/no-explicit-any */
import { TelegramClient } from "telegram";
import { sleep } from "telegram/Helpers";
import { StringSession } from "telegram/sessions";
import { AdminSettingsService } from "./admin/AdminSettingsService";

// Store temporary auth clients to maintain session between requests
const tempAuthClients: Record<string, { client: TelegramClient; phoneCodeHash: string }> = {};

// private apiId: number;
// private apiHash: string;
// private stringSession: StringSession;
// private client: TelegramClient;
// private isConnected: boolean = false;
// private connectionRetries: number = 3;
// private connectionRetryDelay: number = 1000; // 1 second

// constructor() {
//   this.apiId = Number(process.env.TELEGRAM_APP_API_ID!);
//   this.apiHash = process.env.TELEGRAM_API_HASH!;
//   this.stringSession = new StringSession(process.env.TELEGRAM_SESSION || ""); // Load existing session
//   this.client = new TelegramClient(this.stringSession, this.apiId, this.apiHash, {
//     connectionRetries: 5,
//     useWSS: true, // Try using WebSocket Secure connection
//     maxConcurrentDownloads: 1, // Lower concurrent operations
//   });
// }

class TelegramService {
  private apiId: number | null = null;
  private apiHash: string | null = null;
  private stringSession: StringSession | null = null;
  private client: TelegramClient | null = null;
  private isConnected: boolean = false;
  private connectionRetries: number = 3;
  private connectionRetryDelay: number = 1000;

  async initializeClient(): Promise<void> {
    if (this.client) {
      return;
    }
    const settings = await AdminSettingsService.getSettings();
    this.apiId = Number(settings.settings?.telegramApiId);
    this.apiHash = settings.settings?.telegramApiHash ?? "";
    this.stringSession = new StringSession(settings.settings?.telegramSessionString ?? "");
    this.client = new TelegramClient(this.stringSession, this.apiId, this.apiHash, {
      connectionRetries: 5,
      useWSS: true,
      maxConcurrentDownloads: 1,
      autoReconnect: true,
      useIPV6: false,
      floodSleepThreshold: 60,
      baseLogger: undefined,
    });
  }

  /**
   * Connect to Telegram
   */
  async connect(): Promise<boolean> {
    await this.initializeClient();
    if (this.isConnected) {
      return true;
    }
    for (let attempt = 1; attempt <= this.connectionRetries; attempt++) {
      try {
        await (this.client as TelegramClient).connect();
        this.isConnected = true;
        return true;
      } catch (error) {
        console.error(`Error connecting to Telegram (attempt ${attempt}/${this.connectionRetries}):`, error);
        if (attempt === this.connectionRetries) {
          this.isConnected = false;
          return false;
        }

        await sleep(this.connectionRetryDelay);
      }
    }

    return false;
  }

  async sendCode(phoneNumber: string): Promise<{
    phoneCodeHash: string;
    sessionId: string;
    isCodeSent: boolean;
    timeout: number;
  }> {
    await this.initializeClient();
    if (!this.apiId || !this.apiHash) {
      throw new Error("API ID and API Hash are not set");
    }
    console.log("Starting sendCode process for phone", phoneNumber);
    // Create a unique ID for this authentication session
    const sessionId = `auth_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    try {
      // Connect to Telegram first with the main client
      if (!this.isConnected) {
        await this.connect();
      }

      console.log("Connected to Telegram, sending verification code...");

      // Use the correct method signature as per your code
      const sendCodeResult = await (this.client as TelegramClient).sendCode(
        {
          apiId: this.apiId,
          apiHash: this.apiHash,
        },
        phoneNumber,
      );

      console.log("Code sent successfully, phone code hash:", sendCodeResult.phoneCodeHash);

      // Store the auth client for later use
      tempAuthClients[sessionId] = {
        client: this.client as TelegramClient,
        phoneCodeHash: sendCodeResult.phoneCodeHash,
      };

      return {
        phoneCodeHash: sendCodeResult.phoneCodeHash,
        sessionId,
        isCodeSent: true,
        timeout: 120, // Default timeout in seconds
      };
    } catch (error) {
      console.error("Error sending verification code:", error);
      throw error;
    }
  }

  async login(
    sessionId: string,
    phoneNumber: string,
    phoneCode: string,
    password?: string,
  ): Promise<{
    sessionString: string;
    user: any;
  }> {
    await this.initializeClient();
    console.log("Starting login process for session", sessionId);

    // Get the stored auth client
    const stored = tempAuthClients[sessionId];
    if (!stored) {
      throw new Error("Authentication session expired or invalid. Please request a new code.");
    }

    // We only need the client, since phoneCodeHash will be automatically used by the client
    const { client: authClient } = stored;

    try {
      console.log("Attempting to sign in with verification code");

      // Try to sign in with the code
      let user;
      try {
        // Use the client's start method with the saved phoneCodeHash
        user = await authClient.start({
          phoneNumber: () => Promise.resolve(phoneNumber),
          password: () => Promise.resolve(password || ""),
          phoneCode: () => Promise.resolve(phoneCode),
          onError: (err) => {
            console.error("Login error during start:", err);
            return Promise.resolve(false); // continue login flow
          },
        });

        console.log("Sign in successful");
      } catch (error) {
        console.error("Error during sign in:", error);
        throw error;
      }

      // Get session string
      const sessionString = authClient.session.save() as unknown as string;
      console.log("Session string generated successfully");

      // Clean up
      delete tempAuthClients[sessionId];

      return {
        sessionString,
        user,
      };
    } catch (error) {
      console.error("Login error:", error);
      delete tempAuthClients[sessionId];
      throw error;
    }
  }

  /**
   * Check if the current session is authenticated
   */
  async checkAuth(): Promise<any | null> {
    await this.initializeClient();
    if (!this.isConnected && !(await this.connect())) {
      throw new Error("Failed to connect to Telegram");
    }

    try {
      const me = await (this.client as TelegramClient).getMe();
      return me;
    } catch (error) {
      console.error("Authentication check failed:", error);
      return null;
    }
  }

  async getEntity(username: string | number): Promise<any | null> {
    await this.initializeClient();
    if (!this.isConnected && !(await this.connect())) {
      throw new Error("Failed to connect to Telegram");
    }

    try {
      // Add a timeout to prevent hanging
      const entity = await Promise.race([(this.client as TelegramClient).getEntity(username), new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Operation timed out")), 10000))]);

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
    await this.initializeClient();
    if (!this.isConnected && !(await this.connect())) {
      throw new Error("Failed to connect to Telegram");
    }

    try {
      const channel = await this.getEntity(channelUsername);

      // Add a timeout to prevent hanging
      const result = await Promise.race([(this.client as TelegramClient).getMessages(channel, { limit }), new Promise<[]>((_, reject) => setTimeout(() => reject(new Error("Operation timed out")), 15000))]);

      if (!result || result.length === 0) {
        throw new Error(`No messages found for channel "${channelUsername}"`);
      }

      // Filter only necessary conversation data
      const filteredMessages = result.map((message) => ({
        id: message.id,
        text: message.message || "", // Message content
        senderId: message.senderId?.toString() || "unknown", // Sender identifier
        date: message.date, // Unix timestamp
        // Add other fields if needed, e.g., replyToMessageId for context
      }));

      return filteredMessages;
    } catch (error) {
      console.error(`Error getting messages from channel "${channelUsername}":`, error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.initializeClient();
    if (this.isConnected) {
      try {
        await (this.client as TelegramClient).disconnect();
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
