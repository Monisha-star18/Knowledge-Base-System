
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

function clearLoginForm()
{
    $("#l-userId,#l-password").val("").removeClass("is-valid is-invalid");
    $("ld-userId").hide().text("");
}

let emailExists = false;
let userIdExists = false;

const API = "http://localhost:3000";

// regex 
const nameRegex = /^[a-zA-Z\s]{3,30}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/

//function that dont allow empty date and allow only
function isDate(date, minYear, maxYear) 
{
  if (!date) return false; 

  const m = dateRegex.exec(date);
  if (!m) return false;

  const year = parseInt(m[1], 10);
  if (year < minYear || year > maxYear) return false;

  return true
}

$(document).ready(function()
{

    // validateInput is a general  function used to validation  
    function validateInput(element, desc, regex, emptyMsg, invalidMsg)
    {
        const value = $(element).val().trim();
        if (value === "") 
        {
            $(element).removeClass("is-valid").addClass("is-invalid");
            $(desc).show().text(emptyMsg);
            return false;
        }
        if (regex && !regex.test(value)) 
        {
            $(element).removeClass("is-valid").addClass("is-invalid");
            $(desc).show().text(invalidMsg);
            return false;
        }
        $(element).removeClass("is-invalid").addClass("is-valid");
        $(desc).hide().text("");
        return true;
    }

    //----------------sigup validation --------------------------
    //firstname
    $("#s-firstName").on('input',function()
    {
        validateInput(this,"#sd-firstname",nameRegex,"First Name is required", "First Name should be 3–50 letters")
    })

    //lastname
    $("#s-lastName").on('input',function()
    {
        validateInput(this,"#sd-lastName",nameRegex,"Last Name is required", "Last Name should be 3–50 letters")
    })

    // Email
    $("#s-email").on('input', function () 
    {
        validateInput(this, "#sd-email", emailRegex, "Email is required", "Enter a valid email address");
    });

    // User ID
    $("#s-userId") .on('input',function(){validateInput("#s-userId","#sd-userId",null,"User ID is required")}) 

    let userIdTimer;
    $("#s-userId").on("input", function () 
    {
        const element = this;
        const userId = $(this).val().trim();

        if (!userId) return;

        clearTimeout(userIdTimer);
        userIdTimer = setTimeout(async function () {
            const res = await fetch(`${API}/users?userId=${userId}`);
            const data = await res.json();

            if (data.length > 0) {
                userIdExists = true;
                $(element).removeClass("is-valid").addClass("is-invalid");
                $("#sd-userId").show().text("User ID already exists");
            } else {
                userIdExists = false;
                $(element).removeClass("is-invalid").addClass("is-valid");
                $("#sd-userId").hide().text("");
            }
        }, 500);
    });
    


    //date using the isdate function mention at top 
    $("#s-dateOfBirth").on("change", function ()
    {
        if (!isDate($(this).val(), 1946, 2008))
        {
            $(this).removeClass("is-valid").addClass("is-invalid");
            $("#sd-dateOfBirth").show().text("Enter a valid Date of Birth age should be around 18-80");
            return;
        }

        $(this).removeClass("is-invalid").addClass("is-valid");
        $("#sd-dateOfBirth").hide().text("");
    });


    //gender
    function isGenderSelected()
    {
        return $("input[name='gender']:checked").length > 0;
    }

    $("input[name='gender']").on("change", function ()
    {
        if ($("input[name='gender']:checked").length > 0)
        {
            $("#sd-gender").hide().text("");
            $("input[name='gender']").removeClass("is-invalid");
        }
    });


    //role
    $("#s-role").on("change", function ()
    {
        validateInput(this, "#sd-role", null, "Please select a role");
    });

    //bio
    $("#s-bio").on("input", function () 
    {
        validateInput(this, "#sd-bio", null, "Bio is required");
    });

    //passowrd
    $("#s-password").on('input',function()
    {
        validateInput(this,"#sd-password",passwordRegex,"Password is required",
            "8–15 chars with uppercase, lowercase, digit and special character")
        validateConfirmPassword()

    })

    //conformpassowrd
    $("#s-conformPassword").on('input',function(){ validateConfirmPassword() })

    //the function that check on conform passowrd 
    function validateConfirmPassword() 
    {
        const passwrd = $("#s-password").val().trim();
        const confirm = $("#s-conformPassword").val().trim();

        if (confirm === "") 
        {
            $("#s-conformPassword").removeClass("is-valid").addClass("is-invalid");
            $("#sd-conformPassword").show().text("Please confirm your password");
            return false;
        }

        if (confirm !== passwrd) 
        {
            $("#s-conformPassword").removeClass("is-valid").addClass("is-invalid");
            $("#sd-conformPassword").show().text("Passwords do not match");
            return false;
        }

        $("#s-conformPassword").removeClass("is-invalid").addClass("is-valid");
        $("#sd-conformPassword").hide().text("");
        return true;
    }

    $("#register").on("click", async function (e) 
    {
        e.preventDefault();

        // Gender validation
        const genderValid = isGenderSelected();
        if (!genderValid) 
        {
            $("input[name='gender']").addClass("is-invalid");
            $("#sd-gender").show().text("Please select a gender");
        } 
        else 
        {
            $("input[name='gender']").removeClass("is-invalid").addClass("is-valid");
            $("#sd-gender").hide().text("");
        }

        //date
        const dobValid = isDate($("#s-dateOfBirth").val(), 1946, 2008);

        if (!dobValid)
        {
            $("#s-dateOfBirth").addClass("is-invalid");
            $("#sd-dateOfBirth").show().text("Please enter a valid Date of Birth");
        }
                

        // Run all field validations
        const allValid = [
            validateInput("#s-firstName","#sd-firstname", nameRegex,"First Name is required","First Name should be 3–50 letters"),
            validateInput("#s-lastName",     "#sd-lastName",         nameRegex,     "Last Name is required",    "Last Name should be 3–50 letters"),
            validateInput("#s-email",           "#sd-email",            emailRegex,    "Email is required",        "Enter a valid email address"),
            validateInput("#s-password",       "#sd-password",         passwordRegex, "Password is required",     "8–15 chars with uppercase, lowercase, digit and special character"),
            validateInput("#s-role",            "#sd-role",             null,          "Please select a role"),
            validateInput("#s-bio",             "#sd-bio",              null,          "Bio is required"),
            validateInput("#s-userId","#sd-userId",null,"User ID is required"),
            validateConfirmPassword(),
            isGenderSelected(),
            isDate($("#s-dateOfBirth").val(), 1946, 2008)
        ];


        if (allValid.includes(false)) {
            Swal.fire({ icon: "warning", title: "Please fill all fields correctly" });
            return;
        }

        const email  = $("#s-email").val().trim();
        const userId = $("#s-userId").val().trim();

        try {
            // Check email duplicate
            const emailRes  = await fetch(`${API}/users?email=${email}`);
            const emailData = await emailRes.json();
            if (emailData.length > 0) {
                emailExists = true;
                $("#s-email").removeClass("is-valid").addClass("is-invalid");
                $("#sd-email").show().text("Email already registered");
                Swal.fire({ icon: "error", title: "Email already registered" });
                return;
            }

            // Check userId duplicate
            const userIdRes  = await fetch(`${API}/users?userId=${userId}`);
            const userIdData = await userIdRes.json();
            if (userIdData.length > 0) {
                userIdExists = true;
                $("#s-userId").removeClass("is-valid").addClass("is-invalid");
                $("#sd-userId").show().text("User ID already exists");
                Swal.fire({ icon: "error", title: "User ID already exists" });
                return;
            }

            // Build user object
            const userData = {
                firstName:   $("#s-firstName").val().trim(),
                lastName:    $("#s-lastName").val().trim(),
                email:       email,
                userId:      userId,
                password:    $("#s-password").val().trim(),
                dateOfBirth: $("#s-dateOfBirth").val(),
                gender:      $("input[name='gender']:checked").val(),
                role:        $("#s-role").val(),
                bio:         $("#s-bio").val().trim(),
                createdDate: new Date().toISOString()
            };

            // POST to API
            const saveRes = await fetch(`${API}/users`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(userData)
            });

            if (!saveRes.ok) {
                Swal.fire({ icon: "error", title: "Error", text: "Could not create account. Please try again." });
                return;
            }

            clearSignUpForm();

            await Swal.fire({ icon: "success", title: "Successfully signed up!", text: "You can now log in." })
            .then(() => {
                    const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
                    loginModal.show();
                });

            // Close sign-up modal, open login modal
            const signUpModal = bootstrap.Modal.getInstance(document.getElementById("signUpModal"));
            if (signUpModal) signUpModal.hide();
            new bootstrap.Modal(document.getElementById("loginModal")).show();

        } catch (err) {
            // console.error("Sign-up error:", err);
            Swal.fire({ icon: "error", title: "Cannot connect to server", text: "Please try again later." });
        }
    });

        //----------------login validation --------------------------

        // $("#l-userId") .on('input',function(){validateInput("#l-userId","ld-userId",null,"User ID is required")}) 

        // let userIdTimer;

        // $("#l-userId").on("input", function ()
        // {
        //     const element = this;
        //     const userId = $(this).val().trim();

        //     if (!userId)
        //     {
        //         $(element).removeClass("is-valid").addClass("is-invalid");
        //         $("#ld-userId").show().text("User ID is required");
        //         return;
        //     }

        //     clearTimeout(userIdTimer);

        //     userIdTimer = setTimeout(async function ()
        //     {
        //         const res = await fetch(`${API}/users?userId=${userId}`);
        //         const data = await res.json();

        //         if (data.length > 0)
        //         {
        //             // User exists -> Valid Login ID
        //             $(element).removeClass("is-invalid").addClass("is-valid");
        //             $("#ld-userId").hide().text("");
        //         }
        //         else
        //         {
        //             // User does not exist
        //             $(element).removeClass("is-valid").addClass("is-invalid");
        //             $("#ld-userId").show().text("User ID not found");
        //         }
        //     }, 500);
        // });

        $("#loginBtn").on("click", async function (e)
        {
            e.preventDefault();

            const userId = $("#l-userId").val().trim();
            const password = $("#l-password").val().trim();

            if (!userId || !password)
            {
                Swal.fire({
                    icon: "warning",
                    title: "Please enter User ID and Password"
                });
                return;
            }

            try
            {
                const result = await fetch(`${API}/users?userId=${userId}`);
                const users = await result.json();

                if (users.length === 0)
                {
                    Swal.fire({icon: "error",title: "User ID Not Found"});
                    return;
                }

                const user = users[0];

                if (user.password !== password)
                {
                    Swal.fire({icon: "error",title: "Incorrect Password"});
                    return;
                }

                // Store logged-in user (without password)
                const { password: _pw, ...safeUser } = user;
                localStorage.setItem("loggedUser", JSON.stringify(safeUser));

                await Swal.fire({icon: "success",title: "Login Successful!",text: `Welcome, ${user.firstName}!`,timer: 1500,showConfirmButton: false})
                .then(()=>
                {
                    // Redirect based on role
                    if (user.role === "Reader")
                    {
                        window.location.href = "../pages/userDashboard.html";
                    }
                    else if (user.role === "Author")
                    {
                        window.location.href = "../pages/authorDashboard.html";
                    }
                    else if (user.role === "Admin")
                    {
                        window.location.href = "../pages/adminDashboard.html";
                    }
                    // else
                    // {
                    //     Swal.fire({icon: "error",title: "Invalid Role Assigned"});
                    // }

                })

                
            }
            catch (err)
            {
                console.error("Login error:", err);

                Swal.fire({icon: "error",title: "Cannot connect to server"
                });
            }
        });













    












   


    









































































})