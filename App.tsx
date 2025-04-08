import React, { useState, useEffect } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { supabase } from './lib/supabase'
import { Session } from '@supabase/supabase-js'
import { NavigationContainer } from '@react-navigation/native';
import BottomTabs from './components/BottomTabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BookmarksProvider } from './hooks/useBookmarks';
import { CurrentUserProvider } from './hooks/useCurrentUser';
import Auth from './components/Auth'
import AdminSettings from './components/screens/AdminSettings'
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator()

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <CurrentUserProvider session={session}>
            <BookmarksProvider session={session}>
              <Stack.Navigator>
                {!session ? (
                  <Stack.Screen name="Auth" component={Auth} />
                ) : (
                  <>
                    <Stack.Screen name="Main" component={BottomTabs} options={{ headerShown: false }} />
                    <Stack.Screen name="AdminSettings" component={AdminSettings} />
                  </>
                )}
              </Stack.Navigator>
            </BookmarksProvider>
          </CurrentUserProvider>
        </GestureHandlerRootView>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
