import fs from 'fs';
import path from 'path';

const checkIcon = (pkg, name) => {
  try {
    const filePath = path.join(process.cwd(), 'node_modules', `@iconify-json/${pkg}`, 'icons.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const icon = data.icons[name];
      if (icon) {
        console.log(`Icon ${pkg}:${name}:`);
        console.log(JSON.stringify(icon, null, 2));
      } else {
        console.log(`Icon ${pkg}:${name} not found in icons.json`);
      }
    } else {
      console.log(`File not found: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error checking ${pkg}:${name}:`, err.message);
  }
};

checkIcon('cuida', 'calendar-outline');
checkIcon('dashicons', 'category');
checkIcon('mdi', 'tag-outline');
