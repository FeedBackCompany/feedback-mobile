export interface Profile {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    description: string;
    following: string[];
    comments_are_private: boolean;
    updated_at: string;
    created_at: string;
}