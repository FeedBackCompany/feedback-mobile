import React, { useState } from 'react';
import { View, StyleSheet, Button, TouchableWithoutFeedback, Keyboard } from 'react-native';
import CompanySearch from './CompanySearch';
import UserSearch from './UserSearch';
import { Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchWrapper({ navigation }: any) {
    const [searchType, setSearchType] = useState<'company' | 'user'>('company'); // Track the search type
    const [searchQuery, setSearchQuery] = useState('');

    const handleDismissKeyboard = () => {
        Keyboard.dismiss(); // Dismiss the keyboard when clicking outside
    };

    return (
        <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
            <SafeAreaView style={styles.container}>
                <Searchbar
                    placeholder="Search..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    mode="view"
                    showDivider={false}
                    elevation={3}
                />

                <View style={styles.toggleContainer}>
                    <Button
                        title="Companies"
                        onPress={() => setSearchType('company')}
                        color={searchType === 'company' ? 'blue' : 'gray'}
                    />
                    <Button
                        title="Users"
                        onPress={() => setSearchType('user')}
                        color={searchType === 'user' ? 'blue' : 'gray'}
                    />
                </View>

                {searchType === 'company' ? (
                    <CompanySearch searchQuery={searchQuery} navigation={navigation} />
                ) : (
                    <UserSearch searchQuery={searchQuery} navigation={navigation} />
                )}
            </SafeAreaView>
        </TouchableWithoutFeedback>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16, // Added some spacing between search bar and buttons
        marginBottom: 20, // Added some spacing between buttons and results
    },
});
