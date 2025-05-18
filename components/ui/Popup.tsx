import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';

interface PopupProps {
    onClose: () => void;
    title: string;
    message: string;
    actions: {
        label: string;
        onPress: () => void;
        style?: 'default' | 'destructive';
    }[];
}

export default function Popup({ onClose, title, message, actions }: PopupProps) {
    return (
        <Modal
            visible={true}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.popup}>
                            <Text style={styles.title}>{title}</Text>
                            <Text style={styles.message}>{message}</Text>
                            <View style={styles.actions}>
                                {actions.map((action, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.actionButton,
                                            action.style === 'destructive' ? styles.destructiveButton : styles.defaultButton
                                        ]}
                                        onPress={action.onPress}
                                    >
                                        <Text style={[
                                            styles.actionText,
                                            action.style === 'destructive' ? styles.destructiveText : styles.defaultText
                                        ]}>
                                            {action.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popup: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        maxWidth: 340,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 22,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        width: '100%',
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    defaultButton: {
        backgroundColor: 'goldenrod',
    },
    destructiveButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: 'red',
    },
    actionText: {
        fontSize: 16,
        fontWeight: '600',
    },
    defaultText: {
        color: '#fff',
    },
    destructiveText: {
        color: 'red',
    },
});