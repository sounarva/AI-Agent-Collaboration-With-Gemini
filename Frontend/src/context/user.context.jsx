import React, { createContext, useState } from 'react';

// Create the User Context
export const UserContext = createContext();


// User Provider Component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const value = {
        user,
        setUser
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};
