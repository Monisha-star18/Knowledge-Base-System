const API = "http://localhost:3000";

//display the date in the top
const today = new Date();
const displayDate = today.toDateString();
document.getElementById('created-date').textContent = 'Created: ' + displayDate;

//function used to clear the whole add article form 
function clearForm() 
{
    Swal.fire({title: 'Clear form?',text: 'All entered content will be removed.',icon: 'warning',showCancelButton: true})
    .then(result => 
    {
        if (result.isConfirmed) {
            document.getElementById('articleForm').reset();
            document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        }
    });
}

//common function used to validate the form element if the input is empty 
function validate(id) {
    const element = document.getElementById(id);
    const empty = element.value.trim() === '';
    element.classList.toggle('is-invalid', empty);
    return !empty;
}


document.getElementById('articleForm').addEventListener('submit', async function (e) 
{
    e.preventDefault();

    const loggedUserStr = localStorage.getItem("loggedUser");
    if (!loggedUserStr) {
        Swal.fire({ icon: "error", title: "Session Expired", text: "Please log in again." });
        return;
    }
    const loggedUser = JSON.parse(loggedUserStr);

    const ok = [validate('articleTitle'),validate('articleCategory'),validate('articleSubtitle'),
                validate('articleIntro'),validate('articleContent')].every(Boolean);

    if (!ok) {
        const first = document.querySelector('.is-invalid');
        return;
    }

    try 
    {
        const countRes = await fetch(`${API}/articles?authorId=${loggedUser.id}`);
        
        // Fetch existing articles count for the inmage
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
            createdAt: displayDate,
            status: 'pending'
        };

        // Send articel to db
        const saveRes = await fetch(`${API}/articles`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(article)
        });

        if (!saveRes.ok) throw new Error("Could not post.");

        Swal.fire({icon: 'success',title: 'Article submitted!'  })
        .then(() => {
            window.location.href = '../pages/authorDashboard.html';
        });

    } 
    
    catch (err) {
        console.error(err);
        Swal.fire({ icon: "error", title: "Submission Failed" });
    }
});

document.querySelectorAll('.field-input, .field-select, .field-textarea').forEach(formElement => 
{
    formElement.addEventListener('input', () => formElement.classList.remove('is-invalid'));
    formElement.addEventListener('change', () => formElement.classList.remove('is-invalid'));
});