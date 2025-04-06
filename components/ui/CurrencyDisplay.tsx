import React from 'react';
import { TextStyle } from 'react-native-paper';
import { Text } from 'react-native-paper';

interface CurrencyDisplayProps {
  amount: number;
  style?: TextStyle;
  type: 'USD' // | 'other currency'
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ amount, style, type }) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return (
        <Text style={style}>
            {formatter.format(amount)} <Text style={{ fontSize: 12 }}>{type}</Text>
        </Text>
    );
};
