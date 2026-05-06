// Reusable HTML components
const getNavbar = (currentPage = 'home') => `
<nav class="bg-white shadow-md sticky top-0 z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex items-center">
        <a href="/" class="text-2xl font-bold text-blue-600 hover:text-blue-700 transition">
          📚 ED-Tech
        </a>
      </div>
      <div class="hidden md:flex items-center space-x-8">
        <a href="/" class="text-gray-700 hover:text-blue-600 font-medium transition ${currentPage === 'home' ? 'text-blue-600' : ''}">
          Home
        </a>
        <a href="/profile.html" class="text-gray-700 hover:text-blue-600 font-medium transition ${currentPage === 'profile' ? 'text-blue-600' : ''}">
          My Profile
        </a>
      </div>
    </div>
  </div>
</nav>`;

const getFooter = () => `
<footer class="bg-gray-900 text-white mt-16">
  <div class="max-w-7xl mx-auto px-4 py-12">
    <div class="grid md:grid-cols-3 gap-8">
      <div>
        <h3 class="text-xl font-bold mb-4">📚 ED-Tech</h3>
        <p class="text-gray-400">Quality education, accessible anywhere.</p>
      </div>
      <div>
        <h4 class="font-semibold mb-4">Quick Links</h4>
        <ul class="space-y-2 text-gray-400">
          <li><a href="/" class="hover:text-white transition">All Courses</a></li>
          <li><a href="/profile.html" class="hover:text-white transition">My Profile</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold mb-4">Connect</h4>
        <p class="text-gray-400">© ${new Date().getFullYear()} ED-Tech Platform</p>
      </div>
    </div>
  </div>
</footer>`;

const getMetaTags = (title, description) => `
<meta name="description" content="${description}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="website">`;

const getCourseSchema = (course) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  "name": course.title,
  "description": course.summary,
  "provider": {
    "@type": "Organization",
    "name": "ED-Tech Platform"
  },
  "instructor": {
    "@type": "Person",
    "name": course.faculty
  }
});

const getYouTubeEmbed = (url) => {
  if (!url || url === '#') return '';
  const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (!videoId) return '';
  
  return `
  <div class="w-full aspect-video rounded-lg overflow-hidden shadow-lg">
    <iframe 
      class="w-full h-full"
      src="https://www.youtube.com/embed/${videoId[1]}" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen
    ></iframe>
  </div>`;
};

const getTableOfContents = (content) => {
  const headings = content.match(/^#{2,3}\s.+$/gm);
  if (!headings || headings.length === 0) return '';
  
  let toc = '<div class="bg-white rounded-lg shadow p-6"><h3 class="font-bold text-lg mb-4">📑 Table of Contents</h3><ul class="space-y-2">';
  
  headings.forEach(heading => {
    const level = heading.match(/^#+/)[0].length;
    const text = heading.replace(/^#+\s/, '');
    const anchor = text.toLowerCase().replace(/[^\w]+/g, '-');
    const indent = level === 3 ? 'ml-4' : '';
    toc += `<li class="${indent}"><a href="#${anchor}" class="text-gray-600 hover:text-blue-600 transition">${text}</a></li>`;
  });
  
  toc += '</ul></div>';
  return toc;
};

module.exports = {
  getNavbar,
  getFooter,
  getMetaTags,
  getCourseSchema,
  getYouTubeEmbed,
  getTableOfContents
};