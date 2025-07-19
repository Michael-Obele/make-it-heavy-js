import { Tool } from "./base.tool";
import { JSDOM } from "jsdom";

export const browseLinkTool: Tool = {
  name: "browse_link",
  description: "Browse a web page and return its content",
  parameters: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The URL to browse",
      },
    },
    required: ["url"],
  },
  execute: async ({ url }) => {
    try {
      const dom = await JSDOM.fromURL(url);
      const reader = new dom.window.DOMParser();
      const doc = reader.parseFromString(dom.serialize(), "text/html");
      return doc.body.textContent || "";
    } catch (error) {
      if (error instanceof Error) {
        return `Error browsing link: ${error.message}`;
      }
      return "An unknown error occurred while browsing the link.";
    }
  },
};
