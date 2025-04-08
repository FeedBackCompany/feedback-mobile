import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Text } from 'react-native-paper';
import type { PostWithRelations } from '../types/posts';
import { CurrencyDisplay } from './ui/CurrencyDisplay';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useBookmarks } from '../hooks/useBookmarks';

interface CompanyPostProps {
    post: PostWithRelations;
}

export default function CompanyPost({ post }: CompanyPostProps) {
    const { id, title, description, reward, status, company } = post;
    const { name, avatar_url } = company;
    const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
    
    const handleBookmarkClick = () => {
        if (isBookmarked(id)) {
            removeBookmark(id);
        } else {
            addBookmark(id);
        }
    }

    const renderRightActions = () => {
        return (
            <View style={{ margin: 12 }}>
                <TouchableOpacity 
                    onPress={handleBookmarkClick}
                    style={{ 
                        height: 100, 
                        width: 150, 
                        backgroundColor: 'goldenrod',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ color: 'black' }}>{isBookmarked(id) ? 'Remove Bookmark' : 'Bookmark'}</Text>
                    <FontAwesome name={`bookmark${isBookmarked(id) ? '' : '-o'}`} size={24} color="black" />
                </TouchableOpacity>
                <View style={{ 
                    height: 100, 
                    width: 150, 
                    backgroundColor: 'darkgray',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Text style={{ color: 'white', marginBottom: 3 }}>Go to</Text>
                    <Text style={{ color: 'white' }}>{name}'s Profile</Text>
                </View>
            </View>
        );
    };

    return (
        <ReanimatedSwipeable
            friction={2}
            renderRightActions={renderRightActions}
            rightThreshold={30}
        >
            <Card style={styles.card}>
                {avatar_url && <Card.Cover source={{ uri: avatar_url }} />}
                <Card.Content>
                    <Title>{name}</Title>
                    <Title>{title}</Title>
                    <Paragraph>{description}</Paragraph>
                    <Text variant="labelMedium">
                        Reward:
                        <CurrencyDisplay amount={reward} />
                    </Text>
                    <Text variant="labelMedium">Status: {status}</Text>
                </Card.Content>
            </Card>
        </ReanimatedSwipeable>
    )
}

const styles = StyleSheet.create({
    card: {
        height: 210,
        margin: 12,
        padding: 12,
        borderRadius: 3
    },
})