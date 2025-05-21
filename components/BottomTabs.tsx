import React from 'react';
const { getFocusedRouteNameFromRoute } = require('@react-navigation/native');
import { Ionicons } from '@expo/vector-icons';
import { Tab } from '../lib/navigation';
import StackNavigator from './StackNavigator';

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
                tabBarStyle: {
                    display: 'flex',
                },
            })}
        >
            <Tab.Screen
                name="Feed"
                component={StackNavigator}
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
                component={StackNavigator}
                options={({ route }: any) => ({
                    headerShown: false,
                    tabBarActiveTintColor:
                        getFocusedRouteNameFromRoute(route) === 'Public Profile' ||
                            getFocusedRouteNameFromRoute(route) === 'Company Profile' ||
                            getFocusedRouteNameFromRoute(route) === 'Company Post'
                            ? 'gray'
                            : 'goldenrod',
                })}
            />
            <Tab.Screen
                name="Profile"
                component={StackNavigator}
                options={({ route }: any) => ({
                    headerShown: false,
                    tabBarActiveTintColor:
                        getFocusedRouteNameFromRoute(route) === 'Public Profile' ||
                            getFocusedRouteNameFromRoute(route) === 'Company Post'
                            ? 'gray'
                            : 'goldenrod',
                })}
            />
        </Tab.Navigator>
    );
}
