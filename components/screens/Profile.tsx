import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    Image,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native'
import { supabase } from '../../lib/supabase'
import { MaterialIcons, AntDesign } from '@expo/vector-icons'

export default function Profile({ navigation }: any) {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [showAdminOptions, setShowAdminOptions] = useState(false)

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
        navigation.setOptions({ title: 'Profile' })
    }, [navigation])

    const handleOpenModal = () => setIsModalVisible(true)
    const handleCloseModal = () => setIsModalVisible(false)

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.log('Logout error:', error)
        } else {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
            })
        }
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
            {/* Admin icon floating in top-right */}

            <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                    {profile.avatar_url ? (
                        <Image
                            source={{
                                uri: profile.avatar_url || 'https://via.placeholder.com/150',
                            }}
                            style={styles.avatar}
                        />
                    ) : (
                        <AntDesign name="user" size={100} color="gray" />
                    )}
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.username}>{profile.username}</Text>
                    <Text style={styles.fullName}>{profile.full_name}</Text>
                </View>
                <TouchableOpacity onPress={() => setShowAdminOptions(!showAdminOptions)} style={styles.adminIcon}>
                    <MaterialIcons name="admin-panel-settings" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <Text style={styles.description}>{profile.description || 'No description yet.'}</Text>
            {/* Line under description */}
            <View style={styles.separator} />

            {showAdminOptions && (
                <View style={styles.buttonGroup}>
                    <TouchableOpacity onPress={handleOpenModal} style={styles.followingButton}>
                        <Text style={styles.followingButtonText}>Following</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <Text style={styles.logoutButtonText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Modal for Following */}
            <Modal
                visible={isModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Following</Text>
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
        marginTop: 0,
        marginBottom: 15,
    },
    avatarContainer: {
        width: 80,  // Container size
        height: 80, // Container size
        borderRadius: 40,  // Circular shape
        marginRight: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        overflow: 'hidden',  // Ensures image doesn't overflow the container
        flexDirection: 'row',  // Ensure flex properties work
        display: 'flex', // Flex container
    },
    avatar: {
        flex: 1,  // Avatar will take available space inside container
        width: null,  // Let flex control the width
        height: null,  // Let flex control the height
        resizeMode: 'contain',  // Ensures image fits properly within the container
    },
    profileInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    fullName: {
        fontSize: 16,
        color: 'gray',
    },
    description: {
        fontSize: 14,
        color: 'gray',
        marginVertical: 8,
    },
    separator: {
        height: 1,
        backgroundColor: 'lightgray',
        marginVertical: 10,
    },
    adminIcon: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 8,
        zIndex: 1,
    },
    buttonGroup: {
        marginTop: 10,
    },
    followingButton: {
        backgroundColor: 'tomato',
        padding: 12,
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 10,
    },
    followingButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: 'gray',
        padding: 12,
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 10,
    },
    logoutButtonText: {
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
        width: 250, // Smaller modal width
        backgroundColor: 'black',
        padding: 15, // Reduced padding
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
