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

export enum VisitedScreen {
    FEED = 'FEED',
    COMPANY_POST = 'COMPANY_POST',
    COMPANY_PROFILE = 'COMPANY_PROFILE',
    CHARITY_PROFILE = 'CHARITY_PROFILE',
    PERSONAL_PROFILE = 'PERSONAL_PROFILE',
    PUBLIC_PROFILE = 'PUBLIC_PROFILE',
    ADMIN_SETTINGS = 'ADMIN_SETTINGS',
    SEARCH = 'SEARCH'
}