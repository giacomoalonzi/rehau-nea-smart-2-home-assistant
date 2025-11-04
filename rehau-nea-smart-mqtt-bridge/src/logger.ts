import winston from 'winston';
import { LogLevel } from './types';

const logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

/**
 * Redact sensitive information from objects for safe logging
 * Useful for sharing logs with other developers
 */
export function redactSensitiveData(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveData(item));
  }
  
  const redacted: any = {};
  const sensitiveKeys = [
    'password', 'token', 'access_token', 'refresh_token', 'id_token',
    'authorization', 'auth', 'secret', 'api_key', 'apikey',
    'email', 'username', 'login', 'credential',
    // Address fields
    'address', 'street', 'city', 'zip', 'postal', 'country',
    'latitude', 'longitude', 'lat', 'lng', 'location'
  ];
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    // Check if key exactly matches or contains sensitive keywords
    // But exclude 'user' as a standalone key (it's usually an object container)
    const isSensitive = sensitiveKeys.some(sk => {
      if (sk === 'user' && lowerKey === 'user') {
        return false; // Don't redact 'user' object itself
      }
      return lowerKey.includes(sk);
    });
    
    if (isSensitive) {
      if (typeof value === 'string' && value.length > 0) {
        // Show first 2 and last 2 characters for strings
        if (value.length <= 4) {
          redacted[key] = '***';
        } else {
          redacted[key] = `${value.substring(0, 2)}...${value.substring(value.length - 2)}`;
        }
      } else if (typeof value === 'number') {
        // Redact numbers (lat/lng, zip codes, etc.)
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = '[REDACTED]';
      }
    } else if (typeof value === 'object') {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }
  
  return redacted;
}

/**
 * Safe JSON stringify that handles circular references
 */
function safeStringify(obj: any, indent: number = 2): string {
  const seen = new WeakSet();
  return JSON.stringify(obj, (_key, value) => {
    // Handle circular references
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    // Filter out functions
    if (typeof value === 'function') {
      return '[Function]';
    }
    return value;
  }, indent);
}

/**
 * Log full message dump in debug mode (with redacted sensitive data)
 * @param label - Label for the dump
 * @param data - Data to dump
 * @param condensed - If true, use single-line format (no indentation)
 */
export function debugDump(label: string, data: any, condensed: boolean = false): void {
  if (logLevel === 'debug') {
    try {
      const redacted = redactSensitiveData(data);
      const indent = condensed ? 0 : 2;
      const formatted = safeStringify(redacted, indent);
      
      if (condensed) {
        logger.debug(`[DUMP] ${label}: ${formatted}`);
      } else {
        logger.debug(`[DUMP] ${label}:\n${formatted}`);
      }
    } catch (error) {
      logger.debug(`[DUMP] ${label}: [Unable to serialize data]`);
    }
  }
}

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      let msg = `${timestamp} [${level.toUpperCase()}] ${message}`;
      
      // Add metadata if present
      if (Object.keys(meta).length > 0) {
        // Filter out empty objects and stack traces for cleaner output
        const filteredMeta = Object.entries(meta)
          .filter(([key, value]) => {
            if (key === 'stack') return false;
            if (typeof value === 'object' && value !== null && Object.keys(value as object).length === 0) return false;
            return true;
          })
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        
        if (Object.keys(filteredMeta).length > 0) {
          try {
            msg += ' ' + safeStringify(filteredMeta, 2);
          } catch (error) {
            msg += ' [Unable to serialize metadata]';
          }
        }
      }
      
      return msg;
    })
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error']
    })
  ]
});

export default logger;
