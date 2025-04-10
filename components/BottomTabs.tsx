import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import CompanyPost from './CompanyPost';
import Feed from './screens/Feed';
import Profile from './screens/Profile';
import Search from './screens/Search';
import PublicProfile from './screens/PublicProfile';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

type ScreenName = 'Feed' | 'Search' | 'Profile';
// type ScreenOptions = { name: ScreenName, [key: string]: any };

const ProfileStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Your Profile" component={Profile} options={{ headerShown: false }} />
            <Stack.Screen name="Public Profile" component={PublicProfile} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
};

const FeedStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Feed Page" component={Feed} options={{ headerShown: false }} />
            <Stack.Screen 
                name="Company Post" 
                component={CompanyPost} 
                options={{ 
                    headerShown: false, 
                    animation: 'fade',
                    presentation: 'card',
                    animationDuration: 100,
                    transitionSpec: {
                        open: {
                            animation: 'timing',
                            config: {
                                duration: 100,
                            },
                        },
                        close: {
                            animation: 'timing',
                            config: {
                                duration: 100,
                            },
                        },
                    },
                }} 
            />
        </Stack.Navigator>
    );
};

export default function BottomTabs() {
    const getIcon = (page: ScreenName, color: string, size: number) => {
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
            screenOptions={({ route }: any) => ({
                tabBarIcon: ({ color, size }: any) => getIcon(route.name, color, size),
                tabBarActiveTintColor: 'goldenrod',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: (route.name === 'Your Profile') ? (() => {
                    const routeName = getFocusedRouteNameFromRoute(route);
                    return {
                        // Hide tab bar color when on PublicProfile
                        tabBarActiveTintColor: routeName === 'Public Profile' ? 'gray' : 'goldenrod',
                    };
                })() : {},
            })}
        >
            <Tab.Screen name="Feed" component={FeedStack} options={{ headerShown: false }} />
            <Tab.Screen name="Search" component={Search} options={{ headerShown: false }} />
            <Tab.Screen
                name="Profile"
                component={ProfileStack}
                options={({ route }: any) => ({
                    headerShown: false,
                    tabBarActiveTintColor:
                        getFocusedRouteNameFromRoute(route) === 'Public Profile'
                            ? 'gray'
                            : 'goldenrod',
                })}
            />
        </Tab.Navigator>
    );
}
