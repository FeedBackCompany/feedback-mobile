import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import type { PostWithRelations } from '../../types/posts';
import { supabase } from '../../lib/supabase';
import { FlashList } from '@shopify/flash-list';
import CompanyPostCard from '../CompanyPostCard';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Feed({ route, navigation }: any) {
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
        <SafeAreaView style={styles.container}>
            <FlashList
                renderItem={({ item }) => {
                    return <CompanyPostCard post={item} route={route} navigation={navigation} />;
                }}
                estimatedItemSize={5}
                data={posts}
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