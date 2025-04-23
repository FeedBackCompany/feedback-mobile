import { PostStatus } from "../types/posts";

export const formatPostStatus = (status: PostStatus) => {
    switch (status) {
        case PostStatus.CLOSED:
            return 'Closed';

        case PostStatus.CLOSING_SOON:
            return 'Closing Soon';

        case PostStatus.OPEN:
            return 'Open';

        case PostStatus.UNDER_REVIEW:
            return 'Under Review';

        case PostStatus.HIDDEN:
            return 'Hidden';
    
        default:
            return '';
    }
}