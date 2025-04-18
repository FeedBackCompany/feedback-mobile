import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { AntDesign } from '@expo/vector-icons';
import { useCurrentUser } from '../../../hooks/useCurrentUser';

interface UserSearchProps {
    searchQuery: string;
    navigation: any; // Added navigation prop
}

export default function UserSearch({ searchQuery, navigation }: UserSearchProps) {
    const [users, setUsers] = useState<any[]>([]);
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

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <FlatList
                keyboardShouldPersistTaps="handled"
                data={users}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card} onPress={() => {
                        Keyboard.dismiss();
                        handleUserPress(item.id)
                    }}>
                        {item.profile_image_url ? (
                            <Image
                                source={{ uri: item.profile_image_url }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={styles.avatarContainer}>
                                <AntDesign name="user" size={50} color="gray" />
                            </View>
                        )}
                        <Text style={styles.userName}>{item.full_name}</Text>
                    </TouchableOpacity>
                )}
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
});
