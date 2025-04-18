import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useCurrentUser } from '../../hooks/useCurrentUser';

interface CommentVotesProps {
    commentId: string;
    commenterId: string;
    companyId: string;
}

const CommentVotesComponent = ({ commentId }: CommentVotesProps) => {
    const [hasLiked, setHasLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const { user } = useCurrentUser();

    useEffect(() => {
        if (!user?.id) return;
        fetchLikes();
    }, [commentId, user?.id]);

    const fetchLikes = async () => {
        try {
            const { data, error } = await supabase
                .from('comment_votes')
                .select('user_id')
                .eq('comment_id', commentId);

            if (error) throw error;

            const userHasLiked = data.some((like) => like.user_id === user?.id);
            setHasLiked(userHasLiked);
            setLikeCount(data.length);
        } catch (error) {
            console.error('Error fetching likes:', error);
        }
    };

    const toggleLike = async () => {
        if (!user?.id) return;

        const newHasLiked = !hasLiked;
        const newLikeCount = newHasLiked ? likeCount + 1 : likeCount - 1;

        // Optimistically update the UI
        setHasLiked(newHasLiked);
        setLikeCount(newLikeCount);

        try {
            if (hasLiked) {
                const { error } = await supabase
                    .from('comment_votes')
                    .delete()
                    .eq('comment_id', commentId)
                    .eq('user_id', user.id);

                if (error) throw error;
            } else {
                const { error } = await supabase.from('comment_votes').insert([
                    {
                        comment_id: commentId,
                        user_id: user.id,
                    },
                ]);

                if (error) throw error;
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert optimistic update if needed
            setHasLiked((prev) => !prev);
            setLikeCount((prev) => (hasLiked ? prev + 1 : prev - 1));
        }
    };


    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={toggleLike}>
                <Entypo
                    name={hasLiked ? 'heart' : 'heart-outlined'}
                    size={24}
                    color={hasLiked ? 'red' : 'black'}
                />
            </TouchableOpacity>
            <Text style={styles.likeText}>{likeCount}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    likeText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#333',
    },
});

export const CommentVotes = React.memo(CommentVotesComponent);