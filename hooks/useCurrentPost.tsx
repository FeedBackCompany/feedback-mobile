import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Post } from '../types/posts';
import type { Session } from '@supabase/supabase-js'

type CurrentPostContextType = {
    currentPost: Post | null;
    updateCurrentPost: (post: Post) => void;
    clearCurrentPost: () => void;
};

const CurrentPostContext = createContext<CurrentPostContextType | undefined>(undefined);

interface CurrentPostProviderProps {
    children: React.ReactNode;
    session: Session | null;
}

export function CurrentPostProvider({ children, _session }: CurrentPostProviderProps) {
    const [currentPost, setCurrentPost] = useState<Post | null>(null);

    const updateCurrentPost = useCallback((post: Post) => {
        setCurrentPost(post);
    }, []);

    const clearCurrentPost = useCallback(() => {
        setCurrentPost(null);
    })
    
    return (
        <CurrentPostContext.Provider 
            value={{ 
                currentPost,
                updateCurrentPost,
                clearCurrentPost
            }}
        >
            {children}
        </CurrentPostContext.Provider>
    );
}

export function useCurrentPost() {
    const context = useContext(CurrentPostContext);
    if (context === undefined) {
        throw new Error('useCurrentPost must be used within a CurrentPostProvider');
    }
    return context;
}