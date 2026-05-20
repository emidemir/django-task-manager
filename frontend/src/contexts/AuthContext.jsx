import React, {createContext, useState, useContext} from 'react'

const AuthContext = createContext(null)

export const AuthContextProvider = ({children}) => {

    const [user, setUser] = useState(null)

    const login = (userData) => {
        setUser(user)
    }

    const logout = () => {
        setUser(null)
    }

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext)

    if (!context){
        throw new Error("useAuth must be used within an AuthContextProvider");
    }

    return context
}