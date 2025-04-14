// Define types to match what's returned by the real AgentService
export interface Agent {
    id: number
    uuid: string
    name: string
    userId: number
    status: "running" | "paused"
    tickerSymbol?: string | null
    tokenAddress?: string | null
    information?: Record<string, unknown> | null
    triggers?: Array<Record<string, unknown>> | null
    paymentTimestamp?: string | null
}

export interface SchedulePost {
    content: string
    scheduledTime: string
    agentId: string
}

export interface FormValues {
    delayMinutes: number
    schedulePosts: SchedulePost[]
}

// Define more specific types for Excel data
export type ExcelCell = string | number | boolean | null | undefined
export type ExcelRow = ExcelCell[]
export type ExcelData = ExcelRow[]

export interface ScheduledTweetWithAgent {
    id: number;
    agentId: number;
    content: string;
    scheduledAt: Date;
    status: "pending" | "completed" | "failed" | null;
    createdAt: Date | null;
    processedAt: Date | null;
    errorMessage: string | null;
    agent?: {
        name: string;
        uuid: string;
    };
}

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error'; 