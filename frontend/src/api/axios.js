import axios from 'axios';

// Create a customized axios instance pointing to your Spring Boot backend
const api = axios.create({
    baseURL: 'http://localhost:8088/api', 
});

// Intercept requests to automatically attach the JWT token if the user is logged in
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;