const { getNavbar, getFooter, getMetaTags, getCourseSchema, getYouTubeEmbed, getTableOfContents } = require('./components');

const generateCourseHTML = (course, allCourses) => {
  const youtubeEmbed = getYouTubeEmbed(course.youtube);
  const toc = getTableOfContents(course.content);
  
  // Get related courses
  const relatedCourses = allCourses
    .filter(c => c.slug !== course.slug)
    .slice(0, 3);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${course.title} - ED-Tech</title>
  ${getMetaTags(course.title, course.summary)}
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#2563eb',
            secondary: '#7c3aed',
          }
        }
      }
    }
  </script>
  
  <!-- Schema.org markup -->
  <script type="application/ld+json">
    ${JSON.stringify(getCourseSchema(course))}
  </script>
  
  <style>
    /* Markdown content styling */
    .prose h2 { 
      font-size: 1.875rem; 
      font-weight: 700; 
      margin-top: 2rem; 
      margin-bottom: 1rem;
      color: #1e293b;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 0.5rem;
    }
    .prose h3 { 
      font-size: 1.5rem; 
      font-weight: 600; 
      margin-top: 1.5rem; 
      margin-bottom: 0.75rem;
      color: #334155;
    }
    .prose p { margin-bottom: 1rem; line-height: 1.8; }
    .prose ul, .prose ol { margin-left: 1.5rem; margin-bottom: 1rem; }
    .prose li { margin-bottom: 0.5rem; }
    .prose pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 1.5rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 1.5rem 0;
    }
    .prose code {
      background: #f1f5f9;
      color: #ef4444;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-size: 0.9em;
    }
    .prose pre code {
      background: none;
      color: inherit;
      padding: 0;
    }
    .prose blockquote {
      border-left: 4px solid #7c3aed;
      background: #f5f3ff;
      padding: 1rem 1.5rem;
      margin: 1rem 0;
      border-radius: 0 0.5rem 0.5rem 0;
    }
    .prose table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }
    .prose th, .prose td {
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
    }
    .prose th {
      background: #f8fafc;
      font-weight: 600;
    }
    .prose img {
      max-width: 100%;
      border-radius: 0.5rem;
      margin: 1rem 0;
    }
    
    /* Smooth scroll */
    html { scroll-behavior: smooth; }
    
    /* Reading progress bar */
    .progress-bar {
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.1s linear;
    }
  </style>
</head>
<body class="bg-gray-50">
  <!-- Reading Progress Bar -->
  <div class="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
    <div id="progressBar" class="progress-bar h-full w-0"></div>
  </div>
  
  ${getNavbar('course')}
  
  <!-- Course Header -->
  <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
    <div class="max-w-5xl mx-auto px-4 py-16">
      <a href="/" class="inline-flex items-center text-white/80 hover:text-white mb-6 transition">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Back to Courses
      </a>
      
      <h1 class="text-4xl md:text-5xl font-bold mb-4">${course.title}</h1>
      <p class="text-xl text-white/90 mb-6">${course.summary}</p>
      
      <div class="flex flex-wrap gap-4 text-white/80 mb-6">
        <span class="flex items-center gap-2">
          <span>👨‍🏫</span> ${course.faculty}
        </span>
        ${course.level ? `<span class="flex items-center gap-2"><span>📊</span> ${course.level}</span>` : ''}
        ${course.duration ? `<span class="flex items-center gap-2"><span>⏱️</span> ${course.duration}</span>` : ''}
        ${course.tags && course.tags.length ? `<span class="flex items-center gap-2"><span>🏷️</span> ${course.tags.join(', ')}</span>` : ''}
      </div>
      
      <div class="flex flex-wrap gap-3">
        ${course.pdf && course.pdf !== '#' ? `
        <a href="${course.pdf}" target="_blank" 
           class="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition hover:scale-105 inline-flex items-center gap-2">
          📄 Download PDF
        </a>` : ''}
        ${course.youtube && course.youtube !== '#' ? `
        <a href="${course.youtube}" target="_blank" 
           class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition hover:scale-105 inline-flex items-center gap-2">
          ▶️ Watch Video
        </a>` : ''}
        <button onclick="toggleBookmark('${course.slug}')" id="bookmarkBtn"
                class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition hover:scale-105 inline-flex items-center gap-2">
          🔖 Bookmark
        </button>
      </div>
    </div>
  </div>
  
  <!-- Course Content -->
  <div class="max-w-7xl mx-auto px-4 py-12">
    <div class="grid lg:grid-cols-3 gap-8">
      <!-- Main Content -->
      <div class="lg:col-span-2">
        ${youtubeEmbed ? `<div class="mb-8">${youtubeEmbed}</div>` : ''}
        
        <div class="bg-white rounded-lg shadow p-8">
          <div class="prose max-w-none">
            ${course.htmlContent}
          </div>
        </div>
        
        ${course.pdf && course.pdf !== '#' ? `
        <div class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-8 mt-8 text-white text-center">
          <h3 class="text-2xl font-bold mb-4">📥 Download Course Materials</h3>
          <a href="${course.pdf}" target="_blank" 
             class="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:shadow-xl transition">
            Download PDF
          </a>
        </div>` : ''}
      </div>
      
      <!-- Sidebar -->
      <div class="space-y-6">
        ${toc}
        
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="font-bold text-lg mb-4">📊 Course Info</h3>
          <div class="space-y-3 text-gray-600">
            <div class="flex justify-between">
              <span>Instructor:</span>
              <span class="font-semibold">${course.faculty}</span>
            </div>
            ${course.level ? `
            <div class="flex justify-between">
              <span>Level:</span>
              <span class="font-semibold">${course.level}</span>
            </div>` : ''}
            ${course.duration ? `
            <div class="flex justify-between">
              <span>Duration:</span>
              <span class="font-semibold">${course.duration}</span>
            </div>` : ''}
          </div>
        </div>
        
        <!-- Share buttons -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="font-bold text-lg mb-4">🔗 Share Course</h3>
          <div class="flex gap-2">
            <button onclick="navigator.clipboard.writeText(window.location.href)" 
                    class="bg-gray-100 hover:bg-gray-200 p-3 rounded-lg transition">
              📋
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Related Courses -->
    ${relatedCourses.length > 0 ? `
    <div class="mt-16">
      <h2 class="text-3xl font-bold text-gray-900 mb-8">📚 Related Courses</h2>
      <div class="grid md:grid-cols-3 gap-6">
        ${relatedCourses.map(rc => `
        <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-2">${rc.title}</h3>
          <p class="text-gray-600 mb-4">${rc.summary.substring(0, 100)}...</p>
          <a href="/courses/${rc.slug}" 
             class="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1">
            View Course <span>→</span>
          </a>
        </div>
        `).join('')}
      </div>
    </div>` : ''}
  </div>
  
  ${getFooter()}
  
  <script>
    // Reading progress bar
    window.addEventListener('scroll', () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      document.getElementById('progressBar').style.width = progress + '%';
    });
    
    // Bookmark functionality
    async function toggleBookmark(slug) {
      const token = localStorage.getItem('token');
      if (!token) {
        if (confirm('Please login to bookmark courses. Go to profile page?')) {
          window.location.href = '/profile.html';
        }
        return;
      }
      
      const btn = document.getElementById('bookmarkBtn');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '⏳ Loading...';
      btn.disabled = true;
      
      try {
        const response = await fetch('/api/bookmark', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ slug })
        });
        
        const data = await response.json();
        
        if (data.action === 'added') {
          btn.innerHTML = '✅ Bookmarked!';
          btn.className = 'bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition';
        } else if (data.action === 'removed') {
          btn.innerHTML = '🔖 Bookmark';
          btn.className = 'bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition';
        }
      } catch (error) {
        btn.innerHTML = originalHTML;
        alert('Failed to update bookmark');
      } finally {
        btn.disabled = false;
      }
    }
    
    // Check initial bookmark status
    (async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const response = await fetch('/api/getBookmarks', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await response.json();
        const btn = document.getElementById('bookmarkBtn');
        
        if (data.bookmarks && data.bookmarks.includes('${course.slug}')) {
          btn.innerHTML = '✅ Bookmarked!';
          btn.className = 'bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition';
        }
      } catch (error) {
        console.error('Error checking bookmark:', error);
      }
    })();
    
    // Smooth scroll for TOC links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  </script>
</body>
</html>`;
};

module.exports = { generateCourseHTML };