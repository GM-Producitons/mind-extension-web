"use client";

import type { MyInstaPost } from "../types";
import { PostCard } from "./PostCard";

interface FeedListProps {
  posts: MyInstaPost[];
  onLike: (id: string) => void;
  onDelete: (post: MyInstaPost) => void;
}

export function FeedList({ posts, onLike, onDelete }: FeedListProps) {
  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onLike={() => onLike(post._id)}
          onDelete={() => onDelete(post)}
        />
      ))}
    </div>
  );
}
