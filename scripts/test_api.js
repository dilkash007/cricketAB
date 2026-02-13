
import fetch from 'node-fetch';

async function testApi() {
    console.log('Testing /api/financial/financial-stats...');
    try {
        const response = await fetch('http://localhost:5000/api/financial/financial-stats');
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Fetch Error:', err.message);
    }
}

testApi();
