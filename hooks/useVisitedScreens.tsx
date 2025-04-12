import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { VisitedScreen } from '../types/profiles'

type VisitedScreensContextType = {
    visitedScreens: VisitedScreen[];
    addVisitedScreens: (screens: VisitedScreen[]) => void;
    removeVisitedScreens: (screens: VisitedScreen[]) => void;
    hasScreenBeenVisited: (screen: VisitedScreen) => boolean;
};

const VisitedScreensContext = createContext<VisitedScreensContextType | undefined>(undefined);

interface VisitedScreensProviderProps {
    session: Session | null;
    children: React.ReactNode;
}

export function VisitedScreensProvider({ children, session }: VisitedScreensProviderProps) {
    const [visitedScreens, setVisitedScreens] = useState<VisitedScreen[]>([]);
    
    const getVisitedScreens = async () => {
        try {
            if (!session) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('visited_screens')
                .eq('id', session.user.id)
                .single();

            if (error) throw error;

            if (data.visited_screens // it is not null
                && data.visited_screens.length !== visitedScreens.length // some screens returned from db are not in current list, then update with values from db
            ) {
                setVisitedScreens(data.visited_screens);
            } else {
                setTimeout(() => {
                    addVisitedScreens([VisitedScreen.FEED]);
                }, 3000);
            }
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        if (session?.user) {
            getVisitedScreens();
        } else {
            setVisitedScreens([]);
        }
    }, [session])

    const addVisitedScreens = async (screens: VisitedScreen[]) => {
        try {
            if (!screens.length || !session?.user) return;

            // Combines arrays and removes duplicates (very fast)
            const newScreens = [...new Set([...visitedScreens, ...screens])];

            const { data, error } = await supabase
                .from('profiles')
                .update({ visited_screens: newScreens })
                .eq('id', session.user.id)
                .select('visited_screens')
                .single();

            if (error) throw error;

            setVisitedScreens(data.visited_screens);
        } catch (err) {
            console.error(err);
        }
    }

    const removeVisitedScreens = useCallback(async (screens: VisitedScreen[]) => {
        try {
            if (!screens.length || !session?.user) return;

            // Combines arrays and removes duplicates (very fast)
            const newScreens = visitedScreens.filter(screen => !screens.includes(screen))

            const { data, error } = await supabase
                .from('profiles')
                .update({ visited_screens: newScreens.length ? newScreens : null }) // the default value in the db is null, NOT an empty array
                .eq('id', session.user.id)
                .select('visited_screens')
                .single();

            if (error) throw error;

            setVisitedScreens(data.visited_screens ?? []);
        } catch (err) {
            console.error(err);
        }
    }, [visitedScreens])

    const hasScreenBeenVisited = useCallback((screen: VisitedScreen): boolean => {
        return visitedScreens.includes(screen);
    }, [visitedScreens])

    return (
        <VisitedScreensContext.Provider 
            value={{
                visitedScreens,
                addVisitedScreens,
                removeVisitedScreens,
                hasScreenBeenVisited
            }}
        >
            {children}
        </VisitedScreensContext.Provider>
    );
}

export function useVisitedScreens() {
    const context = useContext(VisitedScreensContext);
    if (context === undefined) {
        throw new Error('useVisitedScreens must be used within a VisitedScreensProvider');
    }
    return context;
}