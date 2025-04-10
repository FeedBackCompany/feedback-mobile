import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { supabase } from '../../lib/supabase';

interface Charity {
    name: string;
    website: string;
    total_donations_received: number;
    avatar_url: string;
}

const CharityProfile = ({ route, navigation }: { route: any; navigation: any }) => {
    const { charityId } = route.params; // Get charityId from the navigation route
    const [charityData, setCharityData] = useState<Charity | null>(null);
    const [donations, setDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCharityData = async () => {
            const { data, error } = await supabase
                .from('charities')
                .select('*')
                .eq('id', charityId)
                .single();

            if (data) {
                setCharityData(data);
            } else {
                console.error(error);
            }
        };

        const fetchDonations = async () => {
            const { data, error } = await supabase
                .from('donations_rewards')
                .select('amount, company_profiles(legal_business_name)')
                .eq('charity_id', charityId);

            if (data) {
                setDonations(data);
            } else {
                console.error(error);
            }

            setLoading(false);
        };

        fetchCharityData();
        fetchDonations();
    }, [charityId]);

    if (loading) {
        return <Text>Loading charity data...</Text>;
    }

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: charityData?.avatar_url || 'https://via.placeholder.com/150' }}
                style={styles.avatar}
            />
            <Text style={styles.header}>{charityData?.name}</Text>
            <Text style={styles.website}>{charityData?.website}</Text>
            <Text style={styles.totalDonations}>Total Donations Received: ${charityData?.total_donations_received}</Text>

            <Text style={styles.donorsHeader}>Donating Companies</Text>
            <FlatList
                data={donations}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.donationItem}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Company Profile', { companyId: item.company_profiles.id })}
                        >
                            <Text style={styles.donorName}>{item.company_profiles?.legal_business_name}</Text>
                        </TouchableOpacity>
                        <Text style={styles.donationAmount}>${item.amount.toFixed(2)} donated</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
        marginTop: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        marginBottom: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    website: {
        fontSize: 16,
        color: '#2d9cdb',
        textAlign: 'center',
        marginBottom: 20,
        textDecorationLine: 'underline',
    },
    totalDonations: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2d9cdb',
        textAlign: 'center',
    },
    donorsHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    donationItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1',
        marginBottom: 10,
    },
    donorName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
    },
    donationAmount: {
        fontSize: 14,
        color: '#777',
    },
});

export default CharityProfile;
