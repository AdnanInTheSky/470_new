let token = localStorage.getItem('token');
let isLogin = true;

function check() {
    if (token) {
        document.getElementById('authSection').classList.add('hidden');
        document.getElementById('profileSection').classList.remove('hidden');
        document.getElementById('logoutBtn').classList.remove('hidden');
        loadBookmarks();
    } else {
        document.getElementById('authSection').classList.remove('hidden');
        document.getElementById('profileSection').classList.add('hidden');
        document.getElementById('logoutBtn').classList.add('hidden');
    }
}

function toggleAuth() {
    isLogin = !isLogin;
    document.getElementById('authTitle').textContent = isLogin ? 'Sign in' : 'Register';
    document.querySelector('#authForm button').textContent = isLogin ? 'Sign in' : 'Register';
    document.getElementById('toggleText').textContent = isLogin ? 'No account?' : 'Have an account?';
}

function showMsg(text, type) {
    const el = document.getElementById('msg');
    el.textContent = text;
    el.className = `p-3 rounded-lg mb-4 text-sm ${type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 3000);
}

document.getElementById('authForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const endpoint = isLogin ? '/api/login' : '/api/register';
    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            if (isLogin) {
                token = data.token;
                localStorage.setItem('token', token);
                showMsg('Signed in successfully', 'success');
                check();
            } else {
                showMsg('Registered! Please sign in.', 'success');
                toggleAuth();
                document.getElementById('password').value = '';
            }
        } else {
            showMsg(data.error || 'Error', 'error');
        }
    } catch (e) {
        showMsg('Network error', 'error');
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    token = null;
    check();
});

async function loadBookmarks() {
    try {
        const [cr, br] = await Promise.all([
            fetch('/courses.json'),
            fetch('/api/getBookmarks', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const courses = await cr.json();
        const { bookmarks } = await br.json();
        const list = document.getElementById('bookmarksList');
        if (!bookmarks || !bookmarks.length) {
            list.innerHTML = '<p class="text-gray-400">No bookmarks yet.</p>';
            return;
        }
        list.innerHTML = bookmarks.map(slug => {
            const c = courses.find(c => c.slug === slug);
            return c ? `<a href="/courses/${c.slug}" class="block p-4 border border-gray-200 rounded-lg mb-2 hover:border-gray-300 transition">
                <h3 class="font-medium text-gray-900">${c.title}</h3>
                <p class="text-sm text-gray-500">${c.faculty}</p>
            </a>` : '';
        }).join('');
    } catch (e) {
        console.error(e);
    }
}

check();