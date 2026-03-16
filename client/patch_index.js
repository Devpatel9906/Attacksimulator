const fs = require('fs');
let html = fs.readFileSync('restored_xizt_devops.html', 'utf-8');

html = html.replace(/<body([^>]*)>/i, '<body$1>\n<div id="webflow-content">');
html = html.replace(/<\/body>/i, '</div>\n<div id="root"></div>\n<script type="module" src="/src/main.jsx"></script>\n</body>');

fs.writeFileSync('index.html', html);
