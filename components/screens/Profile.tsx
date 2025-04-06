import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Image, Modal, TouchableOpacity, ActivityIndicator } from 'react-native'
import { supabase } from '../../lib/supabase'

export default function Profile({ navigation }: any) {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isModalVisible, setIsModalVisible] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser()

            if (userError || !user) {
                console.log('Could not fetch user:', userError)
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('username, full_name, description, avatar_url')
                .eq('id', user.id)
                .single()

            if (error) {
                console.log('Error fetching profile:', error)
            } else {
                setProfile(data)
            }

            setLoading(false)
        }

        fetchProfile()
    }, [])

    useEffect(() => {
        if (profile) {
            const fullNameWithPossessive = `${profile.full_name}'s Profile`
            navigation.setOptions({ title: fullNameWithPossessive })
        }
    }, [profile, navigation])

    const handleOpenModal = () => {
        setIsModalVisible(true)
    }

    const handleCloseModal = () => {
        setIsModalVisible(false)
    }

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    if (!profile) {
        return (
            <View style={styles.centered}>
                <Text>No profile found</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.profileHeader}>
                <Image
                    source={{
                        uri: profile.avatar_url || 'https://via.placeholder.com/150',
                    }}
                    style={styles.avatar}
                />
                <View style={styles.profileInfo}>
                    <Text style={styles.username}>{profile.username}</Text>
                    {/* Removed Full Name here as it's already displayed in the title */}
                </View>
            </View>

            <Text style={styles.description}>{profile.description || 'No description yet.'}</Text>

            {/* Following Button */}
            <TouchableOpacity onPress={handleOpenModal} style={styles.followingButton}>
                <Text style={styles.followingButtonText}>Following</Text>
            </TouchableOpacity>

            {/* Modal */}
            <Modal
                visible={isModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Following</Text>
                        {/* For now, this will just display a black modal */}
                        <TouchableOpacity onPress={handleCloseModal} style={styles.closeModalButton}>
                            <Text style={styles.closeModalText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
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
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginRight: 16,
    },
    profileInfo: {
        justifyContent: 'center',
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        color: 'gray',
        marginVertical: 8,
    },
    followingButton: {
        backgroundColor: 'tomato',
        padding: 12,
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 16,
    },
    followingButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        backgroundColor: 'black',
        padding: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeModalButton: {
        backgroundColor: 'tomato',
        marginTop: 20,
        padding: 10,
        borderRadius: 8,
    },
    closeModalText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
