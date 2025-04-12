import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';

import CompanyPostCard from './CompanyPostCard';

import type { PostWithRelations } from '../../../types/posts';

const POSTS_PER_PAGE = 9;

export default function Feed({ route, navigation }: any) {
    const [loading, setLoading] = useState<boolean>(false);
    const [posts, setPosts] = useState<PostWithRelations[]>([]);
    const [firstPostId, setFirstPostId] = useState<string>('');
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);

    useEffect(() => {
        getPosts();
    }, [])

    const getPosts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*, company:company_profiles(*)')
                .range(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE - 1)
                .order('created_at', { ascending: false });
            
            if (error) throw error;

            if (data.length < POSTS_PER_PAGE) {
                setHasMore(false);
            }
            
            if (page === 0) {
                setPosts(data);
                if (data.length > 0) setFirstPostId(data[0].id);
            } else {
                setPosts(prev => [...prev, ...data]);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
            getPosts();
        }
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <FlashList
                style={styles.container}
                data={posts}
                renderItem={({ item }) => {
                    return <CompanyPostCard 
                        post={item} 
                        route={route} 
                        navigation={navigation} 
                        isFirstInFeed={item.id === firstPostId} 
                    />; 
                }}
                estimatedItemSize={9} // ! Making this value larger affects the inifinte loading
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
    }
})