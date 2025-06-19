// SPDX-License-Identifier: GPL-3.0-or-later
// Prototype hourly energy model using ISO 13790 style heat balance.
//ISO 13790 acording to chatgpt, someone with access to it(or preferably(?) the revision ISO 52016-1:2017) should reimplement this
(function(){
  if (typeof module !== 'undefined' && module.exports) {
    Object.assign(global, require('./energy.js'));
  }
  const HOURS_PER_YEAR = 8760;
  const INDOOR_TEMP = 21; // °C
  const HEAT_GAIN_W_M2 = 2; // internal gains, W/m²
  const LOSS_COEFF_W_M2K = 0.5; // transmission loss coefficient, W/m²K
  const INFILTRATION_W_M2K = 0.1; // infiltration loss coefficient, W/m²K

  function generateWeather(){
    const temps = [];
    for(let h=0; h<HOURS_PER_YEAR; h++){
      const day = h/24;
      const rad = 2*Math.PI*(day-30)/365;
      temps.push(10*Math.sin(rad)+5); // crude outdoor temperature curve
    }
    return temps;
  }
  const defaultTemps = generateWeather();

  function hourlyEPpet(house, temps=defaultTemps){
    const A = house.Atemp;
    const F_geo = house.L.F_geo;
    let energyWh = 0;
    for(const t of temps){
      const dT = INDOOR_TEMP - t;
      const loss = (LOSS_COEFF_W_M2K*A + INFILTRATION_W_M2K*A) * dT;
      const gain = HEAT_GAIN_W_M2*A;
      const net = loss - gain;
      if(net>0){
        energyWh += net;
      }
    }
    const energyKWh = energyWh/1000;
    const weight = E_wght[EType.ELECTRIC];
    return (energyKWh * weight) / (A * F_geo);
  }

  function validateHourlyModel(){
    const loc = new Location("Åland",1.1);
    const house = new House(HouseType.SMALL,100,loc,{});
    const ep = hourlyEPpet(house);
    return Math.abs(ep - 110) < 15; // simple sanity check
  }

  if(typeof window !== 'undefined'){
    window.hourlyEPpet = hourlyEPpet;
    window.validateHourlyModel = validateHourlyModel;
  }
  if(typeof module !== 'undefined' && module.exports){
    module.exports = {hourlyEPpet, validateHourlyModel};
  }
})();
