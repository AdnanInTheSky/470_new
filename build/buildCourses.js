const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const { generateCourseHTML } = require('./templates/courseTemplate');

// Directories
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'courses');
const PUBLIC_COURSES_DIR = path.join(__dirname, '..', 'public', 'courses');
const PUBLIC_ROOT = path.join(__dirname, '..', 'public');

// Configure marked
marked.setOptions({
  headerIds: true,
  mangle: false,
  breaks: true,
  gfm: true
});

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function parseCourses() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error('❌ Content directory not found:', CONTENT_DIR);
    return [];
  }

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  
  return files.map(file => {
    const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
    const { data, content: mdContent } = matter(content);
    
    return {
      ...data,
      htmlContent: marked.parse(mdContent),
      content: mdContent
    };
  });
}

function generateJSONFiles(courses) {
  // courses.json for search
  const searchData = courses.map(({ title, slug, summary, faculty, level, duration, tags }) => ({
    title, slug, summary, faculty, level, duration, tags
  }));
  
  fs.writeFileSync(
    path.join(PUBLIC_ROOT, 'courses.json'),
    JSON.stringify(searchData, null, 2)
  );
  
  // Search index
  const searchIndex = {};
  courses.forEach(course => {
    const text = `${course.title} ${course.summary} ${course.faculty}`.toLowerCase();
    text.split(/\s+/).forEach(word => {
      if (!searchIndex[word]) searchIndex[word] = [];
      if (!searchIndex[word].includes(course.slug)) {
        searchIndex[word].push(course.slug);
      }
    });
  });
  
  fs.writeFileSync(
    path.join(PUBLIC_ROOT, 'search-index.json'),
    JSON.stringify(searchIndex)
  );
  
  console.log('✅ Generated courses.json and search index');
}

function build() {
  console.log('🚀 Building courses...\n');
  
  const courses = parseCourses();
  
  if (courses.length === 0) {
    console.log('⚠️  No courses found. Add .md files to content/courses/');
    return;
  }
  
  ensureDirectory(PUBLIC_COURSES_DIR);
  
  courses.forEach(course => {
    const dir = path.join(PUBLIC_COURSES_DIR, course.slug);
    ensureDirectory(dir);
    
    const html = generateCourseHTML(course, courses);
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    
    console.log(`✅ /courses/${course.slug}/index.html`);
  });
  
  generateJSONFiles(courses);
  console.log(`\n🎉 Built ${courses.length} courses successfully!\n`);
}

try {
  build();
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}