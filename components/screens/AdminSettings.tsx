import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { EventRegister } from 'react-native-event-listeners';

export default function AdminSettings({ _navigation }: any) {
    const { logoutUser } = useCurrentUser();

    const handleLogout = async () => {
        const { error } = await logoutUser();
        if (!error) {
            EventRegister.emit('logout');
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Admin Settings</Text>

            {/* Add more admin options here */}
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 75 },
    logoutButton: {
        backgroundColor: 'tomato',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
})
