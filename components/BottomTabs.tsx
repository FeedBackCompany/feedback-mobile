import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Feed from './screens/Feed';
import { Ionicons } from '@expo/vector-icons';
import ProfileStack from './ProfileStack';
import SearchStack from './screens/search/SearchStack';

const Tab = createBottomTabNavigator();

type ScreenName = 'Feed' | 'Search' | 'Profile';

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
                // tabBarActiveTintColor: 'goldenrod',
                // tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    display: 'flex', // Keep tabs visible
                },
                // Remove the highlight from the 'Search' tab when on PublicProfile
                // tabBarActiveTintColor: (route.name === 'Search' && getFocusedRouteNameFromRoute(route) === 'Public Profile') ? 'gray' : 'goldenrod',
            })}
        >
            <Tab.Screen name="Feed" component={Feed} />
            <Tab.Screen
                name="Search"
                component={SearchStack}
                options={({ route }: any) => ({
                    headerShown:
                        getFocusedRouteNameFromRoute(route) === 'Public Profile' ||
                            getFocusedRouteNameFromRoute(route) === 'Company Profile'
                            ? false
                            : true,
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
