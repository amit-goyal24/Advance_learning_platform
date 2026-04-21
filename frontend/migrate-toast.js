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
    if (content.includes('useToast')) {
        content = content.replace(/import \{ useToast \} from '\.\.\/components\/ToastMessage';/, "import toast from 'react-hot-toast';");
        content = content.replace(/import \{ useToast \} from '\.\/components\/ToastMessage';/, "import toast from 'react-hot-toast';");
        
        // Remove hook instantiation entirely
        content = content.replace(/[ \t]*const[ \t]*\{(toasts,\s*)?addToast\}[ \t]*=[ \t]*useToast\(\);\r?\n/, "");

        // Replace addToast(msg, 'success') -> toast.success(msg)
        content = content.replace(/addToast\((.*?),\s*'success'\)/g, "toast.success($1)");
        
        // Replace addToast(msg, 'error') -> toast.error(msg)
        content = content.replace(/addToast\((.*?),\s*'error'\)/g, "toast.error($1)");
        
        // Replace addToast(msg) -> toast($1)
        content = content.replace(/addToast\((.*?)\)/g, "toast($1)");

        fs.writeFileSync(file, content, 'utf8');
        console.log('Migrated', file);
    }
});
