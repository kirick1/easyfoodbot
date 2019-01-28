import * as dotenv from 'dotenv'

dotenv.load()

import db from './config/database'

process.on('SIGINT', async () => {
  await db.end()
  await bot.close()
  process.exit(0)
})

const BootBot = require('bootbot')

const bot = new BootBot({
  accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
  verifyToken: process.env.FACEBOOK_VERIFY_TOKEN,
  appSecret: process.env.FACEBOOK_APP_SECRET,
  webhook: '/webhook',
  graphApiVersion: 'v3.2'
})

import GreetingText from './config/greeting_text'
import PersistentMenu from './config/persistent_menu'

bot.setGreetingText(GreetingText)
bot.setPersistentMenu(PersistentMenu)

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000

bot.start(PORT)
