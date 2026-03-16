const fs = require('fs');
let html = fs.readFileSync('public/home.html', 'utf-8');

const targetStr = '<a href="#form-btn" class="nav_menu-link w-nav-link">CONTACTS</a>';
const appendStr = '<a href="/login" target="_parent" class="nav_menu-link w-nav-link" style="color: #3dd6c6 !important; font-weight: bold;">LOGIN</a>';

if (html.includes(targetStr)) {
  html = html.replace(targetStr, targetStr + appendStr);
  fs.writeFileSync('public/home.html', html);
  console.log("Patched successfully");
} else {
  console.log("Target string not found");
}
