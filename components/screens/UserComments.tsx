import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { PostWithRelations } from '../../types/posts';
import { useCurrentPost } from '../../hooks/useCurrentPost';

export default function UserComments({ userId, navigation }: { userId: string, navigation: any }) {
    const [comments, setComments] = useState<any[]>([]);
    const [sortNewestFirst, setSortNewestFirst] = useState(true);
    const { updateCurrentPost } = useCurrentPost();

    useEffect(() => {
        const fetchComments = async () => {
            const { data, error } = await supabase
                .from('comments')
                .select('*, post:posts(*, company:company_profiles(*))')
                .eq('user_id', userId)
                .order('created_at', { ascending: !sortNewestFirst });

            // const s = { 
            //     "company": { 
            //         "avatar_url": "https://odaobpaclyjudlifakbz.supabase.co/storage/v1/object/sign/avatars/1744400854984-A84B3789-3E49-49CC-AF00-4EE15D7BCFAD.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhdmF0YXJzLzE3NDQ0MDA4NTQ5ODQtQTg0QjM3ODktM0U0OS00OUNDLUFGMDAtNEVFMTVEN0JDRkFELmpwZyIsImlhdCI6MTc0NDQwMDg1NSwiZXhwIjoxNzQ0NDA0NDU1fQ.t8Lrf-rM6CdAww2M38Lf5NMewcXRlWSstIGX00n4VCQ", 
            //         "can_post": true, 
            //         "created_at": "2025-04-08T19:04:04.215969+00:00", 
            //         "email": "company1guest@company1.com", 
            //         "id": "2ab31de5-7555-4cef-8c7b-b7108e04344d", 
            //         "legal_business_name": "Company one inc", 
            //         "name": "Company One", 
            //         "phone_number": "8888888888", 
            //         "website": "https://www.amazon.com/" 
            //     }, 
            //     "company_id": "2ab31de5-7555-4cef-8c7b-b7108e04344d", 
            //     "created_at": "2025-04-08T20:11:22+00:00", 
            //     "description": "Give me some feedback", 
            //     "id": "e4222825-0279-4e9a-8f4e-4368325669e8", 
            //     "reward": 3030003,
            //     "status": "OPEN", 
            //     "title": "A test post 1" 
            // }

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

    const handleCommentPress = (post: PostWithRelations) => {
        // console.log(post);

        updateCurrentPost(post);
        navigation.navigate('Company Post In Profile')
        // navigation.navigate('PostDetails', { postId: companyPostId });
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={toggleSort} style={styles.sortButton}>
                    <Text style={styles.sortText}>
                        {sortNewestFirst ? 'Newest' : 'Oldest'}
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={comments}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleCommentPress(item.post)}>
                        <View style={styles.commentContainer}>
                            <Text style={styles.title}>
                                {item.post?.title || 'Untitled Post'}
                            </Text>
                            <Text style={styles.companyName}>
                                {item.post?.company?.legal_business_name || 'Unknown Company'}
                            </Text>
                            <Text style={styles.commentPreview}>
                                {item.body.length > 100
                                    ? `${item.body.slice(0, 100)}...`
                                    : item.body}
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
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff', // soft light gray
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 16,
    },
    sortButton: {
        paddingHorizontal: 16,
        height: 34,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 2,
        borderColor: 'rgba(0, 0, 0, 0.50)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    sortText: {
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: .3,
        color: 'rgb(0, 0, 0)',
    },
    commentContainer: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e6e6e6',
        shadowColor: 'rgba(0, 0, 0, 0.47)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    companyName: {
        fontSize: 13,
        color: '#555',
        marginBottom: 8,
    },
    commentPreview: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
});

