import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useCurrentPost } from '../../../hooks/useCurrentPost';
import type { PostWithRelations } from '../../../types/posts';

export default function CompanyPostList({ companyId, navigation }: { companyId: string, navigation: any }) {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { updateCurrentPost } = useCurrentPost();

    useEffect(() => {
        const fetchPosts = async () => {
            const { data, error } = await supabase
                .from('posts')
                .select('*, company:company_profiles(*)')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching posts:', error);
            } else {
                setPosts(data);
            }

            setLoading(false);
        };

        fetchPosts();
    }, [companyId]);

    const navigateToPost = (post: PostWithRelations) => {
        updateCurrentPost(post);
        navigation.navigate('Company Post')
    }

    const renderPost = ({ item }: { item: PostWithRelations }) => (
        <TouchableOpacity
            style={styles.postCard}
            onPress={() => navigateToPost(item)}
        >
            <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.postDesc} numberOfLines={4}>{item.description}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.sectionHeader}>Posts</Text>
            {loading ? (
                <Text style={styles.loading}>Loading posts...</Text>
            ) : posts.length === 0 ? (
                <Text style={styles.noPosts}>No posts yet</Text>
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderPost}
                    // estimatedItemSize={9}
                    key={'vertical'}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: '600',
        marginVertical: 24,
        marginLeft: 4,
    },
    loading: {
        textAlign: 'center',
        color: 'gray',
    },
    noPosts: {
        textAlign: 'center',
        color: 'gray',
        fontStyle: 'italic',
    },
    list: {
        paddingBottom: 180,
    },
    postCard: {
        backgroundColor: '#f2f2f2',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        marginHorizontal: 8,
    },
    postTitle: {
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 6,
    },
    postDesc: {
        fontSize: 14,
        color: '#555',
    },
});
