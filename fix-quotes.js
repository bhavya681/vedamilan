const fs = require('fs');
let c = fs.readFileSync('src/features/horoscope/components/yoga-dosha-details.tsx', 'utf8');
const target = 'in the "All" or "Other" tabs';
const replacement = 'in the "All" or "Other" tabs';
if (c.includes(target)) {
  c = c.replace(target, replacement);
  fs.writeFileSync('src/features/horoscope/components/yoga-dosha-details.tsx', c);
  console.log('replaced');
} else {
  console.log('target not found');
  // Try with escaped version
  const target2 = 'in the \\"All\\" or \\"Other\\" tabs';
  if (c.includes(target2)) {
    c = c.replace(target2, replacement);
    fs.writeFileSync('src/features/horoscope/components/yoga-dosha-details.tsx', c);
    console.log('replaced v2');
  }
}