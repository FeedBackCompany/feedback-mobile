import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchWrapper from './SearchWrapper';
import PublicProfile from '../../screens/PublicProfile';
import CompanyProfile from '../CompanyProfile';

const Stack = createNativeStackNavigator();

export default function SearchStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Search" component={SearchWrapper} options={{ headerShown: false }} />
            <Stack.Screen name="Public Profile" component={PublicProfile} options={{ headerShown: false }} />
            <Stack.Screen name="Company Profile" component={CompanyProfile} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}
