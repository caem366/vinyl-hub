const fetch = require('node-fetch');

async function testEndpoint() {
  const response = await fetch('http://localhost:5501/api/listings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': '', 
    },
    body: JSON.stringify({
      albumTitle: 'Dark Side of the Moon',
      artist: 'Pink Floyd',
      genre: 'Rock',
      releaseYear: '1973',
      condition: 'Used',
      price: 30.00,
      description: 'A classic album in great condition.',
    }),
  });

  const data = await response.json();
  console.log('Response:', data);
}

testEndpoint();
