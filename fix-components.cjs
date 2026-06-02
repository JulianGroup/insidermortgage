const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Remove Helmet
      if (content.includes('react-helmet-async')) {
        content = content.replace(/import\s+\{\s*Helmet\s*\}\s+from\s+['"]react-helmet-async['"];?\n?/, '');
        content = content.replace(/<Helmet>[\s\S]*?<\/Helmet>/g, '');
        changed = true;
      }

      // Replace Link to= with Link href=
      if (content.includes('<Link ')) {
        const newContent = content.replace(/(<Link[^>]*?)\bto=/g, '$1href=');
        if (newContent !== content) {
          content = newContent;
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
