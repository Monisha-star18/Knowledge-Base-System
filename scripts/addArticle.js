const API = "http://localhost:3000";

const now = new Date();

const formatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

document.getElementById('auto-date').textContent = 'Created: ' + formatted;

// Character Count Handler
function counter(inputId, counterId, max) {
    const el = document.getElementById(inputId);
    const ct = document.getElementById(counterId);
    el.addEventListener('input', () => {
        const len = el.value.length;
        ct.textContent = max ? len + ' / ' + max : len + ' chars';
    });
}
counter('articleTitle', 'title-count', 50);
counter('articleIntro', 'intro-count', 150);
counter('articleContent', 'content-count', null);

function validate(id) {
    const el = document.getElementById(id);
    const empty = el.value.trim() === '';
    el.classList.toggle('is-invalid', empty);
    return !empty;
}

function clearForm() {
    Swal.fire({title: 'Clear form?',text: 'All entered content will be removed.',icon: 'warning',showCancelButton: true,})
    .then(result => {
        if (result.isConfirmed) {
            document.getElementById('articleForm').reset();
            document.getElementById('title-count').textContent = '0 / 50';
            document.getElementById('intro-count').textContent = '0 / 150';
            document.getElementById('content-count').textContent = '0 chars';
            document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        }
    });
}

document.getElementById('articleForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const loggedUserStr = localStorage.getItem("loggedUser");
    if (!loggedUserStr) {
        Swal.fire({ icon: "error", title: "Session Expired", text: "Please log in again." });
        return;
    }
    const loggedUser = JSON.parse(loggedUserStr);

    const ok = [
        validate('articleTitle'),
        validate('articleCategory'),
        validate('articleSubtitle'),
        validate('articleIntro'),
        validate('articleContent')
    ].every(Boolean);

    if (!ok) {
        const first = document.querySelector('.is-invalid');
        if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    try {
        // Fetch existing articles count for this author to get the dynamic index identifier number
        const countRes = await fetch(`${API}/articles?authorId=${loggedUser.id}`);
        const existingArticles = await countRes.json();
        const nextIndex = existingArticles.length + 1;

        const article = {
            authorId: loggedUser.id,
            title: document.getElementById('articleTitle').value.trim(),
            category: document.getElementById('articleCategory').value,
            subtitle: document.getElementById('articleSubtitle').value.trim(),
            intro: document.getElementById('articleIntro').value.trim(),
            content: document.getElementById('articleContent').value.trim(),
            image: `https://picsum.photos/seed/article${nextIndex}/800/300`,
            createdAt: formatted,
            status: 'pending'
        };

        // Send payload to DB using dynamic JSON server collection route reference
        const saveRes = await fetch(`${API}/articles`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(article)
        });

        if (!saveRes.ok) throw new Error("Could not post layout item.");

        Swal.fire({icon: 'success',title: 'Article submitted!',text: 'Your article is now pending review.',   
        }).then(() => {
            window.location.href = '../pages/authorDashboard.html';
        });

    } catch (err) {
        console.error(err);
        Swal.fire({ icon: "error", title: "Submission Failed", text: "Could not establish." });
    }
});

document.querySelectorAll('.field-input, .field-select, .field-textarea').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('is-invalid'));
    el.addEventListener('change', () => el.classList.remove('is-invalid'));
});