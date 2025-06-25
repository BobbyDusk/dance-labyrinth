import pino from 'pino';

export default pino({
  level: import.meta.env.VITE_LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});