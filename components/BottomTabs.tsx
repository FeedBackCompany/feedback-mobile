import React from 'react';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import CompanyPost from './screens/feed/CompanyPost';
import Feed from './screens/feed/Feed';
import { Ionicons } from '@expo/vector-icons';
import ProfileStack from './screens/profile/ProfileStack';
import SearchStack from './screens/search/SearchStack';
import { Stack, Tab } from '../lib/navigation';

type ScreenName = 'Feed' | 'Search' | 'Profile';

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
                    animationDuration: 100
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
                iconName = 'search-sharp';
                break;
            case 'Profile':
                iconName = 'person';
                break;
            default:
                break;
        }
        return <Ionicons name={iconName as any} size={size} color={color} />;
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }: any) => ({
                tabBarIcon: ({ color, size }: any) => getIcon(route.name, color, size),
                tabBarStyle: {
                    display: 'flex',
                },
            })}
        >
            <Tab.Screen
                name="Feed"
                component={FeedStack}
                options={({ route }: any) => ({
                    headerShown: false,
                    tabBarActiveTintColor:
                        route.name === 'Feed' && getFocusedRouteNameFromRoute(route) !== 'Company Post' ||
                            getFocusedRouteNameFromRoute(route) === 'Feed Page'
                            ? 'goldenrod'
                            : 'gray',
                })}
            />
            <Tab.Screen
                name="Search"
                component={SearchStack}
                options={({ route }: any) => ({
                    headerShown: false,
                    tabBarActiveTintColor:
                        getFocusedRouteNameFromRoute(route) === 'Public Profile' ||
                            getFocusedRouteNameFromRoute(route) === 'Company Profile'
                            ? 'gray'
                            : 'goldenrod',
                })}
            />
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
