/**
 * Environment Variable Validation
 * Ensures all required environment variables are set before server starts
 */

interface RequiredEnvVars {
  [key: string]: {
    required: boolean;
    description: string;
    default?: string;
  };
}

const envVarConfig: RequiredEnvVars = {
  // Security
  JWT_SECRET: {
    required: true,
    description: 'Secret key for signing JWT tokens (MUST be set in production)'
  },

  // Database
  DATABASE_URL: {
    required: false,
    description: 'PostgreSQL connection string',
    default: 'postgresql://postgres:postgres@localhost:5432/partman'
  },
  DB_HOST: {
    required: false,
    description: 'Database host',
    default: 'localhost'
  },
  DB_PORT: {
    required: false,
    description: 'Database port',
    default: '5432'
  },
  DB_NAME: {
    required: false,
    description: 'Database name',
    default: 'partman'
  },
  DB_USER: {
    required: false,
    description: 'Database user',
    default: 'postgres'
  },
  DB_PASSWORD: {
    required: false,
    description: 'Database password',
    default: 'postgres'
  },

  // Application
  NODE_ENV: {
    required: false,
    description: 'Environment mode',
    default: 'development'
  },
  PORT: {
    required: false,
    description: 'API server port',
    default: '3001'
  },

  // JWT Configuration
  JWT_EXPIRY: {
    required: false,
    description: 'JWT token expiry time',
    default: '24h'
  },
  REFRESH_TOKEN_EXPIRY: {
    required: false,
    description: 'Refresh token expiry time',
    default: '7d'
  }
};

export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

/**
 * Validate that all required environment variables are set
 * Throws EnvValidationError if validation fails
 */
export function validateEnvironment(): void {
  const missingVars: string[] = [];
  const warnings: string[] = [];

  // Check each required variable
  for (const [key, config] of Object.entries(envVarConfig)) {
    const value = process.env[key];

    if (!value) {
      if (config.required) {
        missingVars.push(`${key}: ${config.description}`);
      } else if (config.default) {
        process.env[key] = config.default;
        warnings.push(`${key} not set, using default: ${config.default}`);
      }
    }
  }

  // Production-specific validation
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET === 'dev_jwt_secret_change_in_production') {
      missingVars.push('JWT_SECRET: Must not use default value in production');
    }

    if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
      missingVars.push('DATABASE_URL or DB_HOST: Database connection must be configured in production');
    }
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('⚠️  Environment Variable Warnings:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }

  // Throw error if critical variables are missing
  if (missingVars.length > 0) {
    const errorMessage = [
      '❌ Missing required environment variables:',
      ...missingVars.map(v => `   - ${v}`),
      '',
      'Please set these variables in your .env file or environment.'
    ].join('\n');

    throw new EnvValidationError(errorMessage);
  }

  console.log('✅ Environment validation passed');
}

/**
 * Get environment variable with type safety
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not set and no default provided`);
  }
  return value || defaultValue || '';
}

/**
 * Get numeric environment variable
 */
export function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value) {
    if (defaultValue === undefined) {
      throw new Error(`Environment variable ${key} is not set and no default provided`);
    }
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number, got: ${value}`);
  }
  return parsed;
}

/**
 * Get boolean environment variable
 */
export function getEnvBoolean(key: string, defaultValue = false): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}
