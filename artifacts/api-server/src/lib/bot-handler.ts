import { startMessage, donateMessage } from "./bot-constants";
import { getRandomPositiveReaction } from "./bot-helpers";
import TelegramBotAPI from "./telegram-bot-api";

interface TelegramChat {
  id: number;
  type: string;
  title?: string;
}

interface TelegramFrom {
  id: number;
  first_name: string;
}

interface TelegramMessage {
  chat: TelegramChat;
  message_id: number;
  text?: string;
  from?: TelegramFrom;
}

interface TelegramCallbackQuery {
  id: string;
  from: TelegramFrom;
  message?: TelegramMessage;
  data?: string;
}

interface TelegramPreCheckoutQuery {
  id: string;
  from: { id: number };
}

interface TelegramUpdate {
  message?: TelegramMessage;
  channel_post?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
  pre_checkout_query?: TelegramPreCheckoutQuery;
}

function mainMenu(botUsername: string) {
  return [
    [
      { text: "➕ បន្ថែមទៅ Channel", url: `https://t.me/${botUsername}?startchannel=botstart` },
      { text: "➕ បន្ថែមទៅ Group", url: `https://t.me/${botUsername}?startgroup=botstart` },
    ],
    [
      { text: "📋 Emoji ប្រតិកម្ម", callback_data: "reactions" },
      { text: "💝 បរិច្ចាគ", callback_data: "donate" },
    ],
  ];
}

async function handleReaction(
  content: TelegramMessage,
  botApi: TelegramBotAPI,
  reactions: string[],
  restrictedChats: number[],
  randomLevel: number,
): Promise<void> {
  const chatId = content.chat.id;
  if (restrictedChats.includes(chatId)) return;

  const isGroup = ["group", "supergroup"].includes(content.chat.type);
  if (isGroup) {
    const threshold = 1 - randomLevel / 10;
    if (Math.random() <= threshold) {
      await botApi.setMessageReaction(chatId, content.message_id, getRandomPositiveReaction(reactions));
    }
  } else {
    await botApi.setMessageReaction(chatId, content.message_id, getRandomPositiveReaction(reactions));
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
  // ── Channel posts → reaction only ──────────────────────────────────────
  if (data.channel_post) {
    await handleReaction(data.channel_post, botApi, reactions, restrictedChats, randomLevel);
    return;
  }

  // ── Group messages → reaction only ─────────────────────────────────────
  if (data.message) {
    const content = data.message;
    const chatId = content.chat.id;
    const isGroup = ["group", "supergroup"].includes(content.chat.type);

    if (isGroup) {
      await handleReaction(content, botApi, reactions, restrictedChats, randomLevel);
      return;
    }

    // ── Private chat → react + show menu ───────────────────────────────
    if (content.chat.type === "private") {
      if (!restrictedChats.includes(chatId)) {
        await botApi.setMessageReaction(chatId, content.message_id, getRandomPositiveReaction(reactions));
      }
      const firstName = content.from?.first_name ?? "មិត្ត";
      await botApi.sendMessage(
        chatId,
        startMessage.replace("UserName", firstName),
        mainMenu(botUsername),
      );
      return;
    }
  }

  // ── Inline button callbacks (private chat) ──────────────────────────────
  if (data.callback_query) {
    const cq = data.callback_query;
    const chatId = cq.from.id;
    const msgId = cq.message?.message_id;

    await botApi.answerCallbackQuery(cq.id);

    if (cq.data === "reactions") {
      const reactionsList = reactions.join("  ");
      const text = `✅ *Emoji ប្រតិកម្មដែលបានបើក:*\n\n${reactionsList}`;
      const keyboard = [[{ text: "« ត្រឡប់ក្រោយ", callback_data: "back_menu" }]];
      if (msgId) {
        await botApi.editMessageText(chatId, msgId, text, keyboard);
      } else {
        await botApi.sendMessage(chatId, text, keyboard);
      }
    } else if (cq.data === "donate") {
      const text = `⭐ *ជ្រើសរើសចំនួន Stars ដែលអ្នកចង់បរិច្ចាគ:*\n\n${donateMessage}`;
      const keyboard = [
        [
          { text: "⭐ 5 Stars", callback_data: "donate_5" },
          { text: "⭐ 10 Stars", callback_data: "donate_10" },
          { text: "⭐ 25 Stars", callback_data: "donate_25" },
        ],
        [
          { text: "⭐ 50 Stars", callback_data: "donate_50" },
          { text: "⭐ 100 Stars", callback_data: "donate_100" },
        ],
        [{ text: "« ត្រឡប់ក្រោយ", callback_data: "back_menu" }],
      ];
      if (msgId) {
        await botApi.editMessageText(chatId, msgId, text, keyboard);
      } else {
        await botApi.sendMessage(chatId, text, keyboard);
      }
    } else if (cq.data?.startsWith("donate_")) {
      const amount = parseInt(cq.data.split("_")[1], 10);
      if (!isNaN(amount)) {
        if (msgId) await botApi.deleteMessage(chatId, msgId);
        await botApi.sendInvoice(
          chatId,
          "បរិច្ចាគទៅ Auto Reaction Bot ✨",
          donateMessage,
          "{}",
          "",
          "donate",
          "XTR",
          [{ label: `បង់ ⭐️${amount}`, amount }],
        );
      }
    } else if (cq.data === "back_menu") {
      const firstName = cq.from.first_name ?? "មិត្ត";
      const text = startMessage.replace("UserName", firstName);
      const keyboard = mainMenu(botUsername);
      if (msgId) {
        await botApi.editMessageText(chatId, msgId, text, keyboard);
      } else {
        await botApi.sendMessage(chatId, text, keyboard);
      }
    }

    return;
  }

  // ── Donation payment confirmation ────────────────────────────────────────
  if (data.pre_checkout_query) {
    await botApi.answerPreCheckoutQuery(data.pre_checkout_query.id, true);
    await botApi.sendMessage(data.pre_checkout_query.from.id, "សូមអរគុណចំពោះការបរិច្ចាគ! 💝");
  }
}
