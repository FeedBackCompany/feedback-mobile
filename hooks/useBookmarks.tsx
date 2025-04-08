import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Bookmark } from '../types/bookmarks';
import { supabase } from '../lib/supabase'

type BookmarksContextType = {
    bookmarks: Bookmark[];
    setBookmarks: (bookmarks: Bookmark[]) => void;
    addBookmark: (postId: string) => Promise<{ data: Bookmark | null; error: any }>;
    removeBookmark: (bookmarkId: string) => Promise<{ error: any }>;
    fetchUsersBookmarks: () => Promise<void>;
};

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

interface BookmarksProviderProps {
    children: React.ReactNode;
    session: Session | null;
}

export function BookmarksProvider({ children, session }: BookmarksProviderProps) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

    const addBookmark = useCallback(async (postId: string) => {
        try {
            const { data, error } = await supabase
                .from('bookmarks')
                .insert({
                    post_id: postId,
                    user_id: session.user.id
                })
                .select()
                .single();

            if (error) throw error;

            // Only update local state if database operation succeeded
            if (data) {
                setBookmarks(prev => [...prev, data]);
            }

            return { data, error: null };
        } catch (error) {
            console.error('Error adding bookmark:', error);
            return { data: null, error };
        }
    }, []);

    const removeBookmark = useCallback(async (postId: string) => {
        try {
            const { error } = await supabase
                .from('bookmarks')
                .delete()
                .eq('post_id', postId);

            if (error) throw error;

            // Only update local state if database operation succeeded
            setBookmarks(prev => prev.filter(bookmark => bookmark.post_id !== postId));

            return { error: null };
        } catch (error) {
            console.error('Error removing bookmark:', error);
            return { error };
        }
    }, []);

    const fetchUsersBookmarks = async () => {
        try {
            const { data, error } = await supabase
                .from('bookmarks')
                .select('*')
                .eq('user_id', session.user.id);
            
            if (error) throw error;

            setBookmarks(data ?? []);
        } catch (error) {
            console.error(error);
        }
    }

    const isBookmarked = (postId: string): boolean => {
        return bookmarks.filter(bookmark => bookmark.post_id === postId).length > 0;
    }

    return (
        <BookmarksContext.Provider 
            value={{ 
                bookmarks, 
                addBookmark, 
                removeBookmark, 
                fetchUsersBookmarks,
                isBookmarked
            }}
        >
            {children}
        </BookmarksContext.Provider>
    );
}

export function useBookmarks() {
    const context = useContext(BookmarksContext);
    if (context === undefined) {
        throw new Error('useBookmarks must be used within a BookmarksProvider');
    }
    return context;
}