import { Tool } from "./base.tool";
import { JSDOM } from "jsdom";

export const searchWebTool: Tool = {
  name: "search_web",
  description:
    "Search the web using a custom DuckDuckGo search and retrieve content from the pages.",
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
    try {
      console.log(`DEBUG: Performing custom web search for query: "${query}"`);

      // Construct the DuckDuckGo search URL
      const duckDuckGoUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(
        query
      )}`;

      // Fetch the HTML from DuckDuckGo search results
      const response = await fetch(duckDuckGoUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(30000), // 30 second timeout for the search page itself
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            `HTTP 403 Forbidden: The server understood the request but refuses to authorize it. This might be due to IP blocking or bot detection.`
          );
        } else {
          throw new Error(
            `HTTP error fetching search results! status: ${response.status}`
          );
        }
      }

      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const searchResults = [];
      // DuckDuckGo HTML search results are typically within div elements with class "result__body"
      // and links are a elements with class "result__a"
      const resultElements = document.querySelectorAll(
        ".result.results_links.results_links_deep.web-result"
      );

      for (let i = 0; i < Math.min(max_results, resultElements.length); i++) {
        const resultElement = resultElements[i];
        const titleElement = resultElement.querySelector(".result__a");
        const snippetElement = resultElement.querySelector(".result__snippet");
        const urlElement = resultElement.querySelector(".result__url");

        if (titleElement && urlElement) {
          const title = titleElement.textContent?.trim() || "";
          const url = urlElement.textContent?.trim() || "";
          const snippet = snippetElement?.textContent?.trim() || "";

          searchResults.push({ title, url, snippet });
        }
      }

      if (searchResults.length === 0) {
        console.warn(
          "DEBUG: No search results found from custom DuckDuckGo scrape."
        );
        return JSON.stringify({
          error: "No search results found from custom DuckDuckGo scrape.",
        });
      }

      console.log(
        `DEBUG: Custom search results: ${JSON.stringify(searchResults)}`
      );
      return JSON.stringify(searchResults);
    } catch (error) {
      console.error(
        `ERROR: search_web tool execution failed: ${(error as Error).message}`
      );
      return JSON.stringify({
        error: `Search tool failed: ${(error as Error).message}`,
      });
    }
  },
};
