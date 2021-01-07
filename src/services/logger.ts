import {LogglyTracker} from 'react-native-loggly-jslogger';

export interface ILogger {
    debug(message: any, ...args: any[]): void;
    log(message: any, ...args: any[]): void;
    info(message: any, ...args: any[]): void;
    warn(message: any, ...args: any[]): void;
    error(message: any, ...args: any[]): void;
}

export class Logger implements ILogger {
    private static _logger: Logger;
    private _tracker: LogglyTracker;
    constructor() {
        this._tracker = new LogglyTracker();
        this._tracker = new LogglyTracker();
        this._tracker.push({logglyKey: '50f28fd9-0ba8-4faa-893b-9b66bc35f088'});
        this._tracker.push('podnoms-mobile');
    }
    public static getInstance(): ILogger {
        if (!this._logger) {
            this._logger = new Logger();
            this._logger._tracker.push({
                logglyKey: '50f28fd9-0ba8-4faa-893b-9b66bc35f088',
            });
            this._logger._tracker.push('podnoms-mobile');
        }
        return this._logger;
    }

    public debug(message: any, ...args: any[]): void {
        this.__emitLog('debug', message, args);
    }
    public log(message: any, ...args: any[]): void {
        this.__emitLog('log', message, args);
    }
    public info(message: any, ...args: any[]): void {
        this.__emitLog('info', message, args);
    }
    public warn(message: any, ...args: any[]): void {
        this.__emitLog('warn', message, args);
    }
    public error(message: any, ...args: any[]): void {
        this.__emitLog('error', message, args);
    }

    private __emitLog(
        type: 'debug' | 'log' | 'info' | 'warn' | 'error',
        message: any,
        ...args: any[]
    ) {
        this._tracker.push('podnoms-mobile', type, message, args);
    }
}
