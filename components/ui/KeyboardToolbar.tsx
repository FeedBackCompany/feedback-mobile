import { InputAccessoryView, Keyboard, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface KeyboardToolbarProps {
    uniqueId: string;
}

export default function KeyboardToolbar({ uniqueId }: KeyboardToolbarProps) {

    const onHideRewardKeyboard = () => {
        Keyboard.dismiss();
    };

    if (Platform.OS !== 'ios' || !uniqueId) return null;

    return (
        <InputAccessoryView nativeID={uniqueId}>
            <View style={styles.inputAccessory}>
                <TouchableOpacity
                    onPress={onHideRewardKeyboard}
                    style={styles.doneButton}
                >
                    <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
            </View>
        </InputAccessoryView>
    )
}

const styles = StyleSheet.create({
    inputAccessory: {
        backgroundColor: '#f1f1f1',
        padding: 8,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    doneButton: {
        padding: 8,
        marginRight: 8,
    },
    doneButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
