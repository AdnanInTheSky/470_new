let token = localStorage.getItem('token');
let isLogin = true;
let allCourses = [];
let bookmarks = [];

function checkAuth() {
  if (token) showProfile();
  else showAuth();
}

function showAuth() {
  document.getElementById('authSection').classList.remove('hidden');
  document.getElementById('profileSection').classList.add('hidden');
  document.getElementById('logoutBtn').classList.add('hidden');
}

function showProfile() {
  document.getElementById('authSection').classList.add('hidden');
  document.getElementById('profileSection').classList.remove('hidden');
  document.getElementById('logoutBtn').classList.remove('hidden');
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    document.getElementById('userEmail').textContent = payload.email;
  } catch(e) {
    document.getElementById('userEmail').textContent = 'User';
  }
  
  loadData();
}

function toggleAuth() {
  isLogin = !isLogin;
  document.getElementById('authTitle').textContent = isLogin ? 'Login' : 'Register';
  document.querySelector('#authForm button').textContent = isLogin ? 'Login' : 'Register';
  document.getElementById('toggleText').textContent = isLogin ? "Don't have an account?" : "Already have an account?";
  hideMessages();
}

function showError(msg) {
  const el = document.getElementById('errorMsg');
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3000);
}

function showSuccess(msg) {
  const el = document.getElementById('successMsg');
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3000);
}

function hideMessages() {
  document.getElementById('errorMsg').classList.add('hidden');
  document.getElementById('successMsg').classList.add('hidden');
}

document.getElementById('authForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessages();
  
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
        showSuccess('Login successful!');
        showProfile();
      } else {
        showSuccess('Registered! Please login.');
        toggleAuth();
        document.getElementById('password').value = '';
      }
    } else {
      showError(data.error || 'Error occurred');
    }
  } catch(e) {
    showError('Network error');
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  token = null;
  showAuth();
});

async function loadData() {
  try {
    const [coursesRes, bookmarksRes] = await Promise.all([
      fetch('/courses.json'),
      fetch('/api/getBookmarks', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);
    
    allCourses = await coursesRes.json();
    const data = await bookmarksRes.json();
    bookmarks = data.bookmarks || [];
    
    displayCourses(allCourses);
    displayBookmarks();
  } catch(e) {
    console.error('Error loading data:', e);
  }
}

function displayCourses(courses) {
  const grid = document.getElementById('profileCoursesGrid');
  
  if (!courses.length) {
    grid.innerHTML = '<p class="text-gray-500 col-span-full">No courses found</p>';
    return;
  }
  
  grid.innerHTML = courses.map(c => {
    const isBookmarked = bookmarks.includes(c.slug);
    return `
      <div class="bg-white rounded-xl shadow p-6">
        <h3 class="text-xl font-bold mb-2">${c.title}</h3>
        <p class="text-gray-600 mb-4">${c.summary}</p>
        <button onclick="toggleBookmark('${c.slug}', this)" 
                class="${isBookmarked ? 'bg-green-600' : 'bg-blue-600'} text-white px-4 py-2 rounded-lg hover:opacity-90 transition">
          ${isBookmarked ? '✅ Bookmarked' : '🔖 Bookmark'}
        </button>
      </div>
    `;
  }).join('');
}

function displayBookmarks() {
  const list = document.getElementById('bookmarksList');
  const bookmarkedCourses = allCourses.filter(c => bookmarks.includes(c.slug));
  
  if (!bookmarkedCourses.length) {
    list.innerHTML = '<p class="text-gray-500">No bookmarks yet</p>';
    return;
  }
  
  list.innerHTML = bookmarkedCourses.map(c => `
    <div class="bg-white rounded-xl shadow p-6 flex justify-between items-center">
      <div>
        <h3 class="font-bold text-lg">${c.title}</h3>
        <p class="text-gray-500">${c.faculty}</p>
      </div>
      <a href="/courses/${c.slug}" class="text-blue-600 font-semibold hover:underline">View →</a>
    </div>
  `).join('');
}

async function toggleBookmark(slug, btn) {
  try {
    const res = await fetch('/api/bookmark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ slug })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      if (data.action === 'added') {
        bookmarks.push(slug);
        btn.textContent = '✅ Bookmarked';
        btn.className = 'bg-green-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition';
      } else {
        bookmarks = bookmarks.filter(s => s !== slug);
        btn.textContent = '🔖 Bookmark';
        btn.className = 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition';
      }
      displayBookmarks();
    }
  } catch(e) {
    alert('Error updating bookmark');
  }
}

document.getElementById('profileSearch').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = allCourses.filter(c => 
    c.title.toLowerCase().includes(query) ||
    c.summary.toLowerCase().includes(query) ||
    c.faculty.toLowerCase().includes(query)
  );
  displayCourses(filtered);
});

checkAuth();