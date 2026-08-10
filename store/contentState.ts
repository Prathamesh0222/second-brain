import { create } from "zustand";

export enum ContentType {
  YOUTUBE = "YOUTUBE",
  TWITTER = "TWITTER",
  SPOTIFY = "SPOTIFY",
  NOTES = "NOTES",
}

interface ContentStateProps {
  isPreview: string;
  title: string;
  link: string;
  description: string;
  type: ContentType;
  searchQuery: string;
  tags: string[];
  currentFilter: string;
  isCreateContentOpen: boolean;
  setIsPreview: (e: string) => void;
  setTitle: (e: string) => void;
  setDescription: (e: string) => void;
  setLink: (e: string) => void;
  setType: (e: ContentType) => void;
  setTags: (e: string[]) => void;
  setSearchQuery: (e: string) => void;
  setCurrentFilter: (e: string) => void;
  setIsCreateContentOpen: (e: boolean) => void;
}

export const useContentState = create<ContentStateProps>((set) => ({
  isPreview: "",
  title: "",
  link: "",
  description: "",
  type: ContentType.YOUTUBE,
  tags: [],
  searchQuery: "",
  currentFilter: "dashboard",
  isCreateContentOpen: false,
  setIsPreview: (isPreview) => set({ isPreview }),
  setTitle: (title) => set({ title }),
  setType: (type) => set({ type }),
  setDescription: (description) => set({ description }),
  setLink: (link) => set({ link }),
  setTags: (tags) => set({ tags }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCurrentFilter: (currentFilter) => set({ currentFilter }),
  setIsCreateContentOpen: (isCreateContentOpen) => set({ isCreateContentOpen }),
}));
