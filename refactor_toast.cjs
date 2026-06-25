const fs = require('fs');
const lines = fs.readFileSync('src/App.jsx', 'utf8').split('\n');

lines.splice(14, 0, "import OfflineToast from './components/OfflineToast';");

const endIdx = lines.findIndex(l => l.includes('</Routes>'));
if (endIdx !== -1) {
    lines.splice(endIdx + 1, 0, "        <OfflineToast />");
    fs.writeFileSync('src/App.jsx', lines.join('\n'));
    console.log("Added OfflineToast to App.jsx");
} else {
    console.error("Could not find </Routes>");
}
