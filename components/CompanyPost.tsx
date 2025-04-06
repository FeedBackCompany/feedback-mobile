import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Text } from 'react-native-paper';
import type { Post } from '../types/posts';
import { CurrencyDisplay } from './ui/CurrencyDisplay';

interface CompanyPostProps {
    post: Post;
}

export default function CompanyPost({ post }: CompanyPostProps) {
    const { title, description, reward, status } = post;

    return (
        <Card style={styles.card}>
            {/* <Card.Cover source={{ uri: image }} /> */}
            <Card.Content>
                <Title>{title}</Title>
                <Paragraph>{description}</Paragraph>
                <Text variant="labelMedium">
                    Reward:
                    <CurrencyDisplay amount={reward} />
                </Text>
                <Text variant="labelMedium">Status: {status}</Text>
            </Card.Content>
        </Card>
    )
}

const styles = StyleSheet.create({
    card: {
        margin: 12,
        padding: 12,
        borderRadius: 3
    },
})