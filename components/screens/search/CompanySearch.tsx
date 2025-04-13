import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';

interface CompanySearchProps {
    searchQuery: string;
    navigation: any; // Added navigation prop
}

export default function CompanySearch({ searchQuery, navigation }: CompanySearchProps) {
    const [companies, setCompanies] = useState<any[]>([]);

    useEffect(() => {
        if (searchQuery.length === 0) {
            setCompanies([]); // Clear companies when search query is empty
            return;
        }

        const fetchCompanies = async () => {
            const { data, error } = await supabase
                .from('company_profiles')
                .select('*')
                .ilike('legal_business_name', `%${searchQuery}%`); // Search by company name

            if (data) {
                setCompanies(data);
            } else {
                console.error(error);
            }
        };

        fetchCompanies();
    }, [searchQuery]);

    const handleCompanyPress = (companyId: string) => {
        // updateCurrentPost(post);
        // navigation.navigate('Company Post In Profile')
        navigation.navigate('Company Profile', { companyId });
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.resultsContainer}>
                <FlatList
                    keyboardShouldPersistTaps="handled"
                    data={companies}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.card} onPress={() => {
                            Keyboard.dismiss();
                            handleCompanyPress(item.id)
                        }}>
                            {item.profile_image_url ? (
                                <Image
                                    source={{ uri: item.profile_image_url }}
                                    style={styles.profileImage}
                                />
                            ) : (
                                <View style={styles.avatarContainer}>
                                    <MaterialIcons name="business" size={50} color="gray" />
                                </View>
                            )}
                            <Text style={styles.companyName}>{item.legal_business_name}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    resultsContainer: {
        marginTop: 20,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        marginRight: 10,
    },
    companyName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
