import React from 'react';
import { StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Search() {
    const [searchQuery, setSearchQuery] = React.useState('');

    return (
        <SafeAreaView style={styles.container}>
            <Searchbar
                placeholder="Search"
                onChangeText={setSearchQuery}
                value={searchQuery}
                // mode={'view'}
                showDivider={false}
                elevation={1}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: 21,
    }
})