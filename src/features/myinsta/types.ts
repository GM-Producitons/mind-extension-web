export const MAX_IMAGES = 10;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PostImage {
  url: string;
  pathname: string;
  width?: number;
  height?: number;
  order: number;
}

export interface MyInstaPost {
  _id: string;
  userId: string;
  username: string;
  caption: string;
  images: PostImage[];
  liked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  caption: string;
  images: PostImage[];
}
