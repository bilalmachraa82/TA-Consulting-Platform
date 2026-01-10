const Firecrawl = require('firecrawl');
console.log('Type of Firecrawl:', typeof Firecrawl);
console.log('Keys:', Object.keys(Firecrawl));
console.log('Is constructor?', typeof Firecrawl === 'function' && /^\s*class\s+/.test(Firecrawl.toString()));
console.log('Default export?', Firecrawl.default);
