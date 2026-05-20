import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthContextProvider = ({ children }) => {
    // 1. Initialize state lazily. This function only runs once when the app first loads.
    // It checks localStorage for existing user data before defaulting to null.
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error("Failed to parse user from local storage", error);
            return null;
        }
    });

    const login = (userData) => {
        setUser(userData);
        // 2. Save to localStorage when the user logs in
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        // 3. Clean up localStorage when the user logs out
        localStorage.removeItem('user');
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthContextProvider");
    }

    return context;
};