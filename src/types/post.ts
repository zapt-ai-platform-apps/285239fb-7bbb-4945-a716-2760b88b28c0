export interface Post {
  id: number;
  title: string;
  content?: string;
  subredditId?: number;
  communityId?: number;
  communityName?: string;
  subredditName?: string;
  userId: string;
  userName?: string;
  createdAt: string;
  updatedAt?: string;
  upvotes: number;
  downvotes: number;
  commentCount?: number;
  userVote?: number | null;
  voteScore?: number;
}

export interface ExtendedPost extends Post {
  userName: string;
  subredditName: string;
  commentCount: number;
}