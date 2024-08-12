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
            //console.log(info.email);
            db.get().collection(consts.userdb).findOne({ email: info.email }).then((data) => {
                if (data) {
                    if (data.inactivate == true) {
                        bcrypt.compare(info.password, data.password).then((iscoorect) => {
                            if (iscoorect) {
                                resolve(data)
                            }
                            else {
                                console.log("Password Faild");
                                reject(false)
                            }
                        })
                    }
                    else {
                        reject(true)
                    }
                }
                else {
                    console.log("user Email Faild");
                    reject(false)
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
            db.get().collection(consts.busdetails).findOne({ userId: objectId(userid), isaccept: false }).then((resc) => {
                console.log(resc);
                if (resc) {
                    resolve(resc)
                }
                else {
                    reject(false)

                }
            })
        })
    },
    Insert_Checker_info_By_Primary_user: (data) => {
        return new Promise(async (resolve, reject) => {
            data.password = await bcrypt.hash(data.password, 10);
            db.get().collection(consts.checkerbase).insertOne(data).then((info) => {
                resolve(info.ops[0]._id)
            })
        })
    },
    View_Their_Own_Checkers: (userid) => {
        return new Promise((resolve, reject) => {
            var checkers = db.get().collection(consts.checkerbase).find({ userid: objectId(userid) }).toArray()
            if (checkers) {
                resolve(checkers)
            }
            else {
                reject()
            }
        })
    },
    REmove_their_Own_cHeckers: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.checkerbase).deleteOne({ _id: objectId(id) }).then(() => {
                resolve()
            })
        })
    },
    Get_User_added_Buss_Adnd__Its_Details: (userid) => {
        return new Promise(async (resolve, reject) => {
            var buss = await db.get().collection(consts.busdetails).find({ userId: objectId(userid) }).toArray()
            resolve(buss)
        })
    },
    Enable_Permition_For_Edit: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.busdetails).updateOne({ _id: objectId(id) },
                {
                    $set:
                    {
                        editing: true
                    }
                }).then(() => {
                    resolve()
                })
        })
    },
    Get_Date_For_Edit: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.busdetails).findOne({ _id: objectId(id) }).then((info) => {
                resolve(info)
            })
        })
    },
    Update_Edited_information: (id, info) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(consts.busdetails).updateOne({ _id: objectId(id) },
                {
                    $set:
                    {
                        bname: info.bname,
                        busnumber: info.busnumber,
                        stime: info.stime,
                        sdate: info.sdate,
                        edate: info.edate,
                        lino: info.lino,
                        max: info.max,
                        price: info.price,
                        numInputs: info.numInputs,
                        available: info.available,
                        userId: info.userId,
                        isaccept: info.isaccept,
                        isbus: info.isbus,
                        already: info.already,
                        stops: [...info.stops],
                        pri: [...info.pri],
                        dis: [...info.dis],
                        editing: false
                    }
                }).then(() => {
                    resolve()
                })
        })
    },
    Redrive_Bus_informtion_For_Emergency: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.busdetails).findOne({ _id: objectId(id) }).then((info) => {
                resolve(info)
            })
        })
    },
    Emergency_Object_Information_SetUp: (id, info) => {
        return new Promise(async (resolve, reject) => {
            console.log(info);
            await db.get().collection(consts.busorder).updateMany({ id: objectId(id), preferredDates: info.date, isvalidated: false },
                {
                    $set:
                    {
                        emergency: true,
                        isnotify: true,
                        emdescription: info.description,
                        one: info.one,
                        two: info.two
                    }
                }
            ).then(() => {
                resolve()
            })
        })
    },
    Update_Emergence_Date_TO_Notuse: (id, date) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(consts.busdetails).findOne({ _id: objectId(id) }).then((bus) => {
                if (bus.dateArray) {
                    db.get().collection(consts.busdetails).updateOne({ _id: objectId(id) },
                        {
                            $push:
                            {
                                dateArray: date
                            }
                        }).then(() => resolve())
                } else {
                    db.get().collection(consts.busdetails).updateOne({ _id: objectId(id) },
                        {
                            $set:
                            {
                                dateArray: [date]
                            }
                        }).then(() => resolve())
                }
            })
        })
    },
    Setup_To_incriment_Emergency_count: (userid) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(consts.userdb).updateOne({ _id: objectId(userid) },
                {
                    $inc: { emergencycount: 1 }
                }).then(() => {
                    resolve()
                })
        })
    },
    Check_wheteher_Any_Notification_Arrived: (userid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.messageadminandowner).findOne({ ownerid: objectId(userid), isnotview: true }).then((resc) => {
                resolve(resc)
                console.log(resc, "qqq");
            })
        })
    },
    Turn_Of_Nofication_When_ViewIt: (userid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.messageadminandowner).updateMany({ ownerid: objectId(userid) },
                {
                    $set:
                    {
                        isnotview: false
                    }
                }).then(() => resolve())
        })
    },
    Get_all_notification_To_Owner: (userid) => {
        return new Promise(async (resolve, reject) => {
            var nofy = await db.get().collection(consts.messageadminandowner).aggregate([
                {
                    $match: { ownerid: objectId(userid) }
                },
                {
                    $lookup:
                    {
                        from: consts.busdetails,
                        localField: "busid",
                        foreignField: "_id",
                        as: "bus",
                    }
                },
                {
                    $project:
                    {
                        _id: 1,
                        ownerid: 1,
                        busid: 1,
                        message: 1,
                        isnotview: 1,
                        bus:
                        {
                            $arrayElemAt: ["$bus", 0]
                        }
                    }
                }
            ]).toArray()
            console.log(nofy);
            resolve(nofy)
        })
    },
    Owner_Chate_With_Admin: (ownerid, body) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.chatwithadmin).findOne({ ownerid: objectId(ownerid) }).then((chat) => {
                var state =
                {
                    ...body,
                    fromadmin: false
                }
                if (chat) {
                    db.get().collection(consts.chatwithadmin).updateOne({ ownerid: objectId(ownerid) },
                        {
                            $push: { message: state }
                        }).then(() => {
                            db.get().collection(consts.chatwithadmin).updateOne({ ownerid: objectId(ownerid) },
                                {
                                    $inc: { count: 1 },
                                    $set: { iszerochat: true }
                                }).then(() => resolve())
                        })
                }
                else {
                    var putchat =
                    {
                        ownerid: objectId(ownerid),
                        notify: false,
                        count: 1,
                        iszerochat: true,
                        message: [state]

                    }
                    db.get().collection(consts.chatwithadmin).insertOne(putchat).then(() => resolve())
                }
            })
        })
    },
    Get_Message_To_View_In_The_ChtBox: (userid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.chatwithadmin).findOne({ ownerid: objectId(userid) }).then(async (messages) => {
                if (messages) {
                    await db.get().collection(consts.chatwithadmin).updateOne({ ownerid: objectId(userid) },
                        {
                            $set:
                            {
                                notify: false
                            }
                        }).then(() => resolve(messages))
                }
                else {
                    resolve(messages)
                }
            })
        })
    },
    Evaluvate_Is_Admin_Replay_Owner_message: (userid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.chatwithadmin).findOne({ ownerid: objectId(userid) }).then((resc) => {
                resolve(resc)
            })
        })
    },
    ChecK_whethet_THE_Email_Already_Existing_or_Not: (email) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.userdb).findOne({ email }).then((email) => {
                if (email) {
                    resolve()
                } else {
                    reject()
                }
            })
        })
    }
}