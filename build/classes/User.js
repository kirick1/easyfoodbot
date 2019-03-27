"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database");
const _1 = require(".");
const validator_1 = require("validator");
const controllers_1 = require("../controllers");
class User {
    constructor(user) {
        this.messengerID = null;
        this.firstName = null;
        this.lastName = null;
        this.profilePic = null;
        this.locale = null;
        this.gender = null;
        this.id = null;
        this.email = null;
        this.phone = null;
        this.profileURL = null;
        if (user) {
            this.messengerID = user.messenger_id;
            this.firstName = user.first_name;
            this.lastName = user.last_name;
            this.profilePic = user.profile_pic;
            this.locale = user.locale;
            this.gender = user.gender;
            this.id = user.id;
            this.email = user.email;
            this.phone = user.phone;
            this.profileURL = user.profile_url;
        }
    }
    async setEmail(value) {
        if (validator_1.isEmail(value)) {
            this.email = value;
            await database_1.default.query(`UPDATE users SET email = $1, updated_at = now() at time zone 'utc' WHERE messenger_id = $2`, [this.email, this.messengerID]);
            return true;
        }
        else
            return false;
    }
    async setPhone(value) {
        if (value) {
            this.phone = value;
            await database_1.default.query(`UPDATE users SET phone = $1, updated_at = now() at time zone 'utc' WHERE messenger_id = $2`, [this.phone, this.messengerID]);
            return true;
        }
        else
            return false;
    }
    setProfileURL(value) {
        if (validator_1.isURL(value)) {
            this.profileURL = value;
            return true;
        }
        else
            return false;
    }
    setProfile(profile) {
        this.messengerID = profile.messenger_id || this.messengerID;
        this.firstName = profile.first_name || this.firstName;
        this.lastName = profile.last_name || this.lastName;
        this.profilePic = profile.profile_pic || this.profilePic;
        this.locale = profile.locale || this.locale;
        this.gender = profile.gender || this.gender;
        return this.getInformation();
    }
    setUser(user) {
        this.messengerID = user.messenger_id || this.messengerID;
        this.firstName = user.first_name || this.firstName;
        this.lastName = user.last_name || this.lastName;
        this.profilePic = user.profile_pic || this.profilePic;
        this.locale = user.locale || this.locale;
        this.gender = user.gender || this.gender;
        this.id = user.id || this.id;
        this.email = user.email || this.email;
        this.phone = user.phone || this.phone;
        this.profileURL = user.profile_url || this.profileURL;
        return this.getInformation();
    }
    getInformation() {
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
        };
    }
    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }
    async syncInformation(chat) {
        const profile = await chat.getUserProfile();
        profile.messenger_id = profile.id;
        delete profile.id;
        this.setProfile(profile);
        const { rows: [user] } = await database_1.default.query('SELECT messenger_id, first_name, last_name, profile_pic, locale, gender, id, email, phone, profile_url FROM users WHERE messenger_id = $1', [this.messengerID]);
        if (!user) {
            const { rows: [created] } = await database_1.default.query('INSERT INTO users (messenger_id, first_name, last_name, profile_pic, locale, gender, email, phone, profile_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING messenger_id, first_name, last_name, profile_pic, locale, gender, id, email, phone, profile_url', [this.messengerID, this.firstName, this.lastName, this.profilePic, this.locale, this.gender, this.email, this.phone, this.profileURL]);
            this.setUser(created);
        }
        else
            this.setUser(user);
        return this.getInformation();
    }
    async setContactInformation(chat) {
        const conversation = await controllers_1.createConversation(chat);
        const email = await controllers_1.askEmail(conversation);
        conversation.set('email', email);
        await this.setEmail(email);
        const phone = await controllers_1.askPhoneNumber(conversation);
        conversation.set('phone', phone);
        await this.setPhone(phone);
        await conversation.end();
        return this.getInformation();
    }
    showContactInformation(chat) {
        return this.email !== null && this.phone !== null
            ? chat.sendGenericTemplate([_1.Template.getContactInformationGenericMessage(this)])
            : chat.say('Contact information for your account not found!');
    }
    async getCreatedOrders() {
        const { rows } = await database_1.default.query(`SELECT * FROM orders WHERE user_id = $1 AND status = 'new'`, [this.id]);
        return _1.Order.toArray(rows);
    }
    async getCurrentOrders() {
        const { rows } = await database_1.default.query(`SELECT * FROM orders WHERE user_id = $1 AND status = 'progress'`, [this.id]);
        return _1.Order.toArray(rows);
    }
    async getCompletedOrders() {
        const { rows } = await database_1.default.query(`SELECT * FROM orders WHERE user_id = $1 AND status = 'done'`, [this.id]);
        return _1.Order.toArray(rows);
    }
    static async cancelOrder(order) {
        const { rows: [canceledOrderData] } = await database_1.default.query(`UPDATE orders SET status = 'canceled', completed_at = now() at time zone 'utc', updated_at = now() at time zone 'utc' WHERE id = $1 RETURNING *`, [order.id]);
        const canceledOrder = new _1.Order(canceledOrderData);
        return canceledOrder.status === 'canceled';
    }
    async writeFeedBack(chat) {
        const conversation = await controllers_1.createConversation(chat);
        const message = await controllers_1.askQuestion(conversation, 'Write any remark or offer to EasyFood Team');
        const yes = await controllers_1.askYesNo(conversation, `You wrote feedback (${message.length} symbols). Send this feedback?`);
        if (yes) {
            console.log(`[BOT] USER (${this.firstName} ${this.lastName}) CREATED FEEDBACK (${message.length} symbols)!`);
            await database_1.default.query(`NOTIFY feedback_message, '${JSON.stringify({ message })}'`);
            await conversation.say('Your feedback was received, thank you for choosing us!');
        }
        await conversation.end();
        return yes;
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map