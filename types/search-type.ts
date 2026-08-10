import { ContentType } from "@/store/contentState";

export interface Tag {
  id: string;
  title: string;
}

export interface SearchContent {
  id: string;
  title: string;
  type: ContentType;
  summary: string | null;
  link: string;
  createdAt: Date;
  tags: Tag[];
  similarity: number;
  aiScore?: number;
  resultType: "content";
}

export interface SearchNote {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  tags: Tag[];
  similarity: number;
  aiScore?: number;
  resultType: "notes";
}

export type SearchResult = SearchContent | SearchNote;

export interface SearchResponse {
  query: string;
  limit?: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SearchResult[];
  timestamp: string;
}
