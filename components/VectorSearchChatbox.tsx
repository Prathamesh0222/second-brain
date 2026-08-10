"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Send,
  Loader2,
  Sparkles,
  Youtube,
  Twitter,
  Music,
  Notebook,
  X,
  BrainCircuit,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { ContentType } from "@/store/contentState";
import { YoutubeEmbed } from "./YoutubeEmbed";
import { TwitterEmbed } from "./TwitterEmbed";
import { SpotifyEmbed } from "./SpotifyEmbed";
import { useSearch } from "@/hooks/useSearch";
import { AddToSpaceDropdown } from "./AddToSpaceDropdown";

export const VectorSearchChatbox = () => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, search, clearMessages, isPending } = useSearch();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSearch = () => {
    if (!inputValue.trim() || isPending) return;

    search({ query: inputValue, limit: 5 });
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const clearChat = () => {
    clearMessages();
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sticky top-0 z-10">
        <div className="container mx-auto pt-6 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <BrainCircuit className="h-4.5 w-4.5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">AI Search</h2>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-4">
              <div className="p-6 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-6 animate-in fade-in duration-500">
                <BrainCircuit className="h-16 w-16 text-blue-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                Search Your Second Brain
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                Ask questions about your saved content. AI will find the most
                relevant items using semantic search.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {message.role === "user" ? (
                    <div className="flex justify-end mb-6">
                      <div className="max-w-[85%] lg:max-w-[75%]">
                        <div className="bg-blue-600 text-white rounded-3xl rounded-tr-md px-5 py-3 shadow-md hover:shadow-lg transition-shadow">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-md">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 shrink-0 mt-1">
                          <BrainCircuit className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm leading-relaxed whitespace-pre-wrap mb-3">
                            {message.content}
                          </div>
                          {message.sources && message.sources.length > 0 && (
                            <div className="space-y-3 mt-4">
                              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Sources
                              </div>
                              {message.sources.map((result) => (
                                <Card
                                  key={result.id}
                                  className={`border-l-4 hover:shadow-md transition-shadow ${
                                    result.resultType === "content" &&
                                    result.type === ContentType.YOUTUBE
                                      ? "border-red-500 bg-red-50/50 dark:bg-red-950/20"
                                      : result.resultType === "content" &&
                                        result.type === ContentType.TWITTER
                                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                                      : result.resultType === "content" &&
                                        result.type === ContentType.SPOTIFY
                                      ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
                                      : "border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20"
                                  }`}
                                >
                                  <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-center gap-2 flex-1">
                                        {result.resultType === "content" &&
                                        result.type === ContentType.YOUTUBE ? (
                                          <div className="p-2 border rounded-full bg-red-500/20 shrink-0">
                                            <Youtube
                                              size={16}
                                              className="text-red-500"
                                            />
                                          </div>
                                        ) : result.resultType === "content" &&
                                          result.type ===
                                            ContentType.TWITTER ? (
                                          <div className="p-2 border rounded-full bg-blue-500/20 shrink-0">
                                            <Twitter
                                              size={16}
                                              className="text-blue-500"
                                            />
                                          </div>
                                        ) : result.resultType === "content" &&
                                          result.type ===
                                            ContentType.SPOTIFY ? (
                                          <div className="p-2 border rounded-full bg-green-500/20 shrink-0">
                                            <Music
                                              size={16}
                                              className="text-green-500"
                                            />
                                          </div>
                                        ) : (
                                          <div className="p-2 border rounded-full bg-yellow-500/20 shrink-0">
                                            <Notebook
                                              size={16}
                                              className="text-yellow-500"
                                            />
                                          </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                          <CardTitle className="text-base mb-1 line-clamp-2">
                                            {result.title}
                                          </CardTitle>
                                          <CardDescription className="text-xs">
                                            {result.resultType === "content"
                                              ? result.type
                                              : "NOTES"}
                                          </CardDescription>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <Badge
                                          variant="secondary"
                                          className="text-xs shrink-0 ml-2"
                                        >
                                          {result.aiScore
                                            ? `${(result.aiScore * 100).toFixed(
                                                1
                                              )}%`
                                            : `${(
                                                result.similarity * 100
                                              ).toFixed(1)}%`}
                                        </Badge>
                                        <AddToSpaceDropdown
                                          contentId={
                                            result.resultType === "content"
                                              ? result.id
                                              : undefined
                                          }
                                          notesId={
                                            result.resultType === "notes"
                                              ? result.id
                                              : undefined
                                          }
                                          currentSpaceId={undefined}
                                          isViewingSpace={false}
                                        />
                                      </div>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    {result.resultType === "content" &&
                                      result.type === ContentType.YOUTUBE && (
                                        <YoutubeEmbed link={result.link} />
                                      )}
                                    {result.resultType === "content" &&
                                      result.type === ContentType.TWITTER && (
                                        <TwitterEmbed link={result.link} />
                                      )}
                                    {result.resultType === "content" &&
                                      result.type === ContentType.SPOTIFY && (
                                        <SpotifyEmbed link={result.link} />
                                      )}
                                    {result.resultType === "notes" && (
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: result.description,
                                        }}
                                        className="prose prose-sm max-w-none dark:prose-invert"
                                      />
                                    )}
                                    {result.resultType === "content" &&
                                      result.summary && (
                                        <div className="bg-muted/50 rounded-lg p-3">
                                          <p className="text-sm leading-relaxed">
                                            {result.summary}
                                          </p>
                                        </div>
                                      )}
                                    {result.tags && result.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                                        {result.tags.map((tag, idx) => (
                                          <Badge
                                            key={idx}
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {tag.title}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isPending && (
                <div className="flex items-center gap-3 animate-in fade-in duration-300">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Searching through your content...</span>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="sticky bottom-0">
        <div className="max-w-3xl mx-auto px-4 py-4 mb-15">
          <div className="relative">
            <Input
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
              onKeyDown={handleKeyPress}
              placeholder="Ask about your content..."
              disabled={isPending}
              className="w-full pr-14 py-7 text-base rounded-full shadow-lg border-2 focus:border-blue-500 transition-colors bg-background"
            />
            <Button
              onClick={handleSearch}
              disabled={!inputValue.trim() || isPending}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full p-0 shadow-md hover:shadow-lg transition-all bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              size="icon"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Send className="h-5 w-5 text-white" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
