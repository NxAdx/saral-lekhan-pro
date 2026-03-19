import * as Print from 'expo-print';
import { ThemeType } from '../store/themeStore';

export interface PrintOptions {
  title: string;
  body: string; // HTML content
  theme: ThemeType;
}

/**
 * Generate a premium HTML template for printing notes.
 */
export function getPrintingTemplate(options: PrintOptions): string {
  const { title, body, theme } = options;
  const { colors } = theme;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <title>${title || 'Note'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&family=Hind:wght@400;600;700&display=swap');
          
          body { 
            font-family: 'Poppins', 'Hind', -apple-system, Roboto, Helvetica, Arial, sans-serif; 
            padding: 40px; 
            color: #1a1a1a; 
            line-height: 1.8; 
            font-size: 16px; 
            background-color: #fff;
          }
          
          .header {
            border-bottom: 2px solid ${colors.accent || '#C14E28'};
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          
          .brand {
            font-size: 14px;
            font-weight: 800;
            color: ${colors.accent || '#C14E28'};
            letter-spacing: 1px;
          }
          
          h1 { 
            font-size: 32px; 
            margin-top: 0;
            margin-bottom: 10px; 
            color: #000; 
            font-weight: 800; 
          }
          
          .note-body {
            color: #333;
          }
          
          h2 { font-size: 24px; margin-top: 24px; margin-bottom: 12px; font-weight: 700; color: #222; }
          
          blockquote { 
            border-left: 5px solid ${colors.accent || '#C14E28'}; 
            padding: 15px 20px; 
            font-style: italic; 
            color: #555; 
            background: #fdf2f0; 
            margin: 20px 0; 
            border-radius: 6px; 
          }
          
          ul, ol { margin-top: 10px; margin-bottom: 10px; padding-left: 24px; }
          li { margin-bottom: 8px; }
          
          pre {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #444;
            font-family: monospace;
            white-space: pre-wrap;
            font-size: 14px;
          }

          /* Checkbox styling in print */
          input[type="checkbox"] {
            width: 18px;
            height: 18px;
            margin-right: 8px;
            vertical-align: middle;
          }

          .footer {
            margin-top: 50px;
            font-size: 11px;
            color: #999;
            text-align: center;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }

          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">SARAL लेखन</div>
            <h1>${title || 'Untitled'}</h1>
          </div>
          <div style="font-size: 12px; color: #666;">
            Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        
        <div class="note-body">
          ${body}
        </div>
        
        <div class="footer">
          Created with Saral Lekhan - The premium writing experience.
        </div>
      </body>
    </html>
  `;
}

/**
 * Handle native print action.
 */
export async function printNote(options: PrintOptions) {
  const html = getPrintingTemplate(options);
  try {
    await Print.printAsync({ html });
  } catch (e) {
    console.error('Failed to print note', e);
    throw e;
  }
}
