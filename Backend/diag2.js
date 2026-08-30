
require('dotenv').config();
const axios = require('axios');
async function main() {
  const aL = await axios.post('http://localhost:5000/api/v1/users/login',
    {email:'vendor.e2e.test@yopmail.com',password:'TestPass123!'},
    {validateStatus:()=>true});
  console.log('vendor login:', aL.status);
  
  // Login with seed vendor
  const vL = await axios.post('http://localhost:5000/api/v1/users/login',
    {email:'bakery@example.com',password:'Owner123!'},
    {validateStatus:()=>true});
  console.log('seed vendor login:', vL.status, vL.data.user && vL.data.user.activeRole);
  const vToken = vL.data.token;
  
  // Check their businesses
  const myBiz = await axios.get('http://localhost:5000/api/v1/businesses',
    {headers:{Authorization:'Bearer '+vToken},validateStatus:()=>true});
  console.log('businesses:', myBiz.status, myBiz.data.businesses && myBiz.data.businesses.length);
  
  // get their first biz
  const biz = myBiz.data.businesses && myBiz.data.businesses[0];
  if (biz) {
    // Try creating a listing with their biz id
    const cList = await axios.post('http://localhost:5000/api/v1/listings', {
      title:'Test Meal 1234',description:'Surplus jollof rice rescue today',business:biz._id,category:'meals',
      pricing:{originalPrice:5000,price:2000,currency:'RWF',discount:60},
      inventory:{quantity:10,unit:'portions'},fulfillment:'delivery',
      timeWindow:{start:new Date().toISOString(),end:new Date(Date.now()+6*3600000).toISOString()},status:'active'
    }, {headers:{Authorization:'Bearer '+vToken},validateStatus:()=>true});
    console.log('listing create:', cList.status, JSON.stringify(cList.data).slice(0,300));
  }
  
  // Test correct routes
  const adminLogin = await axios.post('http://localhost:5000/api/v1/users/login',
    {email:'ifegwuchibuezevictor@gmail.com',password:'ChopAdmin123!'},
    {validateStatus:()=>true});
  const aToken = adminLogin.data.token;
  
  const routes = [
    ['GET', '/api/v1/orders/admin'],
    ['GET', '/api/v1/payouts/admin'],
    ['GET', '/api/v1/disputes/admin'],
    ['GET', '/api/v1/rider/stats'],
    ['GET', '/api/v1/rider/earnings'],
  ];
  for (const [method, url] of routes) {
    const r = await axios({method, url:'http://localhost:5000'+url,
      headers:{Authorization:'Bearer '+aToken},validateStatus:()=>true});
    console.log(method, url, ':', r.status, JSON.stringify(r.data).slice(0,100));
  }
}
main().catch(console.error);
