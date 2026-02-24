const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walkDir(dirPath, callback);
        } else {
            callback(path.join(dir, f));
        }
    });
}

const componentDir = 'd:/haya/src/app/components';

walkDir(componentDir, function (filePath) {
    if (filePath.endsWith('.ts') && !filePath.endsWith('.spec.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');

        if (content.includes('@Component')) {
            let modified = false;

            // 1. Ensure TranslateModule is imported
            if (!content.includes("'@ngx-translate/core'") && !content.includes('"@ngx-translate/core"')) {
                content = "import { TranslateModule } from '@ngx-translate/core';\n" + content;
                modified = true;
            } else if (!content.includes("TranslateModule")) {
                // If the package is imported but the module name isn't there (unlikely but safe)
                content = content.replace(/import\s*{([^}]*)}\s*from\s*['"]@ngx-translate\/core['"]/, (match, p1) => {
                    if (p1.includes('TranslateModule')) return match;
                    return `import { ${p1.trim()}, TranslateModule } from '@ngx-translate/core'`;
                });
                modified = true;
            }

            // 2. Ensure TranslateModule is in imports array
            const importsRegex = /imports:\s*\[([\s\S]*?)\]/;
            const match = content.match(importsRegex);

            if (match) {
                let importsContent = match[1];
                if (!importsContent.includes('TranslateModule')) {
                    let newImports;
                    if (importsContent.trim() === '') {
                        newImports = 'TranslateModule';
                    } else {
                        // Trim trailing comma if exists and add TranslateModule
                        newImports = importsContent.trim().replace(/,$/, '') + ', TranslateModule';
                    }
                    content = content.replace(importsRegex, `imports: [${newImports}]`);
                    modified = true;
                }
            } else {
                // No imports array found, add it
                content = content.replace(/@Component\({/, '@Component({\n  imports: [TranslateModule],');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log('Processed:', filePath);
            }
        }
    }
});
