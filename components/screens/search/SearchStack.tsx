import React from 'react';
import SearchWrapper from './SearchWrapper';
import PublicProfile from '../profile/PublicProfile';
import CompanyProfile from '../profile/CompanyProfile';
import { Stack } from '../../../lib/navigation';

export default function SearchStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Search" component={SearchWrapper} options={{ headerShown: false }} />
            <Stack.Screen name="Public Profile" component={PublicProfile} options={{ headerShown: false }} />
            <Stack.Screen name="Company Profile" component={CompanyProfile} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}
