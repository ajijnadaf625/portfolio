const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'visualizers');
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (!file.endsWith('.jsx')) return;
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace visualizerArea alignItems to flex-start for professional top alignment
  const oldText = `  visualizerArea: {
    display: 'flex',
    flexDirection: 'row',
    gap: '24px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center'`;

  const newText = `  visualizerArea: {
    display: 'flex',
    flexDirection: 'row',
    gap: '24px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start'`;

  if (content.includes(oldText)) {
    content = content.replace(oldText, newText);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Aligned visualizerArea in ${file}`);
  } else {
    // try different spacing variant
    const oldText2 = `  visualizerArea: {\n    display: 'flex',\n    flexDirection: 'row',\n    gap: '24px',\n    flexWrap: 'wrap',\n    justifyContent: 'center',\n    alignItems: 'center'`;
    const newText2 = `  visualizerArea: {\n    display: 'flex',\n    flexDirection: 'row',\n    gap: '24px',\n    flexWrap: 'wrap',\n    justifyContent: 'center',\n    alignItems: 'flex-start'`;
    if (content.includes(oldText2)) {
      content = content.replace(oldText2, newText2);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Aligned visualizerArea (variant) in ${file}`);
    } else {
      console.log(`Could not find visualizerArea in ${file}`);
    }
  }
});
