        const now = new Date();
        const formatted = now.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
        document.getElementById('auto-date').textContent = 'Created: ' + formatted;

        function counter(inputId, counterId, max) {
            const el = document.getElementById(inputId);
            const ct = document.getElementById(counterId);
            el.addEventListener('input', () => {
                const len = el.value.length;
                ct.textContent = max ? len + ' / ' + max : len + ' chars';
            });
        }
        counter('articleTitle',   'title-count',   50);
        counter('articleIntro',   'intro-count',   150);
        counter('articleContent', 'content-count', null);

        function validate(id) {
            const el = document.getElementById(id);
            const empty = el.value.trim() === '';
            el.classList.toggle('is-invalid', empty);
            return !empty;
        }

        function clearForm() {
            Swal.fire({
                title: 'Clear form?',
                text: 'All entered content will be removed.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#E8440A',
                cancelButtonColor: '#B0A9A6',
                confirmButtonText: 'Yes, clear it',
                cancelButtonText: 'Keep editing'
            }).then(result => {
                if (result.isConfirmed) {
                    document.getElementById('articleForm').reset();
                    document.getElementById('title-count').textContent   = '0 / 50';
                    document.getElementById('intro-count').textContent   = '0 / 150';
                    document.getElementById('content-count').textContent = '0 chars';
                    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
                }
            });
        }

        document.getElementById('articleForm').addEventListener('submit', function(e) {
            e.preventDefault();
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

            const article = {
                title:     document.getElementById('articleTitle').value.trim(),
                category:  document.getElementById('articleCategory').value,
                subtitle:  document.getElementById('articleSubtitle').value.trim(),
                intro:     document.getElementById('articleIntro').value.trim(),
                content:   document.getElementById('articleContent').value.trim(),
                createdAt: formatted,
                status:    'pending'
            };
            console.log('Article submitted:', article);

            Swal.fire({
                icon: 'success',
                title: 'Article submitted!',
                text: 'Your article is now pending review.',
                confirmButtonColor: '#E8440A',
                confirmButtonText: 'Back to Dashboard'
            }).then(() => {
                window.location.href = '../pages/authorDashboard.html';
            });
        });

        document.querySelectorAll('.field-input, .field-select, .field-textarea').forEach(el => {
            el.addEventListener('input',  () => el.classList.remove('is-invalid'));
            el.addEventListener('change', () => el.classList.remove('is-invalid'));
        });
