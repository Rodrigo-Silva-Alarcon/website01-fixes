const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
    );
}

(async () => {
    const files = walk('public/data').filter((f) => /\.(png|jpe?g|gif)$/i.test(f));
    let ok = 0;
    let fail = 0;
    for (const f of files) {
        const out = f.replace(/\.[^.]+$/, '.webp');
        if (fs.existsSync(out)) continue;
        try {
            await sharp(f).webp({ quality: 82 }).toFile(out);
            ok++;
        } catch (e) {
            fail++;
            console.error('FAIL', f, e.message);
        }
    }
    const webp = walk('public/data').filter((f) => /\.webp$/i.test(f));
    console.log(`converted=${ok} failed=${fail} webp_total=${webp.length}`);
})();
