// Pokrenite: node hash-password.js
const bcrypt = require('bcryptjs');

const passwords = {
  'Test123!': 'Za turista i vlasnika',
  'Admin123!': 'Za admina'
};

console.log('Hashovanje lozinki...\n');

Object.entries(passwords).forEach(([password, description]) => {
  const hash = bcrypt.hashSync(password, 10);
  console.log(`${description}:`);
  console.log(`Lozinka: ${password}`);
  console.log(`Hash: ${hash}\n`);
});
