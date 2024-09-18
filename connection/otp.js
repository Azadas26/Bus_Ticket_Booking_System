const promise = require('promise');

module.exports =
{
    otp_generation_for_User_Authentication: () => {
        return new promise((resolve, reject) => {
            const digits = "0123456789";
            let OTP = "";
            for (let i = 0; i < 6; i++) {
                OTP += digits[Math.floor(Math.random() * 10)];
            }
            //console.log(OTP);
            resolve(OTP)
        })

    }
}