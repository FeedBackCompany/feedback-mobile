import React, { useEffect, useState } from 'react';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import CompanyPost from './screens/feed/CompanyPost';
import Feed from './screens/feed/Feed';
import { Ionicons } from '@expo/vector-icons';
import ProfileStack from './screens/profile/ProfileStack';
import SearchStack from './screens/search/SearchStack';
import { Stack, Tab } from '../lib/navigation';
import CompanyProfile from './screens/profile/CompanyProfile';
import PublicProfile from './screens/profile/PublicProfile';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { supabase } from '../lib/supabase';
import { ActivityIndicator, View } from 'react-native';
import Profile from './screens/profile/Profile';

type ScreenName = 'Feed' | 'Search' | 'Profile';

const FeedStack = () => {
    const { user } = useCurrentUser();
    const [isCompany, setIsCompany] = useState<boolean | null>(null);

    useEffect(() => {
        const checkIfCompany = async () => {
            if (!user) return;

            const { data, error } = await supabase
                .from('company_profiles')
                .select('id')
                .eq('id', user.id)
                .single();

            setIsCompany(!!data && !error);
        };

        checkIfCompany();
    }, [user]);

    if (isCompany === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

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
            <Stack.Screen
                name="Company Profile"
                component={CompanyProfile}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Public Profile"
                component={PublicProfile}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Your Profile"
                component={isCompany ? CompanyProfile : Profile}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Company Post In Profile"
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
                            getFocusedRouteNameFromRoute(route) === 'Company Profile' ||
                            getFocusedRouteNameFromRoute(route) === 'Company Post In Profile'
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
                        getFocusedRouteNameFromRoute(route) === 'Public Profile' ||
                            getFocusedRouteNameFromRoute(route) === 'Company Post In Profile'
                            ? 'gray'
                            : 'goldenrod',
                })}
            />
        </Tab.Navigator>
    );
}
