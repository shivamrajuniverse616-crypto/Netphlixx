const fs = require('fs');
const lines = fs.readFileSync('src/App.jsx', 'utf8').split('\n');

const imports = `import { API_KEY, BASE_URL, IMAGE_BASE_URL, IMAGE_BASE_URL_W500, requests } from './utils/constants';
import { getMediaType } from './utils/media';
import HoverPortal from './components/HoverPortal';
import MagneticButton from './components/MagneticButton';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Row from './components/Row';
import { RowCard } from './components/RowCard';`;

const startIdx = 13; 
const endIdx = lines.findIndex(l => l.startsWith('function SearchResults'));

if (endIdx !== -1) {
    const newLines = [...lines.slice(0, startIdx), imports, '', ...lines.slice(endIdx)];
    fs.writeFileSync('src/App.jsx', newLines.join('\n'));
    console.log("Refactored App.jsx");
} else {
    console.error("Could not find function SearchResults");
}
