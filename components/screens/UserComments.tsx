import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function UserComments({ userId }: { userId: string }) {
    const [comments, setComments] = useState<any[]>([]);
    const [sortNewestFirst, setSortNewestFirst] = useState(true);

    useEffect(() => {
        const fetchComments = async () => {
            const { data, error } = await supabase
                .from('user_comments')
                .select(`
                    id,
                    content,
                    company_post_id,
                    created_at,
                    posts (
                        title,
                        company_profiles (
                            name
                        )
                    )
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: !sortNewestFirst });

            if (!error && data) {
                setComments(data);
            } else {
                console.error('Error fetching comments:', error);
            }
        };

        fetchComments();
    }, [userId, sortNewestFirst]);

    const toggleSort = () => {
        setSortNewestFirst(prev => !prev);
    };

    const handleCommentPress = (companyPostId: string) => {
        console.log(`Navigating to post with ID: ${companyPostId}`);
        // navigation.navigate('PostDetails', { postId: companyPostId });
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.header}>Your Comments</Text>
                <TouchableOpacity onPress={toggleSort}>
                    <Text style={styles.sortText}>
                        {sortNewestFirst ? 'Newest' : 'Oldest'}
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={comments}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleCommentPress(item.company_post_id)}>
                        <View style={styles.commentContainer}>
                            <Text style={styles.title}>
                                {item.posts?.title || 'Untitled Post'}
                            </Text>
                            <Text style={styles.companyName}>
                                {item.posts?.company_profiles?.name || 'Unknown Company'}
                            </Text>
                            <Text style={styles.commentPreview}>
                                {item.content.length > 100
                                    ? `${item.content.slice(0, 100)}...`
                                    : item.content}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', marginTop: 20, color: 'gray' }}>
                        No comments yet.
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    header: { fontSize: 18, fontWeight: 'bold' },
    sortText: {
        fontSize: 14,
        color: 'tomato',
        fontWeight: '600',
    },
    commentContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    title: { fontSize: 16, fontWeight: 'bold' },
    companyName: { fontSize: 14, color: 'tomato', marginTop: 2 },
    commentPreview: { fontSize: 14, color: 'gray', marginTop: 4 },
});
