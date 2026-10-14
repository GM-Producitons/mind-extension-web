"use client";

import type { FeedPost } from "../types";
import { PostCard } from "./PostCard";

interface FeedListProps {
  posts: FeedPost[];
  onLike: (id: string) => void;
  onDelete: (post: FeedPost) => void;
}

export function FeedList({ posts, onLike, onDelete }: FeedListProps) {
  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={post.clientId}
          post={post}
          onLike={() => onLike(post._id)}
          onDelete={() => onDelete(post)}
        />
      ))}
    </div>
  );
}
