// import { API } from "./config.js";
const API = "http://localhost:3000";


let loggedUser = null;
let localArticles = []; 
let currentFilter = "all";

$(document).ready(async function () {

    // take the login user data 
    const userData = localStorage.getItem("loggedUser");
    loggedUser = JSON.parse(userData);


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
        const res = await fetch(`${API}/articles?authorId=${loggedUser.id}&isDeleted=false`);
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
                <div class="card-actions">
                    <button class="btn-card-edit" onclick="window.location.href='../pages/addArticle.html?id=${art.id}'">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button class="btn-card-delete" onclick="deleteArticle('${art.id}')">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>`;
        }

        const cardHtml = `
            <div class="article-card">
                <div class="card-img-wrap">
                    <img src="${art.image}" alt="Article cover" class="card-img">
                    <div class="card-status-pill">
                        ${statusBadge}
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-title">${art.title}</div>
                    <div class="card-sub">${art.subtitle}</div>
                    <div class="divider"></div>
                    <div class="card-meta-row d-flex flex-column">
                        <span class="card-meta-item">
                            <i class="fa-solid fa-calendar-days"></i> Submitted: ${art.createdAt}
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
                    ${footerRow}
                    ${actionButtons}
                </div>
            </div>`;
        container.prepend(cardHtml);
    });
}

//delect 
async function deleteArticle(id) 
{
    Swal.fire({ title: 'Delete Article?', text: 'This article will be removed from your dashboard.', icon: 'warning', showCancelButton: true })
        .then(async result => {
            if (result.isConfirmed) {
                await fetch(`${API}/articles/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isDeleted: true })
                });
                await fetchAndRenderArticles();
            }
        });
}

//restore 
async function restoreArticle() {

    const restoreContainer = $("#restoreModal-content");
    restoreContainer.empty();

    const restore = await fetch(`${API}/articles?authorId=${loggedUser.id}&isDeleted=true`);
    if (!restore.ok) throw new Error("Failed to load articles");
    localRestoreArticles = await restore.json();

    console.log(localRestoreArticles);
    localRestoreArticles.forEach(restoreArt => {

        const restoreCard = `
            <div class="container restoreSection">
                <div class="card p-3 mb-3">          
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <p class="mb-1 fw-semibold">Title : ${restoreArt.title}</p>
                            <small class="text-muted">Created date : ${restoreArt.createdAt}</small>
                        </div>                          
                        <div>
                            <button class="btn btn-danger rounded-pill restorSpecificArticle" data-id="${restoreArt.id}">Restore</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        restoreContainer.prepend(restoreCard);
    });
}


$(document).on("click", ".restorSpecificArticle",  function() {
    const restoreId = $(this).data("id");
    Swal.fire({ title: 'Restore Article?', text: 'This article will be restored.', showCancelButton: true })
        .then(async result => {
            if (result.isConfirmed) {
                await fetch(`${API}/articles/${restoreId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isDeleted: false })
                });
                await restoreArticle()
                await fetchAndRenderArticles();
            }
        });
    
});


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

