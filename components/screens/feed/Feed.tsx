import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';

import CompanyPostCard from './CompanyPostCard';

import type { PostWithRelations } from '../../../types/posts';

export default function Feed({ route, navigation }: any) {
    const [_loading, setLoading] = useState<boolean>(false);
    const [posts, setPosts] = useState<PostWithRelations[]>([]);
    const [firstPostId, setFirstPostId] = useState<string>('');

    useEffect(() => {
        getPosts();
    }, [])

    const getPosts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*, company:company_profiles(*)');
            
            if (error) throw error;
            
            setPosts(data);
            setFirstPostId(data[0].id);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlashList
                data={posts}
                renderItem={({ item }) => {
                    return <CompanyPostCard post={item} route={route} navigation={navigation} isFirstInFeed={item.id === firstPostId} />; 
                }}
                estimatedItemSize={5}
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