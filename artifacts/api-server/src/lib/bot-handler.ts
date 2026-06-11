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

async function handleReaction(
  content: TelegramMessage,
  botApi: TelegramBotAPI,
  reactions: string[],
  restrictedChats: number[],
  randomLevel: number,
): Promise<void> {
  const chatId = content.chat.id;
  const message_id = content.message_id;

  if (restrictedChats.includes(chatId)) return;

  const isGroup = ["group", "supergroup"].includes(content.chat.type);
  if (isGroup) {
    const threshold = 1 - randomLevel / 10;
    if (Math.random() <= threshold) {
      await botApi.setMessageReaction(chatId, message_id, getRandomPositiveReaction(reactions));
    }
  } else {
    await botApi.setMessageReaction(chatId, message_id, getRandomPositiveReaction(reactions));
  }
}

export async function onUpdate(
  data: TelegramUpdate,
  botApi: TelegramBotAPI,
  reactions: string[],
  restrictedChats: number[],
  botUsername: string,
  randomLevel: number,
): Promise<void> {
  // Channel posts → reaction only, no commands
  if (data.channel_post) {
    await handleReaction(data.channel_post, botApi, reactions, restrictedChats, randomLevel);
    return;
  }

  if (data.message) {
    const content = data.message;
    const chatId = content.chat.id;
    const message_id = content.message_id;
    const text = content.text;
    const isPrivate = content.chat.type === "private";
    const isGroup = ["group", "supergroup"].includes(content.chat.type);

    // Groups → reaction only, ignore all commands
    if (isGroup) {
      await handleReaction(content, botApi, reactions, restrictedChats, randomLevel);
      return;
    }

    // Private chat → full features
    if (isPrivate) {
      if (text === "/start" || text === "/start@" + botUsername) {
        await botApi.sendMessage(
          chatId,
          startMessage.replace("UserName", content.from?.first_name ?? "there"),
          [
            [
              { text: "➕ បន្ថែមទៅ Channel ➕", url: `https://t.me/${botUsername}?startchannel=botstart` },
              { text: "➕ បន្ថែមទៅ Group ➕", url: `https://t.me/${botUsername}?startgroup=botstart` },
            ],
            [{ text: "💝 គាំទ្រយើង - បរិច្ចាគ 🤝", url: `https://t.me/Auto_ReactionBOT?start=donate` }],
          ],
        );
      } else if (text === "/reactions") {
        const reactionsList = reactions.join(", ");
        await botApi.sendMessage(chatId, "✅ Emoji ប្រតិកម្មដែលបានបើក:\n\n" + reactionsList);
      } else if (text === "/donate" || text === "/start donate") {
        await botApi.sendInvoice(
          chatId,
          "បរិច្ចាគទៅ Auto Reaction Bot ✨",
          donateMessage,
          "{}",
          "",
          "donate",
          "XTR",
          [{ label: "បង់ ⭐️5", amount: 5 }],
        );
      } else {
        // Regular private message → react
        if (!restrictedChats.includes(chatId)) {
          await botApi.setMessageReaction(chatId, message_id, getRandomPositiveReaction(reactions));
        }
      }
    }
  }

  // Donation payment confirmation
  if (data.pre_checkout_query) {
    await botApi.answerPreCheckoutQuery(data.pre_checkout_query.id, true);
    await botApi.sendMessage(data.pre_checkout_query.from.id, "សូមអរគុណចំពោះការបរិច្ចាគ! 💝");
  }
}
