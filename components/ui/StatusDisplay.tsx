
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { PostStatus } from '../../types/posts';
import { formatPostStatus } from '../../util/formatText';

interface StatusDisplayProps {
    status: PostStatus;
    fit?: boolean;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ status, fit = false }) => {

    return (
        <View style={[
            styles.pill,
            fit ? { alignSelf: 'flex-start' } : { flex: 1 },
            {
                backgroundColor:
                status === PostStatus.OPEN ? '#d1f7c4' : '#fdd',
            },
        ]}
        >
            <Text style={styles.pillText}>Status: {formatPostStatus(status)}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    pill: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    pillText: {
        fontSize: 13,
        color: '#333',
    },
})