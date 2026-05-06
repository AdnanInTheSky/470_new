// Home page functionality
console.log('🏠 Home page loaded');

let allCourses = [];
let activeTag = null;

// Load courses data
async function loadCourses() {
    try {
        const response = await fetch('/courses.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allCourses = await response.json();
        
        console.log(`✅ Loaded ${allCourses.length} courses`);
        
        displayCourses(allCourses);
        updateStats(allCourses);
        updateTagFilters(allCourses);
        
    } catch (error) {
        console.error('❌ Error loading courses:', error);
        document.getElementById('coursesGrid').innerHTML = `
            <div class="col-span-full bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                <div class="text-4xl mb-4">⚠️</div>
                <h3 class="text-xl font-bold text-red-700 mb-2">Error Loading Courses</h3>
                <p class="text-red-600">${error.message}</p>
                <p class="text-red-500 mt-2">Check if courses.json exists and is valid JSON</p>
            </div>
        `;
    }
}

// Display courses as clickable cards
function displayCourses(courses) {
    const grid = document.getElementById('coursesGrid');
    const noResults = document.getElementById('noResults');
    
    if (courses.length === 0) {
        grid.innerHTML = '';
        noResults.classList.remove('hidden');
        document.getElementById('visibleCount').textContent = '0';
        return;
    }
    
    noResults.classList.add('hidden');
    
    grid.innerHTML = courses.map(course => `
        <div class="course-card bg-white rounded-xl shadow-md hover:shadow-2xl overflow-hidden group" 
             onclick="goToCourse('${course.slug}')"
             role="button"
             tabindex="0"
             onkeydown="if(event.key==='Enter') goToCourse('${course.slug}')">
            
            <!-- Card Image/Header -->
            <div class="bg-gradient-to-r ${getGradient(course.slug)} h-2"></div>
            
            <div class="p-6">
                <!-- Featured Badge -->
                ${course.featured ? `
                <span class="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                    ⭐ Featured
                </span>
                ` : ''}
                
                <!-- Tags -->
                ${course.tags && course.tags.length > 0 ? `
                <div class="flex flex-wrap gap-1 mb-3">
                    ${course.tags.slice(0, 3).map(tag => `
                        <span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                            ${tag}
                        </span>
                    `).join('')}
                    ${course.tags.length > 3 ? `
                        <span class="text-gray-500 text-xs">+${course.tags.length - 3} more</span>
                    ` : ''}
                </div>
                ` : ''}
                
                <!-- Course Title -->
                <h2 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                    ${course.title}
                </h2>
                
                <!-- Summary -->
                <p class="text-gray-600 mb-4 line-clamp-3">
                    ${course.summary}
                </p>
                
                <!-- Meta Info -->
                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span class="flex items-center gap-1">
                        <span>👨‍🏫</span> ${course.faculty}
                    </span>
                    ${course.level ? `
                    <span class="flex items-center gap-1">
                        <span>📊</span> ${course.level}
                    </span>
                    ` : ''}
                </div>
                
                ${course.duration ? `
                <div class="flex items-center gap-1 text-sm text-gray-500 mb-4">
                    <span>⏱️</span> ${course.duration}
                </div>
                ` : ''}
                
                <!-- View Button -->
                <div class="flex items-center justify-between">
                    <span class="text-blue-600 font-semibold group-hover:translate-x-1 transition inline-flex items-center gap-1">
                        View Course 
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </span>
                    
                    <!-- Bookmark Quick Action -->
                    <button onclick="event.stopPropagation(); quickBookmark('${course.slug}')"
                            class="text-gray-400 hover:text-blue-600 transition p-2 rounded-full hover:bg-blue-50"
                            title="Bookmark this course">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('visibleCount').textContent = courses.length;
}

// Navigate to course page
function goToCourse(slug) {
    window.location.href = `/courses/${slug}`;
}

// Quick bookmark from homepage
function quickBookmark(slug) {
    const token = localStorage.getItem('token');
    if (!token) {
        if (confirm('Please login to bookmark courses. Go to profile page?')) {
            window.location.href = '/profile.html';
        }
        return;
    }
    
    fetch('/api/bookmark', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ slug })
    })
    .then(res => res.json())
    .then(data => {
        if (data.action === 'added') {
            alert('✅ Course bookmarked!');
        } else {
            alert('Bookmark removed');
        }
    })
    .catch(err => {
        console.error('Bookmark error:', err);
    });
}

// Filter courses
function filterCourses(query, tag = null) {
    let filtered = allCourses;
    
    // Filter by tag
    if (tag) {
        filtered = filtered.filter(course => 
            course.tags && course.tags.some(t => t.toLowerCase() === tag.toLowerCase())
        );
    }
    
    // Filter by search query
    if (query) {
        const searchTerm = query.toLowerCase().trim();
        filtered = filtered.filter(course => 
            (course.title || '').toLowerCase().includes(searchTerm) ||
            (course.summary || '').toLowerCase().includes(searchTerm) ||
            (course.faculty || '').toLowerCase().includes(searchTerm) ||
            (course.tags || []).some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
    
    displayCourses(filtered);
    updateStats(filtered);
    updateTagFilters(allCourses, query, tag);
}

// Clear search
function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('clearSearch').classList.add('hidden');
    activeTag = null;
    displayCourses(allCourses);
    updateStats(allCourses);
    updateTagFilters(allCourses);
}

// Update stats
function updateStats(courses) {
    document.getElementById('totalCourses').textContent = allCourses.length;
    
    const featuredTotal = allCourses.filter(c => c.featured).length;
    document.getElementById('featuredCount').textContent = featuredTotal;
    
    document.getElementById('visibleCount').textContent = courses.length;
    
    const statsText = courses.length === allCourses.length ?
        `Showing all ${courses.length} courses` :
        `Showing ${courses.length} of ${allCourses.length} courses`;
    
    document.getElementById('stats').textContent = statsText;
}

// Update tag filters
function updateTagFilters(courses, query = '', activeTag = null) {
    const tagContainer = document.getElementById('tagFilters');
    
    // Collect all unique tags
    const allTags = new Set();
    courses.forEach(course => {
        if (course.tags) {
            course.tags.forEach(tag => allTags.add(tag));
        }
    });
    
    if (allTags.size === 0) {
        tagContainer.innerHTML = '';
        return;
    }
    
    tagContainer.innerHTML = Array.from(allTags).sort().map(tag => `
        <button onclick="filterByTag('${tag}')" 
                class="px-3 py-1.5 rounded-full text-sm font-medium transition
                ${activeTag === tag ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">
            ${tag}
        </button>
    `).join('');
    
    // Add clear filter button if tag is active
    if (activeTag) {
        tagContainer.innerHTML += `
            <button onclick="clearTagFilter()" 
                    class="px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition">
                ✕ Clear Filter
            </button>
        `;
    }
}

// Filter by tag
function filterByTag(tag) {
    activeTag = tag;
    const query = document.getElementById('searchInput').value;
    filterCourses(query, tag);
}

// Clear tag filter
function clearTagFilter() {
    activeTag = null;
    const query = document.getElementById('searchInput').value;
    filterCourses(query);
}

// Generate consistent gradient based on slug
function getGradient(slug) {
    const gradients = [
        'from-blue-500 to-blue-600',
        'from-purple-500 to-purple-600',
        'from-green-500 to-green-600',
        'from-red-500 to-red-600',
        'from-yellow-500 to-yellow-600',
        'from-pink-500 to-pink-600',
        'from-indigo-500 to-indigo-600',
        'from-teal-500 to-teal-600',
    ];
    
    // Simple hash for consistent color
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
        hash = slug.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        const clearBtn = document.getElementById('clearSearch');
        
        if (query) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
        
        filterCourses(query, activeTag);
    });
    
    // Clear search button
    document.getElementById('clearSearch').addEventListener('click', clearSearch);
    
    // Clear search with Escape key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            clearSearch();
        }
    });
    
    // Load courses
    loadCourses();
});

// Add keyboard support for accessibility
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
});