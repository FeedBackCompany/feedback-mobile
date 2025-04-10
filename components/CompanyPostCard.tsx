import React, { useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Title, Paragraph, Text } from 'react-native-paper';
import type { PostWithRelations } from '../types/posts';
import { CurrencyDisplay } from './ui/CurrencyDisplay';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useBookmarks } from '../hooks/useBookmarks';
import { useCurrentPost } from '../hooks/useCurrentPost';

interface CompanyPostCardProps {
    route: any;
    navigation: any;
    post: PostWithRelations;
}

export default function CompanyPostCard({ _route, navigation, post }: CompanyPostCardProps) {
    const { id, title, description, reward, status, company } = post;
    const { name, avatar_url } = company;

    const { updateCurrentPost } = useCurrentPost();
    const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
    const [userHasBookmarked, setUserHasBookmarked] = useState(isBookmarked(id));
    const swipeableRef = useRef(null);


    const handleBookmarkClick = () => {
        setUserHasBookmarked((prev) => !prev);

        if (userHasBookmarked) {
            removeBookmark(id);
        } else {
            addBookmark(id);
        }

        setTimeout(() => swipeableRef.current?.close(), 210)
    }

    const renderRightActions = () => {
        return (
            <View style={styles.actionsContainer}>
                <Pressable 
                    onPress={handleBookmarkClick}
                    style={userHasBookmarked ? styles.activeBookmarkAction : styles.bookmarkAction}
                >
                    <FontAwesome name={`bookmark${userHasBookmarked ? '' : '-o'}`} size={42} color={userHasBookmarked ? 'black' : 'goldenrod'} />
                </Pressable>
                <View style={styles.companyProfileAction}>
                    <Text style={{ color: 'white', marginBottom: 3 }}>Go to Company</Text>
                    <Text style={{ color: 'white' }}>Profile {'->'}</Text>
                </View>
            </View>
        );
    };

    const navigateToPost = () => {
        updateCurrentPost(post);
        navigation.navigate('Company Post')
    }

    const handleSwipeLeftComplete = () => {
        setTimeout(() => swipeableRef.current?.close(), 30);
        setTimeout(() => navigateToPost(), 120);
    };

    const renderLeftActions = () => {
        return (
            <View style={styles.leftActionsContainer}>
                <View style={styles.commentAction}>
                    <FontAwesome name="comments" size={42} color="white" />
                    <Text style={{ color: 'white', marginTop: 8 }}>View Post</Text>
                </View>
            </View>
        );
    };

    return (
        <ReanimatedSwipeable
            ref={swipeableRef}
            friction={2}
            renderRightActions={renderRightActions}
            renderLeftActions={renderLeftActions}
            rightThreshold={30}
            leftThreshold={90}
            onSwipeableWillOpen={(direction) => {
                if (direction === 'left') {
                    handleSwipeLeftComplete();
                }
            }}
        >
            <Pressable onPress={navigateToPost} style={styles.container}>
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
            </Pressable>
        </ReanimatedSwipeable>
    )
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
    },
    card: {
        height: 210,
        margin: 12,
        padding: 12,
        borderRadius: 3
    },
    actionsContainer: { 
        marginRight: 15, 
        marginTop: 12, 
        paddingTop: 9,
        paddingBottom: 9,
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
    },
    leftActionsContainer: {
        marginLeft: 15,
        marginTop: 12,
        paddingTop: 9,
        paddingBottom: 9,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    commentAction: {
        height: 90,
        width: 150,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3
    },
    bookmarkAction: {
        height: 90, 
        width: 150, 
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'goldenrod',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3
    },
    activeBookmarkAction: {
        height: 90, 
        width: 150, 
        backgroundColor: 'goldenrod',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3
    },
    companyProfileAction: { 
        marginBottom: 12,
        height: 90, 
        width: 150, 
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3
    }
})