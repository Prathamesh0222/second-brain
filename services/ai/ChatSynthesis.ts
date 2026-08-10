import { ai } from "./Analysis";
import { SearchResult } from "@/types/search-type";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatAnswer {
  answer: string;
  citedIndexes: number[];
}

const FALLBACK_ANSWER =
  "I found some relevant items, but couldn't put together a clean answer this time. Take a look at the sources below.";

export async function synthesizeAnswer(
  query: string,
  history: ChatTurn[],
  results: SearchResult[]
): Promise<ChatAnswer> {
  if (results.length === 0) {
    return {
      answer:
        "I couldn't find anything in your saved content that relates to that. Try rephrasing, or save some content on this topic first.",
      citedIndexes: [],
    };
  }

  const recentHistory = history
    .slice(-6)
    .map((turn) => `${turn.role === "user" ? "User" : "Assistant"}: ${turn.content}`)
    .join("\n");

  const itemsBlock = results
    .map((result, index) => {
      const isNote = result.resultType === "notes";
      const description = isNote
        ? result.description?.substring(0, 300)
        : result.summary;
      const tags = result.tags.map((tag) => tag.title).join(", ");

      return `[${index}] Title: ${result.title}
   Type: ${isNote ? "Note" : result.type}
   Content: ${description || "No description"}
   Tags: ${tags || "None"}`;
    })
    .join("\n\n");

  const prompt = `You are an assistant answering questions using only the user's own saved content ("their second brain").

${recentHistory ? `Conversation so far:\n${recentHistory}\n\n` : ""}Latest question: "${query}"

Retrieved items from their saved content:
${itemsBlock}

Write a concise, direct answer to the latest question using only the retrieved items above. Cite items inline using their bracketed number, e.g. "[0]". If none of the items are actually relevant, say so plainly instead of guessing.

Return ONLY JSON in this exact format:
{"answer": "your answer text with [n] citations", "citedIndexes": [0, 2]}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;
    if (!text) {
      console.warn("No AI response for chat synthesis, using fallback");
      return { answer: FALLBACK_ANSWER, citedIndexes: [0] };
    }

    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let parsed: ChatAnswer;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error(
        "Failed to parse chat synthesis response:",
        parseError,
        cleanedText
      );
      return { answer: FALLBACK_ANSWER, citedIndexes: [0] };
    }

    const validIndexes = (parsed.citedIndexes || []).filter(
      (i) => Number.isInteger(i) && i >= 0 && i < results.length
    );

    return {
      answer: parsed.answer || FALLBACK_ANSWER,
      citedIndexes: validIndexes.length > 0 ? validIndexes : [0],
    };
  } catch (error) {
    console.error("Chat synthesis failed:", error);
    return { answer: FALLBACK_ANSWER, citedIndexes: [0] };
  }
}
