import { CompanyProfile } from "./companyProfiles";

export interface Post {
    id: string;
    company_id: string;
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

export interface PostImage {
    id: string;
    post_id: string;
    company_id: string;
    image_url: string;
    created_at: string;
}

export interface PostWithRelations extends Post { 
    company: CompanyProfile
};