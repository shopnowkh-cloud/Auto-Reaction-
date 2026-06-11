/**
 * Telegram API wrapper
 * Repository: https://github.com/Malith-Rukshan/Auto-Reaction-Bot
 */

export default class TelegramBotAPI {
  private apiUrl: string;

  constructor(botToken: string) {
    this.apiUrl = `https://api.telegram.org/bot${botToken}/`;
  }

  async callApi(action: string, body: Record<string, unknown>): Promise<unknown> {
    try {
      const response = await fetch(this.apiUrl + action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        // @ts-ignore
        signal: AbortSignal.timeout(10000),
      });

      const data = (await response.json()) as Record<string, unknown>;

      if (!response.ok) {
        if (action === "setMessageReaction") {
          console.error(`Chat ID: ${body.chat_id}, Message ID: ${body.message_id}`);
        } else if (action === "sendMessage") {
          console.error(`Chat ID: ${body.chat_id}`);
        }
        if (data.description) console.error(`Error description: ${data.description}`);
        throw new Error(`Telegram API error: ${data.description || "Unknown error"}`);
      }

      return data;
    } catch (error: unknown) {
      const err = error as Error;
      if (err.name === "AbortError") {
        throw new Error(`Telegram API timeout: ${action}`);
      } else if (!err.message?.includes("Telegram API error")) {
        throw new Error(`Network error: ${action}`);
      }
      throw error;
    }
  }

  async setMessageReaction(chatId: number, messageId: number, emoji: string): Promise<void> {
    await this.callApi("setMessageReaction", {
      chat_id: chatId,
      message_id: messageId,
      reaction: [{ type: "emoji", emoji }],
      is_big: true,
    });
  }

  async sendMessage(
    chatId: number,
    text: string,
    inlineKeyboard: Array<Array<{ text: string; url: string }>> | null = null,
  ): Promise<void> {
    await this.callApi("sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      ...(inlineKeyboard && { reply_markup: { inline_keyboard: inlineKeyboard } }),
    });
  }

  async sendInvoice(
    chatId: number,
    title: string,
    description: string,
    payload: string,
    providerToken: string,
    startParameter: string,
    currency: string,
    prices: Array<{ label: string; amount: number }>,
  ): Promise<void> {
    await this.callApi("sendInvoice", {
      chat_id: chatId,
      title,
      description,
      payload,
      provider_token: providerToken,
      start_parameter: startParameter,
      currency,
      prices,
    });
  }

  async answerPreCheckoutQuery(preCheckoutQueryId: string, ok: boolean): Promise<void> {
    await this.callApi("answerPreCheckoutQuery", {
      pre_checkout_query_id: preCheckoutQueryId,
      ok,
    });
  }
}
