import { Router, type IRouter } from "express";
import TelegramBotAPI from "../lib/telegram-bot-api";
import { splitEmojis, getChatIds } from "../lib/bot-helpers";
import { onUpdate } from "../lib/bot-handler";

const router: IRouter = Router();

const botToken = process.env["BOT_TOKEN"] ?? "";
const botUsername = process.env["BOT_USERNAME"] ?? "";
const reactions = splitEmojis(process.env["EMOJI_LIST"]);
const restrictedChats = getChatIds(process.env["RESTRICTED_CHATS"]);
const randomLevel = parseInt(process.env["RANDOM_LEVEL"] ?? "0", 10);

const botApi = new TelegramBotAPI(botToken);

router.post("/webhook", async (req, res) => {
  if (!botToken || !botUsername) {
    res.status(200).send("Ok");
    return;
  }
  try {
    await onUpdate(req.body, botApi, reactions, restrictedChats, botUsername, randomLevel);
  } catch (error: unknown) {
    const err = error as Error;
    req.log.error({ err: err.message }, "Error in onUpdate");
  }
  res.status(200).send("Ok");
});

export default router;
