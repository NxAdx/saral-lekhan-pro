import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAiStore } from '../store/aiStore';
import { log } from '../utils/Logger';

export class AiService {

    static async getBestModel(apiKey: string): Promise<string> {
        try {
            log.info("Fetching available Gemini models for API key...");
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const data = await res.json();

            if (data.models && Array.isArray(data.models)) {
                const validModels = data.models.filter((m: any) =>
                    m.supportedGenerationMethods?.includes('generateContent') &&
                    m.name.startsWith('models/gemini')
                );

                // Prefer 'flash' models (like gemini-1.5-flash) for speed, then 'pro'
                let best = validModels.find((m: any) => m.name.includes('flash'));
                if (!best) best = validModels.find((m: any) => m.name.includes('pro'));
                if (!best && validModels.length > 0) best = validModels[0];

                if (best) {
                    const modelName = best.name.replace('models/', '');
                    log.info("Dynamically selected model:", modelName);
                    return modelName;
                }
            }
        } catch (e) {
            log.warn("Failed to fetch model list. Falling back to default.", e as any);
        }
        return "gemini-1.5-flash"; // Ultimate fallback
    }

    static async getSummarization(text: string): Promise<string> {
        const apiKey = useAiStore.getState().geminiApiKey;
        if (!apiKey) throw new Error("Gemini API key is not configured.");

        const modelName = await this.getBestModel(apiKey);
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `Summarize the following notes in 3 concise bullet points. Be extremely brief and direct:\n\n${text}`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (e: any) {
            log.error("AI Summarization failed", e);
            throw new Error(e.message || "Failed to summarize note. Check your API Key.");
        }
    }

    static async getSmartTitle(text: string): Promise<string> {
        const apiKey = useAiStore.getState().geminiApiKey;
        if (!apiKey) throw new Error("Gemini API key is not configured.");

        const modelName = await this.getBestModel(apiKey);
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `Generate a very short, catchy, 3 to 5 word title for the following text. Respond ONLY with the title itself, no quotes, no markdown, no other text:\n\n${text}`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim().replace(/^"|"$/g, ''); // strip quotes just in case
        } catch (e: any) {
            log.error("AI Title generation failed", e);
            throw new Error(e.message || "Failed to generate title. Check your API Key.");
        }
    }

    static async getDynamicGeneration(promptParams: string): Promise<string> {
        const apiKey = useAiStore.getState().geminiApiKey;
        if (!apiKey) throw new Error("Gemini API key is not configured.");

        const modelName = await this.getBestModel(apiKey);
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        try {
            const result = await model.generateContent(promptParams);
            const response = await result.response;
            return response.text();
        } catch (e: any) {
            log.error("AI Content generation failed", e);
            throw new Error(e.message || "Failed to generate content. Check your API Key.");
        }
    }

    static async getFormatNote(text: string): Promise<string> {
        const apiKey = useAiStore.getState().geminiApiKey;
        if (!apiKey) throw new Error("Gemini API key is not configured.");

        const modelName = await this.getBestModel(apiKey);
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `Rewrite the following text with excellent grammar, spelling, and professional formatting. Organize it into logical paragraphs with headings or bullet points if necessary. Respond ONLY with the formatted text, no other commentary:\n\n${text}`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (e: any) {
            log.error("AI Content formatting failed", e);
            throw new Error(e.message || "Failed to format note. Check your API Key.");
        }
    }

}
