
$("#buspay").submit((e) => {
    e.preventDefault()
    $.ajax({
        url: '/suser/buspay',
        method: 'post',
        data: $('#buspay').serialize(),
        success: (response) => {
            console.log(response);
            if (response.status) {
                razorpayPayment(response)
            }
            else
            {

            }
        }
    })
})


function razorpayPayment(order) {
    var options = {
        "key": "rzp_test_NVSZaOyVAMHDJW", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Ticket_Validation",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the previous step
        "handler": function (response) {


            verfyPayment(response, order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}


function verfyPayment(payment, order) {

    $.ajax({
        url: '/suser/verfy-pay',
        data: {
            payment,
            order
        },
        method: 'post',
        success: (response) => {

            if (response.status) {
                location.href = '/suser/viewtickets'
            }
            else {
                alert("Payment Faild...")
            }
        }


    })
}


