const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        let dirPath = path.join(dir, f);
        if (f === 'node_modules' || f === '.git' || f === '.angular') continue;
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    }
}

const projectRoot = 'd:/haya/src'; // Focusing on src to be safe and efficient

walkDir(projectRoot, function (filePath) {
    const ext = path.extname(filePath);
    if (['.ts', '.html', '.css', '.js'].includes(ext)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        if (ext === '.html') {
            // Remove HTML comments: <!-- comment -->
            content = content.replace(/<!--[\s\S]*?-->/g, '');
        } else if (ext === '.css') {
            // Remove CSS comments: /* comment */
            content = content.replace(/\/\*[\s\S]*?\*\//g, '');
        } else if (ext === '.ts' || ext === '.js') {
            // Remove multi-line comments: /* comment */
            content = content.replace(/\/\*[\s\S]*?\*\//g, '');

            // Remove single-line comments: // comment
            // We use a regex that tries to avoid matching // inside strings or URLs
            // This is a common "good enough" regex for this task:
            // It matches // only if it's not preceded by : (to avoid http://)
            // and handles the start of the line.
            content = content.split('\n').map(line => {
                // Find // that is not part of a URL
                const commentIndex = line.indexOf('//');
                if (commentIndex !== -1) {
                    // Check if it's a URL (has : immediately before //)
                    if (commentIndex > 0 && line[commentIndex - 1] === ':') {
                        return line;
                    }
                    // If // is at the start or preceded by space/tab, it's likely a comment
                    const beforeComment = line.substring(0, commentIndex);
                    if (beforeComment.trim() === '' || beforeComment.match(/[;\{\}\[\]\s]$/)) {
                        return beforeComment.trimEnd();
                    }
                }
                return line;
            }).join('\n');
        }

        // Clean up empty lines that might have been left behind (optional but cleaner)
        content = content.replace(/^\s*[\r\n]/gm, '');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Cleaned:', filePath);
        }
    }
});

console.log('All comments removed successfully.');
