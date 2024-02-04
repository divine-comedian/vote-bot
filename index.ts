import { Bot, InlineKeyboard } from "grammy";

import client from "./utils/setupViem";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, toHex, toBytes, http, slice } from "viem";
import { auroraTestnet } from "viem/chains";
require('dotenv').config();

const botKey = process.env.BOT_KEY as string;
enum State {
    INE,
    SECCION,
    AWAITING_SECCION,
    MAKE_WALLET,
    CHECK_VOTES,
    VOTE,
    IDLE
}


// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot(botKey); // <-- put your bot token between the ""
let INE: string = "";
let seccion: string = "";
let extraSalt = process.env.SALT as string;
let state = State.IDLE;
// You can now register listeners on your bot object `bot`.
// grammY will call the listeners when users send messages to your bot.
// Handle the /start command.

bot.api.setMyCommands([
    { command: "start", description: "Start the bot and get your wallet" },
    { command: "getVotes", description: "Show vote information" },
    { command: "settings", description: "Open settings" },
  ]);

bot.command("start", (ctx) => {ctx.reply("Welcome! Up and running. \n Please enter your INE"),
    state = State.INE;
    })
bot.on("message", (ctx) => {
    switch (state) {
        // get INE
    case State.INE:{
        if (!ctx.message.text || ctx.message.text.length < 32) {
            ctx.reply("Enter a valid INE");
        }
        INE = ctx.message.text || "";
        ctx.reply("Thank you, now please enter your seccion.")
        state = State.AWAITING_SECCION;
        break;
    }
    // get seccion
    case State.AWAITING_SECCION:{
        seccion = ctx.message.text || "";
        extraSalt = seccion.repeat(10);
        if (seccion.length != 6) {
            ctx.reply("Enter a valid seccion");
        }
        state = State.SECCION;
        
    }
    case State.SECCION: {
        ctx.reply("Your seccion is: " + seccion);
        ctx.reply("Thank you, now creating your voter profile...")
        state = State.MAKE_WALLET;
        
    }
    // make wallet
    case State.MAKE_WALLET: {
        try {
            ctx.reply("One second...");
            const hexedText = slice(toHex(INE.concat(extraSalt)),0 , 32);
            console.log(hexedText);
          const account = privateKeyToAccount(hexedText),
            client = createWalletClient({
                account,
                chain: auroraTestnet,
                transport: http(),
            });
            console.log(client);
            ctx.reply("Your wallet address is: " + account.address);
            state = State.IDLE;
        } catch(err) {
            console.log(err);
        }
        break;
    }
}
})


// Handle other messages.
bot.catch((err) => {
    console.error("An error occurred", err);
  }
);
// Now that you specified how to handle messages, you can start your bot.
// This will connect to the Telegram servers and wait for messages.
bot.command("getVotes", async (ctx) => {
    state = State.CHECK_VOTES;
    ctx.reply("Here are the current votes: \n")

    ctx.reply("Vote #1 \n Title: Fixing the potholes in the street \n Description: The street is full of potholes, we need to fix them. \n Votes: \n  Yes:100 \n No: 50 \n Abstain: 10 \n Vote Closes: March 1st 2024")    
    try {
        const options = new InlineKeyboard().text("Yes", "yes").text("No", "no").text("Abstain", "abstain").row().text("I'll vote later", "later");
        // const votes = await client.getVotes();
        // ctx.reply("Votes: " + votes);
          ctx.reply("What would you like to vote?", { reply_markup: options });
    } catch (err) {
        console.error(err);
    }
}
)
bot.on("callback_query:data", async (ctx) => {
    switch (state) {
        case State.CHECK_VOTES: {
    console.log(ctx.callbackQuery.data);
    if (ctx.callbackQuery.data === "yes" && state === State.CHECK_VOTES) {
        state = State.VOTE;
        ctx.reply("Casting your vote....");
        ctx.reply("You voted yes!");
    }
    if (ctx.callbackQuery.data === "no" && state === State.CHECK_VOTES) {
        state = State.VOTE;
        ctx.reply("Casting your vote....");
        ctx.reply("You voted no!");
    }
    if (ctx.callbackQuery.data === "abstain" && state === State.CHECK_VOTES) {
        state = State.VOTE;
        ctx.reply("Casting your vote....");
        ctx.reply("You abstained!");
    }
    if (ctx.callbackQuery.data === "later" && state === State.CHECK_VOTES) {
        ctx.reply("You'll vote later!");
        state = State.IDLE;
    }
    ctx.reply("Thank you for voting!");
    // await client.vote(ctx.callbackQuery.data);
}}}
)

// Start the bot.
bot.start();