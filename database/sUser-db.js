const Promise = require('promise');
const bcrypt = require('bcryptjs');
const db = require('../connection/connect');
const consts = require('../connection/consts');
var objectId = require('mongodb').ObjectId;

module.exports =
{
    Do_Secondary_user_signup: (info) => {
        console.log(info);
        return new Promise(async (resolve, reject) => {
            info.password = await bcrypt.hash(info.password, 10);
            console.log(info);
            db.get().collection(consts.suserdb).insertOne(info).then((data) => {
                resolve(data.ops[0]._id)
            })
        })
    },
    Do_Secondary_User_Login: (info) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.suserdb).findOne({ email: info.email }).then((data) => {
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
    Find_Matching_Busess_Search_With_Placess: (info) => {
        return new Promise(async (resolve, reject) => {
            var bus = await db.get().collection(consts.busdetails).aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: {
                                                        $reduce: {
                                                            input: "$stops",
                                                            initialValue: [],
                                                            in: { $concatArrays: ["$$value", { $objectToArray: "$$this" }] }
                                                        }
                                                    },
                                                    cond: { $eq: ["$$this.v", info.from] }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                },
                                {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: {
                                                        $reduce: {
                                                            input: "$stops",
                                                            initialValue: [],
                                                            in: { $concatArrays: ["$$value", { $objectToArray: "$$this" }] }
                                                        }
                                                    },
                                                    cond: { $eq: ["$$this.v", info.to] }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                }
                            ]
                        }
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
                        stops: 1
                    }
                }
            ]).toArray();
            //console.log(bus);

            resolve(bus)

        })
    },
    Get_Buse_info_Whe_User_Chose_a_BUS: (id, userid) => {
        return new Promise(async (resolve, reject) => {
            var businfo = await db.get().collection(consts.busdetails).aggregate([
                {
                    $match:
                    {
                        _id: objectId(id),
                        userId: objectId(userid)
                    }
                },
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
                        available:1,
                        user:
                        {
                            $arrayElemAt: ["$User", 0],
                        }

                    },
                },
            ]).toArray()
            console.log(businfo);
            resolve(businfo)
        })
    }
}