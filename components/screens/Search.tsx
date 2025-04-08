import React from 'react';
import { Searchbar } from 'react-native-paper';

export default function Search() {
    const [searchQuery, setSearchQuery] = React.useState('');

    return (
        <Searchbar
            placeholder="Search"
            onChangeText={setSearchQuery}
            value={searchQuery}
            mode={'view'}
            showDivider={false}
            elevation={3}
        />
    );
}
