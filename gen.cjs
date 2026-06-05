const fs = require('fs');
let html = fs.readFileSync('F:/UBDAY/Netflix Logo Animation using HTML and CSS - DevXmart/index.html', 'utf8');
let jsx = html.replace(/class=/g, 'className=').split(/<netflixintro.*?>/)[1].split('</netflixintro>')[0];
fs.writeFileSync('src/components/NetflixIntro.jsx', 
`import React from 'react';
import './NetflixIntro.css';

export default function NetflixIntro() {
  return (
    <div id="container" className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      <div className="netflixintro" letter="N">
${jsx}
      </div>
    </div>
  );
}`);
console.log("Done");
