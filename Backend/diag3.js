
require('dotenv').config();
const axios = require('axios');
async function main() {
  // Register fresh vendor and test listing creation  
  const suffix = 'listingtest' + Date.now().toString(36);
  const rV = await axios.post('http://localhost:5000/api/v1/users/register',
    {email:'listtest.'+suffix+'@yopmail.com',password:'TestPass123!',firstName:'E2E',lastName:'Vendor',roles:['consumer','business_owner']},
    {validateStatus:()=>true});
  console.log('Vendor reg:', rV.status);
  let vToken = rV.data.token;
  
  const sw = await axios.post('http://localhost:5000/api/v1/users/switch-role',{role:'business_owner'},
    {headers:{Authorization:'Bearer '+vToken},validateStatus:()=>true});
  console.log('Switch role:', sw.status, sw.data.user && sw.data.user.activeRole);
  vToken = sw.data.token || vToken;
  
  const cBiz = await axios.post('http://localhost:5000/api/v1/businesses',{
    name:'List Test Biz',description:'test biz desc',type:'restaurant',
    address:{street:'KN 5 Ave',city:'Kigali',location:{type:'Point',coordinates:[30.0588,-1.9441]}},
    contact:{phone:'+250788000001',email:'listtest.'+suffix+'@yopmail.com'}
  },{headers:{Authorization:'Bearer '+vToken},validateStatus:()=>true});
  console.log('Business:', cBiz.status, cBiz.data.business && cBiz.data.business._id || cBiz.data.message);
  const bId = cBiz.data.business && cBiz.data.business._id || cBiz.data._id;
  
  if (bId) {
    const cList = await axios.post('http://localhost:5000/api/v1/listings', {
      title:'Test Meal ' + suffix,description:'Surplus jollof rice - rescue today!',business:bId,category:'meals',
      pricing:{originalPrice:5000,price:2000,currency:'RWF',discount:60},
      inventory:{quantity:10,unit:'portions'},fulfillment:'delivery',
      timeWindow:{start:new Date().toISOString(),end:new Date(Date.now()+6*3600000).toISOString()},status:'active'
    },{headers:{Authorization:'Bearer '+vToken},validateStatus:()=>true});
    console.log('Listing create:', cList.status, JSON.stringify(cList.data).slice(0,400));
  }
}
main().catch(console.error);
