const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('d:/haya/src/app/components', function (filePath) {
    if (filePath.endsWith('.ts') && !filePath.includes('.spec.')) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Only process standalone components that use imports
        if (content.includes('@Component') && content.includes('standalone: true')) {
            // Add TranslateModule import if missing
            if (!content.includes('TranslateModule')) {
                // Find the last import statment
                content = content.replace(/(import .*;\n)(?!import)/, `$1import { TranslateModule } from '@ngx-translate/core';\n`);

                // Append TranslateModule to imports array
                content = content.replace(/imports:\s*\[([^\]]*)\]/, (match, p1) => {
                    if (p1.trim().length === 0) return `imports: [TranslateModule]`;
                    return `imports: [${p1}, TranslateModule]`;
                });

                fs.writeFileSync(filePath, content, 'utf8');
                console.log('Fixed imports for:', filePath);
            }
        }
    }
});

console.log('Finished fixing TranslateModule imports');
