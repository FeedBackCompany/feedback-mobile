import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Title, Paragraph, Text } from 'react-native-paper';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withRepeat,
    cancelAnimation
} from 'react-native-reanimated';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { CurrencyDisplay } from '../../ui/CurrencyDisplay';

import type { PostWithRelations } from '../../../types/posts';
import { VisitedScreen } from '../../../types/profiles';

import { useBookmarks } from '../../../hooks/useBookmarks';
import { useCurrentPost } from '../../../hooks/useCurrentPost';
import { useVisitedScreens } from '../../../hooks/useVisitedScreens';

interface CompanyPostCardProps {
    route: any;
    navigation: any;
    post: PostWithRelations;
    isFirstInFeed: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export default function CompanyPostCard({ navigation, post, isFirstInFeed }: CompanyPostCardProps) {
    const { id, title, description, reward, status, company } = post;
    const [signedUrl, _setSignedUrl] = useState('');
    const { name } = company;

    const { updateCurrentPost } = useCurrentPost();
    const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
    const [userHasBookmarked, setUserHasBookmarked] = useState(isBookmarked(id));
    const swipeableRef = useRef(null);

    const { hasScreenBeenVisited } = useVisitedScreens();

    const translateX = useSharedValue(0);

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    const handlePressIn = () => {
        cancelAnimation(translateX);
        translateX.value = 0;
    };

    const getCompanyPostImage = async () => {
        // TODO: get url(s) by company post id from other table
        // const { data: fetchedAvatarData, error } = await supabase.storage
        //     .from('avatars')
        //     .createSignedUrl(image_url, 3600);

        // if (fetchedAvatarData?.signedUrl) {
        //     setSignedUrl(fetchedAvatarData.signedUrl)
        // }
    }

    useEffect(() => {
        setTimeout(() => {
            if (isFirstInFeed && !hasScreenBeenVisited(VisitedScreen.FEED)) {
                translateX.value = withRepeat(
                    withSequence(
                        withSpring(165, { damping: 18 }),
                        withSpring(-165, { damping: 18 }),
                        withSpring(0, { damping: 12 }),
                    ),
                    1, // number of repeats
                    false // don't reverse
                );
            }
        }, 900)

        getCompanyPostImage()
    }, [isFirstInFeed, hasScreenBeenVisited]);

    const handleBookmarkClick = () => {
        setUserHasBookmarked((prev) => !prev);

        if (userHasBookmarked) {
            removeBookmark(id);
        } else {
            addBookmark(id);
        }

        setTimeout(() => (swipeableRef.current as any)?.close(), 210)
    }

    const leftTextStyle = useAnimatedStyle(() => {
        return {
            opacity: translateX.value > 0 ? 1 : 0,
            display: translateX.value > 0 ? 'flex' : 'none'
        };
    });

    const rightTextStyle = useAnimatedStyle(() => {
        return {
            opacity: translateX.value < 0 ? 1 : 0,
            display: translateX.value < 0 ? 'flex' : 'none'
        };
    });

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

    const navigateToPost = () => {
        console.log(post)
        updateCurrentPost(post);
        navigation.navigate('Company Post');
    }

    const handleSwipeLeftComplete = () => {
        setTimeout(() => (swipeableRef.current as any)?.close(), 30);
        setTimeout(() => navigateToPost(), 120);
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
            <Animated.View style={[styles.container, animatedStyles]}>
                <Pressable onPress={navigateToPost} onPressIn={handlePressIn} style={styles.container}>
                    <Card style={styles.card}>
                        {signedUrl && <Card.Cover source={{ uri: signedUrl }} />}
                        <Card.Content>
                            <Title>{name}</Title>
                            <Title>{title}</Title>
                            <Paragraph>{description}</Paragraph>
                            <Text variant="labelMedium">
                                Reward:
                                <CurrencyDisplay amount={Number(reward)} type={'USD'} />
                            </Text>
                            <Text variant="labelMedium">Status: {status}</Text>
                        </Card.Content>
                    </Card>
                    {isFirstInFeed && !hasScreenBeenVisited(VisitedScreen.FEED) && (
                        <View style={styles.instructionalOverlay}>
                            <View style={styles.swipeInstructions}>
                                <AnimatedView style={[styles.leftInstruction, leftTextStyle]}>
                                    <Text style={styles.arrow}>→</Text>
                                    <Text style={styles.instructionText}>Swipe right{'\n'}to view post</Text>
                                </AnimatedView>
                                <AnimatedView style={[styles.rightInstruction, rightTextStyle]}>
                                    <Text style={styles.arrow}>←</Text>
                                    <Text style={styles.instructionText}>Swipe left{'\n'}to bookmark</Text>
                                </AnimatedView>
                            </View>
                        </View>
                    )}
                </Pressable>
            </Animated.View>
        </ReanimatedSwipeable>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        height: '100%',
        width: '100%',
    },
    card: {
        height: 210,
        margin: 12,
        padding: 12,
        borderRadius: 3,
        zIndex: 1
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
    },
    instructionalOverlay: {
        position: 'absolute',
        top: 12, // Match card margin
        left: 12, // Match card margin
        right: 12, // Match card margin
        height: 210, // Match card height
        backgroundColor: 'rgba(218, 165, 32, 0.69)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
        zIndex: 2
    },
    swipeInstructions: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: 30,
        justifyContent: 'space-between',
    },
    leftInstruction: {
        alignSelf: 'flex-start',
    },
    rightInstruction: {
        alignSelf: 'flex-end',
        flex: 1,
        alignItems: 'flex-end',
    },
    instructionText: {
        color: 'black',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    arrow: {
        color: 'black',
        fontSize: 24,
        textAlign: 'center',
        fontWeight: 'bold'
    }
})