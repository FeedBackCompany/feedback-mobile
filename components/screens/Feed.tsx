import React, { useState, useEffect } from 'react';
import type { PostWithRelations } from '../../types/posts';
import { supabase } from '../../lib/supabase';
import { FlashList } from '@shopify/flash-list';
import CompanyPost from '../CompanyPost';

export default function Feed() {
    // const [loading, setLoading] = useState<boolean>(false);
    const [posts, setPosts] = useState<PostWithRelations[]>([]);

    useEffect(() => {
        getPosts();
    }, [])

    const getPosts = async () => {
        // setLoading(true);
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*, company:company_profiles(*)');
            
            if (error) throw error;
            
            setPosts(data);
        } catch (error) {
            console.error(error);
        } finally {
            // setLoading(false);
        }
    }

    return (
        <FlashList
            renderItem={({ item }) => {
                return <CompanyPost post={item} />;
            }}
            estimatedItemSize={5}
            data={posts}
        />
    )
}
