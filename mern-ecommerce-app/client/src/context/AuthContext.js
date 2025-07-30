// client/src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
    const [impersonatingUser, setImpersonatingUser] = useState(null);
    const [originalAdminToken, setOriginalAdminToken] = useState(localStorage.getItem('originalAdminToken') || null);

    // Create a memoized axios instance that includes the token
    const authAxios = useMemo(() => {
        const instance = axios.create({
            baseURL: 'http://localhost:5000/api', // Your backend URL
            headers: {
                'Content-Type': 'application/json',
            },
        });

        instance.interceptors.request.use(
            (config) => {
                const currentToken = localStorage.getItem('token');
                if (currentToken) {
                    config.headers.Authorization = `Bearer ${currentToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        instance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    console.error("AuthAxios Interceptor: Unauthorized request. Token might be invalid or missing.");
                    localStorage.removeItem('token');
                    localStorage.removeItem('impersonatingUser');
                    localStorage.removeItem('originalAdminToken');
                    setToken(null);
                    setUser(null);
                    setImpersonatingUser(null);
                    setOriginalAdminToken(null);
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );

        return instance;
    }, []);

    useEffect(() => {
        const loadUserFromToken = async () => {
            if (token) {
                try {
                    const decoded = jwtDecode(token);

                    if (decoded.exp * 1000 < Date.now()) {
                        console.log('Token expired. Logging out.');
                        localStorage.removeItem('token');
                        localStorage.removeItem('impersonatingUser');
                        localStorage.removeItem('originalAdminToken');
                        setToken(null);
                        setUser(null);
                        setImpersonatingUser(null);
                        setOriginalAdminToken(null);
                    } else {
                        setUser(decoded);
                        try {
                            const res = await authAxios.get('/auth/me');
                            setUser(res.data);
                            if (res.data.isImpersonating && localStorage.getItem('originalAdminToken')) {
                                setImpersonatingUser(res.data);
                            } else {
                                setImpersonatingUser(null);
                            }
                        } catch (apiErr) {
                            console.error('Failed to fetch user data from /auth/me:', apiErr);
                            localStorage.removeItem('token');
                            localStorage.removeItem('impersonatingUser');
                            localStorage.removeItem('originalAdminToken');
                            setToken(null);
                            setUser(null);
                            setImpersonatingUser(null);
                            setOriginalAdminToken(null);
                        }
                    }
                } catch (err) {
                    console.error('Failed to decode or validate token locally:', err);
                    localStorage.removeItem('token');
                    localStorage.removeItem('impersonatingUser');
                    localStorage.removeItem('originalAdminToken');
                    setToken(null);
                    setUser(null);
                    setImpersonatingUser(null);
                    setOriginalAdminToken(null);
                }
            }
            setLoading(false);
        };

        loadUserFromToken();
    }, [token, authAxios]);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            const newToken = res.data.token;
            localStorage.setItem('token', newToken);
            setToken(newToken);

            const decodedUser = jwtDecode(newToken);
            setUser(decodedUser);

            setImpersonatingUser(null);
            localStorage.removeItem('impersonatingUser');
            setOriginalAdminToken(null);
            localStorage.removeItem('originalAdminToken');

            setLoading(false);
            return decodedUser;
        } catch (error) {
            console.error('Login error:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('impersonatingUser');
            localStorage.removeItem('originalAdminToken');
            setToken(null);
            setUser(null);
            setImpersonatingUser(null);
            setOriginalAdminToken(null);
            setLoading(false);
            throw error;
        }
    }, []);

    // MODIFIED: Register function now accepts a single userData object
    const register = useCallback(async (userData) => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', userData); // Pass the object directly
            const newToken = res.data.token;
            localStorage.setItem('token', newToken);
            setToken(newToken);

            const decodedUser = jwtDecode(newToken);
            setUser(decodedUser);

            setImpersonatingUser(null);
            localStorage.removeItem('impersonatingUser');
            setOriginalAdminToken(null);
            localStorage.removeItem('originalAdminToken');

            setLoading(false);
            return decodedUser;
        } catch (error) {
            console.error('Registration failed:', error.response?.data?.message || error.message);
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setImpersonatingUser(null);
            setOriginalAdminToken(null);
            setLoading(false);
            throw error;
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('impersonatingUser');
        localStorage.removeItem('originalAdminToken');
        setToken(null);
        setUser(null);
        setImpersonatingUser(null);
        setOriginalAdminToken(null);
        setLoading(false);
    }, []);

    const impersonate = useCallback(async (customerId) => {
        setLoading(true);
        try {
            localStorage.setItem('originalAdminToken', token);
            setOriginalAdminToken(token);

            const res = await authAxios.post(`/admin/impersonate/${customerId}`);
            const customerToken = res.data.token;
            localStorage.setItem('token', customerToken);
            setToken(customerToken);

            const decodedCustomer = jwtDecode(customerToken);
            setUser(decodedCustomer);
            setImpersonatingUser(decodedCustomer);

            setLoading(false);
            return true;
        } catch (error) {
            console.error('Impersonation failed:', error);
            const storedOriginalToken = localStorage.getItem('originalAdminToken');
            if (storedOriginalToken) {
                localStorage.setItem('token', storedOriginalToken);
                setToken(storedOriginalToken);
                try {
                    setUser(jwtDecode(storedOriginalToken));
                } catch (decodeError) {
                    console.error('Failed to decode original admin token on fallback:', decodeError);
                    localStorage.removeItem('token');
                    localStorage.removeItem('impersonatingUser');
                    localStorage.removeItem('originalAdminToken');
                    setToken(null);
                    setUser(null);
                    setImpersonatingUser(null);
                    setOriginalAdminToken(null);
                }
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('impersonatingUser');
                localStorage.removeItem('originalAdminToken');
                setToken(null);
                setUser(null);
                setImpersonatingUser(null);
                setOriginalAdminToken(null);
            }
            setImpersonatingUser(null);
            localStorage.removeItem('impersonatingUser');
            setOriginalAdminToken(null);
            localStorage.removeItem('originalAdminToken');
            setLoading(false);
            throw error;
        }
    }, [token, authAxios]);

    const exitImpersonation = useCallback(async () => {
        setLoading(true);
        try {
            const res = await authAxios.post('/admin/exit-impersonation');
            const newAdminToken = res.data.token;

            localStorage.setItem('token', newAdminToken);
            setToken(newAdminToken);

            const decodedAdmin = jwtDecode(newAdminToken);
            setUser(decodedAdmin);
            setImpersonatingUser(null);
            localStorage.removeItem('impersonatingUser');
            setOriginalAdminToken(null);
            localStorage.removeItem('originalAdminToken');

            setLoading(false);
            return true;
        } catch (error) {
            console.error('Failed to exit impersonation:', error);
            if (originalAdminToken) {
                localStorage.setItem('token', originalAdminToken);
                setToken(originalAdminToken);
                try {
                    setUser(jwtDecode(originalAdminToken));
                } catch (decodeError) {
                    console.error('Failed to decode original admin token on fallback:', decodeError);
                    localStorage.removeItem('token');
                    localStorage.removeItem('impersonatingUser');
                    localStorage.removeItem('originalAdminToken');
                    setToken(null);
                    setUser(null);
                    setImpersonatingUser(null);
                    setOriginalAdminToken(null);
                }
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('impersonatingUser');
                localStorage.removeItem('originalAdminToken');
                setToken(null);
                setUser(null);
                setImpersonatingUser(null);
                setOriginalAdminToken(null);
            }
            setImpersonatingUser(null);
            localStorage.removeItem('impersonatingUser');
            setOriginalAdminToken(null);
            localStorage.removeItem('originalAdminToken');
            setLoading(false);
            throw error;
        }
    }, [originalAdminToken, authAxios]);

    const value = useMemo(() => ({
        user,
        token,
        loading,
        authAxios,
        login,
        register,
        logout,
        impersonate,
        exitImpersonation,
        impersonatingUser,
    }), [user, token, loading, authAxios, login, register, logout, impersonate, exitImpersonation, impersonatingUser]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5em', color: '#34495e' }}>
                Authenticating...
            </div>
        );
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
