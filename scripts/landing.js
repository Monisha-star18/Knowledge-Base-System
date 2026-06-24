
// function connect to the clean button in the sigup model 
//used to clear the form 

function clearSignUpForm() 
{

    $("#s-firstName, #s-lastName, #s-email, #s-dateOfBirth, #s-role,#s-userId, #s-bio, #s-password, #s-conformPassword")
        .val("").removeClass("is-valid is-invalid");

    $("input[name='gender']").prop("checked", false).removeClass("is-valid is-invalid");

    $("#sd-firstname, #sd-lastName, #sd-email, #sd-dateOfBirth, #sd-gender, #sd-role, #sd-userId, #sd-bio, #sd-password, #sd-conformPassword")
        .hide().text("");
}

$(document).ready(function(){








































































})