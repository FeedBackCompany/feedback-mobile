import { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { StyleSheet, View, Alert, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Layout() {
    return (
        <SafeAreaView style={styles.container}>
            <Text>This is the Layout Page</Text>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        backgroundColor: 'white',
    },
})