import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

const token = jwt.sign(
  { userId: '038dcc50-9238-40d6-8454-d2fe5c35f5b1', role: 'DRIVER' }, // the user in db_check
  JWT_SECRET,
  { expiresIn: '7d' }
);

async function testUpdatePayment() {
  const http = require('http');

  const data = JSON.stringify({
    cardNumber: '1111222233334444',
    cardHolder: 'THE ANH',
    expiry: '12/26',
    cvv: '123'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/profile/payment-method',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res: any) => {
    console.log(`statusCode: ${res.statusCode}`);
    res.on('data', (d: any) => {
      process.stdout.write(d);
    });
  });

  req.on('error', (error: any) => {
    console.error(error);
  });

  req.write(data);
  req.end();
}

testUpdatePayment();
