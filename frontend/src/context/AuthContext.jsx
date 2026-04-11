import { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Synchronously check local storage, but protect against corrupted data!
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('mcbook_user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            // If the data is corrupted, wipe it and default to logged out
            console.warn("Corrupted user data found in local storage. Clearing it.");
            localStorage.removeItem('mcbook_user');
            return null;
        }
    });

    const navigate = useNavigate();

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('mcbook_user', JSON.stringify(userData));
        setUser(userData);
        
        // Route based on role
        if (userData.role === 'OWNER') {
            navigate('/owner-dashboard');
        } else {
            navigate('/student-dashboard');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('mcbook_user');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};