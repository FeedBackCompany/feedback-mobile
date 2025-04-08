import type { User, Session } from '@supabase/supabase-js'
import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase'

type CurrentUserContextType = {
    user: User;
    setUser: (user: User) => void;
    logoutUser: () => void;
    email: () => string;
};

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(undefined);

interface CurrentUserProviderProps {
    children: React.ReactNode;
    session: Session | null;
}

export function CurrentUserProvider({ children, session }: CurrentUserProviderProps) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(async () => {
        if (session?.user) setUser(session.user);
    }, [session])

    const logoutUser = useCallback(async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            return { error: false }
        } catch (err) {
            console.error(err);
            return { error: err }
        }
    })

    const email = () => user?.email || '';

    return (
        <CurrentUserContext.Provider 
            value={{
                user, 
                logoutUser, 
                email, 
            }}
        >
            {children}
        </CurrentUserContext.Provider>
    );
}

export function useCurrentUser() {
    const context = useContext(CurrentUserContext);
    if (context === undefined) {
        throw new Error('useCurrentUser must be used within a CurrentUserProvider');
    }
    return context;
}