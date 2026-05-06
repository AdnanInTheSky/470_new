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

function generateCourseHTML(course, allCourses) {
    const relatedCourses = allCourses
        .filter(c => c.slug !== course.slug)
        .slice(0, 3);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${course.title} - ED-Tech</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Minimalist typography */
        .prose {
            max-width: 65ch;
            line-height: 1.8;
            color: #374151;
        }
        .prose h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-top: 3rem;
            margin-bottom: 1rem;
            color: #111827;
            letter-spacing: -0.02em;
        }
        .prose h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-top: 2rem;
            margin-bottom: 0.75rem;
            color: #1f2937;
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
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 1.25rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin: 1.5rem 0;
            font-size: 0.9rem;
            line-height: 1.6;
        }
        .prose code {
            background: #f1f5f9;
            color: #dc2626;
            padding: 0.2rem 0.4rem;
            border-radius: 0.25rem;
            font-size: 0.875em;
            font-weight: 500;
        }
        .prose pre code {
            background: none;
            color: #1e293b;
            padding: 0;
            font-weight: 400;
        }
        .prose a {
            color: #2563eb;
            text-decoration: none;
            border-bottom: 1px solid #bfdbfe;
        }
        .prose a:hover {
            border-bottom-color: #2563eb;
        }
        .prose blockquote {
            border-left: 3px solid #e2e8f0;
            padding-left: 1.25rem;
            margin: 1.5rem 0;
            color: #6b7280;
            font-style: italic;
        }
        .prose img {
            border-radius: 0.5rem;
            max-width: 100%;
        }
        
        /* Reading progress */
        .reading-progress {
            height: 2px;
            background: linear-gradient(to right, #2563eb, #7c3aed);
            transition: width 0.2s ease;
        }
        
        /* Smooth scroll */
        html {
            scroll-behavior: smooth;
        }
        
        /* Print styles */
        @media print {
            nav, .no-print { display: none; }
            .prose { max-width: 100%; }
        }
    </style>
</head>
<body class="bg-white min-h-screen antialiased">
    <!-- Reading Progress -->
    <div class="fixed top-0 left-0 w-full z-50">
        <div id="progressBar" class="reading-progress w-0"></div>
    </div>

    <!-- Minimal Nav -->
    <nav class="border-b border-gray-100 no-print">
        <div class="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
            <a href="/" class="text-lg font-semibold text-gray-900 hover:text-blue-600 transition">
                ← Courses
            </a>
            <div class="flex gap-6 text-sm">
                <a href="/" class="text-gray-500 hover:text-gray-900 transition">Home</a>
                <a href="/profile.html" class="text-gray-500 hover:text-gray-900 transition">Profile</a>
            </div>
        </div>
    </nav>

    <!-- Course Header - Minimal -->
    <header class="border-b border-gray-100">
        <div class="max-w-3xl mx-auto px-6 py-16">
            <!-- Tags -->
            ${course.tags ? `
            <div class="flex gap-2 mb-4">
                ${course.tags.map(tag => `
                    <span class="text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">${tag}</span>
                `).join('')}
            </div>` : ''}
            
            <!-- Title -->
            <h1 class="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                ${course.title}
            </h1>
            
            <!-- Summary -->
            <p class="text-lg text-gray-500 mb-6 leading-relaxed">
                ${course.summary}
            </p>
            
            <!-- Meta -->
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
                </span>` : ''}
                ${course.duration ? `
                <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    ${course.duration}
                </span>` : ''}
            </div>
            
            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-3 no-print">
                ${course.pdf ? `
                <a href="${course.pdf}" target="_blank" 
                   class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    PDF
                </a>` : ''}
                ${course.youtube ? `
                <a href="${course.youtube}" target="_blank" 
                   class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Video
                </a>` : ''}
                <button onclick="toggleBookmark('${course.slug}')" id="bookmarkBtn"
                        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                    </svg>
                    <span id="bookmarkText">Bookmark</span>
                </button>
            </div>
        </div>
    </header>

    <!-- Course Content -->
    <article class="max-w-3xl mx-auto px-6 py-12">
        <div class="prose">
            ${course.htmlContent}
        </div>
    </article>

    <!-- Related Courses -->
    ${relatedCourses.length > 0 ? `
    <section class="border-t border-gray-100 no-print">
        <div class="max-w-3xl mx-auto px-6 py-16">
            <h2 class="text-lg font-semibold text-gray-900 mb-6">Related Courses</h2>
            <div class="grid sm:grid-cols-3 gap-4">
                ${relatedCourses.map(rc => `
                <a href="/courses/${rc.slug}" class="group block p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition">
                    <h3 class="font-medium text-gray-900 group-hover:text-blue-600 transition mb-1">${rc.title}</h3>
                    <p class="text-sm text-gray-500">${(rc.summary || '').substring(0, 80)}...</p>
                </a>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    <!-- Minimal Footer -->
    <footer class="border-t border-gray-100 no-print">
        <div class="max-w-3xl mx-auto px-6 py-8 text-center text-sm text-gray-400">
            © ${new Date().getFullYear()} ED-Tech
        </div>
    </footer>

    <script>
        // Reading progress
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = (scrollTop / scrollHeight) * 100;
            document.getElementById('progressBar').style.width = progress + '%';
        });

        // Bookmark
        async function toggleBookmark(slug) {
            const token = localStorage.getItem('token');
            if (!token) {
                if (confirm('Login required. Go to profile?')) window.location.href = '/profile.html';
                return;
            }
            const btn = document.getElementById('bookmarkBtn');
            const text = document.getElementById('bookmarkText');
            const originalText = text.textContent;
            text.textContent = '...';
            btn.disabled = true;
            try {
                const res = await fetch('/api/bookmark', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify({ slug })
                });
                const data = await res.json();
                text.textContent = data.action === 'added' ? 'Bookmarked' : 'Bookmark';
            } catch (e) {
                text.textContent = originalText;
            } finally {
                btn.disabled = false;
            }
        }

        // Check initial bookmark
        (async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await fetch('/api/getBookmarks', {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                const data = await res.json();
                if (data.bookmarks?.includes('${course.slug}')) {
                    document.getElementById('bookmarkText').textContent = 'Bookmarked';
                }
            } catch (e) {}
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