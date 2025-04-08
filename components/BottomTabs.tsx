import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feed from './screens/Feed';
import Profile from './screens/Profile';
import { Ionicons } from '@expo/vector-icons';
import Search from './screens/Search';

const Tab = createBottomTabNavigator();

type ScreenName = 'Feed' | 'Search' | 'Profile';
type ScreenOptions = { name: ScreenName, [key: string]: any };

export default function BottomTabs() {

    const getIcon = (page: ScreenName, color: string, size: string) => {
        let iconName = 'home';

        switch (page) {
            case 'Feed':
                iconName = 'home';
                break;
        
            case 'Search':
                // "search-outline" or "search-sharp"
                iconName = 'search-sharp';
                break;
            
            case 'Profile':
                iconName = 'person';
                break;
            
            default:
                break;
        }

        return <Ionicons name={iconName as any} size={size} color={color} />;
    }

    return (
        <Tab.Navigator
            screenOptions={({ route }: ScreenOptions) => ({
                tabBarIcon: ({ color, size }: any) => getIcon(route.name, color, size),
                tabBarActiveTintColor: 'goldenrod',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Feed" component={Feed} />
            <Tab.Screen name="Search" component={Search} />
            <Tab.Screen name="Profile" component={Profile} />
        </Tab.Navigator>
    );
}
