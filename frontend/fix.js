import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'src');
const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
       ? walkSync(path.join(dir, file), filelist)
       : filelist.concat(path.join(dir, file));
  });
  return filelist;
}

const files = walkSync(srcDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Remove the bad useToast instantiation lines
    content = content.replace(/^[ \t]*const[ \t]*\{.*addToast.*\}[ \t]*=[ \t]*useToast\(\);\r?\n?/gm, "");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', file);
    }
});
