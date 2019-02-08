"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.load();
const database_1 = require("./config/database");
process.on('SIGINT', async () => {
    await database_1.default.end();
    await bot.close();
    process.exit(0);
});
const BootBot = require('bootbot');
const bot = new BootBot({
    accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
    verifyToken: process.env.FACEBOOK_VERIFY_TOKEN,
    appSecret: process.env.FACEBOOK_APP_SECRET,
    webhook: '/webhook',
    graphApiVersion: 'v3.2'
});
const greeting_text_1 = require("./config/greeting_text");
const persistent_menu_1 = require("./config/persistent_menu");
const events_1 = require("./events");
bot.setGreetingText(greeting_text_1.default);
bot.setPersistentMenu(persistent_menu_1.default);
bot.on('postback', events_1.default);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
bot.start(PORT);
//# sourceMappingURL=app.js.map