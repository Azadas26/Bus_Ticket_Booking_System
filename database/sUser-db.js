const Promise = require('promise');
const bcrypt = require('bcryptjs');
const db = require('../connection/connect');
const consts = require('../connection/consts');
var objectId = require('mongodb').ObjectId;
var Razorpay = require('razorpay');
var instance = new Razorpay({
    key_id: 'rzp_test_NVSZaOyVAMHDJW',
    key_secret: '6A9u2YGlYT7tbBTdibTbL9bq',
});



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
                        available: 1,
                        sdate: 1,
                        edate: 1,
                        dis: 1,
                        pri: 1,
                        dateArray: 1,
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
    },
    Insert_Secndary_User_Payment_Details: (info) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.busorder).insertOne(info).then((resc) => {
                resolve(resc.ops[0]._id);
            })
        })
    },
    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: orderId
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                }
                else {
                    //console.log(order);
                    resolve(order);
                }
            });
        })
    },
    verify_Payment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require("crypto");
            const hmac = crypto.createHmac('sha256', '6A9u2YGlYT7tbBTdibTbL9bq');
            hmac.update(details['payment[razorpay_order_id]'] + "|" + details['payment[razorpay_payment_id]']);
            let generatedSignature = hmac.digest('hex');

            if (generatedSignature == details['payment[razorpay_signature]']) {
                console.log(" checked");

                resolve()
            }
            else {
                reject()
            }
        })
    },
    Update_available_Seats_When_User_paceed_ticket: (busid, tkno, id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.busdetails).findOne({ _id: objectId(busid) }).then(async (data) => {
                var availableis = data.available;
                await db.get().collection(consts.busdetails).updateOne({ _id: objectId(busid) },
                    {
                        $set:
                        {
                            available: availableis - tkno
                        }
                    }).then(async () => {
                        await db.get().collection(consts.busorder).updateOne({ _id: objectId(id) },
                            {
                                $set:
                                {
                                    pay: true
                                }
                            }).then(() => {
                                resolve()
                            })

                    })
            })
        })
    },
    Show_Users_Purchased_Tickets: (userid) => {
        return new Promise((resolve, reject) => {
            var tickets = db.get().collection(consts.busorder).aggregate([
                {
                    $match:
                        { suserid: objectId(userid) }
                },
                {
                    $lookup: {
                        from: consts.busdetails,
                        localField: "id",
                        foreignField: "_id",
                        as: "Bus",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        tkno: 1,
                        id: 1,
                        preferredDates: 1,
                        total: 1,
                        start: 1,
                        end: 1,
                        suserid: 1,
                        isvalidated: 1,
                        date: 1,
                        pay: 1,
                        expired: 1,
                        emergency: 1,
                        Bus:
                        {
                            $arrayElemAt: ["$Bus", 0],
                        }

                    },
                },
            ]).toArray();
            resolve(tickets)
        })
    },
    Delete_Verified_Ticket_after_The_Verifyed_Day: (id, userid) => {
        return new Promise((resolve, reject) => {
            console.log(id, "uuu", userid);
            db.get().collection(consts.busorder).deleteOne({ _id: objectId(id), suserid: objectId(userid) }).then((resc) => {
                resolve(resc)
            })
        })
    },
    UpDAte_EXPIRE_oBject: (id, userid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.busorder).updateOne({ _id: objectId(id), suserid: objectId(userid) },
                {
                    $set:
                    {
                        expired: true
                    }
                }).then((resc) => {
                    resolve(resc)
                })
        })
    },
    Remove_Expired_Ticket: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.busorder).deleteOne({ _id: objectId(id) }).then(() => {
                resolve()
            })
        })
    },
    Compair_Prefered_Date_Ticket_Availabilitys: (id, date) => {
        return new Promise(async (resolve, reject) => {
            var info = await db.get().collection(consts.busorder).find({ id: objectId(id), preferredDates: date }).toArray()

            var count = 0;
            if (info.length > 0) {
                info.map((i) => {
                    count = count + parseInt(i.tkno);
                })
            }
            console.log(count);
            resolve(count)
        })
    },
    Check_Is_anY_nOtification_Coming_Or_not: (userid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.busorder).findOne({ suserid: objectId(userid), isnotify: true }).then((notfy) => {
                resolve(notfy)
            })
        })
    },
    Update_Notfy_object_When_User_Viewed: (userid) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(consts.busorder).updateOne({ suserid: objectId(userid), emergency: true, isnotify: true },
                {
                    $set:
                    {
                        isnotify: false
                    }
                }).then(() => {
                    resolve()
                })
        })
    },
    Get_Notification_InformationBy_Emergency: (userid) => {
        return new Promise(async (resolve, reject) => {
            var notfy = await db.get().collection(consts.busorder).aggregate([
                {
                    $match:
                    {
                        suserid: objectId(userid),
                        emergency: true
                    }
                },
                {
                    $lookup:
                    {
                        from: consts.busdetails,
                        localField: "id",
                        foreignField: "_id",
                        as: "bus",
                    }
                },
                {
                    $project:
                    {
                        tkno: 1,
                        total: 1,
                        start: 1,
                        end: 1,
                        preferredDates: 1,
                        date: 1,
                        emdescription: 1,
                        one: 1,
                        two: 1,
                        bus:
                        {
                            $arrayElemAt: ["$bus", 0],
                        }
                    }
                }
            ]).toArray()
            //console.log(notfy);
            resolve(notfy)
        })
    },
    TO_Get_How_Many_Credit_Score_User_HAVE: (id) => {
        return new Promise(async (resolve, reject) => {
            var starts = await db.get().collection(consts.busorder).find({ suserid: objectId(id), emergency: true }).toArray()
            var sum = 0;
            await starts.map(i => { sum += parseInt(i.total) })
            resolve(sum)
        })
    },
    ChecK_whethet_THE_Email_Already_Existing_or_Not: (email) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.suserdb).findOne({ email }).then((email) => {
                if (email) {
                    resolve()
                } else {
                    reject()
                }
            })
        })
    },
    Get_all_Stopname_For_Simplefing_searcH: () => {
        return new Promise((resolve,reject)=>
        {
            db.get().collection(consts.busdetails).find().toArray().then((stops)=>
            {
                resolve(stops)
            })
        })
    }
}