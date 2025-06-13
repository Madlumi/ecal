const assert = require('assert');
const energy = require('./energy.js');
const {EType, HouseType, locations, House, EPpet, limit} = energy;

function assertApprox(actual, expected, eps, label) {
  assert.ok(Math.abs(actual - expected) <= eps, `${label}: expected ${expected} got ${actual}`);
}

const tests = [
  function testNewHouse() {
    const h = new House(HouseType.SMALL, 100, locations[1]);
    assert.strictEqual(h.Rooms, 0, 'Rooms default');
    assert.strictEqual(h.HouseHoldEnergy, 0, 'HouseHoldEnergy default');
    assert.strictEqual(h.uval.U_roof, 0, 'uval default');
    assert.strictEqual(h.energyusage, null, 'energyusage default');
  },
  function testSmallHouse() {
    const h1 = new House(HouseType.SMALL, 100, locations[1]);
    h1.E.heat[EType.ELECTRIC] = 120;
    h1.E.cool[EType.FJARRKYLA] = 40;
    assert.strictEqual(EPpet(h1), 16, 'EPpet small house');
    const lim = limit(h1);
    assert.strictEqual(lim.EP, 95, 'EP small house');
    assertApprox(lim.EL, 4.5, 0.001, 'EL small house');
    assertApprox(lim.UM, 0.30, 0.001, 'UM small house');
    assert.strictEqual(lim.LL, -1, 'LL small house');
  },
  function testMultiHouse() {
    const h2 = new House(HouseType.MULTI, 200, locations[0]);
    h2.flow = 0.4;
    h2.qavg = 0.4;
    h2.foot4 = true;
    h2.foot5 = true;
    assert.strictEqual(EPpet(h2), 17, 'EPpet multi house');
    const lim = limit(h2);
    assert.strictEqual(lim.EP, 77, 'EP multi house');
    assertApprox(lim.EL, 6.8, 0.001, 'EL multi house');
    assertApprox(lim.UM, 0.40, 0.001, 'UM multi house');
    assert.strictEqual(lim.LL, -1, 'LL multi house');
  },
  function testLocalHouse() {
    const h3 = new House(HouseType.LOCAL, 60, locations[1]);
    h3.qavg = 0.4;
    h3.flow = 0.5;
    h3.foot2 = true;
    h3.foot3 = true;
    assert.strictEqual(EPpet(h3), 1, 'EPpet local');
    const lim = limit(h3);
    assert.strictEqual(lim.EP, 72, 'EP local');
    assertApprox(lim.EL, 4.698, 0.001, 'EL local');
    assertApprox(lim.UM, 0.50, 0.001, 'UM local');
    assert.strictEqual(lim.LL, -1, 'LL local');
  },
  function testEPRounding() {
    const h = new House(HouseType.SMALL, 1, locations[1]);
    h.E.heat[EType.ELECTRIC] = 50.333;
    assert.strictEqual(EPpet(h), 104, 'EP rounding');
  }
];

let failures = 0;
for (const t of tests) {
  try {
    t();
    console.log(`${t.name}: PASS`);
  } catch (e) {
    failures++;
    console.log(`${t.name}: FAIL`);
    console.log(e.message);
  }
}
if (failures === 0) {
  console.log('ALL JS TESTS PASSED');
  process.exit(0);
} else {
  console.log(`${failures} JS TESTS FAILED`);
  process.exit(1);
}
