import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';

interface FilterModalProps {
    isVisible: boolean;
    onClose: () => void;
}

export default function FilterModal({ isVisible, onClose }: FilterModalProps) {
    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>Filters</Text>
                            
                            {/* Add your filter options here */}
                            <View style={styles.filterSection}>
                                <Text style={styles.sectionTitle}>Price Range</Text>
                                {/* Add price range controls */}
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.sectionTitle}>Categories</Text>
                                {/* Add category checkboxes */}
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.sectionTitle}>Location</Text>
                                {/* Add location filter */}
                            </View>

                            <TouchableOpacity 
                                style={styles.applyButton}
                                onPress={onClose}
                            >
                                <Text style={styles.applyButtonText}>Apply Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        // backgroundColor: 'rgba(0,0,0,0.5)',
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
});
