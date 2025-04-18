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
    const [showComments, setShowComments] = useState(profile?.show_comments ?? true)  //added

    const [tempUsername, setTempUsername] = useState(username)
    const [tempFullName, setTempFullName] = useState(fullName)
    const [tempBio, setTempBio] = useState(bio)
    const [tempShowComments, setTempShowComments] = useState(showComments) // added

    const [isEditing, setIsEditing] = useState(false)

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
        setTempShowComments(showComments) // ⬅️ ADDED
        setIsEditing(false)
    }

    // Update the profile information in the backend
    const updateProfile = async (newUsername: string, newFullName: string, newBio: string, newShowComments: boolean) => {
        try {
            if (!user) {
                console.error("No user is logged in")
                return
            }

            const { data, error } = await supabase
                .from('profiles') // Use your profiles table name
                .upsert({
                    id: user.id,  // Use the user's ID from Supabase
                    username: newUsername,
                    full_name: newFullName,
                    description: newBio,
                    show_comments: newShowComments, // ⬅️ ADDED
                })
                .single()

            if (error) {
                console.error("Error updating profile:", error.message)
                handleDiscard()  // Optionally, revert changes on error
                return
            }

            // Update local state if successful
            console.log('Profile updated successfully:', data)
            setUsername(newUsername)
            setFullName(newFullName)
            setBio(newBio)
            setShowComments(newShowComments) // ⬅️ ADDED
        } catch (error) {
            console.error("Error updating profile:", error)
            handleDiscard()  // Optionally, revert changes on error
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
                    <Text style={styles.title}>Admin Settings</Text>
                </View>

                <View style={styles.personalInfoContainer}>
                    <Text style={styles.sectionHeaderText}>Personal Info</Text>

                    <View style={styles.profileRow}>
                        <View style={styles.avatarContainer}>
                            {/* Profile Image Background */}
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
                </View>

                <Text style={styles.fieldTitle}>Show Comments Publicly</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ fontSize: 16, marginRight: 10 }}>
                        {tempShowComments ? 'Yes' : 'No'}
                    </Text>
                    <Switch
                        value={tempShowComments}
                        onValueChange={setTempShowComments}
                    />
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
        // padding: 16,

        backgroundColor: '#fff',
    },
    settingsHeader: {
        flexDirection: 'row',
    },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    // Personal Info Container Styles
    backButton: {
        marginTop: -2,
        marginRight: 15,
    },
    personalInfoContainer: {
        backgroundColor: '#f7f7f7', // Light gray background to highlight the section
        padding: 16,
        borderRadius: 10,
        marginBottom: 20, // Add space between the sections
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
        backgroundColor: '#f7f7f7', // Light gray background
        padding: 12, // Adequate padding for a spacious feel
        borderRadius: 8, // Rounded corners for smooth edges
        fontSize: 16, // Standard font size for readability
        marginBottom: 12, // Spacing between fields
        borderWidth: 0, // Subtle border for structure
        borderColor: '#ddd', // Light gray border to indicate the input field
        shadowColor: '#000', // Shadow effect for depth
        shadowOpacity: 0.6, // Soft shadow to make it stand out
        shadowOffset: { width: 6, height: 6 }, // Slightly raised appearance
        shadowRadius: 4, // Soft shadow radius
        elevation: 2, // For Android devices to match iOS shadow
    },
    inputEditing: {
        borderColor: '#4c6aa6',
        borderWidth: 2,
        backgroundColor: '#fff',
        shadowColor: 'transparent', // Shadow effect for depth
        shadowOpacity: 0.6, // Soft shadow to make it stand out
        shadowOffset: { width: 6, height: 6 }, // Slightly raised appearance
        shadowRadius: 4, // Soft shadow radius
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
    // Styling for the professional field titles
    fieldTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000', // A dark gray color for the titles
        marginBottom: 6,
        textTransform: 'capitalize', // Makes the first letter of each word uppercase
    },

    // Add a section for personal info styling
    personalInfoSection: {
        backgroundColor: '#ffff', // Lighter shade than background
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
})



