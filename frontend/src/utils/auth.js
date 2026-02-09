import { jwtDecode } from 'jwt-decode';

export const getToken = () => {
    return localStorage.getItem('token');
};

export const setToken = (token) => {
    localStorage.setItem('token', token);
};

export const setUsername = (username) => {
    localStorage.setItem('username', username);
};

export const removeToken = () => {
    localStorage.removeItem('token');
};

export const removeUsername = () => {
    localStorage.removeItem('username');
};

export const isAuthenticated = () => {
    const token = getToken();
    if (!token) {
        console.log('[Auth] No token found');
        return false;
    }

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
            console.log('[Auth] Token expired');
            removeToken();
            return false;
        }

        console.log('[Auth] Token valid, expires at:', new Date(decoded.exp * 1000));
        return true;
    } catch (error) {
        console.error('[Auth] Token decode error:', error);
        removeToken();
        return false;
    }
};

export const getUserRole = () => {
    const token = getToken();
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        return decoded.role || 'user';
    } catch (error) {
        return null;
    }
};

export const getUsername = () => {
    return localStorage.getItem('username');
};

export const getUserId = () => {
    const token = getToken();
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        return decoded.userId;
    } catch (error) {
        return null;
    }
};

export const getTokenExpiry = () => {
    const token = getToken();
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        if (!decoded.exp) return null;
        return new Date(decoded.exp * 1000);
    } catch (error) {
        return null;
    }
};

export const getAccountType = () => {
    const token = getToken();
    if (!token) return 'SAVINGS'; // Default fallback

    try {
        const decoded = jwtDecode(token);
        return decoded.accountType || 'SAVINGS';
    } catch (error) {
        return 'SAVINGS';
    }
};
