"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = exports.errorLogger = exports.performanceLogger = exports.createLogger = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple(), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
}));
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'realtime-server' },
    transports: [
        new winston_1.default.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'logs/combined.log' }),
        new winston_1.default.transports.Console({
            format: consoleFormat
        })
    ],
});
const createLogger = (service) => {
    return winston_1.default.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: logFormat,
        defaultMeta: { service },
        transports: [
            new winston_1.default.transports.File({ filename: `logs/${service}-error.log`, level: 'error' }),
            new winston_1.default.transports.File({ filename: `logs/${service}-combined.log` }),
            new winston_1.default.transports.Console({
                format: consoleFormat
            })
        ],
    });
};
exports.createLogger = createLogger;
exports.performanceLogger = (0, exports.createLogger)('performance');
exports.errorLogger = (0, exports.createLogger)('error');
exports.auditLogger = (0, exports.createLogger)('audit');
//# sourceMappingURL=logger.js.map