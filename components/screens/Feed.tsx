import React, { useState, useEffect } from 'react';
import type { Post } from '../../types/posts';
import { supabase } from '../../lib/supabase';
import { FlashList } from '@shopify/flash-list';
import CompanyPost from '../CompanyPost';

export default function Feed() {
    // const [loading, setLoading] = useState<boolean>(false);
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        getPosts();
    }, [])

    const getPosts = async () => {
        // setLoading(true);
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*');
            
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
