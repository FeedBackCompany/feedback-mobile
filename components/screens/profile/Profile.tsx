import React, { useEffect, useState, useCallback, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native'
import { supabase } from '../../../lib/supabase'
import { MaterialIcons, AntDesign } from '@expo/vector-icons'
import FollowingList from '../FollowingList'
import UserComments from '../UserComments';
import { useCurrentUser } from '../../../hooks/useCurrentUser'
import { SafeAreaView } from 'react-native-safe-area-context';


export default function Profile({ route, navigation }: any) {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [isFollowing, setIsFollowing] = useState(false)
    const [commentsError, setCommentsError] = useState(false);
    const { user } = useCurrentUser();
    const [activeTab, setActiveTab] = useState<'comments' | 'saved'>('comments');

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

    const fetchData = useCallback(async () => {
        try {
            if (!isMounted.current) return
            loadingRef.current = true
            setLoading(true)

            if (!user) throw new Error('No user found')

            const idToFetch = route.params?.userId || user.id
            const [{ data: profileData }, { data: followData }] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', idToFetch).single(),
                idToFetch !== user.id ?
                    supabase.from('follows').select('*').eq('follower_id', user.id).eq('followed_id', idToFetch).single()
                    : { data: null }
            ])

            if (!isMounted.current) return

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

        fetchData();

        return () => {
            unsubscribe()
        }
    }, [fetchData, navigation])

    const isOwnProfile = user?.id === profile?.id

    const toggleFollow = async () => {
        if (!user) return;

        const viewedUserId = route.params?.userId || user?.id

        // Check if the user is already following
        const { data: followData, error: followError } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', user.id)
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
                .eq('follower_id', user.id)
                .eq('followed_id', viewedUserId)

            setIsFollowing(false)
        } else {
            // Follow the user (insert a new follow record)
            await supabase
                .from('follows')
                .insert([{ follower_id: user.id, followed_id: viewedUserId }])

            setIsFollowing(true)
        }
    }

    const handleOpenModal = () => setIsModalVisible(true)
    const handleCloseModal = () => setIsModalVisible(false)

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

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
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
                        onPress={() => navigation.navigate('UserAdminSettings', { profile })}
                        style={styles.adminIcon}
                    >
                        <MaterialIcons name="admin-panel-settings" size={24} color="black" />
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.description}>{profile.description || 'No bio'}</Text>
            {isOwnProfile ? (
                // Hide the "Following" button when the modal is visible
                <TouchableOpacity onPress={handleOpenModal} style={styles.followingButton}>
                    <Text style={styles.followingButtonText}>Following</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.buttonGroup}>
                    <TouchableOpacity onPress={toggleFollow} style={styles.followingButton}>
                        <Text style={styles.followingButtonText}>
                            {isFollowing ? 'Unfollow' : 'Follow'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <FollowingList
                isVisible={isModalVisible}
                onClose={handleCloseModal}
                navigation={navigation}
            />
            <View style={styles.separator} />


            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
                <TouchableOpacity
                    onPress={() => setActiveTab('comments')}
                    style={{
                        width: '50%',
                        alignItems: 'center',
                        paddingBottom: 6,
                        paddingTop: 10,
                        borderBottomWidth: activeTab === 'comments' ? 3 : 0,
                        borderBottomColor: '#111211',
                    }}
                >
                    <Text style={{ fontSize: 18, letterSpacing: 1.2, color: activeTab === 'comments' ? 'black' : 'gray' }}>
                        Comments
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveTab('saved')}
                    style={{
                        width: '50%',
                        alignItems: 'center',
                        paddingBottom: 6,
                        paddingTop: 10,
                        borderBottomWidth: activeTab === 'saved' ? 3 : 0,
                        borderBottomColor: '#111211',
                    }}
                >
                    <Text style={{ fontSize: 18, letterSpacing: 1.2, color: activeTab === 'saved' ? 'black' : 'gray' }}>
                        Saved
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'comments' && profile.id && !commentsError ? (
                (() => {
                    try {
                        const canShowComments = profile?.show_comments || isOwnProfile

                        if (!canShowComments) {
                            return (
                                <Text style={{ textAlign: 'center', marginTop: 10, color: 'gray' }}>
                                    This user's comments are private.
                                </Text>
                            )
                        }

                        return <UserComments userId={profile.id} navigation={navigation} />
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
            ) : null}

            {activeTab === 'saved' && (
                <View style={{ marginTop: 20, alignItems: 'center' }}>
                    <Text style={{ color: 'gray', fontSize: 16 }}>
                        Bookmarked posts will show here.
                    </Text>
                </View>
            )}
        </SafeAreaView>
    )
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
    followingButton: {
        width: 140, // wider
        height: 40, // shorter
        borderRadius: 20, // half of height for pill shape
        backgroundColor: 'rgba(94, 93, 93, 0.1)',
        opacity: 0.9,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center', // center it horizontally
        marginTop: 10,
    },
    followingButtonText: { color: 'black', fontSize: 16, fontWeight: 'bold' },
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
