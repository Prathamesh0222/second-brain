"use client";

import { ContentArea } from "@/components/ContentArea";
import { Sidebar } from "@/components/Sidebar";
import { useContentState } from "@/store/contentState";

export default function Dashboard() {
  const { currentFilter, setCurrentFilter } = useContentState();

  return (
    <div className="flex h-screen">
      <Sidebar onFilterChange={setCurrentFilter} />
      <div className="w-full lg:p-3 h-screen overflow-hidden">
        <div
          className={`lg:border h-full ${
            currentFilter.toLowerCase() === "search" ? "p-0" : "p-2"
          } lg:rounded-xl dark:bg-[#141212] bg-[#f6f7f7] ${
            currentFilter.toLowerCase() === "search"
              ? "overflow-hidden"
              : "overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          }`}
        >
          <ContentArea
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
          />
        </div>
      </div>
    </div>
  );
}
