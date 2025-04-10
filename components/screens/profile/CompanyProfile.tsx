import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { SafeAreaView } from 'react-native-safe-area-context';
import CompanyProfileLinks from './CompanyProfileLinks';
import Donations from '../Donations';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { ProfileStackParamList } from '../ProfileStack'; // Update if path is different

// type Props = NativeStackScreenProps<ProfileStackParamList, 'Company Profile'>;

export default function CompanyProfile({ route, navigation }: any) {
    const { user } = useCurrentUser();
    const [companyData, setCompanyData] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const companyId = route?.params?.companyId || user?.id;

    useEffect(() => {
        const fetchCompanyData = async () => {
            if (!companyId) return;

            const { data, error } = await supabase
                .from('company_profiles')
                .select('*')
                .eq('id', companyId)
                .single();

            if (data && !error) {
                setCompanyData(data);
            } else {
                console.error(error);
            }
            setLoading(false);
        };

        fetchCompanyData();
    }, [companyId]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!companyData) {
        return (
            <View style={styles.centered}>
                <Text>No company profile data available.</Text>
            </View>
        );
    }

    const { legal_business_name, website, email, phone_number } = companyData;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                    <MaterialIcons name="business" size={50} color="gray" />
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.header}>{legal_business_name}</Text>
                </View>
                {user?.id === companyId && (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('AdminSettings')}
                        style={styles.adminIcon}
                    >
                        <MaterialIcons name="admin-panel-settings" size={24} color="black" />
                    </TouchableOpacity>
                )}
            </View>

            <CompanyProfileLinks email={email} phone_number={phone_number} website={website} />

            <Donations companyId={companyId} navigation={navigation} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        justifyContent: 'space-between',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    adminIcon: {
        padding: 8,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
