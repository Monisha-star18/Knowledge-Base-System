// import { API } from "./config.js";
// const API = "http://localhost:3000";

let loggedUser = null;
let localArticles = []; 
let currentFilter = "all";

$(document).ready(async function () {

    // take the login user data 
    const userData = localStorage.getItem("loggedUser");
    loggedUser = JSON.parse(userData);
    console.log(loggedUser)

    setupProfile(loggedUser); 
    

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
        const res = await fetch(`${API}/articles?category=${loggedUser.category}&isDeleted=false`);
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
                    <button class="btn-card-accept" data-id="${art.id}">
                        <i class="fa-solid fa-pen"></i> Accept
                    </button>
                    <button class="btn-card-reject" data-id="${art.id}">
                        <i class="fa-solid fa-trash"></i> Reject 
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



// ── Review Modal ─────────────────────────────────────────────────────────────
// Inject the modal markup once into the page
$("body").append(`
    <div id="review-modal-overlay" style="
        display:none; position:fixed; inset:0;
        background:rgba(0,0,0,.45); z-index:9999;
        justify-content:center; align-items:center;">

        <div id="review-modal" style="
            background:#fff; border-radius:12px; width:100%; max-width:460px;
            margin:16px; box-shadow:0 8px 32px rgba(0,0,0,.18);
            overflow:hidden; font-family:inherit;">

            <!-- Header -->
            <div id="review-modal-header" style="
                padding:18px 24px; display:flex;
                align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span id="review-modal-icon" style="font-size:1.4rem;"></span>
                    <h5 id="review-modal-title" style="margin:0; font-size:1.1rem; font-weight:600;"></h5>
                </div>
                <button id="review-modal-close" style="
                    background:none; border:none; font-size:1.3rem;
                    cursor:pointer; color:#888; line-height:1;">&times;</button>
            </div>

            <!-- Body -->
            <div style="padding:0 24px 8px;">
                <label for="review-remark" style="
                    display:block; font-size:.85rem;
                    font-weight:500; color:#444; margin-bottom:6px;">
                    Remark <span style="color:#e53935;">*</span>
                </label>
                <textarea id="review-remark" rows="4" placeholder="Write your review remark here..." style="
                    width:100%; box-sizing:border-box; resize:vertical;
                    border:1.5px solid #ddd; border-radius:8px;
                    padding:10px 12px; font-size:.9rem; font-family:inherit;
                    outline:none; transition:border-color .2s;"></textarea>
                <p id="review-remark-error" style="
                    color:#e53935; font-size:.8rem;
                    margin:4px 0 0; display:none;">
                    Remark is required.
                </p>
            </div>

            <!-- Footer -->
            <div style="
                padding:16px 24px; display:flex;
                justify-content:flex-end; gap:10px;">
                <button id="review-modal-cancel" style="
                    padding:8px 20px; border-radius:7px;
                    border:1.5px solid #ccc; background:#fff;
                    cursor:pointer; font-size:.9rem; color:#555;">
                    Cancel
                </button>
                <button id="review-modal-confirm" style="
                    padding:8px 22px; border-radius:7px;
                    border:none; cursor:pointer;
                    font-size:.9rem; font-weight:600; color:#fff;">
                    Confirm
                </button>
            </div>
        </div>
    </div>
`);

// Focus style for textarea
$("#review-remark").on("focus", function () {
    $(this).css("border-color", "#667eea");
}).on("blur", function () {
    $(this).css("border-color", "#ddd");
});

// Helper: open the modal and return a Promise that resolves with the remark or null
function openReviewModal(isAccept) {
    return new Promise((resolve) => {
        const overlay   = $("#review-modal-overlay");
        const title     = $("#review-modal-title");
        const icon      = $("#review-modal-icon");
        const confirmBtn = $("#review-modal-confirm");
        const remark    = $("#review-remark");
        const error     = $("#review-remark-error");

        // Configure for accept vs reject
        if (isAccept) {
            title.text("Accept Article");
            icon.text("✅");
            confirmBtn.css("background", "#4CAF50");
        } else {
            title.text("Reject Article");
            icon.text("🚫");
            confirmBtn.css("background", "#e53935");
        }

        // Reset state
        remark.val("");
        error.hide();

        // Show overlay as flex
        overlay.css("display", "flex");
        remark.focus();

        // ── Close handlers ──────────────────────────────────────────
        function closeModal(result) {
            overlay.css("display", "none");
            // Unbind to avoid stacking listeners on future opens
            $("#review-modal-close, #review-modal-cancel").off("click.review");
            $("#review-modal-confirm").off("click.review");
            overlay.off("click.review");
            $(document).off("keydown.review");
            resolve(result);
        }

        $("#review-modal-close, #review-modal-cancel").on("click.review", () => closeModal(null));

        // Click outside modal box closes it
        overlay.on("click.review", function (e) {
            if ($(e.target).is(overlay)) closeModal(null);
        });

        // Escape key closes it
        $(document).on("keydown.review", function (e) {
            if (e.key === "Escape") closeModal(null);
        });

        // Confirm
        $("#review-modal-confirm").on("click.review", function () {
            const val = remark.val().trim();
            if (!val) {
                error.show();
                remark.focus();
                return;
            }
            closeModal(val);
        });
    });
}

// Event delegation for Accept / Reject buttons (works with dynamically rendered cards)
$(document).on("click", ".btn-card-accept, .btn-card-reject", async function () {
    const articleId  = $(this).data("id");
    const isAccept   = $(this).hasClass("btn-card-accept");
    const action     = isAccept ? "approved" : "rejected";

    const remark = await openReviewModal(isAccept);
    if (!remark) return; // user cancelled

    try {
        const reviewDate = new Date().toLocaleDateString();
        const res = await fetch(`${API}/articles/${articleId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                status: action,
                remark,
                reviewDate,
                reviewedBy: loggedUser.userId
            })
        });

        if (!res.ok) throw new Error("Failed to update article status.");

        // Update local cache so re-render reflects the change instantly
        const idx = localArticles.findIndex(a => a.id == articleId);
        if (idx !== -1) {
            localArticles[idx].status     = action;
            localArticles[idx].remark     = remark;
            localArticles[idx].reviewDate = reviewDate;
        }

        renderCards();

    } catch (err) {
        console.error(err);
        alert("Update failed: " + err.message);
    }
});



