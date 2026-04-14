import axios from 'axios';

// Create a customized axios instance pointing to your live Spring Boot backend
const api = axios.create({
    baseURL: 'https://comp307-winter2026-project.onrender.com/api'
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