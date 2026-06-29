$(document).ready(async function () 
{
    // Setup profile offcanvas
    const userData = localStorage.getItem("loggedUser");
    if (!userData) { window.location.href = "../pages/index.html"; return; }
    const loggedUser = JSON.parse(userData);
    setupProfile(loggedUser);

    // Get article ID from URL
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get("id");

    if (!articleId) 
    {
        $("#article-error").show();
        return;
    }

    try 
    {
        const res = await fetch(`${API}/articles/${articleId}`);
        if (!res.ok) throw new Error("Not found");
        const art = await res.json();

        // Populate fields
        $(".article-count").html(`<i class="fa-solid fa-user"></i> <strong>${art.views}</strong> person to read this article!`);
        $("#art-image").attr("src", art.image);
        $("#art-category").text(art.category.charAt(0).toUpperCase() + art.category.slice(1));
        $("#art-title").text(art.title);
        $("#art-subtitle").text(art.subtitle);
        $("#art-author").text(art.authorName || "Unknown");
        $("#art-date").text(art.createdAt);
        $("#art-intro").text(art.intro);

        // Render content — preserve line breaks
        $("#art-content").html(
            art.content
                .split("\n")
                .map(line => line.trim() === "" ? "<br>" : `<p>${line}</p>`)
                .join("")
        );

        $("#article-content").show();

        //for 1st and 100th user 
        if (art.views === 100 || art.views === 1) 
        {
            confetti({
                particleCount: 500,   // number of pieces
                spread: 90,           // how wide it fans out
                origin: { y: 0.6 },  // where it fires from (0=top, 1=bottom)
                colors: ["#360ae8", "#c70874", "#ffffff"] // your brand colors
            });
        }
    } 
    
    catch (err) 
    {
        console.error(err);
        $("#article-error").show();
    }
    
});