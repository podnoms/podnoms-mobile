import log from 'loglevel';
import remote from 'loglevel-plugin-remote';
import getEnvVars from '../environment';

const {logUrl} = getEnvVars();
export interface ILogger {
    debug(message: any, ...args: any[]): void;
    log(message: any, ...args: any[]): void;
    info(message: any, ...args: any[]): void;
    warn(message: any, ...args: any[]): void;
    error(message: any, ...args: any[]): void;
}

export class Logger implements ILogger {
    private static instance: ILogger;
    public static getInstance(): ILogger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    constructor() {
        const customJSON = (log) => ({
            msg: log.message,
            level: log.level.label,
            stacktrace: log.stacktrace,
        });
        remote.apply(log, {
            format: customJSON,
            url: logUrl,
            method: 'POST',
        });
        log.enableAll();
    }
    public debug(message: any, ...args: any[]): void {
        log.debug(message, args);
    }
    public log(message: any, ...args: any[]): void {
        log.log(message, args);
    }
    public info(message: any, ...args: any[]): void {
        log.debug(message, args);
    }
    public warn(message: any, ...args: any[]): void {
        log.debug(message, args);
    }
    public error(message: any, ...args: any[]): void {
        log.debug(message, args);
    }
}

export default Logger.getInstance();
