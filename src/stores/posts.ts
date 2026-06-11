import { create } from 'zustand';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  published: boolean;
  viewCount: number;
  author: { id: string; name: string };
  category?: { id: string; name: string; slug: string };
  tags: { id: string; name: string; slug: string }[];
  createdAt: string;
  updatedAt: string;
}

interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  fetchPosts: (params?: { page?: number; limit?: number; category?: string; tag?: string }) => Promise<void>;
  fetchPost: (slug: string) => Promise<void>;
  createPost: (data: Partial<Post>) => Promise<Post>;
  updatePost: (id: string, data: Partial<Post>) => Promise<Post>;
  deletePost: (id: string) => Promise<void>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  currentPost: null,
  total: 0,
  page: 1,
  totalPages: 0,
  isLoading: false,
  error: null,

  fetchPosts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.category) searchParams.set('category', params.category);
      if (params.tag) searchParams.set('tag', params.tag);

      const res = await fetch(`${API_BASE}/api/posts?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch posts');

      const data = await res.json();
      set({ 
        posts: data.posts, 
        total: data.total, 
        page: data.page, 
        totalPages: data.totalPages,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchPost: async (slug: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/posts/${slug}`);
      if (!res.ok) throw new Error('Post not found');

      const data = await res.json();
      set({ currentPost: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createPost: async (data: Partial<Post>) => {
    const token = localStorage.getItem('auth-storage');
    const res = await fetch(`${API_BASE}/api/posts`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JSON.parse(token || '{}').state?.token}`
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Failed to create post');
    return await res.json();
  },

  updatePost: async (id: string, data: Partial<Post>) => {
    const token = localStorage.getItem('auth-storage');
    const res = await fetch(`${API_BASE}/api/posts/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JSON.parse(token || '{}').state?.token}`
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Failed to update post');
    return await res.json();
  },

  deletePost: async (id: string) => {
    const token = localStorage.getItem('auth-storage');
    const res = await fetch(`${API_BASE}/api/posts/${id}`, {
      method: 'DELETE',
      headers: { 
        Authorization: `Bearer ${JSON.parse(token || '{}').state?.token}`
      },
    });

    if (!res.ok) throw new Error('Failed to delete post');
  },
}));