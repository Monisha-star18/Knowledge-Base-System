// Base URL of the JSON Server API.
const API = "http://localhost:3000";

// Populates the user profile information on the page.
function setupProfile(loggedUser) 
{
    const fullName = `${loggedUser.firstName} ${loggedUser.lastName}`;
    $("#nav-username").text(fullName);
    $("#Name").text(fullName);
    $("#Role").text(loggedUser.role);
    $("#UserId").text(loggedUser.userId);
    $("#Bio").text(loggedUser.bio || "No bio available.");
    $("#Email").text(loggedUser.email);
    $("#Dob").text(new Date(loggedUser.dateOfBirth).toLocaleDateString());
    $("#Gender").text(loggedUser.gender);
    $("#Joined").text(new Date(loggedUser.createdDate).toLocaleDateString());
}

// Displays a logout confirmation dialog.
function handleLogout() 
{
    Swal.fire({ title: 'LogOut', text: 'Do you want to Log out', icon: 'warning', showCancelButton: true })
        .then(result => {
            if (result.isConfirmed) 
            {
                localStorage.removeItem("loggedUser");
                window.location.href = "../pages/index.html";
            }
        });
}