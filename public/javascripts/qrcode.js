const qr = require('qrcode');
var promise = require('promise')
const fs = require('fs');
const path = require('path');
module.exports =
{
    GenerateOrder_Qr_Code: (Id) => {

        return new promise((resolve, reject) => {

            console.log("function")
            // Data to be encoded in the QR code

            // Data to be encoded in the QR code
            let local =  'http://localhost:3000'
            let ngrock = 'https://3c32-103-149-158-207.ngrok-free.app'
            const data = `${local}/checker/busticket?id=${Id}`; // Replace with your own data

            // Options for generating the QR code
            const options = {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                quality: 0.92,
                margin: 1,
                color: {
                    dark: '#000',
                    light: '#FFF',
                },
            };

            // Define the folder path and the pathname
            const folderPath = path.join(__dirname, 'qrcodes'); // Change 'qr_codes' to your desired folder name
            const imageName = Id+'.png'; // Change the image name if desired

            // Ensure the folder exists, or create it
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }

            // Generate the QR code and save it to the specified folder with the custom image name
            qr.toFile(path.join(folderPath, imageName), data, options, (error) => {
                if (error) {
                    console.error('Error generating QR code:', error);
                    resolve(error)
                } else {
                    console.log('QR code generated and saved successfully!');
                    resolve("Success")
                }
            });


        })

    }
}