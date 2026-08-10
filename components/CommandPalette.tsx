"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, Plus } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  SidebarComponents,
  SidebarFilterComponents,
} from "@/lib/constants/SidebarComponents";
import { useSpaces } from "@/hooks/useSpace";
import { useContentState } from "@/store/contentState";

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const router = useRouter();
  const { data: spacesData } = useSpaces({ enabled: isAuthenticated });
  const spaces = spacesData || [];
  const { setCurrentFilter, setIsCreateContentOpen } = useContentState();

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  const goToFilter = (filter: string) => {
    router.push("/dashboard");
    setCurrentFilter(filter);
    setOpen(false);
  };

  const quickAdd = () => {
    router.push("/dashboard");
    setIsCreateContentOpen(true);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={quickAdd}>
            <Plus />
            <span>Quick add content</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigate">
          {SidebarComponents.map((item) => (
            <CommandItem
              key={item.filter}
              onSelect={() => goToFilter(item.filter)}
            >
              {item.icon}
              <span>{item.title}</span>
            </CommandItem>
          ))}
          {SidebarFilterComponents.map((item) => (
            <CommandItem
              key={item.filter}
              onSelect={() => goToFilter(item.filter)}
            >
              {item.icon}
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        {spaces.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Spaces">
              {spaces.map((space) => (
                <CommandItem
                  key={space.id}
                  onSelect={() => goToFilter(`space:${space.id}`)}
                >
                  <LayoutDashboard />
                  <span>{space.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};
