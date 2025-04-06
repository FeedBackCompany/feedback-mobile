import type { Post } from "./posts";
import type { Profile } from "./profiles";

export interface Comment {
    id: string;
    user_id: string;
    post_id: string;
    body: string;
    created_at: string;
    updated_at: string;
}

export interface CommentWithRelations {
    id: string;
    user: Profile;
    post: Post;
    body: string;
    created_at: string;
    updated_at: string;
}