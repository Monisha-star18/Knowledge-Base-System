let loggedUser = null;
let localArticles = []; 
let currentFilter = "all";

$(document).ready(async function () {

    // take the login user data 
    const userData = localStorage.getItem("loggedUser");
    loggedUser = JSON.parse(userData);


   setupProfile(loggedUser); 

    // fetch and render
    await fetchAndRenderArticles();

    // Filters
    $("#filters .btn").on("click", function () 
    {
        $("#filters .btn").removeClass("active");
        $(this).addClass("active");

        const id = $(this).attr("id");
        if (id === "all-btn") currentFilter = "all";
        if (id === "approved-btn") currentFilter = "approved";
        if (id === "pending-btn") currentFilter = "pending";
        if (id === "rejected-btn") currentFilter = "rejected";

        renderCards();
    });

    //  Search
    $("#searchInput").on("input", function () {renderCards();});
});



// Fetch articles written by this specific author
async function fetchAndRenderArticles() 
{
    try 
    {
        const res = await fetch(`${API}/articles?authorId=${loggedUser.id}&isDeleted=false`);
        if (!res.ok) throw new Error("Failed to load articles");
        localArticles = await res.json();
        renderCards();
    } 
    catch (err) 
    {
        console.error(err);
        Swal.fire({ icon: "error", title: "Error loading dashboard feed." });
    }
}

// Dynamically generate layout cards based on filter and search rules
function renderCards() 
{
    const container = $("#cards-container");
    container.empty();

    const searchVal = $("#searchInput").val().toLowerCase().trim();

    // Filter 
    let filtered = localArticles.filter(art => {
        const matchesFilter = (currentFilter === "all" || art.status === currentFilter);
        const matchesSearch = art.title.toLowerCase().includes(searchVal) || 
                              art.subtitle.toLowerCase().includes(searchVal) || 
                              art.category.toLowerCase().includes(searchVal);
        return  matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
        container.append(`<div class="text-center text-muted my-5 w-100">No articles found matching the criteria.</div>`);
        return;
    }

    // Loop & append items
    filtered.forEach(art => 
    {
        let statusBadge = "";
        let footerRow = "";
        let actionButtons = "";

        if (art.status === "approved") 
        {
            statusBadge = `<span class="badge-approved">✓ Approved</span>`;
            footerRow = `<div class="card-date-row approved"><i class="fa-solid fa-circle-check"></i> Approved on: ${art.reviewDate}</div>`;
            
        } 
        else if (art.status === "rejected") 
        {
            statusBadge = `<span class="badge-rejected">✕ Rejected</span>`;
            footerRow = `<div class="card-date-row rejected"><i class="fa-solid fa-circle-xmark"></i> Rejected on: ${art.reviewDate}</div>`;
            actionButtons = `
                <div class="card-actions">
                    <button class="btn-card-edit" onclick="window.location.href='../pages/addArticle.html?id=${art.id}'">
                        <i class="fa-solid fa-pen"></i> Reapply
                    </button>
                    <button class="btn-card-delete" onclick="deleteArticle('${art.id}')">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>`;
        } 
        else 
        {
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
                    ${art.remark ?`<span class="card-meta-item"> Remark : ${art.remark} </span>` : ''}
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
        .then(async result => 
        {
            if (result.isConfirmed) 
            {
                await fetch(`${API}/articles/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isDeleted: true })
                });
                await fetchAndRenderArticles();
            }
        });
}

//main restore function work on the restore btn cilcked on page 
async function restoreArticle() 
{
    try
    {
        const restoreContainer = $("#restoreModal-content");
        restoreContainer.empty();

        const restore = await fetch(`${API}/articles?authorId=${loggedUser.id}&isDeleted=true`);
        if (!restore.ok) throw new Error("Failed to load articles");
        let localRestoreArticles = await restore.json();

        if (localRestoreArticles.length === 0) 
        {
            restoreContainer.append(`<div class="text-center text-muted my-4">No deleted articles to restore.</div>`);
            return;
        }

        localRestoreArticles.forEach(restoreArt => 
        {

            const restoreCard = `
                    <div class="container restoreSection">
                        <div class="card p-3 mb-3">          
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <p class="mb-1 fw-semibold">Title: ${restoreArt.title}</p>
                                    <small class="text-muted">Created: ${restoreArt.createdAt}</small>
                                    <div class="mt-1">
                                        ${
                                            restoreArt.status === 'rejected' 
                                                ? `<span class="badge-rejected">✕ Rejected</span>`  
                                            : restoreArt.status === 'pending' 
                                                ? `<span class="badge-pending">⏳ Pending</span>`
                                                : ""
                                        }
                                    </div>
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
    catch (err) 
    {
        console.error(err);
        Swal.fire({ icon: "error", title: "Could not load deleted articles." });
    }
}

//individuall restore function work on the restore btn cilcked on for particular card 

$(document).on("click", ".restorSpecificArticle",  function() 
{
    const restoreId = $(this).data("id");
    Swal.fire({ title: 'Restore Article?', text: 'This article will be restored.', showCancelButton: true })
        .then(async result => 
        {
            if (result.isConfirmed)
            {
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

