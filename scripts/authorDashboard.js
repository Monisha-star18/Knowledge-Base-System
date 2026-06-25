document.querySelectorAll('#filters .btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('#filters .btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});