/**
 * Strip raw HTML and decode basic text entities for plain-text UI rendering and search indexing.
 * This replaces the previous markdown stripper, since we now use a Rich Text Editor.
 */
export function stripMarkdown(html: string): string {
    if (!html) return '';
    return html
        .replace(/<style[^>]*>.*<\/style>/gm, '') // Remove style tags completely
        .replace(/<[^>]*>?/gm, ' ') // Replace all other HTML tags with spaces
        .replace(/&nbsp;/g, ' ') // Decode common entities
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
        .trim();
}

/**
 * Count the last numbered list item at the end of text.
 * Returns next number in sequence, or null if not in a list.
 */
export function getNextListNumber(textBeforeCursor: string): number | null {
    // trim trailing whitespace so an extra space/newline doesn't confuse numbering
    const cleaned = textBeforeCursor.replace(/\s+$/g, '');
    const lines = cleaned.split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line === '') continue; // skip blanks
        const m = line.match(/^(\d+)\.\s*/);
        if (m) return parseInt(m[1], 10) + 1;
        break; // non-list line found before list line
    }
    return null;
}

/**
 * Helper to determine if we need to insert a leading newline
 */
export function needsLeadingNewline(textBeforeCursor: string): boolean {
    if (textBeforeCursor.length === 0) return false;
    if (textBeforeCursor.endsWith('\n')) return false;
    return true;
}

/**
 * Word count for editor footer.
 */
export function wordCount(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
}
