import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { WinstonModule } from 'nest-winston';
import * as path from 'path';
import * as fs from 'fs';

// 로그 디렉토리 생성
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// 콘솔 포맷 설정
const consoleFormat = winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.ms(),
        winston.format.printf(({ timestamp, level, message, context, ms, ...meta }) => {
            // context가 객체이면 message 앞에 붙이기
            if (typeof context === 'object' && context !== null && context !== undefined) {
                message = `${JSON.stringify(context)} ${message}`;
                context = 'Application';
            }

            // nestLike 포맷 수동 구현
            const pid = process.pid;
            const levelColor = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : level === 'info' ? '\x1b[32m' : '\x1b[36m';
            const resetColor = '\x1b[0m';
            const contextStr = context || 'Application';

            return `\x1b[33m[StopLineMonitor]\x1b[0m ${pid} ${timestamp} ${levelColor}${level.toUpperCase().padEnd(7)}${resetColor}[${contextStr}] ${message} ${ms || ''}`;
        })
);

// 통일된 파일 포맷 설정 - [context][level][timestamp] message 형태
const fileFormat = winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, context, stack, ...meta }) => {
            let contextStr: string;
            let finalMessage = String(message);

            if (typeof context === 'string') {
                contextStr = context;
            } else if (context === null || context === undefined) {
                contextStr = 'Application';
            } else if (typeof context === 'object') {
                contextStr = 'Application';
                finalMessage = `${JSON.stringify(context)} ${finalMessage}`;
            } else {
                contextStr = String(context);
            }
            let logMessage = `[${contextStr}][${level}][${String(timestamp)}] ${finalMessage}`;

            // 스택 트레이스나 추가 메타데이터가 있는 경우 추가
            if (stack) {
                logMessage += `\n${String(stack)}`;
            }

            // 추가 메타데이터가 있는 경우 JSON 형태로 추가
            const metaKeys = Object.keys(meta);
            if (metaKeys.length > 0) {
                logMessage += `\nMeta: ${JSON.stringify(meta)}`;
            }

            return logMessage;
        }),
);

// Daily Rotate File 설정 - 전체 로그 (audit 파일 비활성화)
const dailyRotateFileTransport = new DailyRotateFile({
    filename: path.join(logDir, 'debug-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: fileFormat,
});

// Daily Rotate File 설정 - 에러 로그만 (audit 파일 비활성화)
const errorRotateFileTransport = new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: fileFormat,
});

// Daily Rotate File 설정 - 배치 작업 로그 (audit 파일 비활성화)
const batchRotateFileTransport = new DailyRotateFile({
    filename: path.join(logDir, 'batch-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '50m',
    maxFiles: '7d',
    format: fileFormat,
});

// Daily Rotate File 설정 - 예외 로그
const exceptionRotateFileTransport = new DailyRotateFile({
    filename: path.join(logDir, 'exceptions-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    format: fileFormat,
});

// Daily Rotate File 설정 - Promise rejection 로그
const rejectionRotateFileTransport = new DailyRotateFile({
    filename: path.join(logDir, 'rejections-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    format: fileFormat,
});

// Winston 로거 설정
export const winstonConfig = {
    transports: [
        // 콘솔 출력
        new winston.transports.Console({
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
            format: consoleFormat,
        }),
        // 전체 로그 파일
        dailyRotateFileTransport,
        // 에러 로그 파일
        errorRotateFileTransport,
        // 배치 작업 로그 파일
        batchRotateFileTransport,
    ],
    // 처리되지 않은 예외도 로깅 (날짜별 관리)
    exceptionHandlers: [
        exceptionRotateFileTransport,
    ],
    // 처리되지 않은 Promise rejection도 로깅 (날짜별 관리)
    rejectionHandlers: [
        rejectionRotateFileTransport,
    ],
};

// NestJS에서 사용할 Winston 로거 인스턴스
export const createWinstonLogger = () => {
    return WinstonModule.createLogger(winstonConfig);
};
