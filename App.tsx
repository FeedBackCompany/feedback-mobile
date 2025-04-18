import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { EventRegister } from 'react-native-event-listeners';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

import BottomTabs from './components/BottomTabs';
import Auth from './components/Auth';

import { BookmarksProvider } from './hooks/useBookmarks';
import { CurrentUserProvider } from './hooks/useCurrentUser';
import { CurrentPostProvider } from './hooks/useCurrentPost';
import { VisitedScreensProvider } from './hooks/useVisitedScreens';
import { Stack } from './lib/navigation';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    })

    const logout = EventRegister.addEventListener('logout', () => {
      setSession(null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
      EventRegister.removeEventListener(logout as string);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <CurrentUserProvider session={session}>
            <VisitedScreensProvider session={session}>
              <BookmarksProvider session={session}>
                <CurrentPostProvider session={session}>
                  <Stack.Navigator>
                    {!session ? (
                      <Stack.Screen name="Auth" component={Auth} />
                    ) : (
                      <Stack.Group>
                        <Stack.Screen name="Main" component={BottomTabs} options={{ headerShown: false }} />
                      </Stack.Group>
                    )}
                  </Stack.Navigator>
                </CurrentPostProvider>
              </BookmarksProvider>
            </VisitedScreensProvider>
          </CurrentUserProvider>
        </GestureHandlerRootView>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
