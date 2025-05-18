import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, TextInput } from 'react-native';
import { Chip, SegmentedButtons } from 'react-native-paper';
import { PostStatus } from '../../../types/posts';
import type { FilterOptions } from '../../../types/filters';
import { generateRandomString } from '../../../util/randomString';
import KeyboardToolbar from '../../ui/KeyboardToolbar';
import Popup from '../../ui/Popup';
import { formatPostStatus } from '../../../util/formatText';

interface FilterModalProps {
    isVisible: boolean;
    onClose: () => void;
    onApplyFilters: (filters: FilterOptions) => void;
    currentFilters: FilterOptions;
}

const TIME_RANGE_OPTIONS = [
    { label: '24h', value: '24h' },
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
    { label: 'All', value: 'all' },
];

const minRewardInputAccessoryId = generateRandomString(9);
const maxRewardInputAccessoryId = generateRandomString(9);

export default function FilterModal({ isVisible, onClose, onApplyFilters, currentFilters }: FilterModalProps) {
    const [filters, setFilters] = useState<FilterOptions>(currentFilters);
    const [prevFilters, _setPrevFilters] = useState<FilterOptions>({ ...currentFilters, status: [ ...currentFilters.status ] });
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    
    const handleCloseAttempt = () => {
        setShowConfirmPopup(true);
    };

    const handleConfirmCancel = () => {
        setShowConfirmPopup(false);
        onClose();
        setFilters(prevFilters);
    };

    const handleOutsidePopupClick = () => {
        setShowConfirmPopup(false);
    };

    const handleApplyFilters = () => {
        onApplyFilters(filters);
        onClose();
    };

    const toggleStatus = (status: PostStatus) => {
        setFilters(prev => ({
            ...prev,
            status: prev.status.includes(status)
                ? prev.status.filter(s => s !== status)
                : [...prev.status, status]
        }));
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleCloseAttempt}
            statusBarTranslucent={true}
        >
            <TouchableWithoutFeedback onPress={handleCloseAttempt}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>Filters</Text>
                            
                            {/* Reward Range Filter */}
                            <View style={styles.filterSection}>
                                <Text style={styles.sectionTitle}>Reward Range</Text>
                                <View style={styles.rewardInputContainer}>
                                    <View style={styles.rewardInputWrapper}>
                                        <Text style={styles.dollarSign}>$</Text>
                                        <TextInput
                                            style={styles.rewardInput}
                                            value={filters.minReward.toString()}
                                            onChangeText={(value) => {
                                                const numValue = parseInt(value) || 0;
                                                setFilters(prev => ({
                                                    ...prev,
                                                    minReward: Math.min(numValue, prev.maxReward)
                                                }));
                                            }}
                                            keyboardType="number-pad"
                                            placeholder="Min reward"
                                            inputAccessoryViewID={minRewardInputAccessoryId}
                                        />
                                    </View>
                                    <Text style={styles.toText}>to</Text>
                                    <View style={styles.rewardInputWrapper}>
                                        <Text style={styles.dollarSign}>$</Text>
                                        <TextInput
                                            style={styles.rewardInput}
                                            value={filters.maxReward.toString()}
                                            onChangeText={(value) => {
                                                const numValue = parseInt(value) || 0;
                                                setFilters(prev => ({
                                                    ...prev,
                                                    maxReward: numValue,
                                                }));
                                            }}
                                            keyboardType="number-pad"
                                            placeholder="Max reward"
                                            inputAccessoryViewID={maxRewardInputAccessoryId}
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Status Filter */}
                            <View style={styles.filterSection}>
                                <Text style={styles.sectionTitle}>Status</Text>
                                <View style={styles.statusChips}>
                                    <Chip
                                        key={PostStatus.OPEN}
                                        selected={filters.status.includes(PostStatus.OPEN)}
                                        onPress={() => toggleStatus(PostStatus.OPEN)}
                                        style={styles.chip}
                                        selectedColor={filters.status.includes(PostStatus.OPEN) ? 'goldenrod' : 'black'}
                                    >
                                        {formatPostStatus(PostStatus.OPEN)}
                                    </Chip>
                                    <Chip
                                        key={PostStatus.CLOSING_SOON}
                                        selected={filters.status.includes(PostStatus.CLOSING_SOON)}
                                        onPress={() => toggleStatus(PostStatus.CLOSING_SOON)}
                                        style={styles.chip}
                                        selectedColor={filters.status.includes(PostStatus.CLOSING_SOON) ? 'goldenrod' : 'black'}
                                    >
                                        {formatPostStatus(PostStatus.CLOSING_SOON)}
                                    </Chip>
                                </View>
                            </View>

                            {/* Created Within Filter */}
                            <View style={styles.filterSection}>
                                <Text style={styles.sectionTitle}>Created Within</Text>
                                <SegmentedButtons
                                    value={filters.createdWithin}
                                    onValueChange={(value) => 
                                        setFilters(prev => ({
                                            ...prev,
                                            createdWithin: value as FilterOptions['createdWithin']
                                        }))
                                    }
                                    buttons={TIME_RANGE_OPTIONS}
                                />
                            </View>

                            <TouchableOpacity 
                                style={styles.applyButton}
                                onPress={handleApplyFilters}
                            >
                                <Text style={styles.applyButtonText}>Apply Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>

            <KeyboardToolbar uniqueId={minRewardInputAccessoryId} />
            <KeyboardToolbar uniqueId={maxRewardInputAccessoryId} />

            {showConfirmPopup && <Popup
                onClose={handleOutsidePopupClick}
                title="Apply Filters?"
                message="Would you like to apply your filter changes before closing?"
                actions={[
                    {
                        label: 'Yes, Apply',
                        onPress: () => {
                            handleApplyFilters();
                            setShowConfirmPopup(false);
                        },
                    },
                    {
                        label: 'No, Cancel',
                        onPress: handleConfirmCancel,
                        style: 'destructive',
                    },
                ]}
            />}
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContent: {
        width: '95%',
        height: '70%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        justifyContent: 'flex-start',
        position: 'absolute',
        bottom: 15,
        borderWidth: 1,
        borderColor: 'lightgray',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
    },
    modalText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    filterSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    applyButton: {
        backgroundColor: 'goldenrod',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 'auto',
    },
    applyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    statusChips: {
        flexDirection: 'column',
        gap: 6,
    },
    chip: {
        backgroundColor: '#f2f2f2',
        marginBottom: 8,
    },
    rewardInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    rewardInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        flex: 2,
    },
    rewardInput: {
        flex: 1,
        fontSize: 16,
        padding: 5,
    },
    dollarSign: {
        fontSize: 16,
        color: '#666',
        marginRight: 2,
    },
    toText: {
        fontSize: 16,
        color: '#666',
        marginHorizontal: 15,
        flex: 1,
        textAlign: 'center',
    },
});
