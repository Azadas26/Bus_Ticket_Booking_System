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
            var users = await db.get().collection(consts.userdb).find().toArray()
            console.log(users);
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
        return new Promise(async(resolve,reject)=>
        {
            var info = await db.get().collection(consts.busdetails).find({userId:objectId(uid)}).toArray();
            resolve(info)
        })
    }
}