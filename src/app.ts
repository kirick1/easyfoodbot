import { join } from 'path'
import { config } from 'dotenv'

config({ path: join(__dirname, '..', '.env') })

import { Bot, BotOptions } from './types'
import { PostbackEventHandler } from './handlers'
import { GreetingText, PersistentMenu } from './settings'

const BootBot = require('bootbot')

const botOptions: BotOptions = {
  accessToken: process.env.FACEBOOK_ACCESS_TOKEN || '',
  verifyToken: process.env.FACEBOOK_VERIFY_TOKEN || '',
  appSecret: process.env.FACEBOOK_APP_SECRET || '',
  webhook: '/webhook',
  graphApiVersion: 'v3.2',
  broadcastEchoes: false
}

const bot: Bot = new BootBot(botOptions)

bot.setGreetingText(GreetingText)
bot.setPersistentMenu(PersistentMenu)

bot.on('postback', PostbackEventHandler)

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000

bot.start(PORT)
