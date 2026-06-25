// document.querySelectorAll('#filters .btn').forEach(btn => {
//     btn.addEventListener('click', function () {
//         document.querySelectorAll('#filters .btn').forEach(b => b.classList.remove('active'));
//         this.classList.add('active');
//     });
// });

const API = "http://localhost:3000";
let loggedUser = null;
let localArticles = []; // Stores current active articles fetched from db
let currentFilter = "all";

$(document).ready(async function () {
    // 1. Guard check: Ensure user is logged in and is an Author
    const userData = localStorage.getItem("loggedUser");
    if (!userData) {
        window.location.href = "landing.html"; // Adjust to your landing page path
        return;
    }
    loggedUser = JSON.parse(userData);

    if (loggedUser.role !== "Author") {
        window.location.href = "landing.html";
        return;
    }

    // 2. Populate Navbar & Profile Sidebar
    setupProfile();

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

// Populate Profile Sidebar Fields
function setupProfile() {
    $("#nav-username").text(`${loggedUser.firstName} ${loggedUser.lastName}`);
    $("#oc-name").text(`${loggedUser.firstName} ${loggedUser.lastName}`);
    $("#oc-dept").text(loggedUser.role);
    $("#oc-email").val(loggedUser.email);
    $("#oc-empid").val(loggedUser.userId || "—");
    $("#oc-designation").val("Content Creator");
    $("#oc-projectid").val(loggedUser.id || "—");
}

// Fetch articles written by this specific author
async function fetchAndRenderArticles() {
    try {
        const res = await fetch(`${API}/articles?authorId=${loggedUser.id}`);
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
        const matchesFilter = (currentFilter === "all" || art.status === currentFilter);
        const matchesSearch = art.title.toLowerCase().includes(searchVal) || 
                              art.subtitle.toLowerCase().includes(searchVal) || 
                              art.category.toLowerCase().includes(searchVal);
        return matchesFilter && matchesSearch;
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
            footerRow = `<div class="card-date-row approved"><i class="fa-solid fa-circle-check"></i> Approved on: ${art.createdAt}</div>`;
        } else if (art.status === "rejected") {
            statusBadge = `<span class="badge-rejected">✕ Rejected</span>`;
            footerRow = `<div class="card-date-row rejected"><i class="fa-solid fa-circle-xmark"></i> Rejected on: ${art.createdAt}</div>`;
        } else {
            statusBadge = `<span class="badge-pending">⏳ Pending</span>`;
            footerRow = `<div class="card-date-row"><i class="fa-regular fa-clock"></i> Awaiting review</div>`;
            actionButtons = `
                <div class="card-actions">
                    <button class="btn-card-edit" style="opacity:0.6; cursor:not-allowed;" disabled><i class="fa-solid fa-pen"></i> Edit</button>
                    <button class="btn-card-delete" style="opacity:0.6; cursor:not-allowed;" disabled><i class="fa-solid fa-trash"></i> Delete</button>
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
                        <span class="card-meta-item">
                            <i class="fa-solid fa-tag"></i> ${art.category.charAt(0).toUpperCase() + art.category.slice(1)}
                        </span>
                    </div>
                    ${footerRow}
                    ${actionButtons}
                </div>
            </div>`;
        container.append(cardHtml);
    });
}

// Restore Simulation Function
function restoreAll() {
    fetchAndRenderArticles();
}

// Logout execution 
function handleLogout() {
    localStorage.removeItem("loggedUser");
    window.location.href = "landing.html";
}