import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feed from './screens/Feed';
import Profile from './screens/Profile';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };

        fetchUser();
    }, []);

    return (
        <Tab.Navigator
            screenOptions={({ route }: any) => ({
                tabBarIcon: ({ color, size }: any) => {
                    let iconName = 'home';

                    if (route.name === 'Feed') {
                        iconName = 'home';
                    } else if (route.name === 'Profile') {
                        iconName = 'person';
                    }

                    return <Ionicons name={iconName as any} size={size} color={color} />;
                },
                tabBarActiveTintColor: 'tomato',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Feed" component={Feed} />
            <Tab.Screen
                name="Profile"
                component={Profile}
                initialParams={{ userId: currentUser?.id }} // Pass the current user's ID to the Profile screen
            />
        </Tab.Navigator>
    );
}
