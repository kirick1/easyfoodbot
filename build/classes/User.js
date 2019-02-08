"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const Order_1 = require("./Order");
const validator_1 = require("validator");
const conversation_1 = require("../controllers/conversation");
class User {
    constructor(user) {
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
    setEmail(value) {
        if (value && validator_1.isEmail(value)) {
            this.email = value;
            return true;
        }
        else
            return false;
    }
    setPhone(value) {
        if (value) {
            this.phone = value;
            return true;
        }
        else
            return false;
    }
    setProfileURL(value) {
        if (value && validator_1.isURL(value)) {
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
    async syncInformation(chat) {
        try {
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
        catch (error) {
            console.error('[BOT] [USER] SYNC ERROR: ', error);
            await chat.say('Something went wrong, please try again later!');
            throw Error(error);
        }
    }
    async setContactInformation(chat) {
        const conversation = await conversation_1.Conversation(chat);
        const email = await conversation_1.Question(conversation, 'Write email');
        if (await conversation_1.YesNo(conversation, `${email}, is it correct?`))
            conversation.set('email', email);
        this.setEmail(email);
        const phone = await conversation_1.Question(conversation, 'Write phone');
        if (await conversation_1.YesNo(conversation, `${phone}, is it correct?`))
            conversation.set('phone', phone);
        this.setPhone(phone);
        await conversation.end();
        return this.getInformation();
    }
    async showContactInformation(chat) {
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
            : chat.say('Contact information for your account not found!');
    }
    async getCreatedOrders() {
        try {
            const { rows } = await database_1.default.query(`SELECT * FROM orders WHERE user_id = $1 AND status = 'new'`, [this.id]);
            return await Order_1.default.toArray(rows);
        }
        catch (error) {
            console.error('[BOT] ERROR GETTING CREATED ORDERS: ', error);
            throw Error(error);
        }
    }
    async getCurrentOrders() {
        try {
            const { rows } = await database_1.default.query(`SELECT * FROM orders WHERE user_id = $1 AND status = 'progress'`, [this.id]);
            return await Order_1.default.toArray(rows);
        }
        catch (error) {
            console.error('[BOT] ERROR GETTING CURRENT ORDERS: ', error);
            throw Error(error);
        }
    }
    async getCompletedOrders() {
        try {
            const { rows } = await database_1.default.query(`SELECT * FROM orders WHERE user_id = $1 AND status = 'done'`, [this.id]);
            return await Order_1.default.toArray(rows);
        }
        catch (error) {
            console.error('[BOT] ERROR GETTING COMPLETED ORDERS: ', error);
            throw Error(error);
        }
    }
    async cancelOrder(order) {
        try {
            const { rows: [canceledOrderData] } = await database_1.default.query(`UPDATE orders SET status = 'canceled', completed_at = now() at time zone 'utc', updated_at = now() at time zone 'utc' WHERE id = $1 RETURNING *`, [order.id]);
            const canceled = new Order_1.default(canceledOrderData);
            await canceled.getDishes();
            return canceled;
        }
        catch (error) {
            console.error('[BOT] ERROR CANCELING ORDER: ', error);
            throw Error(error);
        }
    }
    async writeFeedBack(chat) {
        const conversation = await conversation_1.Conversation(chat);
        try {
            const message = await conversation_1.Question(conversation, 'Write any remark or offer to EasyFood Team');
            const yes = await conversation_1.YesNo(conversation, `You wrote feedback (${message.length} symbols). Send this feedback?`);
            if (yes) {
                console.log(`[BOT] USER (${this.firstName} ${this.lastName}) CREATED FEEDBACK (${message.length} symbols)!`);
                await database_1.default.query(`NOTIFY feedback_message, '${JSON.stringify(message)}'`);
                await conversation.say('Your feedback was received, thank you for choosing us!');
            }
        }
        catch (error) {
            console.error('[BOT] ERROR NOTIFYING USER FEEDBACK: ', error);
        }
        finally {
            await conversation.end();
        }
    }
}
exports.default = User;
//# sourceMappingURL=User.js.map