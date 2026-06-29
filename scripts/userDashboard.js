let loggedUser = null;       // holds the logged-in user  from localStorage
let localArticles = [];    


$(document).ready(async function () 
{

    const userData = localStorage.getItem("loggedUser"); // store logged-in user from localStorage

    // redirect to home if  user session  not found
    if (!userData) {
        window.location.href = "../pages/index.html";
        return;
    }

    loggedUser = JSON.parse(userData);

    setupProfile(loggedUser); //  offcanvas profile if filled

    await fetchAndRenderArticles(); // Fetch articles from API and render cards

    // Search call render cards on input
    $("#searchInput").on("input", function () {
        renderCards();
    });
});


async function fetchAndRenderArticles() {
    try {
        $("#cards-container").html(`<div class="text-center text-muted my-5 w-100">Loading articles...</div>`);

        // Fetches only approved, non-deleted articles from the DB
        const res = await fetch(`${API}/articles?isDeleted=false&status=approved`);
        if (!res.ok) throw new Error("Failed to load articles");

        localArticles = await res.json();
        renderCards();

    } catch (err) {
        console.error(err);
        Swal.fire({ icon: "error", title: "Error loading dashboard feed." });
    }
}


// Filters localArticles by search input and renders article cards
function renderCards() {
    const container = $("#cards-container");
    container.empty();

    const searchVal = $("#searchInput").val().toLowerCase().trim();

    // Filter by title, subtitle, category or author name
    const filtered = localArticles.filter(art => {
        return art.title.toLowerCase().includes(searchVal) ||
               art.subtitle.toLowerCase().includes(searchVal) ||
               art.category.toLowerCase().includes(searchVal) ||
               (art.authorName && art.authorName.toLowerCase().includes(searchVal));
    });

    // Show message if no results match
    if (filtered.length === 0) {
        container.append(`<div class="text-center text-muted my-5 w-100">No articles found matching the criteria.</div>`);
        return;
    }

    // card for each article
    filtered.forEach(art => {
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
                            <i class="fa-solid fa-pen"></i> Author: ${art.authorName || "Unknown"}
                        </span>
                        <span class="card-meta-item">
                            <i class="fa-solid fa-calendar-days"></i> Posted on: ${art.createdAt}
                        </span>
                        <span class="card-meta-item">
                            <i class="fa-solid fa-tag"></i> ${art.category.charAt(0).toUpperCase() + art.category.slice(1)}
                        </span>
                    </div>
                </div>
            </div>`;
        container.prepend(cardHtml);
    });
}