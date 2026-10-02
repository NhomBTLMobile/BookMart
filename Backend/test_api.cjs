const http = require('http');
http.get('http://localhost:5000/api/books/search/advanced?category_id=1&page=1&limit=10', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(data));
}).on('error', (e) => console.error(e));
