const fs = require('fs');
let c = fs.readFileSync('src/features/horoscope/components/yoga-dosha-details.tsx', 'utf8');
// The file contains literal backslash-quote characters
c = c.replace(/in the \\"All\\" or \\"Other\\" tabs/g, 'in the "All" or "Other" tabs');
fs.writeFileSync('src/features/horoscope/components/yoga-dosha-details.tsx', c);
console.log('done');