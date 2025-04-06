import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import { Session } from '@supabase/supabase-js'
import { NavigationContainer } from '@react-navigation/native';
import BottomTabs from './components/BottomTabs';

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <NavigationContainer>
      {session ? <BottomTabs /> : <Auth />}
    </NavigationContainer>
  )
}