import React, { createContext, useState, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query'; // 1. Import the hook

const AuthContext = createContext(null);

export const AuthContextProvider = ({ children }) => {
    // 2. Initialize the query client
    const queryClient = useQueryClient(); 
    
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error("Failed to parse user from local storage", error);
            return null;
        }
    });

    const login = (userData, tokens) => {
        const userWithToken = { ...userData, token: tokens.access };
        setUser(userWithToken);
        localStorage.setItem('user', JSON.stringify(userWithToken));
        localStorage.setItem('accessToken', tokens.access);
        localStorage.setItem('refreshToken', tokens.refresh);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // 3. Clear the cache! This wipes all data from memory.
        queryClient.clear(); 
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