import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { SafeAreaView } from 'react-native-safe-area-context';
import CompanyProfileLinks from './CompanyProfileLinks';
import CompanyPostList from './CompanyPostList';

export default function CompanyProfile({ route, navigation }: any) {
    const { user } = useCurrentUser();
    const [companyData, setCompanyData] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [signedUrl, setSignedUrl] = useState('');
    const isMounted = useRef(true);
    const companyId = route?.params?.companyId || user?.id;


    const fetchCompanyData = useCallback(async () => {
        if (!companyId) return;

        setLoading(true);

        const { data, error } = await supabase
            .from('company_profiles')
            .select('*')
            .eq('id', companyId)
            .single();

        if (!isMounted.current) return;

        if (data && !error) {
            setCompanyData(data);

            const { data: fetchedAvatarData } = await supabase.storage
                .from('avatars')
                .createSignedUrl(data.avatar_url, 3600);

            if (fetchedAvatarData) setSignedUrl(fetchedAvatarData.signedUrl);
        } else {
            console.error(error);
        }

        setLoading(false);
    }, [companyId]);

    useEffect(() => {
        isMounted.current = true;

        const unsubscribe = navigation.addListener('focus', () => {
            fetchCompanyData();
        });

        fetchCompanyData();

        return () => {
            isMounted.current = false;
            unsubscribe();
        };
    }, [fetchCompanyData, navigation]);

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
                    {signedUrl ? (
                        <Image
                            source={{ uri: signedUrl }}
                            style={{ width: 80, height: 80, borderRadius: 40 }}
                        />
                    ) : (
                        <MaterialIcons name="business" size={50} color="gray" />
                    )}
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.header}>{legal_business_name}</Text>
                </View>
                {user?.id === companyId && (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('CompanyAdminSettings', { profile: { ...companyData, avatar_url: signedUrl || '' } })}
                        style={styles.adminIcon}
                    >
                        <MaterialIcons name="admin-panel-settings" size={24} color="black" />
                    </TouchableOpacity>
                )}
            </View>

            <CompanyProfileLinks email={email} phone_number={phone_number} website={website} />

            <CompanyPostList companyId={companyId} navigation={navigation} />
            {/* <Donations companyId={companyId} navigation={navigation} /> */}
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
