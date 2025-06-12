const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

// Load energy.js into this context
const energyCode = fs.readFileSync(__dirname + '/energy.js', 'utf8');
vm.runInThisContext(energyCode);

function round(x) {
  return Math.round(x * 1000) / 1000;
}

// Case 1: small house with some electric heating and cooling
const h1 = new House(HouseType.SMALL, 100, locations[1]);
h1.E.heat[EType.ELECTRIC] = 120;
h1.E.cool[EType.FJARRKYLA] = 40;
assert.strictEqual(EPpet(h1), 2);
let lim = limit(h1);
assert.strictEqual(lim.EP, 95);
assert.strictEqual(round(lim.EL), 4.5);
assert.strictEqual(lim.UM, 0.30);
assert.strictEqual(lim.LL, -1);

// Case 2: multi dwelling house on Åland with ventilation adjustments
const h2 = new House(HouseType.MULTI, 200, locations[0]);
h2.flow = 0.4;
h2.qavg = 0.4;
h2.foot4 = true;
h2.foot5 = true;
assert.strictEqual(EPpet(h2), 0);
lim = limit(h2);
assert.strictEqual(lim.EP, 77);
assert.strictEqual(round(lim.EL), 6.8);
assert.strictEqual(lim.UM, 0.40);
assert.strictEqual(lim.LL, -1);

// Case 3: local building with footnote adjustments
const h3 = new House(HouseType.LOCAL, 60, locations[1]);
h3.qavg = 0.4;
h3.flow = 0.5;
h3.foot2 = true;
h3.foot3 = true;
assert.strictEqual(EPpet(h3), 0);
lim = limit(h3);
assert.strictEqual(lim.EP, 72);
assert.strictEqual(round(lim.EL), 4.698);
assert.strictEqual(lim.UM, 0.50);
assert.strictEqual(lim.LL, -1);

console.log('All tests passed.');
