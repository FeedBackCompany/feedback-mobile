import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useCurrentUser } from '../../../hooks/useCurrentUser';

interface SearchProps {
    searchQuery: string;
    navigation: any; // Added navigation prop
}

export default function SearchAll({ searchQuery, navigation }: SearchProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const { user } = useCurrentUser();

    useEffect(() => {
        if (searchQuery.length === 0) {
            setUsers([]); // Clear users when search query is empty
            return;
        }

        const fetchUsers = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .ilike('full_name', `%${searchQuery}%`); // Search by user's full name

            if (data) {
                const filtered = data.filter(u => u.id !== user?.id);
                setUsers(filtered);
            } else {
                console.error(error);
            }
        };

        fetchUsers();
    }, [searchQuery]);

    const handleUserPress = (userId: string) => {

        navigation.navigate('Public Profile', { userId });
    };


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
                const filtered = data.filter(u => u.id !== user?.id);
                setCompanies(filtered);
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

    const combinedResults = [
        ...companies.map((item) => ({ ...item, type: 'company' })),
        ...users.map((item) => ({ ...item, type: 'user' })),
    ];

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <FlatList
                keyboardShouldPersistTaps="handled"
                data={combinedResults}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString() + item.type}
                renderItem={({ item }) => {
                    if (item.type === 'user') {
                        return (
                            <TouchableOpacity style={styles.card} onPress={() => handleUserPress(item.id)}>
                                {item.profile_image_url ? (
                                    <Image source={{ uri: item.profile_image_url }} style={styles.profileImage} />
                                ) : (
                                    <View style={styles.avatarContainer}>
                                        <AntDesign name="user" size={50} color="gray" />
                                    </View>
                                )}
                                <Text style={styles.userName}>{item.full_name}</Text>
                            </TouchableOpacity>
                        );
                    } else {
                        return (
                            <TouchableOpacity style={styles.card} onPress={() => handleCompanyPress(item.id)}>
                                {item.profile_image_url ? (
                                    <Image source={{ uri: item.profile_image_url }} style={styles.profileImage} />
                                ) : (
                                    <View style={styles.avatarContainer}>
                                        <MaterialIcons name="business" size={50} color="gray" />
                                    </View>
                                )}
                                <Text style={styles.companyName}>{item.legal_business_name}</Text>
                            </TouchableOpacity>
                        );
                    }
                }}
            />
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
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    companyName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
