// ── Date Setup ───────────────────────────────────────────────────────────────
const today = new Date();
const displayDate = today.toDateString();
document.getElementById('created-date').textContent = 'Created: ' + displayDate;

// ── Edit Mode Detection (from URL ?id=ARTICLE_ID) ────────────────────────────
const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get('id');
const isEditMode = !!editId;

let originalArticle = null; // stores original article data in edit mode

// ── Edit Mode Setup ──────────────────────────────────────────────────────────
if (isEditMode) {

    // update page title and header text
    document.title = 'Edit Article – InsightHub';
    const headingEl = document.querySelector('.header-heading');
    const subEl = document.querySelector('.header-sub');
    if (headingEl) headingEl.textContent = 'Edit Article';
    if (subEl) subEl.textContent = 'Update the details below and resubmit for review.';

    // change submit button label to update
    const submitBtn = document.querySelector('.btn-submit');
    if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Update Article';

    // change date label to update date
    const date = document.getElementById('created-date');
    if (date) date.textContent = 'Update Date : ' + displayDate;

    // fetch the existing article and fill the form
    fetch(`${API}/articles/${editId}`)
        .then(res => {
            if (!res.ok) throw new Error('Article not found');
            return res.json();
        })
        .then(article => {
            originalArticle = article;

            // fill all form fields with existing article data
            document.getElementById('articleTitle').value    = article.title;
            document.getElementById('articleSubtitle').value = article.subtitle;
            document.getElementById('articleCategory').value = article.category;
            document.getElementById('articleIntro').value    = article.intro;
            document.getElementById('articleContent').value  = article.content;

            // show admin remark if available (from rejection)
            if (article.remark) {
                const dateEl = document.getElementById('created-date');
                if (dateEl) dateEl.insertAdjacentHTML('afterend', `
                    <div class="alert alert-warning mt-2 mb-0" style="font-size:0.85rem;">
                        <i class="fa-solid fa-comment"></i> <strong>Admin Remark:</strong> ${article.remark}
                    </div>
                `);
            }
        })
        .catch(err => {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Could not load article', text: 'Redirecting to dashboard.' })
                .then(() => { window.location.href = '../pages/authorDashboard.html'; });
        });
}

// ── Clear Form ───────────────────────────────────────────────────────────────
// Resets all fields — in edit mode title/subtitle are preserved
function clearForm() {
    Swal.fire({ title: 'Clear form?', text: 'All entered content will be removed.', icon: 'warning', showCancelButton: true })
        .then(result => {
            if (result.isConfirmed) {
            
                document.getElementById('articleForm').reset();
                document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

            }
        });
}

// ── Validation Helper ────────────────────────────────────────────────────────
// Returns true if field has a value, false and marks invalid if empty
function validate(id) {
    const element = document.getElementById(id);
    if (element.disabled) return true; // skip locked fields

    const empty = element.value.trim() === '';
    element.classList.toggle('is-invalid', empty);
    return !empty;
}

// ── Form Submit ──────────────────────────────────────────────────────────────
document.getElementById('articleForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // check session
    const loggedUserStr = localStorage.getItem('loggedUser');
    if (!loggedUserStr) {
        Swal.fire({ icon: 'error', title: 'Session Expired', text: 'Please log in again.' });
        return;
    }
    const loggedUser = JSON.parse(loggedUserStr);

    // validate all fields before submitting
    const ok = [
        validate('articleTitle'),
        validate('articleCategory'),
        validate('articleSubtitle'),
        validate('articleIntro'),
        validate('articleContent')
    ].every(Boolean);

    if (!ok) return;

    try {

        // ── EDIT MODE: PATCH existing article ────────────────────────────
        if (isEditMode) {

            const updatedArticle = {
                ...originalArticle,                                         // keep image, authorId, authorName, createdAt etc.
                title:      document.getElementById('articleTitle').value.trim(),
                subtitle:   document.getElementById('articleSubtitle').value.trim(),
                category:   document.getElementById('articleCategory').value,
                intro:      document.getElementById('articleIntro').value.trim(),
                content:    document.getElementById('articleContent').value.trim(),
                status:     'pending',                                      // reset to pending for re-review
                reviewDate: null,
                updatedAt:  displayDate                                     // today's date auto-set
            };

            // check if anything actually changed compared to original
            const hasChanged =
                updatedArticle.title    !== originalArticle.title    ||
                updatedArticle.subtitle !== originalArticle.subtitle ||
                updatedArticle.category !== originalArticle.category ||
                updatedArticle.intro    !== originalArticle.intro    ||
                updatedArticle.content  !== originalArticle.content;

            // nothing changed — block update
            if (!hasChanged) {
                Swal.fire({ icon: 'info', title: 'No changes made', text: 'Nothing was updated.' });
                return;
            }

            // something changed — ask for confirmation before saving
            const confirm = await Swal.fire({
                icon: 'question',
                title: 'Update Article?',
                text: 'Are you sure you want to resubmit this article for review?',
                showCancelButton: true,
                confirmButtonText: 'Yes, Update'
            });

            if (!confirm.isConfirmed) return;

            const saveRes = await fetch(`${API}/articles/${editId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedArticle)
            });

            if (!saveRes.ok) throw new Error('Could not update.');

            Swal.fire({ icon: 'success', title: 'Article updated!', text: 'Resubmitted for review.' })
                .then(() => { window.location.href = '../pages/authorDashboard.html'; });

        // ── CREATE MODE: POST new article ────────────────────────────────
        } else {

            // count existing articles by this author to generate a unique image seed
            const countRes = await fetch(`${API}/articles?authorId=${loggedUser.id}`);
            const existingArticles = await countRes.json();
            const nextIndex = existingArticles.length + 1;

            const article = {
                authorId:   loggedUser.id,
                authorName: `${loggedUser.firstName} ${loggedUser.lastName}`,
                title:      document.getElementById('articleTitle').value.trim(),
                category:   document.getElementById('articleCategory').value,
                subtitle:   document.getElementById('articleSubtitle').value.trim(),
                intro:      document.getElementById('articleIntro').value.trim(),
                content:    document.getElementById('articleContent').value.trim(),
                image:      `https://picsum.photos/seed/article${nextIndex}/800/300`,
                createdAt:  displayDate,
                status:     'pending',
                reviewDate: null,
                isDeleted:  false
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

// ── Remove Validation Highlight on Input ─────────────────────────────────────
// Clears red border as soon as user starts typing in any field
document.querySelectorAll('.field-input, .field-select, .field-textarea').forEach(formElement => {
    formElement.addEventListener('input',  () => formElement.classList.remove('is-invalid'));
    formElement.addEventListener('change', () => formElement.classList.remove('is-invalid'));
});