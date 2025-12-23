import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { systemConfigService } from "./services/system-config-service";

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
    const config = systemConfigService.readConfigSync();
    const aiConfig = config?.services?.ai;

    switch (provider) {
        case "openai": {
            const openaiConfig = aiConfig?.openai;
            const apiKey = openaiConfig?.apiKey;
            if (!apiKey) {
                throw new Error('OpenAI API Key is not configured in settings.json');
            }
            return new ChatOpenAI({
                configuration: {
                    apiKey,
                    baseURL: openaiConfig?.baseUrl || "https://api.openai.com/v1",
                },
                model: openaiConfig?.model || "gpt-4o-mini",
                temperature: 0.15,
            });
        }
        case "gemini": {
            const geminiConfig = aiConfig?.gemini;
            const apiKey = geminiConfig?.apiKey;
            if (!apiKey) {
                throw new Error('Gemini API Key is not configured in settings.json');
            }
            return new ChatGoogleGenerativeAI({
                apiKey,
                model: geminiConfig?.model || "gemini-1.5-flash",
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
