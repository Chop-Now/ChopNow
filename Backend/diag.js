
require('dotenv').config();
const axios = require('axios');
async function main() {
  const r = await axios.post('http://localhost:5000/api/v1/users/login',
    {email:'ifegwuchibuezevictor@gmail.com',password:'ChopAdmin123!'},
    {validateStatus:()=>true});
  const t = r.data.token;
  const tests = [
    ['Admin orders', 'GET', '/api/v1/orders/admin/all'],
    ['Payouts', 'GET', '/api/v1/payouts'],
    ['Disputes', 'GET', '/api/v1/disputes'],
    ['Favorites', 'POST', '/api/v1/favorites'],
    ['Listing validate', 'POST', '/api/v1/listings'],
    ['Forgot-pw error', 'GET', '/api/v1/users/forgot-password'],
  ];
  for (const [name, method, url] of tests) {
    const res = await axios({method, url: 'http://localhost:5000'+url,
      headers: {Authorization: 'Bearer '+t}, validateStatus:()=>true});
    console.log(name + ':', res.status, JSON.stringify(res.data).slice(0,150));
  }
  // Test listing validation in detail
  const vt = (await axios.post('http://localhost:5000/api/v1/users/login',
    {email:'bakery@example.com',password:'Owner123!'},{validateStatus:()=>true})).data.token;
  const bizt = (await axios.post('http://localhost:5000/api/v1/users/login',
    {email:'bakery@example.com',password:'Owner123!'},{validateStatus:()=>true})).data.token;
  if (vt) {
    const myBiz = await axios.get('http://localhost:5000/api/v1/businesses/my',
      {headers:{Authorization:'Bearer '+vt},validateStatus:()=>true});
    console.log('My biz:', myBiz.status, JSON.stringify(myBiz.data).slice(0,200));
  }
}
main().catch(console.error);
