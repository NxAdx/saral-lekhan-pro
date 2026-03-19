import { marked } from 'marked';

/**
 * Configure marked for GFM and custom rendering
 */
marked.setOptions({
    gfm: true,
    breaks: true,
});

/**
 * Convert raw markdown to HTML for rendering in Rich Text editor.
 */
export function markdownToHtml(md: string): string {
    if (!md) return '';
    try {
        // Simple pre-processor to ensure [ ] and [x] are handled as task lists if marked doesn't pick them up
        // though marked with gfm should handle them.
        return marked.parse(md) as string;
    } catch {
        return md;
    }
}

/**
 * HTML to Markdown converter (Simple implementation for Saral Lekhan)
 * Focuses on headings, bold, italic, lists, and task lists.
 */
export function htmlToMarkdown(html: string): string {
    if (!html) return '';

    let md = html;

    // 1. Headings
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');

    // 2. Bold & Italic
    md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
    md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '_$1_');
    md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '_$1_');

    // 3. Lists & Task Lists
    // Handle Pell's specific checkbox list format if it uses .x-todo or standard task-list-item
    // Checked items
    md = md.replace(/<li[^>]*>(?:<div[^>]*>)?<input[^>]*checkbox[^>]*checked[^>]*>(?:<\/div>)?\s*(.*?)<\/li>/gi, '- [x] $1\n');
    // Unchecked items
    md = md.replace(/<li[^>]*>(?:<div[^>]*>)?<input[^>]*checkbox[^>]*>(?:<\/div>)?\s*(.*?)<\/li>/gi, '- [ ] $1\n');
    
    // Standard bullets
    md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');

    // 4. Blockquotes
    md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n');

    // 5. Code
    md = md.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n');
    md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

    // 6. Links & Images
    md = md.replace(/<a[^>]*href="(.*?)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    md = md.replace(/<img[^>]*src="(.*?)"[^>]*>/gi, '![]($1)');

    // 7. Cleanup remaining tags and entities
    md = md.replace(/<br\s*\/?>/gi, '\n');
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    md = md.replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\n');
    md = md.replace(/<[^>]*>?/gm, ''); // Final strip of unknown tags

    // Decode entities
    md = md.replace(/&nbsp;/g, ' ')
           .replace(/&amp;/g, '&')
           .replace(/&lt;/g, '<')
           .replace(/&gt;/g, '>')
           .replace(/&quot;/g, '"')
           .replace(/&#39;/g, "'");

    return md.trim();
}

/**
 * Strip raw HTML and decode basic text entities for plain-text UI rendering and search indexing.
 */
export function stripMarkdown(html: string): string {
    if (!html) return '';
    return html
        .replace(/<style[^>]*>.*<\/style>/gm, '') 
        .replace(/<[^>]*>?/gm, ' ') 
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s{2,}/g, ' ') 
        .trim();
}

export function getNextListNumber(textBeforeCursor: string): number | null {
    const cleaned = textBeforeCursor.replace(/\s+$/g, '');
    const lines = cleaned.split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line === '') continue;
        const m = line.match(/^(\d+)\.\s*/);
        if (m) return parseInt(m[1], 10) + 1;
        break;
    }
    return null;
}

export function needsLeadingNewline(textBeforeCursor: string): boolean {
    if (textBeforeCursor.length === 0) return false;
    if (textBeforeCursor.endsWith('\n')) return false;
    return true;
}

export function wordCount(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
}
