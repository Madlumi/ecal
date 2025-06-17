(function(){
  const EPClass = {
    data: {
      A: { range: [0, 0.5], colour: '#2ac02c', width: '20%' },
      B: { range: [0.5, 0.75], colour: '#6cc04a', width: '30%' },
      C: { range: [0.75, 1.0], colour: '#dbdb29', width: '40%' },
      D: { range: [1.0, 1.35], colour: '#f0b928', width: '50%' },
      E: { range: [1.35, 1.8], colour: '#f08d1c', width: '60%' },
      F: { range: [1.8, 2.35], colour: '#e65400', width: '70%' },
      G: { range: [2.35, Infinity], colour: '#d90000', width: '80%' }
    },
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

  if(typeof window !== 'undefined'){
    window.EPClass = EPClass;
  }
  if(typeof module !== 'undefined' && module.exports){
    module.exports = {EPClass};
  }
})();
