// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2025 Edvin svenblad

(function(){
  const EP_TABLE = {
    A: { range: [0, 0.5], colour: '#2ac02c', width: '20%' },
    B: { range: [0.5, 0.75], colour: '#6cc04a', width: '30%' },
    C: { range: [0.75, 1.0], colour: '#dbdb29', width: '40%' },
    D: { range: [1.0, 1.35], colour: '#f0b928', width: '50%' },
    E: { range: [1.35, 1.8], colour: '#f08d1c', width: '60%' },
    F: { range: [1.8, 2.35], colour: '#e65400', width: '70%' },
    G: { range: [2.35, Infinity], colour: '#d90000', width: '80%' }
  };
  const CONFIG = {
    CONSTANTS: {
      PERSON_HEAT: 80,
      NOREQ_VALUE: 999999999,
      LOCKED_COMBINATIONS: [],
      ROOMS_TO_PERSONS: [1.42, 1.63, 2.18, 2.79, 3.51],
      ARROW_LENGTH_IN: 1.5,
      NA_ARROW_COLOR: "#ccc"
    },
    FEATURES: {
      NOREQ_NACLASS: true,
      HOURLY_MODEL: false
    },
    APP_INFO: {
      VERSION: "α-02",
      REPO_URL: "https://github.com/digi-regeringen-ax/energy-calculation"
    },
    PRINTING: {
      NAME_LIMITS: {
        ADDRESS: 80,
        FILENAME: 100
      },
      CLASS_LAYOUT: {
        container: { width:73, height:90 },
        margins: { top:10, bottom:5, gap:3 },
        arrow: { minNorm:0.2, maxNorm:0.9, fontSize:5 },
        letterOffset: { x:-4, y:0.5 },
        outline: { black:2.5, white:1 },
        house: { roofThickness:9, roofGap:6, fontSize:50, letterOffset: { x:0, y:20 } }
      }
    },
    EP_TABLE: EP_TABLE
  };
  CONFIG.CONSTANTS.ARROW_LENGTH = `${CONFIG.CONSTANTS.ARROW_LENGTH_IN}in`;

  const EPClass = {
    data: EP_TABLE,
    values(eplim){
      const out = {};
      for(const [k,v] of Object.entries(this.data)){
        out[k] = {
          min: v.range[0]*eplim,
          max: v.range[1] === Infinity ? Infinity : v.range[1]*eplim,
          color: v.colour,
          width: v.width
        };
      }
      return out;
    },
    classify(ep,eplim){
      for(const [k,v] of Object.entries(this.data)){
        const lo = v.range[0]*eplim;
        const hi = v.range[1] === Infinity ? Infinity : v.range[1]*eplim;
        if(ep >= lo && ep <= hi) return k;
      }
      return '';
    }
  };

  if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.EPClass = EPClass;
  }

  if (typeof module !== 'undefined' && module.exports) {
    CONFIG.EPClass = EPClass;
    module.exports = CONFIG;
  }
})();
