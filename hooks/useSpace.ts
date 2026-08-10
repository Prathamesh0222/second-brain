import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AddToSpaceData,
  CreateSpaceData,
  RemoveFromSpaceData,
  Space,
} from "@/types/space-type";
import { queryClient } from "@/providers/CustomProvider";

export const useSpaces = (options?: { enabled?: boolean }) => {
  return useQuery<Space[]>({
    queryKey: ["spaces"],
    queryFn: async () => {
      const response = await axios.get("/api/space");
      return response.data;
    },
    enabled: options?.enabled ?? true,
  });
};

export const useCreateSpace = () => {
  return useMutation({
    mutationFn: async (data: CreateSpaceData) => {
      const response = await axios.post("/api/space", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Space created successfully");
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create space");
    },
  });
};

export const useAddToSpace = () => {
  return useMutation({
    mutationFn: async (data: AddToSpaceData) => {
      const response = await axios.patch("/api/space", {
        spaceId: data.spaceId,
        contentIds: data.contentIds || [],
        notesIds: data.notesIds || [],
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Added to space successfully");
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to add to space");
    },
  });
};

export const useRemoveFromSpace = () => {
  return useMutation({
    mutationFn: async (data: RemoveFromSpaceData) => {
      const response = await axios.patch("/api/space/remove", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Removed from space successfully");
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to remove from space");
    },
  });
};

export const useDeleteSpace = () => {
  return useMutation({
    mutationFn: async (spaceId: string) => {
      const response = await axios.delete("/api/space", {
        data: { spaceId },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Space deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete space");
    },
  });
};
