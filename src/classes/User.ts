import db from '../config/database'
import { UserObject } from '../declarations/user'
import { ProfileObject } from '../declarations/profile'
import { isEmail, isMobilePhone, isURL } from 'validator'
import { Conversation, YesNo, Question } from '../controllers/conversation'

export default class User {
  messengerID: number
  firstName: string
  lastName: string
  profilePic: string
  locale: string
  gender: string
  id?: number
  email?: string
  phone?: string
  profileURL?: string
  constructor (user: UserObject) {
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
  getInformation () {
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
}
