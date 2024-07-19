
$(document).ready(() => {
    // Add a custom validation method for the name field
    $.validator.addMethod(
        "startsWithLetter",
        function (value, element) {
            return this.optional(element) || /^[A-Za-z]/.test(value);
        },
        "Name must start with a letter."
    );

    // Initialize the validation for your form
    $("#prform").validate({
        rules: {
            bname: {
                required: true,
                minlength: 5,
                maxlength: 10,
            },
            busnumber:
            {
                required: true
            }
        },
    });

    $("#pusersignup").validate({
        rules: {
            name: {
                startsWithLetter: true,
                required: true,
                minlength: 5,
                maxlength: 10,
            },
            email:
            {
                required: true
            },
            ph:
            {
                required: true,
                minlength: 10,
                maxlength: 10,
            },
            password:
            {
                required: true,
            }
        },
    });

    $("#emergencyform").validate({
        rules: {
            date:
            {
                required: true
            },
            description:
            {
                required: true,
            }
        },
    });


    $("#suserssignupform").validate({
        rules: {
            name: {
                startsWithLetter: true,
                required: true,
                minlength: 5,
                maxlength: 10,
            },
            email:
            {
                required: true
            },
            password:
            {
                required: true,
            }
        },
    });

});
