import { join } from 'path'
import { config } from 'dotenv'

config({ path: join(__dirname, '..', '.env') })

const BootBot = require('bootbot')

const bot = new BootBot({
  accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
  verifyToken: process.env.FACEBOOK_VERIFY_TOKEN,
  appSecret: process.env.FACEBOOK_APP_SECRET,
  webhook: '/webhook',
  graphApiVersion: 'v3.2'
})

import { GreetingText, PersistentMenu } from './settings/'

bot.setGreetingText(GreetingText)
bot.setPersistentMenu(PersistentMenu)

import { PostbackEvents } from './events'

bot.on('postback', PostbackEvents)

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000

bot.start(PORT)
