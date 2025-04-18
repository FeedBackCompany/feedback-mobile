import React, { useEffect, useState } from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { ActivityIndicator, View } from 'react-native';
import { Stack, Tab } from '../lib/navigation';
import CompanyPost from './screens/feed/CompanyPost';
import Feed from './screens/feed/Feed';
import CompanyProfile from './screens/profile/CompanyProfile';
import PublicProfile from './screens/profile/PublicProfile';
import Profile from './screens/profile/Profile';
import { supabase } from '../lib/supabase';
import UserAdminSettings from './screens/UserAdminSettings';
import SearchWrapper from './screens/search/SearchWrapper';
import CompanyAdminSettings from './screens/CompanyAdminSettings';

export default function StackNavigator({ route }: any) {
    const { user } = useCurrentUser();
    const [isCompany, setIsCompany] = useState<boolean | null>(null);

    const tabName = route?.name ?? 'Feed'

    // Map each tab to its initial screen
    const initialRouteName = (() => {
        switch (tabName) {
            case 'Search':
                return 'Search';
            case 'Profile':
                return 'Your Profile';
            case 'Feed':
                return 'Feed Page';
            default:
                return 'Feed Page';
        }
    })();

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
        <Stack.Navigator initialRouteName={initialRouteName}>

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
            <Stack.Screen name="UserAdminSettings"
                component={UserAdminSettings}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="CompanyAdminSettings"
                component={CompanyAdminSettings}
                options={{ headerShown: false }}
            />
            <Stack.Screen name="Search" component={SearchWrapper} options={{ headerShown: false }} />

        </Stack.Navigator>
    );
};