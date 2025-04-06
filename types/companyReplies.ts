import type { Comment } from "./comments";
import { CompanyProfile } from "./companyProfiles";

export interface CompanyReply {
    id: string;
    company_id: string;
    comment_id: string;
    body: string;
    created_at: string;
    updated_at: string;
}

export interface CompanyReplyWithRelations {
    id: string;
    company: CompanyProfile;
    comment: Comment;
    body: string;
    created_at: string;
    updated_at: string;
}