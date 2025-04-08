import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, FlatList, TouchableWithoutFeedback } from 'react-native'
import { supabase } from '../../lib/supabase'
import { AntDesign } from '@expo/vector-icons'

const FollowingList = ({ isVisible, onClose, navigation }: any) => {
    const [following, setFollowing] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFollowing = async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError || !user) {
                console.log('Error fetching user:', userError)
                setLoading(false)
                return
            }

            // Fetch the current user's profile to get the following list
            const { data: followedProfiles, error } = await supabase
                .from('follows')
                .select('followed_id')
                .eq('follower_id', user.id)  // Fetch users the current user is following

            if (error) {
                console.log('Error fetching followed profiles:', error)
            } else {
                const followedUserIds = followedProfiles?.map((profile: any) => profile.followed_id)
                if (followedUserIds && followedUserIds.length > 0) {
                    const { data: profiles, error: profilesError } = await supabase
                        .from('profiles')
                        .select('id, username, avatar_url')  // Fetch profile details
                        .in('id', followedUserIds)

                    if (profilesError) {
                        console.log('Error fetching profiles:', profilesError)
                    } else {
                        setFollowing(profiles || [])
                    }
                }
            }

            setLoading(false)
        }

        if (isVisible) {
            fetchFollowing()
        }
    }, [isVisible])

    const handleProfileClick = (userId: string) => {
        navigation.navigate('Profile', { userId }) // Navigate to the profile page with the user ID
        onClose() // Close the modal
    }

    const renderItem = ({ item }: any) => (
        <TouchableOpacity style={styles.followingItem} onPress={() => handleProfileClick(item.id)}>
            <AntDesign name="user" size={50} color="gray" />
            <Text style={styles.followingText}>{item.username}</Text>
        </TouchableOpacity>
    )

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        )
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
                            <Text style={styles.modalText}>Following</Text>
                            <FlatList
                                data={following}
                                renderItem={renderItem}
                                keyExtractor={(item) => item.id}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',  // Align the modal at the bottom
        alignItems: 'center',
    },
    modalContent: {
        width: '95%', // Full width with some padding
        height: '60%', // Cover the bottom half
        backgroundColor: 'white', // White background
        padding: 20,
        borderRadius: 12, // Rounded corners for a card-like appearance
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        justifyContent: 'flex-start',
        position: 'absolute',
        bottom: 15, // Add some space from the bottom edge
        borderWidth: 1, // Border width
        borderColor: 'lightgray', // Light border color
        shadowColor: '#000', // Shadow color
        shadowOffset: { width: 0, height: 2 }, // Shadow offset for depth
        shadowOpacity: 0.15, // Shadow opacity
        shadowRadius: 10, // Shadow blur radius
        elevation: 5, // Elevation for Android shadow
    },
    modalText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    followingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    followingText: {
        marginLeft: 10,
        fontSize: 16,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export default FollowingList
