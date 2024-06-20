
$("#buspay").submit((e) => {
    e.preventDefault()
    $.ajax({
        url: '/suser/buspay',
        method: 'post',
        data: $('#buspay').serialize(),
        success: (response) => {
            //alert(response)
            

        }
    })
})
