const isDevelopment = process.env.NODE_ENV === 'development';

const config = {
  isDevelopment,
  baseURL: isDevelopment ? 'http://localhost:5000/api' : 'http://localhost:5000/api',
  NODE_ENV: process.env.NODE_ENV
};

export default config;
