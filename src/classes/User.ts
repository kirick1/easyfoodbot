import db, { NotificationType } from '../database'
import { Messages } from '../config'
import { isEmail, isURL } from 'validator'
import { IChat, ProfileObject, ButtonType } from '../types'
import { Conversation, Location, Order, OrderStatus, Template } from '.'

export interface IUser {
  messenger_id: number | null
  first_name: string | null
  last_name: string | null
  profile_pic: string | null
  locale: string | null
  gender: string | null
  id: number | null
  email: string | null
  phone: string | null
  profile_url: string | null
  location: number | null
}

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
  location: number | null = null
  constructor (user?: IUser) {
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
      this.location = user.location
    }
  }
  async setEmail (value: string): Promise<User> {
    if (!isEmail(value)) throw Error(Messages.INVALID_EMAIL)
    this.email = value
    await db.query(`UPDATE users SET email = $1, updated_at = now() at time zone 'utc' WHERE messenger_id = $2`, [this.email, this.messengerID])
    return this
  }
  async setPhone (value: string): Promise<User> {
    this.phone = value
    await db.query(`UPDATE users SET phone = $1, updated_at = now() at time zone 'utc' WHERE messenger_id = $2`, [this.phone, this.messengerID])
    return this
  }
  async setLocation (location: Location): Promise<User> {
    this.location = location.id
    await db.query(`UPDATE users SET location = $1, updated_at = now() at time zone 'utc' WHERE messenger_id = $2`, [this.location, this.messengerID])
    return this
  }
  async setProfileURL (value: string): Promise<User> {
    if (!isURL(value)) throw Error()
    this.profileURL = value
    await db.query(`UPDATE users SET profile_url = $1, updated_at = now() at time zone 'utc' WHERE messenger_id = $2`, [this.profileURL, this.messengerID])
    return this
  }
  setProfile (profile: ProfileObject): User {
    this.messengerID = profile.messenger_id || this.messengerID
    this.firstName = profile.first_name || this.firstName
    this.lastName = profile.last_name || this.lastName
    this.profilePic = profile.profile_pic || this.profilePic
    this.locale = profile.locale || this.locale
    this.gender = profile.gender || this.gender
    return this
  }
  setUser (user: IUser): User {
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
    this.location = user.location || this.location
    return this
  }
  getFullName (): string {
    return `${this.firstName} ${this.lastName}`
  }
  async getDefaultLocation (): Promise<Location> {
    return Location.getByID(this.location)
  }
  async syncInformation (chat: IChat): Promise<User> {
    const profile = await chat.getUserProfile()
    profile.messenger_id = profile.id
    delete profile.id
    this.setProfile(profile)
    const { rows: [user] } = await db.query('SELECT messenger_id, first_name, last_name, profile_pic, locale, gender, id, email, phone, profile_url, location FROM users WHERE messenger_id = $1', [this.messengerID])
    if (!user) {
      const { rows: [created] } = await db.query('INSERT INTO users (messenger_id, first_name, last_name, profile_pic, locale, gender, email, phone, profile_url, location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING messenger_id, first_name, last_name, profile_pic, locale, gender, id, email, phone, profile_url', [this.messengerID, this.firstName, this.lastName, this.profilePic, this.locale, this.gender, this.email, this.phone, this.profileURL, this.location])
      this.setUser(created)
    } else this.setUser(user)
    return this
  }
  async setDefaultLocation (chat: IChat): Promise<User> {
    const location = await Conversation.askLocation(chat)
    await this.setLocation(location)
    return this
  }
  async showDefaultLocation (chat: IChat): Promise<any> {
    if (!this.location) return chat.say(Messages.NO_DEFAULT_LOCATION)
    const location = await this.getDefaultLocation()
    return chat.sendButtonTemplate(Messages.DEFAULT_LOCATION, [{
      type: ButtonType.WEB_URL,
      url: location.url,
      title: location.title
    }])
  }
  async setContactInformation (chat: IChat): Promise<User> {
    const email = await Conversation.askEmail(chat)
    await this.setEmail(email)
    const phone = await Conversation.askPhoneNumber(chat)
    await this.setPhone(phone)
    return this
  }
  async showContactInformation (chat: IChat): Promise<any> {
    return this.email !== null && this.phone !== null
      ? chat.sendGenericTemplate([Template.getContactInformationGenericMessage(this)])
      : chat.say(Messages.NO_CONTACT_INFORMATION)
  }
  async getCreatedOrders (): Promise<Array<Order>> {
    const { rows } = await db.query(`SELECT * FROM orders WHERE user_id = $1 AND status = ${OrderStatus.NEW}`, [this.id])
    return Order.toArray(rows)
  }
  async getCurrentOrders (): Promise<Array<Order>> {
    const { rows } = await db.query(`SELECT * FROM orders WHERE user_id = $1 AND status = ${OrderStatus.PROGRESS}`, [this.id])
    return Order.toArray(rows)
  }
  async getCompletedOrders (): Promise<Array<Order>> {
    const { rows } = await db.query(`SELECT * FROM orders WHERE user_id = $1 AND status = ${OrderStatus.DONE}`, [this.id])
    return Order.toArray(rows)
  }
  static async cancelOrder (order: Order): Promise<boolean> {
    const { rows: [canceledOrderData] } = await db.query(`UPDATE orders SET status = ${OrderStatus.CANCELED}, completed_at = now() at time zone 'utc', updated_at = now() at time zone 'utc' WHERE id = $1 RETURNING *`, [order.id])
    const canceledOrder = new Order(canceledOrderData)
    return canceledOrder.status === OrderStatus.CANCELED
  }
  async writeFeedBack (chat: IChat): Promise<boolean> {
    const conversation = await Conversation.createConversation(chat)
    const message = await Conversation.askQuestion(conversation, Messages.WRITE_FEEDBACK_MESSAGE)
    const yes = await Conversation.askYesNo(conversation, `You wrote feedback (${message.length} symbols). Send this feedback?`)
    if (yes) {
      console.log(`[BOT] USER (${this.firstName} ${this.lastName}) CREATED FEEDBACK (${message.length} symbols)!`)
      await db.query(`NOTIFY ${NotificationType.FEEDBACK}, '${JSON.stringify({ message })}'`)
      await conversation.say(Messages.FEEDBACK_RECEIVED)
    }
    await conversation.end()
    return yes
  }
}
