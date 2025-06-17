import type { OpenRouterProvider } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"

export async function generateChatTitle(
  openrouter: OpenRouterProvider,
  firstMessageText: string,
) {
  try {
    const { text } = await generateText({
      model: openrouter("google/gemini-2.0-flash-lite-001"),
      system:
        "You are an expert at creating concise, descriptive chat titles. Based on the user's first message, generate a short title (2-4 words) that captures the main topic or intent. Focus on the key subject matter, location, or primary theme. Avoid generic words like 'help', 'question', or 'discussion'. Be specific and descriptive. Examples: 'Berlin Cycling', 'Recipe Ideas', 'JavaScript Debugging', 'San Francisco Travel Planning'.",
      prompt: firstMessageText,
    })

    return text.trim()
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.error(error)

    return null
  }
}
