import type { User, Session } from '@supabase/supabase-js'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'

type CurrentUserContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
    logoutUser: () => Promise<{ error: any }>;
    email: () => string;
};

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(undefined);

interface CurrentUserProviderProps {
    children: React.ReactNode;
    session: Session | null;
}

export function CurrentUserProvider({ children, session }: CurrentUserProviderProps) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
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
    }, [])

    const email = useCallback(() => user?.email || '', [user]);

    return (
        <CurrentUserContext.Provider
            value={{
                user,
                setUser,
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