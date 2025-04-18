import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    Keyboard,
    Text,
    Modal,
    Pressable,
} from 'react-native';
import CompanySearch from './CompanySearch';
import UserSearch from './UserSearch';
import SearchAll from './SearchAll';
import { Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchWrapper({ navigation }: any) {
    const [searchType, setSearchType] = useState<'all' | 'company' | 'user'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false); // Track focus state

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const handleDismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const handleSelectFilter = (type: 'all' | 'company' | 'user') => {
        setSearchType(type);
        setModalVisible(false);
    };

    const searchTypeDisplay = {
        all: 'All',
        company: 'Companies',
        user: 'Users',
    }[searchType];

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
                    style={[
                        styles.searchbar,
                        isFocused && styles.searchbarActive, // Apply active style when focused
                    ]}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />

                <View style={styles.filterRow}>
                    <View style={[
                        styles.filterContainer,
                        isFocused && styles.filterContainerActive,
                    ]}>

                        <Pressable style={styles.filterButton} onPress={() => setModalVisible(true)}>
                            <Text style={styles.filterButtonText}>Filter by:</Text>
                        </Pressable>
                        <Text style={styles.selectedFilter}>{searchTypeDisplay}</Text>
                    </View>
                </View>

                {/* Filter Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback>
                                <View style={styles.modalContainer}>
                                    <Text style={styles.modalTitle}>Select Filter</Text>

                                    {(['all', 'company', 'user'] as const).map((type) => (
                                        <Pressable
                                            key={type}
                                            style={[
                                                styles.modalOption,
                                                searchType === type && styles.selectedOption,
                                            ]}
                                            onPress={() => handleSelectFilter(type)}
                                        >
                                            <Text
                                                style={[
                                                    styles.modalOptionText,
                                                    searchType === type && styles.selectedOptionText,
                                                ]}
                                            >
                                                {searchTypeDisplayMap[type]}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                {searchType === 'company' && (
                    <CompanySearch searchQuery={searchQuery} navigation={navigation} />
                )}
                {searchType === 'user' && (
                    <UserSearch searchQuery={searchQuery} navigation={navigation} />
                )}
                {searchType === 'all' && (
                    <SearchAll searchQuery={searchQuery} navigation={navigation} />
                )}
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const searchTypeDisplayMap = {
    all: 'All',
    company: 'Companies',
    user: 'Users',
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        marginBottom: -40,
        backgroundColor: '#fff',
    },
    searchbar: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 8,
        marginBottom: 0,
    },
    searchbarActive: {
        borderColor: '#007AFF',   // Blue border when active
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 16,

    },
    filterContainer: {
        flexDirection: 'row',
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderRightColor: '#000',
    },
    filterContainerActive: {
        flexDirection: 'row',
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#007AFF',
        borderRightColor: '#007AFF',
    },
    filterButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 6,
        marginRight: 8,
    },
    filterButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    selectedFilter: {
        fontSize: 16,
        marginTop: 8,
        marginRight: 6,
        fontWeight: 800,
        color: '#555',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: 280,
        backgroundColor: 'white',
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderRadius: 14,
        alignItems: 'center',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        width: '100%',
        borderRadius: 8,
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedOption: {
        backgroundColor: '#E6F0FF',
        borderRadius: 10,
    },
    selectedOptionText: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
});
