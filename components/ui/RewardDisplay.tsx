import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { CurrencyDisplay } from './CurrencyDisplay';

interface RewardDisplayProps {
    reward: string;
    fit?: boolean;
}

export const RewardDisplay: React.FC<RewardDisplayProps> = ({ reward, fit = false }) => {

    return (
        <View style={[
            styles.pill,
            fit ? { alignSelf: 'flex-start' } : { flex: 1 }
        ]}>
            <Text style={styles.pillText}>
                Reward: <CurrencyDisplay amount={Number(reward)} type={'USD'} />
            </Text>
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