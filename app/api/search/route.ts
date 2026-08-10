import { authOptions } from "@/config/auth.config";
import { generateEmbedding } from "@/lib/embedding";
import { rerankResults } from "@/services/ai/Reranker";
import { synthesizeAnswer, ChatTurn } from "@/services/ai/ChatSynthesis";
import { SearchResult } from "@/types/search-type";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { searchRateLimit } from "@/lib/redis";
import { getCached, setCache, hashKey } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export const POST = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const { success, limit, reset, remaining } = await searchRateLimit.limit(
    session.user.id
  );

  if (!success) {
    return NextResponse.json(
      {
        error: "Too many searches. Please wait a moment.",
        limit,
        reset,
        remaining,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      }
    );
  }

  try {
    const { query, limit = 5, history } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json(
        {
          error: "Query is required and must be a string",
        },
        {
          status: 400,
        }
      );
    }

    const chatHistory: ChatTurn[] = Array.isArray(history) ? history : [];
    const isChatMode = chatHistory.length > 0;

    const userId = session.user.id;

    const searchCacheKey = `search:${userId}:${hashKey(query)}:${limit}`;

    if (!isChatMode) {
      const cachedResults = await getCached<{
        results: SearchResult[];
        query: string;
      }>(searchCacheKey);

      if (cachedResults) {
        return NextResponse.json(cachedResults);
      }
    }

    let queryEmbedding: number[];
    try {
      queryEmbedding = await generateEmbedding(query);
    } catch (embeddingError) {
      console.error("Error generating query embedding:", embeddingError);
      return NextResponse.json(
        {
          error: "Failed to generate query embedding",
          details:
            embeddingError instanceof Error
              ? embeddingError.message
              : String(embeddingError),
        },
        {
          status: 500,
        }
      );
    }

    const results = await prisma.$queryRaw<
      Array<{
        id: string;
        title: string;
        link: string | null;
        type: string | null;
        summary: string | null;
        description: string | null;
        createdAt: Date;
        similarity: number;
        resultType: string;
        tags: string;
      }>
    >`
    WITH ranked_results AS (
      -- Content Results
      SELECT
      c.id,
      c.title,
      c.link,
      c.type,
      c.summary,
      NULL as description,
      c."createdAt",
      1 - (c.embedding <=> ${queryEmbedding}::vector) as similarity,
      'content' as "resultType",
        COALESCE(
            json_agg(
              json_build_object('id', t.id, 'title', t.title)
            ) FILTER (WHERE t.id IS NOT NULL),
            '[]'
          )::text as tags
        FROM "Content" c
        LEFT JOIN "ContentTags" ct ON c.id = ct."contentId"
        LEFT JOIN "Tags" t ON ct."tagsId" = t.id
        WHERE c."userId" = ${userId} AND c.embedding IS NOT NULL
        GROUP BY c.id, c.title, c.link, c.type, c.summary, c."createdAt", c.embedding

      UNION ALL
      
      -- NOTE Results
      SELECT
      n.id,
      n.title,
      NULL as link,
      NULL as type,
      NULL as summary,
      n.description,
      n."createdAt",
      1 - (n.embedding <=> ${queryEmbedding}::vector) as similarity,
      'notes' as "resultType",
      COALESCE(
        json_agg(
          json_build_object('id', t.id, 'title', t.title)
        ) FILTER (WHERE t.id IS NOT NULL),
         '[]'
      )::text as tags
      FROM "Notes" n
        LEFT JOIN "NotesTags" nt ON n.id = nt."notesId"
        LEFT JOIN "Tags" t ON nt."tagsId" = t.id
        WHERE n."userId" = ${userId} AND n.embedding IS NOT NULL
        GROUP BY n.id, n.title, n.description, n."createdAt", n.embedding
    )
         SELECT * FROM ranked_results
        ORDER BY similarity DESC
        LIMIT ${limit}
    `;

    const enrichedResults = results.map((result) => ({
      ...result,
      tags: JSON.parse(result.tags),
    })) as SearchResult[];

    const rerankedResults = await rerankResults(query, enrichedResults);

    if (isChatMode) {
      const { answer, citedIndexes } = await synthesizeAnswer(
        query,
        chatHistory,
        rerankedResults
      );

      const chatResponseData = {
        results: rerankedResults,
        query,
        answer,
        sources: citedIndexes.map((i) => rerankedResults[i]),
      };

      return NextResponse.json(chatResponseData);
    }

    const responseData = {
      results: rerankedResults,
      query,
    };

    await setCache(searchCacheKey, responseData, 300);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error while searching", error);
    return NextResponse.json(
      {
        error: "Error while searching",
      },
      {
        status: 500,
      }
    );
  }
};
