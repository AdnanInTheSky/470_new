const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'courses');
const PUBLIC_COURSES_DIR = path.join(__dirname, '..', 'public', 'courses');
const PUBLIC_ROOT = path.join(__dirname, '..', 'public');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function parseCourses() {
    if (!fs.existsSync(CONTENT_DIR)) {
        console.error('❌ content/courses/ directory not found');
        return [];
    }

    const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
    
    return files.map(file => {
        const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
        const { data, content: mdContent } = matter(content);
        return {
            ...data,
            htmlContent: marked.parse(mdContent || ''),
            content: mdContent
        };
    });
}

function getYoutubeEmbedUrl(url) {
    if (!url) return null;
    // Handle youtu.be format
    if (url.includes('youtu.be')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    // Handle youtube.com watch format
    const videoIdMatch = url.match(/(?:watch\?v=|&v=|\/(?:embed|v)\/)([a-zA-Z0-9_-]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
        return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    return null;
}

function generateCourseHTML(course, allCourses) {
    const relatedCourses = allCourses
        .filter(c => c.slug !== course.slug)
        .slice(0, 3);
    
    const youtubeEmbedUrl = getYoutubeEmbedUrl(course.youtube);
    const hasVideo = !!youtubeEmbedUrl;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${course.title} — ED-Tech</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap" rel="stylesheet">
    <style>
        * {
            font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .prose {
            max-width: 65ch;
            line-height: 1.75;
            color: #334155;
        }
        .prose h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-top: 2.5rem;
            margin-bottom: 1rem;
            color: #0f172a;
            letter-spacing: -0.01em;
        }
        .prose h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-top: 2rem;
            margin-bottom: 0.75rem;
            color: #1e293b;
        }
        .prose p {
            margin-bottom: 1.25rem;
        }
        .prose ul, .prose ol {
            margin-bottom: 1.25rem;
            padding-left: 1.5rem;
        }
        .prose li {
            margin-bottom: 0.5rem;
        }
        .prose pre {
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            padding: 1rem;
            border-radius: 0.75rem;
            overflow-x: auto;
            margin: 1.5rem 0;
            font-size: 0.875rem;
            line-height: 1.6;
        }
        .prose code {
            background: #f1f5f9;
            color: #e11d48;
            padding: 0.2rem 0.4rem;
            border-radius: 0.375rem;
            font-size: 0.875em;
            font-weight: 500;
        }
        .prose pre code {
            background: none;
            color: #0f172a;
            padding: 0;
            font-weight: 400;
        }
        .prose a {
            color: #3b82f6;
            text-decoration: none;
            border-bottom: 1px solid #bfdbfe;
        }
        .prose a:hover {
            border-bottom-color: #3b82f6;
        }
        .prose blockquote {
            border-left: 3px solid #cbd5e1;
            padding-left: 1.25rem;
            margin: 1.5rem 0;
            color: #64748b;
            font-style: italic;
        }
        .prose img {
            border-radius: 0.75rem;
            max-width: 100%;
        }
        .reading-progress {
            height: 2px;
            background: linear-gradient(to right, #3b82f6, #8b5cf6);
            transition: width 0.2s ease;
        }
        html {
            scroll-behavior: smooth;
        }
        @media print {
            nav, .no-print { display: none; }
            .prose { max-width: 100%; }
        }
        .video-container {
            position: relative;
            padding-bottom: 56.25%; /* 16:9 aspect ratio */
            height: 0;
            overflow: hidden;
            border-radius: 1rem;
            background: #f8fafc;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
        }
        .video-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 0;
            border-radius: 1rem;
        }
        .bookmark-btn.bookmarked svg {
            fill: #3b82f6;
            stroke: #3b82f6;
        }
        .hover-scale {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-scale:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 20px -12px rgba(0, 0, 0, 0.15);
        }
    </style>
</head>
<body class="bg-white antialiased">
    <!-- Reading Progress Bar -->
    <div class="fixed top-0 left-0 w-full z-50">
        <div id="progressBar" class="reading-progress w-0"></div>
    </div>

    <!-- Minimal Navigation -->
    <nav class="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-40 no-print">
        <div class="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <a href="/" class="text-base font-medium text-gray-900 hover:text-blue-600 transition flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                All courses
            </a>
            <div class="flex gap-6 text-sm">
                <a href="/" class="text-gray-500 hover:text-gray-900 transition">Home</a>
                <a href="/profile.html" class="text-gray-500 hover:text-gray-900 transition">Profile</a>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <header class="border-b border-gray-100">
        <div class="max-w-3xl mx-auto px-6 py-12 md:py-16">
            ${course.tags && course.tags.length ? `
            <div class="flex flex-wrap gap-2 mb-5">
                ${course.tags.map(tag => `
                    <span class="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">${tag}</span>
                `).join('')}
            </div>` : ''}
            
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                ${course.title}
            </h1>
            
            <p class="text-lg md:text-xl text-gray-500 mb-6 leading-relaxed">
                ${course.summary || 'An in-depth exploration of fundamental concepts and advanced techniques.'}
            </p>
            
            <div class="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-500 mb-8">
                <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    ${course.faculty || 'Instructor TBA'}
                </span>
                ${course.level ? `
                <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                    ${course.level}
                </span>` : ''}
                ${course.duration ? `
                <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    ${course.duration} weeks
                </span>` : ''}
            </div>
            
            <div class="flex flex-wrap gap-3 no-print">
                ${course.pdf ? `
                <a href="${course.pdf}" target="_blank" 
                   class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    Syllabus (PDF)
                </a>` : ''}
                ${hasVideo ? `
                <a href="#video-section" 
                   class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-sm">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.5 4.5L9 12L2.5 19.5V4.5Z" fill="currentColor"/><path d="M9 12L20 6V18L9 12Z" fill="currentColor"/></svg>
                    Watch intro
                </a>` : ''}
                <button onclick="toggleBookmark('${course.slug}')" id="bookmarkBtn"
                        class="bookmark-btn inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                    <span id="bookmarkText">Bookmark</span>
                </button>
            </div>
        </div>
    </header>

    <!-- YouTube Video Section (if available) -->
    ${hasVideo ? `
    <section id="video-section" class="border-b border-gray-100 no-print">
        <div class="max-w-3xl mx-auto px-6 py-12">
            <div class="video-container">
                <iframe src="${youtubeEmbedUrl}?rel=0&modestbranding=1&autohide=1&showinfo=0" 
                        title="${course.title} video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                </iframe>
            </div>
            <p class="text-xs text-gray-400 text-center mt-3">Course overview and key concepts</p>
        </div>
    </section>
    ` : ''}

    <!-- Main Content -->
    <article class="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <div class="prose prose-slate max-w-none">
            ${course.htmlContent}
        </div>
    </article>

    <!-- Related Courses -->
    ${relatedCourses.length ? `
    <section class="border-t border-gray-100 no-print">
        <div class="max-w-3xl mx-auto px-6 py-16">
            <h2 class="text-xl font-semibold text-gray-900 mb-6 tracking-tight">Continue learning</h2>
            <div class="grid sm:grid-cols-3 gap-5">
                ${relatedCourses.map(rc => `
                <a href="/courses/${rc.slug}" class="group block p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover-scale transition bg-white">
                    <h3 class="font-medium text-gray-900 group-hover:text-blue-600 transition mb-1">${rc.title}</h3>
                    <p class="text-sm text-gray-500 line-clamp-2">${(rc.summary || rc.title).substring(0, 90)}...</p>
                </a>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    <!-- Footer -->
    <footer class="border-t border-gray-100 no-print">
        <div class="max-w-3xl mx-auto px-6 py-8 text-center text-sm text-gray-400">
            © ${new Date().getFullYear()} ED-Tech
        </div>
    </footer>

    <script>
        (function() {
            // Reading progress
            window.addEventListener('scroll', function() {
                const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const progress = (scrollTop / scrollHeight) * 100;
                const progressBar = document.getElementById('progressBar');
                if (progressBar) progressBar.style.width = progress + '%';
            });

            // Bookmark logic
            window.toggleBookmark = async function(slug) {
                const token = localStorage.getItem('token');
                if (!token) {
                    if (confirm('Login required to bookmark. Go to profile page?')) {
                        window.location.href = '/profile.html';
                    }
                    return;
                }
                const btn = document.getElementById('bookmarkBtn');
                const textSpan = document.getElementById('bookmarkText');
                const originalText = textSpan.textContent;
                textSpan.textContent = '...';
                btn.disabled = true;
                try {
                    const res = await fetch('/api/bookmark', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                        body: JSON.stringify({ slug })
                    });
                    const data = await res.json();
                    if (data.action === 'added') {
                        textSpan.textContent = 'Bookmarked';
                        btn.classList.add('bookmarked');
                    } else {
                        textSpan.textContent = 'Bookmark';
                        btn.classList.remove('bookmarked');
                    }
                } catch (e) {
                    textSpan.textContent = originalText;
                } finally {
                    btn.disabled = false;
                }
            };

            // Check initial bookmark status
            (async function checkBookmark() {
                const token = localStorage.getItem('token');
                if (!token) return;
                try {
                    const res = await fetch('/api/getBookmarks', {
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    const data = await res.json();
                    if (data.bookmarks && data.bookmarks.includes('${course.slug}')) {
                        const textSpan = document.getElementById('bookmarkText');
                        const btn = document.getElementById('bookmarkBtn');
                        if (textSpan) textSpan.textContent = 'Bookmarked';
                        if (btn) btn.classList.add('bookmarked');
                    }
                } catch (e) {
                    // silently fail
                }
            })();
        })();
    </script>
</body>
</html>`;
}

function build() {
    console.log('🚀 Building courses...\n');
    
    const courses = parseCourses();
    
    if (courses.length === 0) {
        console.log('⚠️  No courses found. Add .md files to content/courses/');
        return;
    }
    
    ensureDir(PUBLIC_COURSES_DIR);
    
    courses.forEach(course => {
        const courseDir = path.join(PUBLIC_COURSES_DIR, course.slug);
        ensureDir(courseDir);
        
        const html = generateCourseHTML(course, courses);
        fs.writeFileSync(path.join(courseDir, 'index.html'), html);
        console.log(`✅ Built: /courses/${course.slug}/index.html`);
    });
    
    const coursesJSON = courses.map(({ title, slug, summary, faculty, level, duration, featured, tags }) => ({
        title, slug, summary, faculty, level, duration, featured, tags
    }));
    
    fs.writeFileSync(
        path.join(PUBLIC_ROOT, 'courses.json'),
        JSON.stringify(coursesJSON, null, 2)
    );
    
    console.log(`\n✅ Created courses.json with ${courses.length} courses`);
    console.log('🎉 Build complete!\n');
}

try {
    build();
} catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
}