import { startMessage, donateMessage } from "./bot-constants";
import { getRandomPositiveReaction } from "./bot-helpers";
import TelegramBotAPI from "./telegram-bot-api";

interface TelegramChat {
  id: number;
  type: string;
  title?: string;
}

interface TelegramFrom {
  first_name: string;
}

interface TelegramMessage {
  chat: TelegramChat;
  message_id: number;
  text?: string;
  from?: TelegramFrom;
}

interface TelegramPreCheckoutQuery {
  id: string;
  from: { id: number };
}

interface TelegramUpdate {
  message?: TelegramMessage;
  channel_post?: TelegramMessage;
  pre_checkout_query?: TelegramPreCheckoutQuery;
}

export async function onUpdate(
  data: TelegramUpdate,
  botApi: TelegramBotAPI,
  reactions: string[],
  restrictedChats: number[],
  botUsername: string,
  randomLevel: number,
): Promise<void> {
  if (data.message || data.channel_post) {
    const content = data.message || data.channel_post!;
    const chatId = content.chat.id;
    const message_id = content.message_id;
    const text = content.text;

    if (data.message && (text === "/start" || text === "/start@" + botUsername)) {
      await botApi.sendMessage(
        chatId,
        startMessage.replace(
          "UserName",
          content.chat.type === "private"
            ? content.from?.first_name ?? "there"
            : content.chat.title ?? "there",
        ),
        [
          [
            { text: "➕ Add to Channel ➕", url: `https://t.me/${botUsername}?startchannel=botstart` },
            { text: "➕ Add to Group ➕", url: `https://t.me/${botUsername}?startgroup=botstart` },
          ],
          [{ text: "Github Source 📥", url: "https://github.com/Malith-Rukshan/Auto-Reaction-Bot" }],
          [{ text: "💝 Support Us - Donate 🤝", url: `https://t.me/Auto_ReactionBOT?start=donate` }],
        ],
      );
    } else if (data.message && text === "/reactions") {
      const reactionsList = reactions.join(", ");
      await botApi.sendMessage(chatId, "✅ Enabled Reactions : \n\n" + reactionsList);
    } else if (data.message && (text === "/donate" || text === "/start donate")) {
      await botApi.sendInvoice(
        chatId,
        "Donate to Auto Reaction Bot ✨",
        donateMessage,
        "{}",
        "",
        "donate",
        "XTR",
        [{ label: "Pay ⭐️5", amount: 5 }],
      );
    } else {
      const threshold = 1 - randomLevel / 10;
      if (!restrictedChats.includes(chatId)) {
        if (["group", "supergroup"].includes(content.chat.type)) {
          if (Math.random() <= threshold) {
            await botApi.setMessageReaction(chatId, message_id, getRandomPositiveReaction(reactions));
          }
        } else {
          await botApi.setMessageReaction(chatId, message_id, getRandomPositiveReaction(reactions));
        }
      }
    }
  } else if (data.pre_checkout_query) {
    await botApi.answerPreCheckoutQuery(data.pre_checkout_query.id, true);
    await botApi.sendMessage(data.pre_checkout_query.from.id, "Thank you for your donation! 💝");
  }
}
