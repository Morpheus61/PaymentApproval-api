import axios, { AxiosError } from 'axios';

// Define API response data interface
interface ApiErrorResponse {
  message: string;
  error?: string;
  details?: Record<string, string>;
}

// Define custom error interface
interface CustomError extends Error {
  status?: number;
  data?: ApiErrorResponse;
}

const isDevelopment = process.env.NODE_ENV === 'development';
const baseURL = isDevelopment ? 'http://localhost:5000' : '';

console.log('Axios config:', {
  isDevelopment,
  baseURL,
  NODE_ENV: process.env.NODE_ENV
});

// Create axios instance with base configuration
const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      console.log('Request config:', {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
        headers: config.headers,
        fullUrl: `${config.baseURL}${config.url}`
      });
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    console.error('Response error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message,
      error: error.response?.data?.error
    });
    
    // Create custom error with additional properties
    const enhancedError = new Error(
      error.response?.data?.message || error.message
    ) as CustomError;
    
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;
    
    return Promise.reject(enhancedError);
  }
);

export default instance;
