
export type AspectRatio = '1:1' | '4:5' | '16:9' | 'original';

export interface PostImage {
  id: string;
  url: string;
  file?: File;
}

export interface PostData {
  username: string;
  avatar: string;
  location: string;
  caption: string;
  likes: number;
  isLiked: boolean;
  isBookmarked: boolean;
  images: PostImage[];
  aspectRatio: AspectRatio;
  isDarkMode: boolean;
}
