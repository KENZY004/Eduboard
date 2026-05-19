const axios = require('axios');

async function testApprove() {
    try {
        // 1. Log in as admin to get token
        console.log('Logging in as admin...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'kenznajeeb@gmail.com',
            password: 'kenz@eduboard123'
        });

        const token = loginRes.data.token;
        console.log('Admin logged in! Token acquired.');

        // 2. Fetch pending teachers to get teacher ID
        console.log('Fetching pending teachers...');
        const pendingRes = await axios.get('http://localhost:5000/api/admin/pending-teachers', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (pendingRes.data.length === 0) {
            console.log('No pending teachers found.');
            return;
        }

        const teacherId = pendingRes.data[0].id;
        console.log(`Attempting to approve teacher with ID: ${teacherId} (${pendingRes.data[0].username})...`);

        // 3. Call approve endpoint
        const approveRes = await axios.post(
            `http://localhost:5000/api/verification/approve/${teacherId}`,
            { adminNotes: 'Approved via admin panel' },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log('Success!', approveRes.data);

    } catch (err) {
        console.error('Error occurred:', err.response ? err.response.data : err.message);
    }
}

testApprove();
