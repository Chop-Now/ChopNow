const axios = require('axios');

const API_URL = 'http://127.0.0.1:5000/api/users';
const TEST_USER = {
    email: 'verification_test@chopnow.app',
    password: 'Password123!',
    firstName: 'Verification',
    lastName: 'User',
    role: 'consumer'
};

const verify = async () => {
    try {
        console.log('1. Attempting Registration...');
        try {
            const regRes = await axios.post(`${API_URL}/register`, TEST_USER);
            console.log('   Registration Success:', regRes.status);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message === 'User already exists') {
                console.log('   User already exists (Expected if re-running)');
            } else {
                console.error('   Registration Failed:', err.message);
                if (err.response) console.error(err.response.data);
                // Don't exit, try login anyway
            }
        }

        console.log('2. Attempting Login...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: TEST_USER.email,
            password: TEST_USER.password
        });

        if (loginRes.data.token) {
            console.log('   Login Success! Token received.');
            console.log('   User Role:', loginRes.data.role);
            console.log('VERIFICATION COMPLETE: Backend is accepting auth requests.');
        } else {
            console.error('   Login Failed: No token returned.');
        }

    } catch (error) {
        console.error('Verification Failed:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
            console.error('Response Status:', error.response.status);
        }
    }
};

verify();
