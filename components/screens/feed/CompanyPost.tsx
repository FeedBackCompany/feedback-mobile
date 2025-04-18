import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    Alert,
    Pressable,
} from 'react-native';
import { Text } from 'react-native-paper';
import { CurrencyDisplay } from '../../ui/CurrencyDisplay';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCurrentPost } from '../../../hooks/useCurrentPost';
import { supabase } from '../../../lib/supabase';
import { CommentVotes } from '../CommentVotes';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { PostStatus } from '../../../types/posts';
import Modal from 'react-native-modal';

export default function CompanyPost({ _route, navigation }: any) {
    const { currentPost, clearCurrentPost } = useCurrentPost();
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const { user } = useCurrentUser();
    const [commentModalVisible, setCommentModalVisible] = useState(false);
    const [selectedComment, setSelectedComment] = useState<any>(null);
    const [_editedComment, setEditedComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState('');

    const handleNavigateToFeedClick = () => {
        clearCurrentPost();
        navigation.navigate('Feed Page');
    };

    useEffect(() => {
        if (currentPost?.id) {
            fetchComments();
        }
    }, [currentPost]);

    const fetchComments = async () => {
        if (!currentPost) return;

        const { data, error } = await supabase
            .from('comments')
            .select('*, user:profiles(username)')
            .eq('post_id', currentPost.id)
            .order('created_at', { ascending: false });

        if (!error) {
            setComments(data || []);
        } else {
            console.error('Error fetching comments:', error.message);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        const { data: userData } = await supabase.auth.getUser();

        if (!userData || !userData.user) {
            console.error('User not logged in');
            return;
        }

        const userId = userData.user.id;
        if (!currentPost) return;

        const { error, data } = await supabase
            .from('comments')
            .insert([{ post_id: currentPost.id, user_id: userId, body: newComment.trim() }])
            .select('*, user:profiles(username)')
            .single();

        if (error) {
            console.error('Error posting comment:', error.message);
            return;
        }

        setComments((prev) => [data, ...prev]);
        setNewComment('');
        Keyboard.dismiss();
    };

    const handleDeleteComment = (commentId: string) => {
        Alert.alert('Delete Comment', 'Are you sure you want to delete this comment?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                onPress: async () => {
                    const { error } = await supabase.from('comments').delete().eq('id', commentId);
                    if (error) {
                        console.error('Error deleting comment:', error.message);
                        return;
                    }
                    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
                },
                style: 'destructive',
            },
        ]);
    };

    if (!currentPost) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Unable to find post {':('}</Text>
                <TouchableOpacity onPress={handleNavigateToFeedClick}>
                    <Text>{'<-'} Go to your feed</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const timeAgo = (timestamp: string | Date): string => {
        const now = new Date();
        const past = new Date(timestamp);
        const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

        const intervals = [
            { label: 'w', seconds: 604800 },
            { label: 'd', seconds: 86400 },
            { label: 'h', seconds: 3600 },
            { label: 'm', seconds: 60 },
            { label: 's', seconds: 1 },
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return ` ${count}${interval.label} ago`;
            }
        }

        return 'just now';
    };

    const renderCommentItem = useCallback(
        ({ item }: any) => (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                        <TouchableOpacity
                            style={styles.userInfoContainer}
                            onPress={() =>
                                navigation.navigate('Public Profile', {
                                    userId: item.user_id,
                                })
                            }
                        >
                            <View style={styles.userImageWrapper}>
                                <AntDesign name="user" size={18} color="gray" />
                            </View>
                            <Text style={styles.commentUser}>{item.user.username}</Text>
                            <Text style={styles.commentTimeAgo}>{timeAgo(item.created_at)}</Text>
                        </TouchableOpacity>

                        {item.user_id === user?.id && (
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedComment(item);
                                    setEditedComment(item.body);
                                    setCommentModalVisible(true);
                                }}
                            >
                                <Text style={{ fontSize: 18 }}>⋯</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {editingCommentId === item.id ? (
                        <View>
                            <TextInput
                                value={editingText}
                                onChangeText={setEditingText}
                                style={[styles.commentInput, { marginBottom: 8 }]}
                                multiline
                            />
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity
                                    style={[styles.sendButton, { backgroundColor: '#4CAF50' }]}
                                    onPress={async () => {
                                        if (!editingText.trim()) return;
                                        const { error } = await supabase
                                            .from('comments')
                                            .update({ body: editingText.trim() })
                                            .eq('id', item.id);

                                        if (!error) {
                                            setComments((prev) =>
                                                prev.map((c) =>
                                                    c.id === item.id
                                                        ? { ...c, body: editingText.trim() }
                                                        : c
                                                )
                                            );
                                            setEditingCommentId(null);
                                            setCommentModalVisible(false);
                                        } else {
                                            console.error('Error updating comment:', error.message);
                                        }
                                    }}
                                >
                                    <Text style={styles.sendButtonText}>Update</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.sendButton, { backgroundColor: '#999' }]}
                                    onPress={() => {
                                        setEditingCommentId(null);
                                        setCommentModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.sendButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.commentText}>{item.body}</Text>
                    )}

                    <View style={styles.commentVoteWrapper}>
                        <CommentVotes
                            commentId={item.id}
                            commenterId={item.user_id}
                            companyId={id}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        ),
        [comments, user, editingCommentId, editingText, navigation] // keep this list updated with actual state/props used inside
    );


    const { title, description, reward, status, company, company_id } = currentPost;
    const { name, id } = company;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={-35} // tweak if needed
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.postCard}>
                    <TouchableOpacity
                        style={styles.companyInfoContainer}
                        onPress={() =>
                            navigation.navigate('Company Profile', { companyId: company_id })
                        }
                    >
                        <View style={styles.companyImageWrapper}>
                            <MaterialIcons name="business" size={32} color="#555" />
                        </View>
                        <Text style={styles.companyName}>{name}</Text>
                    </TouchableOpacity>
                    <Text style={styles.postTitle}>{title}</Text>
                    <Text style={styles.postDescription}>{description}</Text>

                    <View style={styles.metaRow}>
                        <View style={styles.pill}>
                            <Text style={styles.pillText}>
                                Reward: <CurrencyDisplay amount={Number(reward)} type={'USD'} />
                            </Text>
                        </View>
                        <View
                            style={[
                                styles.pill,
                                {
                                    backgroundColor:
                                        status === PostStatus.OPEN ? '#d1f7c4' : '#fdd',
                                },
                            ]}
                        >
                            <Text style={styles.pillText}>Status: {status}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Comments</Text>

                <FlatList
                    data={comments}
                    keyExtractor={(item) => item.id}
                    keyboardShouldPersistTaps="always"
                    renderItem={renderCommentItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <Text style={{ color: 'gray', marginTop: 10, textAlign: 'center' }}>
                            No comments yet.
                        </Text>
                    }
                    ListHeaderComponent={
                        <Pressable
                            style={{ height: 1, width: '100%' }}
                            onLongPress={() => { }}
                        />
                    }
                    style={styles.commentList}
                />

                {/* MODAL */}
                <Modal
                    isVisible={commentModalVisible}
                    onBackdropPress={() => setCommentModalVisible(false)}
                    onSwipeComplete={() => setCommentModalVisible(false)}
                    swipeDirection="down"
                    backdropOpacity={0}
                    useNativeDriver={true}
                    style={styles.bottomModal}
                    backdropTransitionOutTiming={0}
                >
                    <View style={styles.modalBackdrop}>
                        <Pressable style={{ flex: 1 }} onPress={() => setCommentModalVisible(false)} />
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHandle} />
                            <Text style={styles.modalTitle}>Manage Comment</Text>

                            <TouchableOpacity
                                onPress={() => {
                                    setEditingCommentId(selectedComment.id);
                                    setEditingText(selectedComment.body);
                                    setCommentModalVisible(false);
                                }}
                                style={styles.modalOption}
                            >
                                <View style={styles.optionWrapper}>
                                    <Text style={styles.modalEditText}>Edit</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    handleDeleteComment(selectedComment.id);
                                    setCommentModalVisible(false);
                                }}
                                style={styles.modalOption}
                            >
                                <View style={styles.optionWrapper}>
                                    <Text style={styles.modalDeleteText}>Delete</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>


                {editingCommentId === null && (
                    <View style={styles.commentInputContainer}>
                        <TextInput
                            placeholder="Write a comment..."
                            style={[styles.commentInput, { maxHeight: 120 }]}
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                        />
                        <TouchableOpacity onPress={handleAddComment} style={styles.sendButton}>
                            <Text style={styles.sendButtonText}>Post</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    postCard: {
        padding: 16,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    companyName: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#333',
    },
    postTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 6,
    },
    postDescription: {
        fontSize: 15,
        color: '#555',
        marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 8,
    },
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
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    commentList: {
        paddingHorizontal: 16,
    },
    commentItem: {
        marginBottom: 12,
        backgroundColor: '#f2f2f2',
        padding: 10,
        borderRadius: 12,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
        flex: 1,
    },
    commentUser: {
        fontWeight: '600',
        marginBottom: 4,
        color: '#444',
    },
    commentTimeAgo: {
        fontSize: 11,
        color: 'hsl(0, 1.70%, 52.90%)',
        marginTop: -2.5,
    },
    commentText: {
        fontSize: 14,
        color: '#333',
    },
    commentVoteWrapper: {
        marginTop: 8,
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
    },
    commentInput: {
        flex: 1,
        backgroundColor: 'hsl(0, 4.30%, 86.50%)',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginRight: 10,
        fontSize: 14,
    },
    sendButton: {
        backgroundColor: 'tomato',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    sendButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    companyInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    companyImageWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userImageWrapper: {
        width: 28,
        height: 28,
        borderRadius: 24,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4,
    },
    modalBackdrop: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContainer: {
        backgroundColor: '#000',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        paddingBottom: 32,
    },
    modalHandle: {
        width: 80,
        height: 4,
        backgroundColor: '#ccc',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 12,
    },
    modalTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 12,
        textAlign: 'center',
        color: 'white',
    },
    modalOption: {
        alignSelf: 'flex-start',
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    modalDeleteText: {
        color: 'red',
    },
    modalEditText: {
        color: 'white',
    },
    optionWrapper: {
        paddingHorizontal: 16,
        paddingVertical: 4,
        backgroundColor: 'transparent',
        borderRadius: 8,
    },
});
