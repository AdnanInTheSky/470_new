const getCourseHTML = (course, allCourses) => {
    // Get related courses
    const related = allCourses
        .filter(c => c.slug !== course.slug)
        .slice(0, 3);

    // Extract YouTube video ID
    let videoId = '';
    if (course.youtube) {
        const match = course.youtube.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        if (match) videoId = match[1];
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${course.title} - ED-Tech</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #1a1a1a;
            line-height: 1.7;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        /* Reading progress bar */
        .progress-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: #f1f5f9;
            z-index: 1000;
        }
        
        .progress-bar {
            height: 100%;
            background: #2563eb;
            width: 0%;
            transition: width 0.1s linear;
        }
        
        /* Markdown content styling */
        .content {
            max-width: 680px;
            font-size: 1.0625rem;
            color: #374151;
        }
        
        .content h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-top: 3rem;
            margin-bottom: 1rem;
            color: #111827;
            letter-spacing: -0.02em;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .content h3 {
            font-size: 1.2rem;
            font-weight: 600;
            margin-top: 2rem;
            margin-bottom: 0.75rem;
            color: #1f2937;
        }
        
        .content p {
            margin-bottom: 1.25rem;
        }
        
        .content ul,
        .content ol {
            margin-bottom: 1.25rem;
            padding-left: 1.5rem;
        }
        
        .content li {
            margin-bottom: 0.5rem;
        }
        
        .content pre {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            padding: 1.25rem;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1.5rem 0;
            font-size: 0.9rem;
            line-height: 1.6;
        }
        
        .content code {
            background: #f1f5f9;
            color: #dc2626;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-size: 0.875em;
        }
        
        .content pre code {
            background: none;
            color: #1e293b;
            padding: 0;
        }
        
        .content a {
            color: #2563eb;
            text-decoration: none;
            border-bottom: 1px solid #bfdbfe;
        }
        
        .content a:hover {
            border-bottom-color: #2563eb;
        }
        
        .content blockquote {
            border-left: 3px solid #e5e7eb;
            padding-left: 1.25rem;
            margin: 1.5rem 0;
            color: #6b7280;
            font-style: italic;
        }
        
        /* Buttons */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.625rem 1.25rem;
            font-size: 0.875rem;
            font-weight: 500;
            color: #374151;
            background: #fff;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.15s ease;
            text-decoration: none;
        }
        
        .btn:hover {
            background: #f9fafb;
            border-color: #9ca3af;
        }
        
        .btn-bookmarked {
            background: #f0fdf4;
            border-color: #86efac;
            color: #166534;
        }
        
        .btn-bookmarked:hover {
            background: #dcfce7;
        }
        
        /* Print styles */
        @media print {
            nav, .no-print, .progress-container {
                display: none !important;
            }
            .content {
                max-width: 100%;
            }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .content {
                font-size: 1rem;
            }
        }
    </style>
</head>
<body class="bg-white min-h-screen">
    <!-- Reading Progress Bar -->
    <div class="progress-container">
        <div id="progressBar" class="progress-bar"></div>
    </div>

    <!-- Navigation -->
    <nav class="border-b border-gray-100 no-print">
        <div class="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
            <a href="/" class="text-sm text-gray-500 hover:text-gray-900 transition flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Courses
            </a>
            <div class="flex items-center gap-6 text-sm">
                <a href="/" class="text-gray-500 hover:text-gray-900 transition">Home</a>
                <a href="/profile.html" class="text-gray-500 hover:text-gray-900 transition">Profile</a>
            </div>
        </div>
    </nav>

    <!-- Course Header -->
    <header class="border-b border-gray-100">
        <div class="max-w-3xl mx-auto px-6 py-16">
            <!-- Tags -->
            ${course.tags && course.tags.length > 0 ? `
            <div class="flex flex-wrap gap-2 mb-4">
                ${course.tags.map(tag => `
                <span class="text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                    ${tag}
                </span>
                `).join('')}
            </div>
            ` : ''}
            
            <!-- Title -->
            <h1 class="text-4xl font-bold text-gray-900 mb-3 tracking-tight leading-tight">
                ${course.title}
            </h1>
            
            <!-- Summary -->
            <p class="text-lg text-gray-500 mb-6 leading-relaxed max-w-2xl">
                ${course.summary}
            </p>
            
            <!-- Meta Info -->
            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    ${course.faculty}
                </span>
                ${course.level ? `
                <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                    </svg>
                    ${course.level}
                </span>
                ` : ''}
                ${course.duration ? `
                <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    ${course.duration} weeks
                </span>
                ` : ''}
            </div>
            
            <!-- Action Buttons -->
            <div class="flex flex-wrap items-center gap-2 no-print">
                ${course.pdf ? `
                <a href="${course.pdf}" target="_blank" class="btn">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    PDF Notes
                </a>
                ` : ''}
                
                ${videoId ? `
                <a href="${course.youtube}" target="_blank" class="btn">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Watch Video
                </a>
                ` : ''}
                
                <button onclick="toggleBookmark('${course.slug}')" id="bookmarkBtn" class="btn">
                    <svg id="bookmarkIcon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                    </svg>
                    <span id="bookmarkText">Bookmark</span>
                </button>
            </div>
        </div>
    </header>

    <!-- Video Embed -->
    ${videoId ? `
    <div class="max-w-3xl mx-auto px-6 pt-12 no-print">
        <div class="aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            <iframe 
                class="w-full h-full"
                src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        </div>
    </div>
    ` : ''}

    <!-- Course Content -->
    <article class="max-w-3xl mx-auto px-6 py-12">
        <div class="content">
            ${course.htmlContent}
        </div>
    </article>

    <!-- Related Courses -->
    ${related.length > 0 ? `
    <section class="border-t border-gray-100 no-print">
        <div class="max-w-3xl mx-auto px-6 py-16">
            <h2 class="text-lg font-semibold text-gray-900 mb-6">Related Courses</h2>
            <div class="grid sm:grid-cols-3 gap-4">
                ${related.map(c => `
                <a href="/courses/${c.slug}" class="group block p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition">
                    <h3 class="font-medium text-gray-900 group-hover:text-blue-600 transition mb-1">${c.title}</h3>
                    <p class="text-sm text-gray-500 line-clamp-2">${c.summary}</p>
                    <span class="text-xs text-gray-400 mt-2 block">${c.faculty}</span>
                </a>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}

    <!-- Footer -->
    <footer class="border-t border-gray-100 no-print">
        <div class="max-w-3xl mx-auto px-6 py-8">
            <p class="text-center text-sm text-gray-400">
                © ${new Date().getFullYear()} ED-Tech Platform
            </p>
        </div>
    </footer>

    <!-- Scripts -->
    <script>
        // Reading progress bar
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = (scrollTop / scrollHeight) * 100;
            document.getElementById('progressBar').style.width = progress + '%';
        });

        // Bookmark functionality
        async function toggleBookmark(slug) {
            const token = localStorage.getItem('token');
            
            if (!token) {
                if (confirm('You need to login first. Go to profile page?')) {
                    window.location.href = '/profile.html';
                }
                return;
            }

            const btn = document.getElementById('bookmarkBtn');
            const text = document.getElementById('bookmarkText');
            const icon = document.getElementById('bookmarkIcon');
            const originalText = text.textContent;
            
            btn.disabled = true;
            text.textContent = 'Loading...';

            try {
                const response = await fetch('/api/bookmark', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ slug: slug })
                });

                const data = await response.json();

                if (response.ok) {
                    if (data.action === 'added') {
                        text.textContent = 'Bookmarked';
                        btn.classList.add('btn-bookmarked');
                        icon.setAttribute('fill', 'currentColor');
                    } else {
                        text.textContent = 'Bookmark';
                        btn.classList.remove('btn-bookmarked');
                        icon.setAttribute('fill', 'none');
                    }
                } else {
                    alert(data.error || 'Failed to update bookmark');
                    text.textContent = originalText;
                }
            } catch (error) {
                console.error('Bookmark error:', error);
                text.textContent = originalText;
                alert('Network error. Please try again.');
            } finally {
                btn.disabled = false;
            }
        }

        // Check if course is already bookmarked on page load
        (async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await fetch('/api/getBookmarks', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.bookmarks && data.bookmarks.includes('${course.slug}')) {
                        const btn = document.getElementById('bookmarkBtn');
                        const text = document.getElementById('bookmarkText');
                        const icon = document.getElementById('bookmarkIcon');
                        
                        text.textContent = 'Bookmarked';
                        btn.classList.add('btn-bookmarked');
                        icon.setAttribute('fill', 'currentColor');
                    }
                }
            } catch (error) {
                console.error('Error checking bookmark status:', error);
            }
        })();
    </script>
</body>
</html>`;
};

module.exports = { getCourseHTML };