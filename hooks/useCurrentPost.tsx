import React, { createContext, useContext, useState, useCallback } from 'react';
import type { PostWithRelations } from '../types/posts';
import type { Session } from '@supabase/supabase-js'

type CurrentPostContextType = {
    currentPost: PostWithRelations | null;
    updateCurrentPost: (post: PostWithRelations) => void;
    clearCurrentPost: () => void;
};

const CurrentPostContext = createContext<CurrentPostContextType | undefined>(undefined);

interface CurrentPostProviderProps {
    children: React.ReactNode;
    session: Session | null;
}

export function CurrentPostProvider({ children }: CurrentPostProviderProps) {
    const [currentPost, setCurrentPost] = useState<PostWithRelations | null>(null);

    const updateCurrentPost = useCallback((post: PostWithRelations) => {
        setCurrentPost(post);
    }, [setCurrentPost]);

    const clearCurrentPost = useCallback(() => {
        setCurrentPost(null);
    }, [setCurrentPost])

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