
const API = "http://localhost:3000";
let loggedUser = null;
let localArticles = []; 
let currentFilter = "all";

$(document).ready(async function () {

    // take the login user data 
    const userData = localStorage.getItem("loggedUser");
    loggedUser = JSON.parse(userData);
    console.log(loggedUser)


    // 2. fill Navbar & Profile Sidebar
    setupProfile();

    // fill Profile Sidebar Fields using the login deatils 
    function setupProfile() 
    {

        const fullName = `${loggedUser.firstName} ${loggedUser.lastName}`;
        $("#nav-username").text(fullName);

        $("#Name").text(fullName);
        $("#Role").text(loggedUser.role);
        $("#UserId").text(loggedUser.userId);
        $("#Bio").text(loggedUser.bio || "No bio available.");
        $("#Email").text(loggedUser.email);
        
        const dob = new Date(loggedUser.dateOfBirth).toLocaleDateString();
        $("#Dob").text(dob);

        $("#Gender").text(loggedUser.gender);

        const joined = new Date(loggedUser.createdDate).toLocaleDateString();
        $("#Joined").text(joined);
    }

    // 3. Initial fetch and render
    await fetchAndRenderArticles();

    // 4. Setup Filters
    $("#filters .btn").on("click", function () {
        $("#filters .btn").removeClass("active");
        $(this).addClass("active");

        const id = $(this).attr("id");
        if (id === "all-btn") currentFilter = "all";
        if (id === "approved-btn") currentFilter = "approved";
        if (id === "pending-btn") currentFilter = "pending";
        if (id === "rejected-btn") currentFilter = "rejected";

        renderCards();
    });

    // 5. Setup Search
    $("#searchInput").on("input", function () {
        renderCards();
    });
});



// Fetch articles written by this specific author
async function fetchAndRenderArticles() {
    try {
        const res = await fetch(`${API}/articles?isDeleted=false&status=approved`);
        if (!res.ok) throw new Error("Failed to load articles");
        localArticles = await res.json();
        renderCards();
        
    } catch (err) {
        console.error(err);
        Swal.fire({ icon: "error", title: "Error loading dashboard feed." });
    }
}

// Dynamically generate layout cards based on filter and search rules
function renderCards() {
    const container = $("#cards-container");
    container.empty();

    const searchVal = $("#searchInput").val().toLowerCase().trim();

    // Filter array
    let filtered = localArticles.filter(art => {
        const notDeleted  = !art.isDeleted
        const matchesFilter = (currentFilter === "all" || art.status === currentFilter);
        const matchesSearch = art.title.toLowerCase().includes(searchVal) || 
                              art.subtitle.toLowerCase().includes(searchVal) || 
                              art.category.toLowerCase().includes(searchVal);
        return notDeleted && matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
        container.append(`<div class="text-center text-muted my-5 w-100">No articles found matching the criteria.</div>`);
        return;
    }

    // Loop & append items
    filtered.forEach(art => {
        let statusBadge = "";
        let footerRow = "";
        let actionButtons = "";

        if (art.status === "approved") {
            statusBadge = `<span class="badge-approved">✓ Approved</span>`;
            footerRow = `<div class="card-date-row approved"><i class="fa-solid fa-circle-check"></i> Approved on: ${art.reviewDate}</div>`;
        } else if (art.status === "rejected") {
            statusBadge = `<span class="badge-rejected">✕ Rejected</span>`;
            footerRow = `<div class="card-date-row rejected"><i class="fa-solid fa-circle-xmark"></i> Rejected on: ${art.reviewDate}</div>`;
        } else {
            statusBadge = `<span class="badge-pending">⏳ Pending</span>`;
            footerRow = `<div class="card-date-row"><i class="fa-regular fa-clock"></i> Awaiting review</div>`;
            actionButtons = `
                // <div class="card-actions">
                //     <button class="btn-card-edit" onclick="window.location.href='../pages/addArticle.html?id=${art.id}'">
                //         <i class="fa-solid fa-pen"></i> Accept
                //     </button>
                //     <button class="btn-card-delete" onclick="deleteArticle('${art.id}')">
                //         <i class="fa-solid fa-trash"></i> Reject
                //     </button>
                // </div>`;
        }

        const cardHtml = `
            <div class="article-card">
                <div class="card-img-wrap">
                    <img src="${art.image}" alt="Article cover" class="card-img">
                    
                </div>
                <div class="card-body">
                    <div class="card-title">${art.title}</div>
                    <div class="card-sub">${art.subtitle}</div>
                    <div class="divider"></div>
                    <div class="card-meta-row d-flex flex-column">
                        <span class="card-meta-item">
                            <i class="fa-solid fa-calendar-days"></i> Posted on : ${art.createdAt}
                        </span>
                        <!-- ternarany operator used to check if  updatedAt these else dont display -->
                        ${art.updatedAt ? `
                        <span class="card-meta-item">
                            <i class="fa-solid fa-calendar-days"></i> Updated: ${art.updatedAt}
                        </span>` : ''}
                        <span class="card-meta-item">
                            <i class="fa-solid fa-tag"></i> ${art.category.charAt(0).toUpperCase() + art.category.slice(1)}
                        </span>
                    </div>
                   
                    ${actionButtons}
                </div>
            </div>`;
        container.prepend(cardHtml);
    });
}



// Logout execution 
function handleLogout()
{
    Swal.fire({title: 'LogOut',text:'Do you want to Log out',icon: 'warning',showCancelButton: true})
        .then(result => 
        {
            if (result.isConfirmed) {
                localStorage.removeItem("loggedUser");
                window.location.href = "../pages/index.html";
            }
        });
}

