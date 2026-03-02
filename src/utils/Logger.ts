import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    details?: any;
}

const MAX_LOGS = 200;
const LOG_FILE = `${FileSystem.documentDirectory}app_logs.json`;

class Logger {
    private static instance: Logger;
    private logs: LogEntry[] = [];
    private isInitialized = false;

    private constructor() {
        this.init();
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private async init() {
        if (this.isInitialized) return;
        try {
            const info = await FileSystem.getInfoAsync(LOG_FILE);
            if (info.exists) {
                const content = await FileSystem.readAsStringAsync(LOG_FILE);
                this.logs = JSON.parse(content);
            }
            this.setupGlobalHandlers();
            this.isInitialized = true;
            this.info("Logger initialized with persistent storage");
        } catch (e) {
            console.error("Failed to initialize persistent logger", e);
        }
    }

    private setupGlobalHandlers() {
        // Capture unhandled JS exceptions
        const originalHandler = (global as any).ErrorUtils?.getGlobalHandler();
        (global as any).ErrorUtils?.setGlobalHandler(async (error: any, isFatal: any) => {
            this.error(`FATAL EXCEPTION: ${error.message}`, { stack: error.stack, isFatal });
            await this.saveLogs();
            if (originalHandler) {
                originalHandler(error, isFatal);
            }
        });
    }

    private async saveLogs() {
        try {
            await FileSystem.writeAsStringAsync(LOG_FILE, JSON.stringify(this.logs));
        } catch (e) {
            console.error("Failed to save logs to file", e);
        }
    }

    private addLog(level: LogLevel, message: string, details?: any) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            details: details ? (typeof details === 'object' ? JSON.stringify(details) : details) : undefined,
        };

        this.logs.unshift(entry);
        if (this.logs.length > MAX_LOGS) {
            this.logs.pop();
        }

        // Save periodically/directly
        this.saveLogs();

        // Also log to console in development
        if (__DEV__) {
            const consoleMethod = level === 'info' ? 'log' : level;
            console[consoleMethod](`[${level.toUpperCase()}] ${message}`, details || '');
        }
    }

    public info(message: string, details?: any) {
        this.addLog('info', message, details);
    }

    public warn(message: string, details?: any) {
        this.addLog('warn', message, details);
    }

    public error(message: string, details?: any) {
        this.addLog('error', message, details);
    }

    public getLogsAsString(): string {
        return this.logs
            .map(log => `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message} ${log.details || ''}`)
            .join('\n');
    }

    public getDebugInfo(): string {
        return `
--- DEBUG INFO ---
App Version: 2.7.1 (Stability)
Platform: ${Platform.OS} ${Platform.Version}
Timestamp: ${new Date().toISOString()}
------------------
`;
    }

    public async clearLogs() {
        this.logs = [];
        try {
            await FileSystem.deleteAsync(LOG_FILE, { idempotent: true });
        } catch (e) {
            console.error("Failed to clear log file", e);
        }
    }
}

export const log = Logger.getInstance();
