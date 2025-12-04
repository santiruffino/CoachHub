import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileLogger extends ConsoleLogger {
    private readonly logDir = 'logs';
    private readonly logFile = 'app.log';

    constructor() {
        super();
        this.ensureLogDirectoryExists();
    }

    private ensureLogDirectoryExists() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir);
        }
    }

    log(message: any, ...optionalParams: any[]) {
        super.log(message, ...optionalParams);
        this.writeToFile('LOG', message);
    }

    error(message: any, ...optionalParams: any[]) {
        super.error(message, ...optionalParams);
        this.writeToFile('ERROR', message);
    }

    warn(message: any, ...optionalParams: any[]) {
        super.warn(message, ...optionalParams);
        this.writeToFile('WARN', message);
    }

    debug(message: any, ...optionalParams: any[]) {
        super.debug(message, ...optionalParams);
        this.writeToFile('DEBUG', message);
    }

    verbose(message: any, ...optionalParams: any[]) {
        super.verbose(message, ...optionalParams);
        this.writeToFile('VERBOSE', message);
    }

    private writeToFile(level: string, message: any) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] ${message}\n`;
        const filePath = path.join(this.logDir, this.logFile);

        fs.appendFile(filePath, logMessage, (err) => {
            if (err) {
                console.error('Failed to write to log file:', err);
            }
        });
    }
}
