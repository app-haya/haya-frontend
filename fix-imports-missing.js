const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(path.join(dir, f));
        }
    });
}

let modified = 0;
walkDir('d:/haya/src/app/components', function (filePath) {
    if (filePath.endsWith('.ts') && !filePath.includes('.spec.')) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Check if TranslateModule is used in the decorator
        if (content.includes('TranslateModule')) {
            // Check if it's imported at the top
            if (!content.includes('import { TranslateModule } from \'@ngx-translate/core\';') &&
                !content.includes('import {TranslateModule} from \'@ngx-translate/core\';')) {

                let lines = content.split('\n');
                let lastImportIndex = -1;
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].trim().startsWith('import ')) {
                        lastImportIndex = i;
                    }
                }

                if (lastImportIndex !== -1) {
                    lines.splice(lastImportIndex + 1, 0, 'import { TranslateModule } from \'@ngx-translate/core\';');
                    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
                    modified++;
                    console.log('Fixed missing import in:', filePath);
                } else {
                    // no imports found at all, just put it at 0
                    lines.unshift('import { TranslateModule } from \'@ngx-translate/core\';');
                    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
                    modified++;
                    console.log('Fixed missing import in:', filePath);
                }
            }
        }
    }
});

console.log('Total fixed:', modified);
