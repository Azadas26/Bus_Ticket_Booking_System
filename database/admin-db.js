const Promise = require('promise');
const bcrypt = require('bcryptjs');
const db = require('../connection/connect');
const consts = require('../connection/consts');
var objectId = require('mongodb').ObjectId;


module.exports =
{
    Accept_PriMary_User_BUS_rEquEst: () => {
        return new Promise(async (resolve, reject) => {
            var buss = await db.get().collection(consts.busdetails).aggregate([
                {
                    $lookup: {
                        from: consts.userdb,
                        localField: "userId",
                        foreignField: "_id",
                        as: "User",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        bname: 1,
                        busnumber: 1,
                        stime: 1,
                        isreturn: 1,
                        retime: 1,
                        lino: 1,
                        max: 1,
                        price: 1,
                        numInputs: 1,
                        userId: 1,
                        isaccept: 1,
                        isbus: 1,
                        already: 1,
                        stops: 1,
                        available: 1,
                        user:
                        {
                            $arrayElemAt: ["$User", 0],
                        }

                    },
                },
            ]).toArray()
            console.log(buss);
            if (buss) {
                resolve(buss)
            }
            else {
                reject()
            }
        })
    },
    Update_Isrequest_When_after_admin_accept: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(consts.busdetails).updateOne({ _id: objectId(id) },
                {
                    $set:
                    {
                        isaccept: true
                    }
                }).then(() => {
                    resolve()
                })
        })
    },
    Delete_Admin_REmoved_Busss: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.busdetails).deleteOne({ _id: objectId(id) }).then(() => {
                resolve()
            })
        })
    },
    Do_Checker_admin_Login: (info) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.adminbase).findOne({ name: info.name, password: info.password }).then((data) => {
                if (data) {
                    resolve(data)
                }
                else {
                    reject()
                }
            })
        })
    },
    View_Primary_Users: () => {
        return new Promise(async (resolve, reject) => {
            var users = await db.get().collection(consts.userdb).aggregate([
                {
                    $lookup:
                    {
                        from: consts.busdetails,
                        localField: "_id",
                        foreignField: "userId",
                        as: "businfo"
                    }
                },
                {
                    $project:
                    {
                        _id: 1,
                        name: 1,
                        email: 1,
                        ph: 1,
                        password: 1,
                        inactivate: 1,
                        emergencycount: 1,
                        businfo: 1

                    }
                },
            ]).toArray()
            //console.log(users);
            resolve(users)
        })
    },
    View_Secondary_Users: () => {
        return new Promise(async (resolve, reject) => {
            var users = await db.get().collection(consts.suserdb).find().toArray()
            console.log(users);
            resolve(users)
        })
    },
    View_all_Bus_DEtails: () => {
        return new Promise(async (resolve, reject) => {
            var buss = await db.get().collection(consts.busdetails).aggregate([
                {
                    $lookup:
                    {
                        from: consts.userdb,
                        localField: "userId",
                        foreignField: "_id",
                        as: "User",
                    }
                },
                {
                    $project: {
                        _id: 1,
                        bname: 1,
                        busnumber: 1,
                        stime: 1,
                        isreturn: 1,
                        retime: 1,
                        lino: 1,
                        max: 1,
                        price: 1,
                        numInputs: 1,
                        userId: 1,
                        isaccept: 1,
                        isbus: 1,
                        already: 1,
                        stops: 1,
                        available: 1,
                        sdate: 1,
                        edate: 1,
                        user:
                        {
                            $arrayElemAt: ["$User", 0],
                        }

                    },
                }
            ]).toArray()
            //console.log(buss);
            resolve(buss)
        })
    }, DEsable_inactivate_Option: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(consts.userdb).updateOne({ _id: objectId(id) },
                {
                    $set:
                    {
                        inactivate: false
                    }
                }).then(() => {
                    resolve()
                })
        })
    }, Enable_inactivate_Option: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(consts.userdb).updateOne({ _id: objectId(id) },
                {
                    $set:
                    {
                        inactivate: true
                    }
                }).then(() => {
                    resolve()
                })
        })
    },
    WenInactive_also_desable_Isaccept: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(consts.busdetails).updateMany({ userId: objectId(id) },
                {
                    $set:
                    {
                        isaccept: false
                    }
                }).then(() => resolve())
        })
    },
    Wenactive_also_enable_Isaccept: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(consts.busdetails).updateMany({ userId: objectId(id) },
                {
                    $set:
                    {
                        isaccept: true
                    }
                }).then(() => resolve())
        })
    },
    Get_Owner_bus_info_Basses_Own_Emergency: (uid) => {
        return new Promise(async (resolve, reject) => {
            var info = await db.get().collection(consts.busdetails).find({ userId: objectId(uid) }).toArray();
            resolve(info)
        })
    },
    Report_Problem_TO_Customer: (userid, busid, body) => {
        let today = new Date();

        // Convert to IST (Indian Standard Time)
        let options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
        let formatter = new Intl.DateTimeFormat('en-CA', options); // 'en-CA' for ISO 8601 format (YYYY-MM-DD)

        let formattedToday = formatter.format(today);

        return new Promise((resolve, reject) => {
            var state =
            {

                ...body,
                date: formattedToday
            }
            db.get().collection(consts.messageadminandowner).findOne({ ownerid: objectId(userid), busid: objectId(busid) }).then((info) => {
                if (info) {
                    db.get().collection(consts.messageadminandowner).updateOne({ ownerid: objectId(userid), busid: objectId(busid) },
                        {
                            $push: { message: state }
                        }).then(() => {
                            resolve()
                        })
                }
                else {
                    var first =
                    {
                        ownerid: objectId(userid),
                        busid: objectId(busid),
                        message: [state]
                    }
                    db.get().collection(consts.messageadminandowner).insertOne(first).then(() => {
                        resolve()
                    })
                }
            })
        })
    },
    Get_Messaging_wners: () => {
        return new Promise(async (resolve, reject) => {
            var chainfo = await db.get().collection(consts.chatwithadmin).aggregate([
                {
                    $lookup:
                    {
                        from: consts.userdb,
                        localField: "ownerid",
                        foreignField: "_id",
                        as: "User",
                    }
                },
                {
                    $project:
                    {
                        _id: 1,
                        ownerid: 1,
                        count: 1,
                        notify: 1,
                        message: 1,
                        iszerochat: true,
                        user: { $arrayElemAt: ["$User", 0] }
                    }
                }
            ]).toArray()
            console.log(chainfo);
            resolve(chainfo)
        })
    },
    Get_Single_Owner_cHats: (id) => {
        return new Promise(async (resolve, reject) => {
            var chatdetails = await db.get().collection(consts.chatwithadmin).aggregate([
                {
                    $match: { _id: objectId(id) }
                },
                {
                    $lookup:
                    {
                        from: consts.userdb,
                        localField: "ownerid",
                        foreignField: "_id",
                        as: "User",
                    }
                },
                {
                    $project:
                    {
                        _id: 1,
                        ownerid: 1,
                        count: 1,
                        notify: 1,
                        message: 1,
                        iszerochat: 1,
                        user: { $arrayElemAt: ["$User", 0] }
                    }
                }
            ]).toArray()
            resolve(chatdetails[0])
        })
    },
    Replay_Message_To_wner: (id, body) => {
        console.log(body);
        return new Promise(async (resolve, reject) => {
            var state =
            {
                chat: body,
                fromadmin: true
            }
            await db.get().collection(consts.chatwithadmin).updateOne({ _id: objectId(id) },
                {
                    $push:
                    {
                        message: state
                    }
                }).then(() => {
                    db.get().collection(consts.chatwithadmin).updateOne({ _id: objectId(id) },
                        {
                            $set:
                            {
                                notify: true
                            }
                        }).then(() => resolve())
                })
        })
    },
    Desable_NotificationCount: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(consts.chatwithadmin).updateOne({ _id: objectId(id) },
                {
                    $set:
                    {
                        count: 0,
                        iszerochat:false
                    }
                }).then(() => resolve())
        })
    },
}