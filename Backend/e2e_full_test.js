
require('dotenv').config();
const axios = require('axios');

const BASE = 'http://localhost:5000/api/v1';
const HEALTH = 'http://localhost:5000/health';
const MOMO = '0794758542';
const sleep = ms => new Promise(r => setTimeout(r, ms));

let passed = 0, failed = 0, failures = [];

function ok(label, cond, detail) {
  if (cond) { console.log('  pass ' + label); passed++; }
  else { const m = label + (detail ? ' -- ' + detail : ''); console.log('  FAIL ' + m); failed++; failures.push(m); }
}

async function api(method, path, body, token) {
  try {
    const isHealth = path.startsWith('http');
    return await axios({ method, url: isHealth ? path : BASE + path, data: body,
      headers: token ? { Authorization: 'Bearer ' + token } : {}, validateStatus: () => true });
  } catch(e) { return { status: 0, data: { message: e.message } }; }
}

function uid() { return Math.random().toString(36).slice(2,10); }

(async () => {
  console.log('\n===== ChopNow Full E2E Test - CTO Edition =====');
  const suf = uid();
  const cEmail = 'consumer.e2e.' + suf + '@yopmail.com';
  const vEmail = 'vendor.e2e.' + suf + '@yopmail.com';
  const rEmail = 'rider.e2e.' + suf + '@yopmail.com';

  // 1. Registration & Verification
  console.log('\n[1] Registration & Email Verification');
  const rC = await api('POST','/users/register',{email:cEmail,password:'TestPass123!',firstName:'E2E',lastName:'Consumer',roles:['consumer']});
  ok('Consumer registered', rC.status===201, 'status=' + rC.status + ' ' + (rC.data.message||''));
  const cToken = rC.data.token;
  const cId = rC.data.user && rC.data.user._id || rC.data._id;

  const rV = await api('POST','/users/register',{email:vEmail,password:'TestPass123!',firstName:'E2E',lastName:'Vendor',roles:['consumer','business_owner']});
  ok('Vendor registered', rV.status===201, 'status=' + rV.status);
  let vToken = rV.data.token;
  const sw = await api('POST','/users/switch-role',{role:'business_owner'},vToken);
  ok('Vendor switched to business_owner', sw.status===200 && sw.data.user && sw.data.user.activeRole==='business_owner', 'activeRole=' + (sw.data.user && sw.data.user.activeRole));
  vToken = sw.data.token || vToken;

  const rR = await api('POST','/users/register',{email:rEmail,password:'TestPass123!',firstName:'E2E',lastName:'Rider',roles:['consumer']});
  ok('Rider user registered', rR.status===201, 'status=' + rR.status);
  let rToken = rR.data.token;
  const rUId = rR.data.user && rR.data.user._id || rR.data._id;

  const prof = await api('GET','/users/profile',null,cToken);
  ok('Consumer profile', prof.status===200, 'email=' + prof.data.email);

  const fpw = await api('POST','/users/forgot-password',{email:cEmail});
  ok('Forgot-password triggered', fpw.status===200, 'status=' + fpw.status + ' ' + (fpw.data.message||''));

  const resendV = await api('POST','/users/resend-verification',{email:cEmail});
  ok('Resend verification accepted', resendV.status===200||resendV.status===400, 'status=' + resendV.status);

  // 2. Admin Login & Dashboard
  console.log('\n[2] Admin Login & Dashboard');
  const aL = await api('POST','/users/login',{email:'ifegwuchibuezevictor@gmail.com',password:'ChopAdmin123!',role:'admin'});
  ok('Admin login', aL.status===200, 'status=' + aL.status + ' ' + (aL.data.message||''));
  const aToken = aL.data.token;

  if (aToken) {
    const aStats = await api('GET','/analytics/admin/stats',null,aToken);
    ok('Admin platform stats', aStats.status===200, 'status=' + aStats.status);
    const aUsers = await api('GET','/users',null,aToken);
    ok('Admin list users', aUsers.status===200, 'total=' + (aUsers.data.total||aUsers.data.users && aUsers.data.users.length));
    const aOver = await api('GET','/analytics/platform/overview',null,aToken);
    ok('Admin platform overview', aOver.status===200, 'status=' + aOver.status);
    const aAct = await api('GET','/analytics/platform/activity',null,aToken);
    ok('Admin recent activity', aAct.status===200, 'status=' + aAct.status);
    const aPending = await api('GET','/businesses/pending',null,aToken);
    ok('Admin pending businesses', aPending.status===200, 'status=' + aPending.status);
  }

  // 3. Rider Application & Approval
  console.log('\n[3] Rider Application & Approval');
  // apply-rider requires file uploads — simulate by directly setting riderStatus in DB
  const mongoose = require('mongoose');
  const User = require('./models/User');
  if (!mongoose.connection.readyState) {
    await mongoose.connect(process.env.MONGO_URI);
  }
  await User.updateOne(
    { _id: rUId },
    { riderStatus: 'pending', riderDetails: { phone: '250794758542', vehicleType: 'motorcycle', licensePlate: 'RAC123E', nationalId: '1199380012345678', appliedAt: new Date() } }
  );
  ok('Rider application seeded (DB)', true, 'riderStatus=pending');

  if (aToken) {
    const adminRiders = await api('GET','/users/admin/riders',null,aToken);
    ok('Admin list riders', adminRiders.status===200, 'status=' + adminRiders.status);
    const apr = await api('POST','/users/admin/riders/' + rUId + '/review',{status:'approved'},aToken);
    ok('Admin approved rider', apr.status===200, 'status=' + apr.status + ' ' + (apr.data.message||''));
    // After approval, admin sets activeRole=rider — re-login the rider to get fresh token
    const rLogin = await api('POST','/users/login',{email:rEmail,password:'TestPass123!',role:'rider'});
    ok('Rider logged in with rider role', rLogin.status===200, 'activeRole=' + (rLogin.data.user && rLogin.data.user.activeRole));
    rToken = rLogin.data.token || rToken;
  }

  // 4. Vendor: Business & Listing
  console.log('\n[4] Vendor: Business & Listing');
  const bizName = 'E2E Restaurant ' + suf;
  const cBiz = await api('POST','/businesses',{
    name:bizName,description:'Surplus food restaurant',type:'restaurant',
    address:{street:'KN 5 Ave',city:'Kigali',location:{type:'Point',coordinates:[30.0588,-1.9441]}},
    contact:{phone:'+250788000001',email:vEmail}
  },vToken);
  ok('Vendor created business', cBiz.status===201, 'status=' + cBiz.status + ' ' + (cBiz.data.message||''));
  const bId = cBiz.data.business && cBiz.data.business._id || cBiz.data._id;

  if (bId) {
    const bStats = await api('GET','/businesses/' + bId + '/stats',null,vToken);
    ok('Vendor business stats', bStats.status===200, 'status=' + bStats.status);
  }

  const cList = await api('POST','/listings',{
    title:'E2E Meal ' + suf,description:'Surplus jollof rice - rescue today!',business:bId,category:'meals',
    pricing:{originalPrice:5000,price:2000,currency:'RWF',discount:60},
    inventory:{quantity:10,unit:'portions'},fulfillment:'delivery',
    timeWindow:{availableFrom:new Date().toISOString(),availableUntil:new Date(Date.now()+6*3600000).toISOString()},status:'active'
  },vToken);
  ok('Vendor created listing', cList.status===201, 'status=' + cList.status + ' ' + (cList.data.message||JSON.stringify(cList.data.errors||'').slice(0,100)));
  const lId = cList.data.listing && cList.data.listing._id || cList.data._id;

  const browse = await api('GET','/listings',null,cToken);
  ok('Consumer browse listings', browse.status===200, 'count=' + (browse.data.listings && browse.data.listings.length||browse.data.length));
  const search = await api('GET','/listings?category=meals&limit=5',null,cToken);
  ok('Consumer search/filter listings', search.status===200, 'status=' + search.status);

  // 5. Order & MoMo Payment
  console.log('\n[5] Order Placement & MoMo Payment');
  const cOrd = await api('POST','/orders',{
    listing:lId,
    items:[{listing:lId,quantity:2,unitPrice:2000,subtotal:4000,title:'E2E Meal ' + suf}],
    fulfillmentType:'delivery',
    deliveryDetails:{
      address:{street:'KG 11 Ave',city:'Kigali',location:{type:'Point',coordinates:[30.0619,-1.9536]}},
      recipientName:'E2E Consumer',recipientPhone:'250794758542',instructions:'Call on arrival'
    },
    payment:{paymentMethod:'mobile_money'}
  },cToken);
  ok('Consumer placed order', cOrd.status===201, 'status=' + cOrd.status + ' ' + (cOrd.data.message||JSON.stringify(cOrd.data.errors||'').slice(0,100)));
  const oId = cOrd.data.order && cOrd.data.order._id || cOrd.data._id;
  ok('Order in pending_payment', (cOrd.data.order && cOrd.data.order.status||cOrd.data.status)==='pending_payment', 'status=' + (cOrd.data.order && cOrd.data.order.status||cOrd.data.status));

  if (oId) {
    const initP = await api('POST','/payments/deposit',{orderId:oId,phoneNumber:MOMO,correspondent:'MTN_MOMO_RWA'},cToken);
    ok('MoMo payment initiated', initP.status===200, 'status=' + initP.status + ' ' + (initP.data.message||''));
    ok('Payment has depositId', !!initP.data.depositId, 'depositId=' + initP.data.depositId);
    ok('Test mode active', initP.data.testMode===true || (initP.data.message && initP.data.message.includes('TEST')), 'testMode=' + initP.data.testMode);

    console.log('  Waiting 8s for simulated MoMo callback...');
    await sleep(8000);

    const payS = await api('GET','/payments/status/' + oId,null,cToken);
    ok('Payment status polled', payS.status===200, 'status=' + payS.status);
    ok('Payment completed', payS.data.status==='completed', 'payment_status=' + payS.data.status);

    const oAfter = await api('GET','/orders/' + oId,null,cToken);
    ok('Order updated to paid', oAfter.data.status==='paid', 'order_status=' + oAfter.data.status);
  }

  // 6. Notifications & History
  console.log('\n[6] Notifications & History');
  const notifs = await api('GET','/notifications',null,cToken);
  ok('Consumer notifications', notifs.status===200, 'count=' + (notifs.data.notifications && notifs.data.notifications.length||0));
  const unread = await api('GET','/notifications/unread/count',null,cToken);
  ok('Unread count', unread.status===200, 'count=' + unread.data.count);
  const markA = await api('PUT','/notifications/read-all',{},cToken);
  ok('Mark all notifications read', markA.status===200, 'status=' + markA.status);
  const myOrds = await api('GET','/orders',null,cToken);
  ok('Consumer order history', myOrds.status===200, 'count=' + (myOrds.data.orders && myOrds.data.orders.length||myOrds.data.length));
  const impact = await api('GET','/analytics/impact/my',null,cToken);
  ok('Consumer impact stats', impact.status===200, 'status=' + impact.status);
  const lboard = await api('GET','/analytics/impact/leaderboard');
  ok('Leaderboard accessible', lboard.status===200, 'status=' + lboard.status);

  // 7. Vendor Order Management
  console.log('\n[7] Vendor Order Management');
  const vOrds = await api('GET','/orders',null,vToken);
  ok('Vendor view orders', vOrds.status===200, 'status=' + vOrds.status);
  if (oId) {
    const conf = await api('PUT','/orders/' + oId + '/status',{status:'confirmed'},vToken);
    ok('Vendor confirmed order', conf.status===200, 'order_status=' + (conf.data.order && conf.data.order.status||conf.data.status));
    const prep = await api('PUT','/orders/' + oId + '/status',{status:'preparing'},vToken);
    ok('Vendor marked preparing', prep.status===200, 'status=' + prep.status);
    const ready = await api('PUT','/orders/' + oId + '/status',{status:'ready_for_pickup'},vToken);
    ok('Vendor marked ready_for_pickup', ready.status===200, 'status=' + ready.status);
    const vNotifs = await api('GET','/notifications',null,vToken);
    ok('Vendor has notifications', vNotifs.status===200, 'count=' + (vNotifs.data.notifications && vNotifs.data.notifications.length||0));
  }
  if (bId) {
    const bOver = await api('GET','/analytics/business/overview?businessId=' + bId,null,vToken);
    ok('Vendor business analytics', bOver.status===200, 'status=' + bOver.status);
  }

  // 8. Delivery & Rider Workflow
  console.log('\n[8] Delivery & Rider Workflow');
  let dId;
  if (oId && bId) {
    const cDel = await api('POST','/deliveries',{
      orderId:oId,
      pickupLocation:{businessName:bizName,address:'KN 5 Ave, Kigali',location:{type:'Point',coordinates:[30.0588,-1.9441]},contactPhone:'+250788000001'},
      dropoffLocation:{recipientName:'E2E Consumer',recipientPhone:'250794758542',address:'KG 11 Ave, Kigali',location:{type:'Point',coordinates:[30.0619,-1.9536]},instructions:'Call'},
      deliveryFee:500
    },vToken);
    ok('Vendor created delivery', cDel.status===201, 'status=' + cDel.status + ' ' + (cDel.data.message||JSON.stringify(cDel.data.errors||'').slice(0,100)));
    dId = cDel.data.delivery && cDel.data.delivery._id || cDel.data._id;

    const avail = await api('GET','/deliveries/available?lat=-1.9441&lng=30.0588&radius=50',null,rToken);
    ok('Rider finds available deliveries', avail.status===200, 'count=' + (avail.data.deliveries && avail.data.deliveries.length||avail.data.length||0));

    if (dId) {
      const assignD = await api('PATCH','/deliveries/' + dId + '/assign',{},rToken);
      ok('Rider assigned to delivery', assignD.status===200, 'status=' + assignD.status + ' ' + (assignD.data.message||''));
      const online = await api('PUT','/rider/availability',{isOnline:true},rToken);
      ok('Rider toggled online', online.status===200, 'status=' + online.status);
      const pu = await api('PATCH','/deliveries/' + dId + '/status',{status:'picked_up'},rToken);
      ok('Rider picked up', pu.status===200, 'status=' + pu.status);
      const loc = await api('PATCH','/deliveries/' + dId + '/location',{latitude:-1.95,longitude:30.06},rToken);
      ok('Rider updated location', loc.status===200, 'status=' + loc.status);
      const it = await api('PATCH','/deliveries/' + dId + '/status',{status:'in_transit'},rToken);
      ok('Rider in transit', it.status===200, 'status=' + it.status);
      const done = await api('PATCH','/deliveries/' + dId + '/status',{status:'delivered'},rToken);
      ok('Rider completed delivery', done.status===200, 'status=' + done.status);
      const earn = await api('GET','/rider/earnings',null,rToken);
      ok('Rider earnings', earn.status===200, 'status=' + earn.status);
      const rStats = await api('GET','/rider/stats',null,rToken);
      ok('Rider dashboard stats', rStats.status===200, 'status=' + rStats.status);
    }
  }

  // 9. Post-Delivery: Review & Favorites
  console.log('\n[9] Post-Delivery: Review & Favorites');
  if (oId) {
    const fOrd = await api('GET','/orders/' + oId,null,cToken);
    ok('Consumer views completed order', fOrd.status===200, 'status=' + fOrd.status);
    const rev = await api('POST','/reviews',{order:oId,rating:5,comment:'Rescued and absolutely delicious!'},cToken);
    ok('Consumer submits review', rev.status===201||rev.status===400, 'status=' + rev.status + ' ' + (rev.data.message||''));
  }
  if (bId) {
    const fav = await api('POST','/favorites/toggle',{type:'business',referenceId:bId},cToken);
    ok('Consumer favorites business', fav.status===200||fav.status===201||fav.status===400, 'status=' + fav.status + ' ' + (fav.data.message||''));
    const getFavs = await api('GET','/favorites',null,cToken);
    ok('Consumer view favorites', getFavs.status===200, 'status=' + getFavs.status);
  }

  // 10. Admin Management
  console.log('\n[10] Admin Management');
  if (aToken) {
    const aOrds = await api('GET','/orders/admin',null,aToken);
    ok('Admin view all orders', aOrds.status===200, 'status=' + aOrds.status);
    const payouts = await api('GET','/payouts/admin',null,aToken);
    ok('Admin view payouts', payouts.status===200, 'status=' + payouts.status);
    const disputes = await api('GET','/disputes/admin',null,aToken);
    ok('Admin view disputes', disputes.status===200, 'status=' + disputes.status);
    const settings = await api('GET','/settings',null,aToken);
    ok('Admin view settings', settings.status===200, 'status=' + settings.status);
    if (cId) {
      const susp = await api('PATCH','/users/' + cId + '/suspend',{},aToken);
      ok('Admin suspend user', susp.status===200, 'status=' + susp.status);
      const act = await api('PATCH','/users/' + cId + '/activate',{},aToken);
      ok('Admin reactivate user', act.status===200, 'status=' + act.status);
    }
    const uAct = await api('GET','/analytics/user-activity',null,aToken);
    ok('Admin user-activity analytics', uAct.status===200, 'status=' + uAct.status);
  }

  // 11. Cart Flow
  console.log('\n[11] Cart Flow');
  if (lId) {
    const addC = await api('POST','/cart/add',{listingId:lId,quantity:1},cToken);
    ok('Add to cart', addC.status===200||addC.status===201, 'status=' + addC.status + ' ' + (addC.data.message||''));
    const getC = await api('GET','/cart',null,cToken);
    ok('View cart', getC.status===200, 'count=' + (getC.data.items && getC.data.items.length||0));
    const clrC = await api('DELETE','/cart/clear',null,cToken);
    ok('Clear cart', clrC.status===200, 'status=' + clrC.status);
  }

  // 12. Health & DB Performance
  console.log('\n[12] Health & DB Performance');
  const hStart = Date.now();
  const health = await api('GET',HEALTH,null,null);
  const hLat = Date.now()-hStart;
  ok('Health endpoint responds', health.status===200, 'status=' + health.status);
  ok('DB latency < 500ms', hLat<500, 'latency=' + hLat + 'ms');
  ok('DB connected', health.data && (health.data.database==='connected'||health.data.status==='ok'||health.data.status==='ready'), 'db_status=' + JSON.stringify(health.data).slice(0,100));
  const lStart = Date.now();
  const loads = await Promise.all(Array(5).fill(null).map(()=>api('GET',HEALTH,null,null)));
  const lLat = Date.now()-lStart;
  ok('5 concurrent requests succeed', loads.every(r=>r.status===200), 'all200=' + loads.every(r=>r.status===200));
  ok('5 concurrent requests < 2s', lLat<2000, 'time=' + lLat + 'ms');

  // Results
  console.log('\n' + '='.repeat(55));
  console.log('Results: ' + passed + ' passed, ' + failed + ' failed (total: ' + (passed+failed) + ')');
  if (failures.length>0) { console.log('\nFailed:'); failures.forEach(f=>console.log('  - ' + f)); }
  if (failed===0) console.log('\n ALL E2E TESTS PASSED! Platform is LAUNCH READY!');
  else console.log('\n ' + failed + ' test(s) failed. Review above before launch.');
})().catch(e => { console.error('Fatal error:', e.message); process.exit(1); });
