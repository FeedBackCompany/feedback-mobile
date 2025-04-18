import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, FlatList, TouchableWithoutFeedback } from 'react-native';
import { supabase } from '../../lib/supabase';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useCurrentUser } from '../../hooks/useCurrentUser';

const FollowingList = ({ isVisible, onClose, navigation }: any) => {
    const [following, setFollowing] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useCurrentUser();
    const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

    const fetchFollowing = async () => {
        setLoading(true);
        try {
            if (!user) throw new Error('No user found');

            const { data: followedProfiles, error } = await supabase
                .from('follows')
                .select('followed_id, created_at')
                .eq('follower_id', user.id);

            if (error) throw new Error(`Error fetching followed profiles: ${error.message}`);

            const followedIds = followedProfiles.map(p => p.followed_id);

            const [{ data: users }, { data: companies }] = await Promise.all([
                supabase.from('profiles').select('id, username, avatar_url').in('id', followedIds),
                supabase.from('company_profiles').select('id, legal_business_name, avatar_url').in('id', followedIds),
            ]);

            // Map for easy lookup of follow timestamps
            const followTimestampsMap: Record<string, string> = {};
            followedProfiles.forEach(fp => {
                followTimestampsMap[fp.followed_id] = fp.created_at;
            });

            const taggedUsers = (users || [])
                .filter((u: any) => u && u.username)
                .map((u: any) => ({
                    ...u,
                    type: 'user',
                    created_at: followTimestampsMap[u.id],
                }));

            const taggedCompanies = (companies || [])
                .filter((c: any) => c && c.legal_business_name)
                .map((c: any) => ({
                    ...c,
                    type: 'company',
                    created_at: followTimestampsMap[c.id],
                }));

            const combined = [...taggedUsers, ...taggedCompanies];

            const sorted = combined.sort((a, b) => {
                return sortOrder === 'latest'
                    ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            });

            setFollowing(sorted);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data once when the modal is opened
    useEffect(() => {
        if (isVisible) {
            fetchFollowing();
        }
    }, [isVisible]);

    // Sort following list based on sortOrder
    useEffect(() => {
        if (following.length > 0) {
            const sorted = [...following].sort((a, b) => {
                const aTime = new Date(a.created_at).getTime();
                const bTime = new Date(b.created_at).getTime();
                return sortOrder === 'latest' ? bTime - aTime : aTime - bTime;
            });

            setFollowing(sorted);
        }
    }, [sortOrder]);

    const handleProfileClick = (item: any) => {
        if (item.type === 'user') {
            navigation.navigate('Public Profile', { userId: item.id });
        } else {
            navigation.navigate('Company Profile', { companyId: item.id });
        }
        onClose();
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity style={styles.followingItem} onPress={() => handleProfileClick(item)}>
            {item.type === 'company' ? (
                <MaterialIcons name="business" size={50} color="gray" />
            ) : (
                <AntDesign name="user" size={50} color="gray" />
            )}
            <Text style={styles.followingText}>
                {item.type === 'company' ? item.legal_business_name : item.username}
            </Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <View style={styles.headerRow}>
                                <Text style={styles.modalText}>Following</Text>
                                <TouchableOpacity onPress={() => {
                                    setSortOrder(prev => prev === 'latest' ? 'oldest' : 'latest');
                                }}>
                                    <Text style={styles.sortText}>
                                        {sortOrder === 'latest' ? 'Latest ⬇️' : 'Oldest ⬆️'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={following}
                                renderItem={renderItem}
                                keyExtractor={(item) => `${item.type}-${item.id}`}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    modalContent: {
        width: '95%',
        height: '60%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        justifyContent: 'flex-start',
        position: 'absolute',
        bottom: 15,
        borderWidth: 1,
        borderColor: 'lightgray',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
    },
    modalText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    followingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        marginBottom: 5,
    },
    followingText: {
        marginLeft: 10,
        fontSize: 20,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sortText: {
        fontSize: 14,
        color: 'gray',
    },
});

export default FollowingList;
