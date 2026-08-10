import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useSearchState } from "../store/searchState";
import { Message, SearchResponse, SearchResult } from "@/types/search-type";

interface ChatApiResponse {
  results: SearchResult[];
  query: string;
  answer?: string;
  sources?: SearchResult[];
}

export const useSearch = () => {
  const { messages, addMessage, clearMessages } = useSearchState();

  const mutation = useMutation<ChatApiResponse, Error, SearchResponse>({
    mutationFn: async ({ query, limit }) => {
      const history = messages.slice(-6).map((message) => ({
        role: message.role,
        content: message.content,
      }));

      const response = await axios.post("/api/search", {
        query,
        limit,
        history,
      });
      return response.data;
    },
    onSuccess: (data) => {
      const sources = (data.sources ?? data.results).filter((result) => {
        const score = result.aiScore ?? result.similarity;
        return score > 0.5;
      });

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.answer ?? `Found ${sources.length} relevant items`,
        sources,
        timestamp: new Date().toISOString(),
      };
      addMessage(assistantMessage);
    },
    onError: (error) => {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
      addMessage(errorMessage);
    },
  });
  const search = (variables: SearchResponse) => {
    const queryMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: variables.query,
      timestamp: new Date().toISOString(),
    };
    addMessage(queryMessage);
    mutation.mutate(variables);
  };

  return {
    messages,
    search,
    clearMessages,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};
