import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
} from 'react-native';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { EventRegister } from 'react-native-event-listeners';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';

export default function CompanyAdminSettings({ _navigation, route }: any) {
    const { logoutUser } = useCurrentUser()
    const profile = route?.params?.profile
    const { user } = useCurrentUser()

    const [legalName, setLegalName] = useState(profile?.legal_business_name || '')
    const [name, setName] = useState(profile?.name || '')
    const [email, setEmail] = useState(profile?.email || '')
    const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '')
    const [website, setWebsite] = useState(profile?.website || '')
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')

    const [tempLegalName, setTempLegalName] = useState(legalName)
    const [tempName, setTempName] = useState(name)
    const [tempEmail, setTempEmail] = useState(email)
    const [tempPhoneNumber, setTempPhoneNumber] = useState(phoneNumber)
    const [tempWebsite, setTempWebsite] = useState(website)

    const [isEditing, setIsEditing] = useState(false)

    const handleLogout = async () => {
        const { error } = await logoutUser()
        if (!error) {
            EventRegister.emit('logout')
        }
    }

    const handleEditProfilePicture = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'Permission to access gallery is required!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (result.canceled || !result.assets?.length) {
                console.log('canceled')
                return;
            }

            console.log('result.assets', result.assets);

            const imageUri = result.assets[0].uri;

            // console.log('imageuri', imageUri);
            const fileName = `${Date.now()}-${imageUri.split('/').pop()}`;
            const fileType = result.assets[0].mimeType || '';

            // Fetch the image as a blob
            const response = await fetch(imageUri);
            const blobData = await response.blob();

            const blob = new Blob([blobData], {
                type: fileType
            })

            const formData = new FormData();
            formData.append('file', blob)

            console.log('fileName', fileName);
            // Upload to Supabase
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, formData, {
                    contentType: 'multipart/form-data'
                });

            console.log('uploadError', uploadError);

            if (uploadError) {
                Alert.alert('Upload Error', uploadError.message);
                return;
            }

            // Get public URL
            const { data } = await supabase.storage
                .from('avatars')
                .createSignedUrl(fileName, 3600);

            const signedUrl = data?.signedUrl || avatarUrl;

            console.log('signedUrl', signedUrl);

            // Update Supabase profile
            const { error: updateProfileError } = await supabase
                .from('company_profiles')
                .update({ avatar_url: signedUrl })
                .eq('id', profile.id);

            if (updateProfileError) {
                console.error('did not upload')
                throw new Error(updateProfileError.toString());
            } else {
                setAvatarUrl(imageUri);
            }
        } catch (error) {
            console.error('Error picking/uploading image: ', error);
            Alert.alert('Image Upload Error', 'Something went wrong while uploading the image.');
        }
    }

    const handleEditToggle = () => {
        setIsEditing(true)
    }

    const handleDone = () => {
        updateProfile(tempLegalName, tempName, tempEmail, tempPhoneNumber, tempWebsite)
        setIsEditing(false)
    }

    const handleDiscard = () => {
        setTempLegalName(legalName)
        setTempName(name)
        setTempEmail(email)
        setTempPhoneNumber(phoneNumber)
        setTempWebsite(website)
        setIsEditing(false)
    }

    // Update the profile information in the backend
    const updateProfile = async (newLegalName: string, newName: string, newEmail: string, newNumber: string, newWebsite: string) => {
        try {
            if (!user) {
                console.error("No user is logged in")
                return
            }

            const { error } = await supabase
                .from('company_profiles') // Make sure you use the correct table for company profiles
                .update({
                    legal_business_name: newLegalName,
                    name: newName,
                    email: newEmail,
                    phone_number: newNumber,
                    website: newWebsite,
                })
                .eq('id', profile.id)
                .single();

            if (error) {
                console.error("Error updating profile:", error.message)
                handleDiscard()  // Optionally, revert changes on error
                return
            }

            // Update local state if successful
            // console.log('Profile updated successfully:', data)
            setLegalName(newLegalName)
            setName(newName)
            setEmail(newEmail)
            setPhoneNumber(newNumber)
            setWebsite(newWebsite)
        } catch (error) {
            console.error("Error updating profile:", error)
            handleDiscard()  // Optionally, revert changes on error
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <Text style={styles.title}>Admin Settings</Text>

                {/* Personal Info Section */}
                <View style={styles.personalInfoContainer}>
                    <Text style={styles.sectionHeaderText}>Personal Info</Text>

                    <View style={styles.profileRow}>
                        <View style={styles.avatarContainer}>
                            {/* Profile Image Background */}
                            {avatarUrl ? (
                                <Image
                                    source={{ uri: avatarUrl }}
                                    style={{ width: 80, height: 80, borderRadius: 40 }}
                                />
                            ) : (
                                <MaterialIcons name="business" size={50} color="gray" />
                            )}

                            {isEditing && (
                                <TouchableOpacity
                                    onPress={handleEditProfilePicture}
                                    style={styles.changeImageButton}
                                >
                                    <Ionicons name="camera-outline" size={30} color={'#fff'} />
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
                        <Text style={styles.fieldTitle}>Legal Name</Text>
                        <TextInput
                            style={[styles.input, isEditing && styles.inputEditing]}
                            value={tempLegalName}
                            onChangeText={setTempLegalName}
                            placeholder="Legal Name"
                            editable={isEditing}
                        />
                        <Text style={styles.fieldTitle}>Company Name</Text>
                        <TextInput
                            style={[styles.input, isEditing && styles.inputEditing]}
                            value={tempName}
                            onChangeText={setTempName}
                            placeholder="Company Name"
                            editable={isEditing}
                        />
                        <Text style={styles.fieldTitle}>Email</Text>
                        <TextInput
                            style={[styles.input, isEditing && styles.inputEditing]}
                            value={tempEmail}
                            onChangeText={setTempEmail}
                            placeholder="Email"
                            editable={isEditing}
                        />
                        <Text style={styles.fieldTitle}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, isEditing && styles.inputEditing]}
                            value={tempPhoneNumber}
                            onChangeText={setTempPhoneNumber}
                            placeholder="Phone Number"
                            editable={isEditing}
                        />
                        <Text style={styles.fieldTitle}>Website</Text>
                        <TextInput
                            style={[styles.input, isEditing && styles.inputEditing]}
                            value={tempWebsite}
                            onChangeText={setTempWebsite}
                            placeholder="Website"
                            editable={isEditing}
                        />
                    </View>

                </View>

                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutButtonText}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    // Personal Info Container Styles
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
        width: '100%',
        height: '100%',
        bottom: 0,
        right: 0,
        backgroundColor: 'gray',
        opacity: .8,
        padding: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '100%',
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
