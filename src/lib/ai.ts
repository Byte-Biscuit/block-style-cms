import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";

type LLMProvider = "openai" | "claude" | "gemini";

type GenType = "slug" | "summary" | "keywords" | "suggestion" | "batch";

interface BatchResult {
    summary: string;
    keywords: string;
    suggestion: string;
}

const promptMap: Record<GenType, string> = {
    slug: "Generate a concise, readable slug containing only English letters and numbers (hyphen-separated, max 100 characters) for the following title:\nTitle: {input}",
    summary: "Summarize the following content in one sentence, within 200 characters:\nContent: {input}\nPlease respond in language: {lang}",
    keywords: "Extract 3-15 keywords from the following content, separated by English commas:\nContent: {input}\nPlease respond in language: {lang}",
    suggestion: "Provide one optimization suggestion for the following content:\nContent: {input}\nPlease respond in language: {lang}",
    batch: "Analyze the following content and provide a JSON response with summary, keywords, and suggestion:\nContent: {input}\nPlease respond in language: {lang}\n\nReturn a valid JSON object with this exact structure:\n{\n  \"summary\": \"One sentence summary within 200 characters\",\n  \"keywords\": \"3-15 keywords separated by commas\",\n  \"suggestion\": \"One optimization suggestion\"\n}",
};

function getLLM(provider: LLMProvider) {
    switch (provider) {
        case "openai": {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) {
                throw new Error('OPENAI_API_KEY environment variable is required');
            }
            return new ChatOpenAI({
                configuration: {
                    apiKey,
                    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
                },
                model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
                temperature: 0.15,
            });
        }
        case "gemini": {
            const apiKey = process.env.GEMINI_API_KEY || "";
            return new ChatGoogleGenerativeAI({
                apiKey,
                model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
                temperature: 0.15,
            });
        }
        default:
            throw new Error(`Unsupported LLM provider: ${provider}`);
    }
}

export async function generate(
    type: GenType,
    input: Record<string, unknown>,
    llmProvider: LLMProvider = "openai"
): Promise<string> {
    try {
        const llm = getLLM(llmProvider);
        const prompt = PromptTemplate.fromTemplate(promptMap[type]);
        const chain = RunnableSequence.from([
            prompt,
            llm,
            new StringOutputParser(),
        ]);
        const result = await chain.invoke(input);
        if (!result || typeof result !== 'string' || result.trim() === '') {
            throw new Error('Empty or invalid result from LLM');
        }
        return result;
    } catch (error) {
        console.error(`AI generation failed for type: ${type}, provider: ${llmProvider}`, error);
        return '';
    }
}

export async function generateBatch(
    input: Record<string, unknown>,
    llmProvider: LLMProvider = "openai"
): Promise<BatchResult | null> {
    try {
        const result = await generate("batch", input, llmProvider);
        if (!result) {
            return null;
        }
        const parsed = JSON.parse(result) as BatchResult;
        if (!parsed.summary || !parsed.keywords || !parsed.suggestion) {
            throw new Error('Missing required fields in batch result');
        }
        return parsed;
    } catch (error) {
        console.warn("Batch generation failed:", error);
        return null;
    }
}
