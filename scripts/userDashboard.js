
let loggedUser = null;
let localArticles = []; 

$(document).ready(async function () {

    // check for a user 
    if (!loggedUser) {
        window.location.href = "../pages/index.html";
        return;
    }
    // take the login user data 
    const userData = localStorage.getItem("loggedUser");
    loggedUser = JSON.parse(userData);

    setupProfile(loggedUser); 
     
    

    // 3. Initial fetch and render
    await fetchAndRenderArticles();

    

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
        return art.title.toLowerCase().includes(searchVal) || 
                            art.subtitle.toLowerCase().includes(searchVal) || 
                            art.category.toLowerCase().includes(searchVal);
    });

    if (filtered.length === 0) {
        container.append(`<div class="text-center text-muted my-5 w-100">No articles found matching the criteria.</div>`);
        return;
    }

    // Loop & append items
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
                             <i class="fa-solid fa-pen"></i> Author : ${art.authorName}
                        </span>
                        <span class="card-meta-item">
                            <i class="fa-solid fa-calendar-days"></i> Posted on : ${art.createdAt}
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

