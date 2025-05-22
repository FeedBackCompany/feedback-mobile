import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    Modal
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCurrentPost } from '../../../hooks/useCurrentPost';
import { supabase } from '../../../lib/supabase';
import { CommentVotes } from '../CommentVotes';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { StatusDisplay } from '../../ui/StatusDisplay';
import { RewardDisplay } from '../../ui/RewardDisplay';
import { ReplyVotes } from '../ReplyVotes';

export default function CompanyPost({ navigation }: any) {
    const { currentPost, clearCurrentPost } = useCurrentPost();
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const { user } = useCurrentUser();
    const [commentModalVisible, setCommentModalVisible] = useState(false);
    const [selectedComment, setSelectedComment] = useState<any>(null);
    const [_editedComment, setEditedComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
    const replyInputRef = useRef<TextInput>(null);
    const [newReply, setNewReply] = useState('');
    const [replies, setReplies] = useState<any[]>([]);
    const [reRender, setReRender] = useState(false);
    const [visibleReplies, setVisibleReplies] = useState<{ [commentId: string]: boolean }>({});

    const handleNavigateToFeedClick = () => {
        clearCurrentPost();
        navigation.navigate('Feed Page');
    };

    useEffect(() => {
        if (replyingToCommentId && replyInputRef.current) {
            replyInputRef.current.focus();
        }
    }, [replyingToCommentId]);

    useEffect(() => {
        if (currentPost?.id) {
            fetchComments();
        }
    }, [currentPost, reRender]);

    const fetchComments = async () => {
        if (!currentPost) return;

        const { data: commentsData, error } = await supabase
            .from('comments')
            .select('*, user:profiles(username)')
            .eq('post_id', currentPost.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching comments:', error.message);
        }
        setComments(commentsData || []);
        const commentIds = commentsData?.map((comment: { id: string }) => comment.id) || [];

        if (commentIds.length === 0) {
            setReplies([]);
            return;
        }

        setReRender(true);

        const { data: replyData, error: replyError } = await supabase
            .from('reply_comments')
            .select('*, user:profiles(username)')
            .in('comment_id', commentIds)
            .order('created_at', { ascending: true });

        if (!replyError) {
            setReplies(replyData || []);
        } else {
            console.error('Error fetching replies:', replyError.message);
        }

    }

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
                    if (selectedComment?.isReply) {
                        // Delete just the reply
                        const { error } = await supabase
                            .from('reply_comments')
                            .delete()
                            .eq('id', commentId);

                        if (error) {
                            console.error('Error deleting reply:', error.message);
                            return;
                        }

                        setReplies((prev) => prev.filter((r) => r.id !== commentId));
                    } else {
                        // First delete all replies for the parent comment
                        const { error: replyError } = await supabase
                            .from('reply_comments')
                            .delete()
                            .eq('comment_id', commentId);

                        if (replyError) {
                            console.error('Error deleting replies:', replyError.message);
                            return;
                        }

                        // Then delete the parent comment
                        const { error: commentError } = await supabase
                            .from('comments')
                            .delete()
                            .eq('id', commentId);

                        if (commentError) {
                            console.error('Error deleting comment:', commentError.message);
                            return;
                        }

                        setComments((prev) => prev.filter((c) => c.id !== commentId));
                        setReplies((prev) => prev.filter((r) => r.comment_id !== commentId)); // Cleanup from UI
                    }
                },
                style: 'destructive',
            },
        ]);
    };


    const handleAddReply = async () => {
        if (!newReply.trim()) return;

        const { data: userData } = await supabase.auth.getUser();

        if (!userData || !userData.user) {
            console.error('User not logged in');
            return;
        }

        const userId = userData.user.id;
        if (!currentPost) return;

        const { error, data } = await supabase
            .from('reply_comments')
            .insert([{ comment_id: replyingToCommentId, user_id: userId, body: newReply.trim() }])
            .select('*, user:profiles(username)')
            .single();

        if (error) {
            console.error('Error posting reply:', error.message);
            return;
        }

        setReplies((prev) => [data, ...prev]);
        setNewReply('');
        Keyboard.dismiss();

        // refetch replies and comments to refresh UI fully
        await fetchComments();
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

        return ' just now';
    };

    const toggleReplies = (commentId: string) => {
        setVisibleReplies((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }));
    };

    const renderReplyItem = useCallback(
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
                                    console.log("\n== item ==\n", item, "\n");
                                    setSelectedComment({ ...item, isReply: true });
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
                                            .from('reply_comments')
                                            .update({ body: editingText.trim() })
                                            .eq('id', item.id);

                                        if (!error) {
                                            setReplies((prev) =>
                                                prev.map((c) =>
                                                    c.id === item.id
                                                        ? { ...c, body: editingText.trim() }
                                                        : c
                                                )
                                            );
                                            setEditingCommentId(null);
                                            setCommentModalVisible(false);
                                        } else {
                                            console.error('Error updating reply:', error.message);
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
                        <ReplyVotes
                            replyId={item.id}
                        />
                    </View>

                </View>
            </TouchableWithoutFeedback>
        ),
        [replies, user, navigation, comments, editingCommentId, editingText] // keep this list updated with actual state/props used inside
    );

    const renderCommentItem = useCallback(
        ({ item }: any) => {

            const commentReplies = replies.filter((reply) => reply.comment_id === item.id);
            const hasReplies = commentReplies.length > 0;
            const isVisible = visibleReplies[item.id];

            return (
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
                                        console.log("\n== item ==\n", item, "\n");
                                        setSelectedComment({ ...item, isReply: false });
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

                        <TouchableOpacity
                            onPress={() => {
                                setReplyingToCommentId(item.id)
                            }}
                        >
                            <Text style={styles.replyButtonText}>Reply</Text>
                        </TouchableOpacity>

                        {hasReplies ? (
                            <>
                                <TouchableOpacity onPress={() => toggleReplies(item.id)}>
                                    <Text style={styles.replyToggleText}>
                                        {isVisible ? 'Hide Replies' : 'Show Replies'}
                                    </Text>
                                </TouchableOpacity>

                                {isVisible && (
                                    <FlatList
                                        data={commentReplies}
                                        keyExtractor={(item) => item.id}
                                        keyboardShouldPersistTaps="always"
                                        renderItem={renderReplyItem}
                                        contentContainerStyle={{ paddingBottom: 20 }}
                                        ListEmptyComponent={
                                            <Text style={{ color: 'gray', marginTop: 10, textAlign: 'center' }}>
                                                No replies yet.
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
                                )}
                            </>
                        ) : (
                            <Text style={{ color: 'gray', marginTop: 10, textAlign: 'center' }}>
                                No replies yet.
                            </Text>
                        )}

                    </View>
                </TouchableWithoutFeedback>
            )
        },
        [comments, user, editingCommentId, editingText, navigation, replies, toggleReplies] // keep this list updated with actual state/props used inside
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
                        <RewardDisplay reward={reward} />
                        <StatusDisplay status={status} />
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
                    visible={commentModalVisible}
                    onRequestClose={() => setCommentModalVisible(false)}
                    animationType={'slide'}
                    transparent={true}
                    presentationStyle={'overFullScreen'}
                >
                    <View style={styles.modalBackdrop}>
                        <Pressable style={{ flex: 1 }} onPress={() => setCommentModalVisible(false)} />
                        <View style={styles.modalContainer}>
                            {/* <View style={styles.modalHandle} /> */}
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

                <View>
                    {editingCommentId === null && !replyingToCommentId && (
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
                    {editingCommentId === null && replyingToCommentId && (
                        <View style={styles.commentInputContainer}>
                            <TextInput
                                ref={replyInputRef}
                                placeholder="Reply to comment..."
                                style={[styles.commentInput, { maxHeight: 120 }]}
                                value={newReply}
                                onChangeText={setNewReply}
                                multiline
                                onBlur={() => {
                                    setTimeout(() => {
                                        if (replyingToCommentId) {
                                            setNewReply('');
                                            setReplyingToCommentId(null);
                                        }
                                    }, 100); // Wait 100ms to allow Post press to go through
                                }}
                            />
                            <TouchableOpacity onPress={handleAddReply} style={styles.sendButton}>
                                <Text style={styles.sendButtonText}>Post</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>


            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingBottom: -15,
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
        // paddingBottom: 25,
        marginBottom: 15,
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
        backgroundColor: 'rgba(9, 9, 9, 0.94)',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        paddingBottom: 52,
    },
    modalHandle: {
        width: 86,
        height: 6,
        backgroundColor: '#ccc',
        borderRadius: 4,
        alignSelf: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontWeight: 'bold',
        fontSize: 20,
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
        margin: 5,
        fontSize: 18,
    },
    modalEditText: {
        color: 'white',
        margin: 5,
        fontSize: 18,
    },
    optionWrapper: {
        paddingHorizontal: 16,
        paddingVertical: 4,
        backgroundColor: 'transparent',
        borderRadius: 8,
    },
    replyButtonText: {
        color: 'blue',
    },

    replyInput: {
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        padding: 8,
        marginTop: 4,
    },
    replyItem: {
        marginTop: 6,
        marginLeft: 24,
        backgroundColor: '#f9f9f9',
        padding: 8,
        borderRadius: 6,
    },
    replyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 6,
    },
    replyUsername: {
        fontWeight: 'bold',
        fontSize: 13,
    },
    replyTimeAgo: {
        color: 'gray',
        fontSize: 11,
    },
    replyText: {
        fontSize: 14,
    },
    replyToggleText: {
        color: '#007AFF',
        marginTop: 10,
        marginBottom: 5,
        fontWeight: '500',
        textAlign: 'left',
    },
});
