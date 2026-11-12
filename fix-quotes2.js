const fs = require('fs');
let c = fs.readFileSync('src/features/horoscope/components/yoga-dosha-details.tsx', 'utf8');
// Replace escaped quotes with HTML entities
c = c.replace(/in the \\"All\\" or \\"Other\\" tabs/g, 'in the "All" or "Other" tabs');
fs.writeFileSync('src/features/horoscope/components/yoga-dosha-details.tsx', c);
console.log('done');