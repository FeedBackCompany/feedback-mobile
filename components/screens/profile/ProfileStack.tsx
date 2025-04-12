import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from '../../../lib/supabase';
import { ActivityIndicator, View } from 'react-native';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import Profile from './Profile';
import CompanyProfile from './CompanyProfile';
import PublicProfile from './PublicProfile';
import CharityProfile from './CharityProfile';
import { Stack } from '../../../lib/navigation';

export type ProfileStackParamList = {
    'Your Profile': undefined;
    'Public Profile': { userId: string };
    'Company Profile': { companyId: string };
    'Charity Profile': { charityId: string };
};

const ProfileStack = () => {
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
            <Stack.Screen
                name="Your Profile"
                component={isCompany ? CompanyProfile : Profile}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Public Profile"
                component={PublicProfile}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Company Profile"
                component={CompanyProfile}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Charity Profile" // Add CharityProfile to the navigator
                component={CharityProfile}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

export default ProfileStack;
