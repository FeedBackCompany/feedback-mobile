export interface Post {
    id: string;
    user_id: string;
    title: string;
    description: string;
    reward: string;
    status: PostStatus;
    created_at: string;
}

export enum PostStatus {
    OPEN = "OPEN", 
    CLOSING_SOON = "CLOSING_SOON", 
    CLOSED = "CLOSED", 
    UNDER_REVIEW = "UNDER_REVIEW", 
    HIDDEN = "HIDDEN"
}