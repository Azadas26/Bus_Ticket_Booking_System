const Promise = require('promise');
const bcrypt = require('bcryptjs');
const db = require('../connection/connect');
const consts = require('../connection/consts');
var objectId = require('mongodb').ObjectId;

module.exports =
{
    Do_Primary_user_signup: (info) => {
        console.log(info);
        return new Promise(async (resolve, reject) => {
            info.password = await bcrypt.hash(info.password, 10);
            console.log(info);
            db.get().collection(consts.userdb).insertOne(info).then((data) => {
                resolve(data.ops[0]._id)
            })
        })
    },
    Do_Primary_User_Login: (info) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.userdb).findOne({ email: info.email }).then((data) => {
                if (data) {
                    bcrypt.compare(info.password, data.password).then((iscoorect) => {
                        if (iscoorect) {
                            resolve(data)
                        }
                        else {
                            console.log("Password Faild");
                            reject()
                        }
                    })
                }
                else {
                    console.log("Email Faild");
                    reject()
                }
            })
        })
    },
    Inserty_Bus_AND_Stops_Details: (info) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.busdetails).insertOne(info).then((obj) => {
                resolve(obj.ops[0]._id);
            })
        })
    },
    Check_Whether_The_PRIMARY_USER_Already_REquested_OR_not: (userid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.busdetails).findOne({ userId: objectId(userid) }).then((resc) => {
                console.log(resc);
                if (resc) {

                    reject(false)
                }
                else {
                    resolve(true)
                }
            })
        })
    }
}