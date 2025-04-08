import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import { Session } from '@supabase/supabase-js'
import { NavigationContainer } from '@react-navigation/native';
import BottomTabs from './components/BottomTabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BookmarksProvider, useBookmarks } from './hooks/useBookmarks';

function AppContent({ session }: { session: Session | null }) {
  const { fetchUsersBookmarks } = useBookmarks();

  useEffect(() => {
    if (session?.user) {
      fetchUsersBookmarks();
    }
  }, [session]);

  return session ? <BottomTabs /> : <Auth />;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, []);

  return (
    <NavigationContainer>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BookmarksProvider session={session}>
          <AppContent session={session} />
        </BookmarksProvider>
      </GestureHandlerRootView>
    </NavigationContainer>
  )
}