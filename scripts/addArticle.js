const API = "http://localhost:3000";

// Display the date in the top
const today = new Date();
const displayDate = today.toDateString();
document.getElementById('created-date').textContent = 'Created: ' + displayDate;

//  edit mode from URL  ?id=ARTICLE_ID
const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get('id');
const isEditMode = !!editId;

let originalArticle = null; //  article in edit mode

// edit mode 
if (isEditMode) {
    //  page title and header 
    document.title = 'Edit Article – InsightHub';
    const headingEl = document.querySelector('.header-heading');
    const subEl = document.querySelector('.header-sub');
    if (headingEl) headingEl.textContent = 'Edit Article';
    if (subEl) subEl.textContent = 'Update the details below and resubmit for review.';

    //  submit -> edit 
    const submitBtn = document.querySelector('.btn-submit');
    if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Update Article';

    //created -> upadte date
    const date = document.getElementById('created-date');
    if (date) date.textContent = 'Update Date : ' + displayDate;

    // Fetch the article 
    fetch(`${API}/articles/${editId}`)
        .then(res => {
            if (!res.ok) throw new Error('Article not found');
            return res.json();
        })
        .then(article => {
            originalArticle = article;

            // fill all fields
            document.getElementById('articleTitle').value    = article.title;
            document.getElementById('articleSubtitle').value = article.subtitle;
            document.getElementById('articleCategory').value = article.category;
            document.getElementById('articleIntro').value    = article.intro;
            document.getElementById('articleContent').value  = article.content;

            //  heading and subtitle  cannot be edited
            const titleInput    = document.getElementById('articleTitle');
            const subtitleInput = document.getElementById('articleSubtitle');

            titleInput.disabled    = true;
            subtitleInput.disabled = true;

            //  fields are locked
            titleInput.style.opacity    = '0.6';
            subtitleInput.style.opacity = '0.6';
            // titleInput.title    = 'Heading cannot be changed after submission.';
            // subtitleInput.title = 'Subtitle cannot be changed after submission.';
        })
        .catch(err => {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Could not load article', text: 'Redirecting to dashboard.' })
                .then(() => { window.location.href = '../pages/authorDashboard.html'; });
        });
}

// ── Clear form (only useful in create mode) ─────────────────────────────────
function clearForm() {
    Swal.fire({ title: 'Clear form?', text: 'All entered content will be removed.', icon: 'warning', showCancelButton: true })
        .then(result => {
            if (result.isConfirmed) {
                const titleVal    = document.getElementById('articleTitle').value;
                const subtitleVal = document.getElementById('articleSubtitle').value;

                document.getElementById('articleForm').reset();
                document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

                if (isEditMode) {
                    document.getElementById('articleTitle').value    = titleVal;
                    document.getElementById('articleSubtitle').value = subtitleVal;
                }
            }
        });
}

// ── Validation helper ───────────────────────────────────────────────────────
function validate(id) {
    const element = document.getElementById(id);
    if (element.disabled) return true;        // skip locked fields, count as valid

    const empty = element.value.trim() === '';
    element.classList.toggle('is-invalid', empty);
    return !empty;                             // now always in scope, always returns properly
}

// ── Form submit ─────────────────────────────────────────────────────────────
document.getElementById('articleForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const loggedUserStr = localStorage.getItem('loggedUser');
    if (!loggedUserStr) {
        Swal.fire({ icon: 'error', title: 'Session Expired', text: 'Please log in again.' });
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

    if (!ok) return;

    try {
        // ── EDIT MODE: PATCH existing article ──────────────────────────────
        if (isEditMode) {

            

            const updatedArticle = {
                ...originalArticle,                                      // keep image, createdAt, authorId, etc.
                category:  document.getElementById('articleCategory').value,
                intro:     document.getElementById('articleIntro').value.trim(),
                content:   document.getElementById('articleContent').value.trim(),
                status:    'pending',                                    // reset to pending for re-review
                reviewDate: null,
                updatedAt:  displayDate                                  // today's date auto-set
            };

            const saveRes = await fetch(`${API}/articles/${editId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedArticle)
            });

            if (!saveRes.ok) throw new Error('Could not update.');

            Swal.fire({ icon: 'success', title: 'Article updated!', text: 'Resubmitted for review.' })
                .then(() => { window.location.href = '../pages/authorDashboard.html'; });

        // ── CREATE MODE: POST new article ───────────────────────────────────
        } 
        else {
            const countRes = await fetch(`${API}/articles?authorId=${loggedUser.id}`);
            const existingArticles = await countRes.json();
            const nextIndex = existingArticles.length + 1;

            const article = {
                authorId:   loggedUser.id,
                title:      document.getElementById('articleTitle').value.trim(),
                category:   document.getElementById('articleCategory').value,
                subtitle:   document.getElementById('articleSubtitle').value.trim(),
                intro:      document.getElementById('articleIntro').value.trim(),
                content:    document.getElementById('articleContent').value.trim(),
                image:      `https://picsum.photos/seed/article${nextIndex}/800/300`,
                createdAt:  displayDate,
                status:     'pending',
                reviewDate: null
            };

            const saveRes = await fetch(`${API}/articles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(article)
            });

            if (!saveRes.ok) throw new Error('Could not post.');

            Swal.fire({ icon: 'success', title: 'Article submitted!' })
                .then(() => { window.location.href = '../pages/authorDashboard.html'; });
        }

    } catch (err) {
        console.error(err);
        Swal.fire({ icon: 'error', title: isEditMode ? 'Update Failed' : 'Submission Failed' });
    }
});

// ── Remove validation highlight on user input ───────────────────────────────
document.querySelectorAll('.field-input, .field-select, .field-textarea').forEach(formElement => {
    formElement.addEventListener('input',  () => formElement.classList.remove('is-invalid'));
    formElement.addEventListener('change', () => formElement.classList.remove('is-invalid'));
});