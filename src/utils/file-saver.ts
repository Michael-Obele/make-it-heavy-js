import { promises as fs } from "fs";
import path from "path";

/**
 * Sanitizes a string to be used as a directory or file name.
 * Converts to lowercase, replaces spaces with hyphens, and removes invalid characters.
 * @param name The string to sanitize.
 * @returns The sanitized string.
 */
function sanitizeName(name: string): string {
  const stopWords = new Set([
    "a",
    "an",
    "the",
    "is",
    "for",
    "to",
    "of",
    "in",
    "it",
    "and",
    "or",
    "but",
    "not",
    "on",
    "with",
    "as",
    "at",
    "by",
    "from",
    "up",
    "down",
    "out",
    "off",
    "over",
    "under",
    "again",
    "further",
    "then",
    "once",
    "here",
    "there",
    "when",
    "where",
    "why",
    "how",
    "all",
    "any",
    "both",
    "each",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "s",
    "t",
    "can",
    "will",
    "just",
    "don",
    "should",
    "now",
  ]);

  return name
    .toLowerCase()
    .split(/\s+/) // Split by spaces
    .filter((word) => !stopWords.has(word) && word.length > 0) // Remove stop words and empty strings
    .slice(0, 6) // Take the first 6 words
    .join("-") // Join with hyphens
    .replace(/[^a-z0-9-]/g, "") // Remove invalid characters (keep hyphens)
    .replace(/--+/g, "-") // Replace multiple hyphens with a single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Saves content to a markdown file with a structured directory path.
 * @param prompt The user's initial prompt, used for the subdirectory name.
 * @param content The content to save.
 */
export async function saveHeavyModeOutput(
  prompt: string,
  content: string
): Promise<void> {
  const baseDir = "output";
  const date = new Date();
  const dateDir = date.toISOString().slice(0, 10); // YYYY-MM-DD
  const timeFile = date.toTimeString().slice(0, 8).replace(/:/g, "-"); // HH-MM-SS

  const sanitizedPrompt = sanitizeName(prompt);
  const outputDir = path.join(baseDir, dateDir, sanitizedPrompt);
  const filePath = path.join(outputDir, `${timeFile}.md`);

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(filePath, content);

  console.log(`Output saved to: ${filePath}`);
}
