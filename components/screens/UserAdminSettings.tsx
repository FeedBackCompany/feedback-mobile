import React, { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Switch,
    ScrollView,
} from 'react-native'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { EventRegister } from 'react-native-event-listeners'
import { AntDesign, MaterialIcons, FontAwesome6 } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UserAdminSettings({ navigation, route }: any) {
    const insets = useSafeAreaInsets();
    const { logoutUser } = useCurrentUser()
    const profile = route?.params?.profile
    const { user } = useCurrentUser()

    const [username, setUsername] = useState(profile?.username || '')
    const [fullName, setFullName] = useState(profile?.full_name || '')
    const [bio, setBio] = useState(profile?.bio || '')
    const [showComments, setShowComments] = useState(profile?.show_comments ?? true)

    const [tempUsername, setTempUsername] = useState(username)
    const [tempFullName, setTempFullName] = useState(fullName)
    const [tempBio, setTempBio] = useState(bio)
    const [tempShowComments, setTempShowComments] = useState(showComments)

    const [isEditing, setIsEditing] = useState(false)
    const [isPersonalInfoCollapsed, setIsPersonalInfoCollapsed] = useState(true)
    const [isCommentsCollapsed, setIsCommentsCollapsed] = useState(true)

    const handleLogout = async () => {
        const { error } = await logoutUser()
        if (!error) {
            EventRegister.emit('logout')
        }
    }

    const handleEditProfilePicture = () => {
        console.log('Edit profile picture pressed')
    }

    const handleEditToggle = () => {
        setIsEditing(true)
    }

    const handleDone = () => {
        updateProfile(tempUsername, tempFullName, tempBio, tempShowComments)
        setIsEditing(false)
    }

    const handleDiscard = () => {
        setTempUsername(username)
        setTempFullName(fullName)
        setTempBio(bio)
        setTempShowComments(showComments)
        setIsEditing(false)
    }

    const updateProfile = async (newUsername: string, newFullName: string, newBio: string, newShowComments: boolean) => {
        try {
            if (!user) {
                console.error("No user is logged in")
                return
            }

            const { data, error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    username: newUsername,
                    full_name: newFullName,
                    description: newBio,
                    show_comments: newShowComments,
                })
                .single()

            if (error) {
                console.error("Error updating profile:", error.message)
                handleDiscard()
                return
            }

            console.log('Profile updated successfully:', data)
            setUsername(newUsername)
            setFullName(newFullName)
            setBio(newBio)
            setShowComments(newShowComments)
        } catch (error) {
            console.error("Error updating profile:", error)
            handleDiscard()
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }}>
            <ScrollView
                style={{ flex: 1, backgroundColor: '#fff' }}
                contentContainerStyle={{ padding: 16 }}
                contentInset={{ bottom: 0, top: 0 }}
                contentInsetAdjustmentBehavior="never"
                keyboardShouldPersistTaps="handled"
            >

                <View style={styles.settingsHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <AntDesign name="arrowleft" size={34} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Settings</Text>
                </View>

                <View style={styles.personalInfoContainer}>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                        onPress={() => setIsPersonalInfoCollapsed(!isPersonalInfoCollapsed)}
                    >
                        <Text style={styles.sectionHeaderText}>Personal Info</Text>
                        <AntDesign name={isPersonalInfoCollapsed ? "plus" : "minus"} size={20} color="black" />
                    </TouchableOpacity>

                    {!isPersonalInfoCollapsed && (
                        <>
                            <View style={styles.profileRow}>
                                <View style={styles.avatarContainer}>
                                    <AntDesign name="user" size={50} color="gray" />
                                    {isEditing && (
                                        <TouchableOpacity
                                            onPress={handleEditProfilePicture}
                                            style={styles.changeImageButton}
                                        >
                                            <FontAwesome6 name="image-portrait" size={34} color="white" />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <View>
                                    {!isEditing && (
                                        <TouchableOpacity
                                            onPress={handleEditToggle}
                                            style={styles.editButton}
                                        >
                                            <MaterialIcons name="edit" size={20} color="#fff" />
                                            <Text style={styles.editButtonText}>Edit</Text>
                                        </TouchableOpacity>
                                    )}

                                    {isEditing && (
                                        <View style={styles.editActions}>
                                            <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
                                                <Text style={styles.doneText}>Update</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={handleDiscard} style={styles.discardButton}>
                                                <Text style={styles.discardText}>Discard</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </View>

                            <View style={styles.personalInfoSection}>
                                <Text style={styles.fieldTitle}>Username</Text>
                                <TextInput
                                    style={[styles.input, isEditing && styles.inputEditing]}
                                    value={tempUsername}
                                    onChangeText={setTempUsername}
                                    placeholder="Username"
                                    editable={isEditing}
                                />
                                <Text style={styles.fieldTitle}>Full Name</Text>
                                <TextInput
                                    style={[styles.input, isEditing && styles.inputEditing]}
                                    value={tempFullName}
                                    onChangeText={setTempFullName}
                                    placeholder="Full Name"
                                    editable={isEditing}
                                />
                                <Text style={styles.fieldTitle}>Bio</Text>
                                <TextInput
                                    style={[styles.input, styles.bioInput, isEditing && styles.inputEditing]}
                                    value={tempBio}
                                    onChangeText={setTempBio}
                                    placeholder="Enter Bio"
                                    editable={isEditing}
                                    multiline
                                />
                            </View>
                        </>
                    )}
                </View>

                <View style={styles.publicCommentShowContainer}>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                        onPress={() => setIsCommentsCollapsed(!isCommentsCollapsed)}
                    >
                        <Text style={styles.sectionHeaderText}>Show Comments Publicly</Text>
                        <AntDesign name={isCommentsCollapsed ? "plus" : "minus"} size={20} color="black" />
                    </TouchableOpacity>

                    {!isCommentsCollapsed && (
                        <View style={{ marginTop: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                <Text style={{ fontSize: 16, marginRight: 10 }}>
                                    {tempShowComments ? 'Yes' : 'No'}
                                </Text>
                                <Switch
                                    value={tempShowComments}
                                    onValueChange={setTempShowComments}
                                />
                            </View>
                        </View>
                    )}
                </View>

                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutButtonText}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    settingsHeader: {
        flexDirection: 'row',
    },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    backButton: {
        marginTop: -2,
        marginRight: 15,
    },
    personalInfoContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 10,
        borderRightWidth: .8,
        borderLeftWidth: .8,
        borderColor: 'black',
        marginBottom: 20,
    },
    sectionHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        marginRight: 15,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        position: 'relative',
    },
    changeImageButton: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: 'gray',
        opacity: .8,
        padding: 8,
        borderRadius: 20,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'tomato',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    editActions: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 10,
    },
    doneButton: {
        backgroundColor: 'green',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginRight: 8,
    },
    discardButton: {
        backgroundColor: 'gray',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    doneText: { color: '#fff', fontWeight: 'bold' },
    discardText: { color: '#fff', fontWeight: 'bold' },
    input: {
        backgroundColor: '#f7f7f7',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 12,
        borderWidth: 0,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOpacity: 0.6,
        shadowOffset: { width: 6, height: 6 },
        shadowRadius: 4,
        elevation: 2,
    },
    inputEditing: {
        borderColor: '#4c6aa6',
        borderWidth: 2,
        backgroundColor: '#fff',
        shadowColor: 'transparent',
        shadowOpacity: 0.6,
        shadowOffset: { width: 6, height: 6 },
        shadowRadius: 4,
    },
    bioInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    logoutButton: {
        backgroundColor: 'tomato',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    publicCommentShowContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 10,
        borderRightWidth: .8,
        borderLeftWidth: .8,
        borderColor: 'black',
        marginBottom: 20,
    },
    fieldTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
        marginBottom: 6,
        textTransform: 'capitalize',
    },
    personalInfoSection: {
        backgroundColor: '#ffff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
})
