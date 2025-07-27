// client/src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Create a memoized axios instance that includes the token
    const authAxios = useMemo(() => {
        const instance = axios.create({
            baseURL: 'http://localhost:5000/api', // Your backend URL
        });

        instance.interceptors.request.use(
            (config) => {
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        instance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                // Example: If 401 and not already retrying, attempt token refresh
                if (error.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    console.error("AuthAxios Interceptor: Unauthorized request. Token might be invalid or missing.");
                    // If the token is definitively bad, clear it and log out
                    setToken(null);
                    localStorage.removeItem('token');
                    setUser(null);
                    // Optionally, redirect to login page here
                }
                return Promise.reject(error);
            }
        );

        return instance;
    }, [token]);

    // This useEffect fetches the user data on initial mount
    // and when the token changes (e.g., after login/logout)
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    setLoading(true);
                    const res = await authAxios.get('/auth/me');
                    setUser(res.data);
                } catch (err) {
                    console.error('Failed to load user from /auth/me:', err);
                    // If 'me' fails, it means the token is bad, so clear it
                    setToken(null);
                    localStorage.removeItem('token');
                    setUser(null);
                } finally {
                    setLoading(false);
                }
            } else {
                setUser(null);
                setLoading(false);
            }
        };

        loadUser();
    }, [token, authAxios]); // Depend on token and authAxios

    // Function to handle login
    const login = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            const newToken = res.data.token;
            setToken(newToken);
            localStorage.setItem('token', newToken);
            // The useEffect above will now trigger to load the user
            return res.data;
        } catch (err) {
            console.error('Login failed:', err);
            throw err;
        }
    };

    // Function to handle registration (New)
    const register = async (userData) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', userData);
            const newToken = res.data.token;
            setToken(newToken);
            localStorage.setItem('token', newToken);
            // The useEffect above will now trigger to load the user
            return res.data;
        } catch (err) {
            console.error('Registration failed:', err);
            throw err;
        }
    };

    // Function to handle logout
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        // Optionally redirect to login page
    };

    const value = useMemo(() => ({
        user,
        token,
        loading,
        authAxios,
        login,
        register, // Expose the new register function
        logout,
    }), [user, token, loading, authAxios, login, register, logout]); // Include register in dependencies

    // You might want to render children only when loading is false
    if (loading) {
        return <div>Authenticating...</div>; // Or a spinner
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
