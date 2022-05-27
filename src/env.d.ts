declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      REDIS_URL: string;
      PORT: string;
      SECRET_SESSION: string;
      CORS_ORIGIN: string;
    }
  }
}

export {}
