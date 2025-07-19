import { Tool } from "./base.tool";
import { search } from "duck-duck-scrape";

export const searchWebTool: Tool = {
  name: "search_web",
  description: "Search the web using DuckDuckGo for current information",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query to find information on the web",
      },
      max_results: {
        type: "integer",
        description: "Maximum number of search results to return",
        default: 5,
      },
    },
    required: ["query"],
  },
  execute: async ({ query, max_results = 5 }) => {
    const searchResults = await search(query, {
      retries: 2,
      safeSearch: "moderate",
    });

    const results = searchResults.results.slice(0, max_results);
    return JSON.stringify(results);
  },
};
