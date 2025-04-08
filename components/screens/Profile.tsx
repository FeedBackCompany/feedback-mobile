import React, { useEffect, useState, useCallback, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { supabase } from '../../lib/supabase'
import { MaterialIcons, AntDesign } from '@expo/vector-icons'
import FollowingList from './FollowingList'
import UserComments from './UserComments';
import { useCurrentUser } from '../../hooks/useCurrentUser'

export default function Profile({ route, navigation }: any) {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [isFollowing, setIsFollowing] = useState(false)
    const [commentsError, setCommentsError] = useState(false);
    const { user, logoutUser } = useCurrentUser();

    const isMounted = useRef(true)
    const loadingRef = useRef(true)
    const navigationChecked = useRef(false)

    useEffect(() => {
        const checkNavigation = async () => {
            if (!route.params?.userId && user?.id) {
                navigation.setParams({ userId: user.id })
            }
        }

        if (!navigationChecked.current) {
            navigationChecked.current = true
            checkNavigation()
        }
    }, [])

    useEffect(() => {
        return () => {
            isMounted.current = false
        }
    }, [])

    const fetchData = useCallback(async () => {
        try {
            if (!isMounted.current) return
            loadingRef.current = true
            setLoading(true)

            if (userError || !user) throw userError || new Error('No user found')

            const idToFetch = route.params?.userId || user.id
            const [{ data: profileData }, { data: followData }] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', idToFetch).single(),
                idToFetch !== user.id ?
                    supabase.from('follows').select('*').eq('follower_id', user.id).eq('followed_id', idToFetch).single()
                    : { data: null }
            ])

            if (!isMounted.current) return

            setCurrentUser(user)
            setProfile(profileData)

            // Set isFollowing based on whether the follow exists in the 'follows' table
            if (followData) {
                setIsFollowing(true) // User is following
            } else {
                setIsFollowing(false) // User is not following
            }

        } catch (error) {
            console.error('Error:', error)
            if (isMounted.current) {
                navigation.navigate('ErrorScreen')
            }
        } finally {
            if (isMounted.current) {
                loadingRef.current = false
                setLoading(false)
            }
        }
    }, [route.params?.userId])

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (isMounted.current) {
                fetchData()
            }
        })

        fetchData()

        return () => {
            unsubscribe()
        }
    }, [fetchData, navigation])

    const isOwnProfile = currentUser?.id === profile?.id

    const toggleFollow = async () => {
        const { data: _, error: fetchError } = await supabase
            .from('profiles')
            .select('following')
            .eq('id', currentUser.id)
            .single()

        if (fetchError) return

        const viewedUserId = route.params?.userId || currentUser?.id

        // Check if the user is already following
        const { data: followData, error: followError } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', currentUser.id)
            .eq('followed_id', viewedUserId)
            .single()

        if (followError && followError.code !== 'PGRST116') {
            // Handle other errors related to querying follows
            console.error('Error fetching follow data:', followError)
            return
        }

        if (followData) {
            // Unfollow the user (delete the follow record)
            await supabase
                .from('follows')
                .delete()
                .eq('follower_id', currentUser.id)
                .eq('followed_id', viewedUserId)

            setIsFollowing(false)
        } else {
            // Follow the user (insert a new follow record)
            await supabase
                .from('follows')
                .insert([{ follower_id: currentUser.id, followed_id: viewedUserId }])

            setIsFollowing(true)
        }
    }

    const handleOpenModal = () => setIsModalVisible(true)
    const handleCloseModal = () => setIsModalVisible(false)

    const goToMyProfile = () => {
        navigation.setParams({ userId: currentUser?.id })
    }

    if (loadingRef.current || loading) {
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

    try {
        return (
            <View style={styles.container}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <AntDesign name="user" size={50} color="gray" />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.username}>{profile.username}</Text>
                        <Text style={styles.fullName}>{profile.full_name}</Text>
                    </View>
                    {isOwnProfile && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('AdminSettings')}
                            style={styles.adminIcon}
                        >
                            <MaterialIcons name="admin-panel-settings" size={24} color="black" />
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={styles.description}>{profile.description || 'No description yet.'}</Text>
                <View style={styles.separator} />

                {isOwnProfile ? (
                    // Hide the "Following" button when the modal is visible
                    !isModalVisible && (
                        <TouchableOpacity onPress={handleOpenModal} style={styles.followingButton}>
                            <Text style={styles.followingButtonText}>Following</Text>
                        </TouchableOpacity>
                    )
                ) : (
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity onPress={toggleFollow} style={styles.followingButton}>
                            <Text style={styles.followingButtonText}>
                                {isFollowing ? 'Unfollow' : 'Follow'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={goToMyProfile} style={styles.backButton}>
                            <Text style={styles.backButtonText}>Back to My Profile</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <FollowingList
                    isVisible={isModalVisible}
                    onClose={handleCloseModal}
                    navigation={navigation}
                />

                {profile.id && !commentsError ? (
                    (() => {
                        try {
                            return <UserComments userId={profile.id} />
                        } catch (e) {
                            console.error('UserComments crashed:', e)
                            setCommentsError(true)
                            return (
                                <Text style={{ textAlign: 'center', marginTop: 10, color: 'gray' }}>
                                    Could not load comments.
                                </Text>
                            )
                        }
                    })()
                ) : commentsError ? (
                    <Text style={{ textAlign: 'center', marginTop: 10, color: 'gray' }}>
                        Could not load comments.
                    </Text>
                ) : null}
            </View>
        )
    } catch (e) {
        console.error('Render error:', e)
        return (
            <View style={styles.centered}>
                <Text>Something went wrong while loading this profile.</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    avatarContainer: {
        width: 80, height: 80, borderRadius: 40, marginRight: 16,
        justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0',
    },
    profileInfo: { flex: 1 },
    username: { fontSize: 18, fontWeight: 'bold' },
    fullName: { fontSize: 16, color: 'gray' },
    description: { fontSize: 14, color: 'gray', marginVertical: 8 },
    separator: { height: 1, backgroundColor: 'lightgray', marginVertical: 10 },
    adminIcon: { position: 'absolute', top: 16, right: 16, padding: 8 },
    followingButton: { marginTop: 10, alignSelf: 'flex-end' },
    followingButtonText: { color: 'tomato', fontSize: 16, fontWeight: 'bold' },
    logoutButton: {
        backgroundColor: 'gray', padding: 12, alignItems: 'center',
        borderRadius: 8, marginTop: 10,
    },
    logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    backButton: { marginTop: 8 },
    backButtonText: { color: 'blue', fontSize: 14 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    buttonGroup: { marginTop: 10 },
})
