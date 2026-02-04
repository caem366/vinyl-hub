const fetch = require('node-fetch');

async function testGetListings() {
  const response = await fetch('http://localhost:5501/api/listings', {
    method: 'GET',
    headers: {
      'Authorization': '', 
    },
  });

  const data = await response.json();
  console.log('Listings:', data);
}

testGetListings();
