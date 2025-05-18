import type { PostStatus } from "./posts";

export interface FilterOptions {
    minReward: number;
    maxReward: number;
    status: PostStatus[];
    createdWithin: '24h' | '7d' | '30d' | 'all';
}