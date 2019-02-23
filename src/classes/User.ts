import db from '../database'
import Order from './Order'
import { UserObject } from '../declarations/user'
import { ProfileObject } from '../declarations/profile'
import { isEmail, isURL } from 'validator'
import { Conversation, YesNo, Question } from '../controllers/conversation'

export default class User {
  messengerID?: number
  firstName?: string
  lastName?: string
  profilePic?: string
  locale?: string
  gender?: string
  id?: number
  email?: string
  phone?: string
  profileURL?: string
  constructor (user?: UserObject) {
    if (user) {
      this.messengerID = user.messenger_id
      this.firstName = user.first_name
      this.lastName = user.last_name
      this.profilePic = user.profile_pic
      this.locale = user.locale
      this.gender = user.gender
      this.id = user.id
      this.email = user.email
      this.phone = user.phone
      this.profileURL = user.profile_url
    }
  }
  setEmail (value?: string): boolean {
    if (value && isEmail(value)) {
      this.email = value
      return true
    } else return false
  }
  setPhone (value?: string): boolean {
    if (value) {
      this.phone = value
      return true
    } else return false
  }
  setProfileURL (value?: string): boolean {
    if (value && isURL(value)) {
      this.profileURL = value
      return true
    } else return false
  }
  setProfile (profile: ProfileObject) {
    this.messengerID = profile.messenger_id || this.messengerID
    this.firstName = profile.first_name || this.firstName
    this.lastName = profile.last_name || this.lastName
    this.profilePic = profile.profile_pic || this.profilePic
    this.locale = profile.locale || this.locale
    this.gender = profile.gender || this.gender
  }
  setUser (user: UserObject) {
    this.messengerID = user.messenger_id || this.messengerID
    this.firstName = user.first_name || this.firstName
    this.lastName = user.last_name || this.lastName
    this.profilePic = user.profile_pic || this.profilePic
    this.locale = user.locale || this.locale
    this.gender = user.gender || this.gender
    this.id = user.id || this.id
    this.email = user.email || this.email
    this.phone = user.phone || this.phone
    this.profileURL = user.profile_url || this.profileURL
  }
  getInformation (): object {
    return {
      messenger_id: this.messengerID,
      first_name: this.firstName,
      last_name: this.lastName,
      profile_pic: this.profilePic,
      locale: this.locale,
      gender: this.gender,
      id: this.id,
      email: this.email,
      phone: this.phone,
      profile_url: this.profileURL
    }
  }
  async syncInformation (chat: any): Promise<object> {
    try {
      const profile: ProfileObject = await chat.getUserProfile()
      profile.messenger_id = profile.id
      delete profile.id
      this.setProfile(profile)
      const { rows: [user] } = await db.query('SELECT messenger_id, first_name, last_name, profile_pic, locale, gender, id, email, phone, profile_url FROM users WHERE messenger_id = $1', [this.messengerID])
      if (!user) {
        const { rows: [created] } = await db.query('INSERT INTO users (messenger_id, first_name, last_name, profile_pic, locale, gender, email, phone, profile_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING messenger_id, first_name, last_name, profile_pic, locale, gender, id, email, phone, profile_url', [this.messengerID, this.firstName, this.lastName, this.profilePic, this.locale, this.gender, this.email, this.phone, this.profileURL])
        this.setUser(created)
      } else this.setUser(user)
      return this.getInformation()
    } catch (error) {
      console.error('[BOT] [USER] SYNC ERROR: ', error)
      await chat.say('Something went wrong, please try again later!')
      throw Error(error)
    }
  }
  async setContactInformation (chat: any) {
    const conversation: any = await Conversation(chat)
    const email = await Question(conversation, 'Write email')
    if (await YesNo(conversation, `${email}, is it correct?`)) conversation.set('email', email)
    this.setEmail(email)
    const phone = await Question(conversation, 'Write phone')
    if (await YesNo(conversation, `${phone}, is it correct?`)) conversation.set('phone', phone)
    this.setPhone(phone)
    await conversation.end()
    return this.getInformation()
  }
  async showContactInformation (chat: any) {
    return this.email && this.phone
      ? chat.sendGenericTemplate([{
        title: `${this.firstName} ${this.lastName}`,
        subtitle: `Email: ${this.email}\nPhone: ${this.phone}`,
        buttons: [{
          title: 'Edit',
          type: 'postback',
          payload: `ACCOUNT_CONTACT_EDIT___${this.id}`
        }]
      }])
      : chat.say('Contact information for your account not found!')
  }
  async getCreatedOrders (): Promise<Array<Order>> {
    try {
      const { rows } = await db.query(`SELECT * FROM orders WHERE user_id = $1 AND status = 'new'`, [this.id])
      return await Order.toArray(rows)
    } catch (error) {
      console.error('[BOT] ERROR GETTING CREATED ORDERS: ', error)
      throw Error(error)
    }
  }
  async getCurrentOrders (): Promise<Array<Order>> {
    try {
      const { rows } = await db.query(`SELECT * FROM orders WHERE user_id = $1 AND status = 'progress'`, [this.id])
      return await Order.toArray(rows)
    } catch (error) {
      console.error('[BOT] ERROR GETTING CURRENT ORDERS: ', error)
      throw Error(error)
    }
  }
  async getCompletedOrders (): Promise<Array<Order>> {
    try {
      const { rows } = await db.query(`SELECT * FROM orders WHERE user_id = $1 AND status = 'done'`, [this.id])
      return await Order.toArray(rows)
    } catch (error) {
      console.error('[BOT] ERROR GETTING COMPLETED ORDERS: ', error)
      throw Error(error)
    }
  }
  static async cancelOrder (order: Order): Promise<Order> {
    try {
      const { rows: [canceledOrderData] } = await db.query(`UPDATE orders SET status = 'canceled', completed_at = now() at time zone 'utc', updated_at = now() at time zone 'utc' WHERE id = $1 RETURNING *`, [order.id])
      const canceled = new Order(canceledOrderData)
      await canceled.getDishes()
      return canceled
    } catch (error) {
      console.error('[BOT] ERROR CANCELING ORDER: ', error)
      throw Error(error)
    }
  }
  async writeFeedBack (chat: any) {
    const conversation = await Conversation(chat)
    try {
      const message = await Question(conversation, 'Write any remark or offer to EasyFood Team')
      const yes = await YesNo(conversation, `You wrote feedback (${message.length} symbols). Send this feedback?`)
      if (yes) {
        console.log(`[BOT] USER (${this.firstName} ${this.lastName}) CREATED FEEDBACK (${message.length} symbols)!`)
        await db.query(`NOTIFY feedback_message, '${JSON.stringify(message)}'`)
        await conversation.say('Your feedback was received, thank you for choosing us!')
      }
    } catch (error) {
      console.error('[BOT] ERROR NOTIFYING USER FEEDBACK: ', error)
    } finally {
      await conversation.end()
    }
  }
}
