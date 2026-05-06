const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const { getCourseHTML } = require('./template');

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'courses');
const PUBLIC_COURSES_DIR = path.join(__dirname, '..', 'public', 'courses');
const PUBLIC_ROOT = path.join(__dirname, '..', 'public');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function parseMarkdownFiles() {
    if (!fs.existsSync(CONTENT_DIR)) {
        console.error('❌ content/courses/ directory not found');
        return [];
    }

    const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
    
    if (files.length === 0) {
        console.log('⚠️  No .md files found in content/courses/');
        return [];
    }

    const courses = [];

    for (const file of files) {
        const filePath = path.join(CONTENT_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Parse frontmatter
        const { data, content } = matter(fileContent);
        
        // Validate required fields
        if (!data.title || !data.slug) {
            console.error(`❌ Missing title or slug in ${file}`);
            continue;
        }

        // Convert markdown content to HTML
        const htmlContent = marked.parse(content || '');

        courses.push({
            title: data.title,
            slug: data.slug,
            summary: data.summary || '',
            faculty: data.faculty || 'Unknown',
            pdf: data.pdf || '',
            youtube: data.youtube || '',
            featured: data.featured || false,
            level: data.level || '',
            duration: data.duration || '',
            tags: data.tags || [],
            htmlContent: htmlContent
        });
    }

    return courses;
}

function generateCoursesJSON(courses) {
    const searchData = courses.map(course => ({
        title: course.title,
        slug: course.slug,
        summary: course.summary,
        faculty: course.faculty,
        level: course.level,
        duration: course.duration,
        featured: course.featured,
        tags: course.tags
    }));

    const jsonPath = path.join(PUBLIC_ROOT, 'courses.json');
    fs.writeFileSync(jsonPath, JSON.stringify(searchData, null, 2));
}

function build() {
    console.log('🚀 Building courses...\n');
    const startTime = Date.now();

    const courses = parseMarkdownFiles();

    if (courses.length === 0) {
        console.log('\n⚠️  No courses to build. Add .md files to content/courses/');
        return;
    }

    console.log(`📚 Found ${courses.length} course(s)\n`);

    ensureDir(PUBLIC_COURSES_DIR);

    let successCount = 0;

    for (const course of courses) {
        try {
            const courseDir = path.join(PUBLIC_COURSES_DIR, course.slug);
            ensureDir(courseDir);

            const html = getCourseHTML(course, courses);
            const outputPath = path.join(courseDir, 'index.html');
            fs.writeFileSync(outputPath, html);

            console.log(`✅ /courses/${course.slug}/index.html`);
            successCount++;
        } catch (error) {
            console.error(`❌ Failed to build ${course.slug}:`, error.message);
        }
    }

    // Generate courses.json for search
    generateCoursesJSON(courses);
    console.log(`\n✅ Generated courses.json`);

    const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n📊 Build Summary:`);
    console.log(`   Time: ${buildTime}s`);
    console.log(`   Built: ${successCount}/${courses.length} courses`);
    console.log(`\n🎉 Build complete!\n`);
}

// Run build
try {
    build();
} catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
}