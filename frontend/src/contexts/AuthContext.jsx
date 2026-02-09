import { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated, getUserRole, removeToken, removeUsername } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        if (isAuthenticated()) {
            const role = getUserRole();
            setUser({ role });
        } else {
            setUser(null);
        }
        setLoading(false);
    };

    const login = (token) => {
        localStorage.setItem('token', token);
        checkAuth();
        const role = getUserRole();

        if (role === 'admin') {
            navigate('/admin/dashboard');
        } else {
            navigate('/user/dashboard');
        }
    };

    const logout = () => {
        removeToken();
        removeUsername();
        localStorage.removeItem('apiKey');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
