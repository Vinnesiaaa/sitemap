// script.js
document.getElementById('addUrl').addEventListener('click', function() {
  const urlList = document.getElementById('url-list');
  const index = urlList.children.length;
  const urlEntry = document.createElement('div');
  urlEntry.className = 'url-entry';
  urlEntry.innerHTML = `
    <label for="mainUrl-${index}" class="block text-sm font-medium text-gray-300">Main URL</label>
    <input type="url" id="mainUrl-${index}" name="mainUrl[]" required
           class="mt-1 block w-full border border-gray-600 rounded-md p-2 bg-gray-900 text-white text-sm"
           placeholder="https://example.com">
    <label for="path-${index}" class="block text-sm font-medium text-gray-300 mt-2">Path</label>
    <input type="text" id="path-${index}" name="path[]"
           class="mt-1 block w-full border border-gray-600 rounded-md p-2 bg-gray-900 text-white text-sm"
           placeholder="/page${index + 1}">
    <label for="lastmod-${index}" class="block text-sm font-medium text-gray-300 mt-2">Last Modified (YYYY-MM-DD)</label>
    <input type="date" id="lastmod-${index}" name="lastmod[]"
           class="mt-1 block w-full border border-gray-600 rounded-md p-2 bg-gray-900 text-white text-sm">
    <label for="changefreq-${index}" class="block text-sm font-medium text-gray-300 mt-2">Change Frequency</label>
    <select id="changefreq-${index}" name="changefreq[]"
            class="mt-1 block w-full border border-gray-600 rounded-md p-2 bg-gray-900 text-white text-sm">
      <option value="daily">Daily</option>
      <option value="weekly">Weekly</option>
      <option value="monthly">Monthly</option>
      <option value="yearly">Yearly</option>
      <option value="never">Never</option>
    </select>
    <label for="priority-${index}" class="block text-sm font-medium text-gray-300 mt-2">Priority (0.0 - 1.0)</label>
    <input type="number" id="priority-${index}" name="priority[]" step="0.1" min="0" max="1"
           class="mt-1 block w-full border border-gray-600 rounded-md p-2 bg-gray-900 text-white text-sm"
           placeholder="0.8">
  `;
  urlList.appendChild(urlEntry);
});

document.getElementById('sitemapForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const errorMessage = document.getElementById('error-message');
  errorMessage.classList.add('hidden');
  errorMessage.textContent = '';

  const mainUrls = document.getElementsByName('mainUrl[]');
  const paths = document.getElementsByName('path[]');
  const lastmods = document.getElementsByName('lastmod[]');
  const changefreqs = document.getElementsByName('changefreq[]');
  const priorities = document.getElementsByName('priority[]');

  const urls = [];
  const urlRegex = /^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const validFrequencies = ['daily', 'weekly', 'monthly', 'yearly', 'never'];

  for (let i = 0; i < mainUrls.length; i++) {
    const mainUrl = mainUrls[i].value.trim();
    const path = paths[i].value.trim();
    const lastmod = lastmods[i].value || new Date().toISOString().split('T')[0];
    const changefreq = changefreqs[i].value;
    const priority = priorities[i].value || '0.8';

    if (!urlRegex.test(mainUrl)) {
      errorMessage.textContent = `Invalid URL format at entry ${i + 1}`;
      errorMessage.classList.remove('hidden');
      return;
    }
    if (lastmod && !dateRegex.test(lastmod)) {
      errorMessage.textContent = `Invalid date format at entry ${i + 1}`;
      errorMessage.classList.remove('hidden');
      return;
    }
    if (!validFrequencies.includes(changefreq)) {
      errorMessage.textContent = `Invalid change frequency at entry ${i + 1}`;
      errorMessage.classList.remove('hidden');
      return;
    }
    if (priority && (isNaN(priority) || priority < 0 || priority > 1)) {
      errorMessage.textContent = `Priority must be between 0.0 and 1.0 at entry ${i + 1}`;
      errorMessage.classList.remove('hidden');
      return;
    }

    const fullUrl = mainUrl + (path.startsWith('/') ? path : '/' + path);
    urls.push({ fullUrl, lastmod, changefreq, priority });
  }

  let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  urls.forEach(url => {
    xmlContent += `
  <url>
    <loc>${url.fullUrl}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
  });
  xmlContent += `
</urlset>`;

  gtag('event', 'generate_sitemap', {
    'event_category': 'Sitemap',
    'event_label': 'Generate',
    'value': urls.length
  });

  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'sitemap.xml';
  link.click();
  URL.revokeObjectURL(link.href);
});
