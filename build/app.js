"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const dotenv_1 = require("dotenv");
dotenv_1.config({ path: path_1.join(__dirname, '.env') });
const BootBot = require('bootbot');
const bot = new BootBot({
    accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
    verifyToken: process.env.FACEBOOK_VERIFY_TOKEN,
    appSecret: process.env.FACEBOOK_APP_SECRET,
    webhook: '/webhook',
    graphApiVersion: 'v3.2'
});
const settings_1 = require("./settings/");
bot.setGreetingText(settings_1.GreetingText);
bot.setPersistentMenu(settings_1.PersistentMenu);
const events_1 = require("./events");
bot.on('postback', events_1.PostbackEvents);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
bot.start(PORT);
//# sourceMappingURL=app.js.map