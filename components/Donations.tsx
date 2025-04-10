import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';

interface Donation {
    amount: any;
    charity_name: string;
    charity_id: string;
}

const Donations = ({ companyId, navigation }: { companyId: string; navigation: any }) => {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [totalDonations, setTotalDonations] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchDonations = async () => {
            const { data, error } = await supabase
                .from('donations_rewards')
                .select('amount, charities(name, id)')  // Include the charity id
                .eq('company_id', companyId);

            if (data) {
                const mappedData = data.map((item: any) => ({
                    amount: item.amount,
                    charity_name: item.charities?.name || 'Unknown',
                    charity_id: item.charities?.id || '',  // Get charity id
                }));

                const total = mappedData.reduce((sum, donation) => sum + donation.amount, 0);
                setTotalDonations(total);
                setDonations(mappedData);
            } else {
                console.error(error);
            }

            setLoading(false);
        };

        fetchDonations();
    }, [companyId]);

    if (loading) {
        return <Text>Loading donations...</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Total Donations</Text>
            <Text style={styles.totalAmount}>${totalDonations.toFixed(2)}</Text>

            <FlatList
                data={donations}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.donationItem}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Charity Profile', { charityId: item.charity_id })}
                        >
                            <Text style={styles.charityName}>{item.charity_name}</Text>
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2d9cdb',
    },
    donationItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1',
        marginBottom: 10,
    },
    charityName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
    },
    donationAmount: {
        fontSize: 14,
        color: '#777',
    },
});

export default Donations;
