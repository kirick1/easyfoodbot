import db from '../database'
import { Order, Template } from '.'
import { isEmail, isURL } from 'validator'
import { UserObject, ProfileObject, Chat } from '../types'
import { createConversation, askYesNo, askQuestion } from '../controllers'

export class User {
  messengerID: number | null = null
  firstName: string | null = null
  lastName: string | null = null
  profilePic: string | null = null
  locale: string | null = null
  gender: string | null = null
  id: number | null = null
  email: string | null = null
  phone: string | null = null
  profileURL: string | null = null
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
  setEmail (value: string): boolean {
    if (isEmail(value)) {
      this.email = value
      return true
    } else return false
  }
  setPhone (value: string): boolean {
    if (value) {
      this.phone = value
      return true
    } else return false
  }
  setProfileURL (value: string): boolean {
    if (isURL(value)) {
      this.profileURL = value
      return true
    } else return false
  }
  setProfile (profile: ProfileObject): UserObject {
    this.messengerID = profile.messenger_id || this.messengerID
    this.firstName = profile.first_name || this.firstName
    this.lastName = profile.last_name || this.lastName
    this.profilePic = profile.profile_pic || this.profilePic
    this.locale = profile.locale || this.locale
    this.gender = profile.gender || this.gender
    return this.getInformation()
  }
  setUser (user: UserObject): UserObject {
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
    return this.getInformation()
  }
  getInformation (): UserObject {
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
  getFullName (): string {
    return `${this.firstName} ${this.lastName}`
  }
  async syncInformation (chat: Chat): Promise<UserObject> {
    const profile = await chat.getUserProfile()
    profile.messenger_id = profile.id
    delete profile.id
    this.setProfile(profile)
    const { rows: [user] } = await db.query('SELECT messenger_id, first_name, last_name, profile_pic, locale, gender, id, email, phone, profile_url FROM users WHERE messenger_id = $1', [this.messengerID])
    if (!user) {
      const { rows: [created] } = await db.query('INSERT INTO users (messenger_id, first_name, last_name, profile_pic, locale, gender, email, phone, profile_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING messenger_id, first_name, last_name, profile_pic, locale, gender, id, email, phone, profile_url', [this.messengerID, this.firstName, this.lastName, this.profilePic, this.locale, this.gender, this.email, this.phone, this.profileURL])
      this.setUser(created)
    } else this.setUser(user)
    return this.getInformation()
  }
  async setContactInformation (chat: Chat): Promise<UserObject> {
    const conversation = await createConversation(chat)
    const email = await askQuestion(conversation, 'Write email')
    if (await askYesNo(conversation, `${email}, is it correct?`)) {
      conversation.set('email', email)
      this.setEmail(email)
    }
    const phone = await askQuestion(conversation, 'Write phone')
    if (await askYesNo(conversation, `${phone}, is it correct?`)) {
      conversation.set('phone', phone)
      this.setPhone(phone)
    }
    await conversation.end()
    return this.getInformation()
  }
  showContactInformation (chat: Chat): Promise<any> {
    return this.email !== null && this.phone !== null
      ? chat.sendGenericTemplate([Template.getContactInformationGenericMessage(this)])
      : chat.say('Contact information for your account not found!')
  }
  async getCreatedOrders (): Promise<Array<Order>> {
    const { rows } = await db.query(`SELECT * FROM orders WHERE user_id = $1 AND status = 'new'`, [this.id])
    return Order.toArray(rows)
  }
  async getCurrentOrders (): Promise<Array<Order>> {
    const { rows } = await db.query(`SELECT * FROM orders WHERE user_id = $1 AND status = 'progress'`, [this.id])
    return Order.toArray(rows)
  }
  async getCompletedOrders (): Promise<Array<Order>> {
    const { rows } = await db.query(`SELECT * FROM orders WHERE user_id = $1 AND status = 'done'`, [this.id])
    return Order.toArray(rows)
  }
  static async cancelOrder (order: Order): Promise<boolean> {
    const { rows: [canceledOrderData] } = await db.query(`UPDATE orders SET status = 'canceled', completed_at = now() at time zone 'utc', updated_at = now() at time zone 'utc' WHERE id = $1 RETURNING *`, [order.id])
    const canceledOrder = new Order(canceledOrderData)
    return canceledOrder.status === 'canceled'
  }
  async writeFeedBack (chat: Chat): Promise<boolean> {
    const conversation = await createConversation(chat)
    const message = await askQuestion(conversation, 'Write any remark or offer to EasyFood Team')
    const yes = await askYesNo(conversation, `You wrote feedback (${message.length} symbols). Send this feedback?`)
    if (yes) {
      console.log(`[BOT] USER (${this.firstName} ${this.lastName}) CREATED FEEDBACK (${message.length} symbols)!`)
      await db.query(`NOTIFY feedback_message, '${JSON.stringify({ message })}'`)
      await conversation.say('Your feedback was received, thank you for choosing us!')
    }
    await conversation.end()
    return yes
  }
}
