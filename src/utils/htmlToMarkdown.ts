import TurndownService from 'turndown';

// Initialize a singleton instance of Turndown to convert legacy HTML to pure Markdown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced'
});

/**
 * Checks if a string likely contains HTML.
 * A very simple heuristic to avoid running Turndown on pure plain text unnecessarily.
 */
export const containsHtml = (str: string): boolean => {
  return /<[a-z][\s\S]*>/i.test(str);
};

/**
 * Safely converts legacy WebView HTML into pure Markdown.
 * Used for migrating older notes to the new native Dual-Mode Editor.
 */
export const htmlToMarkdown = (html: string): string => {
  try {
    if (!html || !containsHtml(html)) return html;
    return turndownService.turndown(html);
  } catch (e) {
    console.warn("Failed to convert HTML to Markdown", e);
    // Fallback: strip tags roughly if Turndown completely crashes (rare)
    return html.replace(/<[^>]*>?/gm, '');
  }
};
