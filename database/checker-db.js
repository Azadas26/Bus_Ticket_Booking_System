const Promise = require('promise');
const bcrypt = require('bcryptjs');
const db = require('../connection/connect');
const consts = require('../connection/consts');
var objectId = require('mongodb').ObjectId;

module.exports =
{
    Do_Checker_User_Login: (info) => {
        console.log(info);
        return new Promise((resolve, reject) => {
            db.get().collection(consts.checkerbase).findOne({ uname: info.name }).then((data) => {
                if (data) {
                    bcrypt.compare(info.password, data.password).then((iscoorect) => {
                        if (iscoorect) {
                            console.log("Hoii");
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
    Qr_Code_scann_and_Verify_User_BUS_ticket: (tkid, userid) => {
        return new Promise(async (resolve, reject) => {
            var details = await db.get().collection(consts.busorder).aggregate([
                {
                    $match:
                        { _id: objectId(tkid), puser: objectId(userid) }
                },
                {
                    $lookup: {
                        from: consts.suserdb,
                        localField: "suserid",
                        foreignField: "_id",
                        as: "suser",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        tkno: 1,
                        puser: 1,
                        id: 1,
                        preferredDates: 1,
                        total: 1,
                        start: 1,
                        end: 1,
                        suserid: 1,
                        isvalidated: 1,
                        date: 1,
                        suser:
                        {
                            $arrayElemAt: ["$suser", 0],
                        }

                    },
                },
                {
                    $lookup: {
                        from: consts.userdb,
                        localField: "puser",
                        foreignField: "_id",
                        as: "primaryuser",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        tkno: 1,
                        puser: 1,
                        id: 1,
                        preferredDates: 1,
                        total: 1,
                        start: 1,
                        end: 1,
                        suserid: 1,
                        isvalidated: 1,
                        date: 1,
                        suser: 1,
                        primaryuser:
                        {
                            $arrayElemAt: ["$primaryuser", 0],
                        }

                    },
                },
                {
                    $lookup: {
                        from: consts.busdetails,
                        localField: "id",
                        foreignField: "_id",
                        as: "businfo",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        tkno: 1,
                        puser: 1,
                        id: 1,
                        preferredDates: 1,
                        total: 1,
                        start: 1,
                        end: 1,
                        suserid: 1,
                        isvalidated: 1,
                        date: 1,
                        suser: 1,
                        primaryuser: 1,
                        businfo:
                        {
                            $arrayElemAt: ["$businfo", 0],
                        }

                    },
                },
            ]).toArray()
            console.log(details);

            resolve(details)

        })
    },
    Ticket_Verification_AND_Change_Verifyed_STAte: (id,date) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.busorder).updateOne({ _id: objectId(id) },
                {
                    $set:
                    {
                        isvalidated: true,
                        preferredDates : date
                    }
                }).then(() => {
                    resolve()
                })
        })
    },
    Get_all_Verified_Bus_ticket_TO_Shoe_History: (id) => {
        return new Promise(async(resolve,reject)=>
        {
            var details = await db.get().collection(consts.busorder).aggregate([
                {
                    $match:
                        { puser: objectId(id),isvalidated:true }
                },
                {
                    $lookup: {
                        from: consts.suserdb,
                        localField: "suserid",
                        foreignField: "_id",
                        as: "suser",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        tkno: 1,
                        puser: 1,
                        id: 1,
                        preferredDates: 1,
                        total: 1,
                        start: 1,
                        end: 1,
                        suserid: 1,
                        isvalidated: 1,
                        date: 1,
                        suser:
                        {
                            $arrayElemAt: ["$suser", 0],
                        }

                    },
                },
                {
                    $lookup: {
                        from: consts.userdb,
                        localField: "puser",
                        foreignField: "_id",
                        as: "primaryuser",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        tkno: 1,
                        puser: 1,
                        id: 1,
                        preferredDates: 1,
                        total: 1,
                        start: 1,
                        end: 1,
                        suserid: 1,
                        isvalidated: 1,
                        date: 1,
                        suser: 1,
                        primaryuser:
                        {
                            $arrayElemAt: ["$primaryuser", 0],
                        }

                    },
                },
                {
                    $lookup: {
                        from: consts.busdetails,
                        localField: "id",
                        foreignField: "_id",
                        as: "businfo",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        tkno: 1,
                        puser: 1,
                        id: 1,
                        preferredDates: 1,
                        total: 1,
                        start: 1,
                        end: 1,
                        suserid: 1,
                        isvalidated: 1,
                        date: 1,
                        suser: 1,
                        primaryuser: 1,
                        businfo:
                        {
                            $arrayElemAt: ["$businfo", 0],
                        }

                    },
                },
            ]).toArray()
            console.log(details);
            
            resolve(details)

        })
    }
}