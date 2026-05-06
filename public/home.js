let courses = [];

async function load() {
    try {
        const res = await fetch('/courses.json');
        if (!res.ok) throw new Error('Failed to load');
        courses = await res.json();
        render(courses);
    } catch (e) {
        document.getElementById('grid').innerHTML = 
            '<p class="text-red-500 col-span-full text-center py-12">Error loading courses. Run: npm run build</p>';
    }
}

function render(list) {
    document.getElementById('grid').innerHTML = list.map(c => `
        <div class="card bg-white rounded-lg border border-gray-200 p-6" onclick="location.href='/courses/${c.slug}'">
            ${c.featured ? '<span class="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full mb-3 inline-block">Featured</span>' : ''}
            <h2 class="text-lg font-semibold text-gray-900 mb-2">${c.title}</h2>
            <p class="text-sm text-gray-500 mb-4">${c.summary}</p>
            <div class="flex items-center justify-between text-xs text-gray-400">
                <span>${c.faculty}</span>
                ${c.duration ? `<span>${c.duration} weeks</span>` : ''}
            </div>
        </div>
    `).join('');
}

document.getElementById('search').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    render(courses.filter(c => 
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.faculty.toLowerCase().includes(q)
    ));
});

load();