(function(){
  const INFO_ICON_CLASS = 'info-icon';
  function parseValidatedNumber(el, max, errorEl, errKey){
    const num = parseFloat(el.value);
    const invalid = isNaN(num) || num < 0 || num > max;
    if(invalid){
      if(errorEl){
        errorEl.textContent = getString(errKey);
        errorEl.style.display = 'block';
        errorEl.setAttribute('role','alert');
      }
      el.classList.add('invalid');
      el.setAttribute('aria-invalid','true');
      if(errorEl) el.setAttribute('aria-describedby', errorEl.id);
      return null;
    }
    if(errorEl){
      errorEl.style.display = 'none';
      errorEl.removeAttribute('role');
    }
    el.classList.remove('invalid');
    el.removeAttribute('aria-invalid');
    if(errorEl) el.removeAttribute('aria-describedby');
    return num;
  }

  function ensureInfoIconsFocusable(){
    document.querySelectorAll('.' + INFO_ICON_CLASS).forEach(icon => {
      if(!icon.hasAttribute('role')){
        icon.setAttribute('role','button');
      }
      if(icon.tabIndex < 0){
        icon.tabIndex = 0;
      }
    });
  }

  class ValueBox{
    constructor(box, but, locked=true, allowToggle=true){
      this.box = box;
      this.but = but;
      this.locked = locked;
      this.allowToggle = allowToggle;
      this.valueCalc = '';
      this.valueInp = '';
      if(this.allowToggle){
        this.but.addEventListener('click', () => this.toggleLock());
      }else{
        this.but.style.display = 'none';
        this.box.disabled = true;
      }
      this.updateVisual();
    }
    updateVisual(){
      if(this.allowToggle){
        this.box.disabled = this.locked;
      }else{
        this.box.disabled = true;
      }
      if(this.locked){
        this.box.classList.add('locked');
      }else{
        this.box.classList.remove('locked');
      }
      if(this.allowToggle){
        this.but.textContent = this.locked ? getString('calc_icon') : getString('pen_icon');
        const tip = this.locked ? getString('calc_tooltip') : getString('pen_tooltip');
        this.but.title = tip;
        this.but.setAttribute('aria-label', tip);
      }
    }
    setCalc(v){
      this.valueCalc = v;
      if(this.locked) this.box.value = v;
    }
    toggleLock(){
      if(!this.allowToggle) return;
      if(this.locked){
        this.valueCalc = this.box.value;
      }else{
        this.valueInp = this.box.value;
        this.box.value = this.valueCalc;
      }
      this.locked = !this.locked;
      this.updateVisual();
      calculate();
    }
    getValue(){
      return this.locked ? this.valueCalc : this.box.value;
    }
  }

  if(typeof window !== 'undefined'){
    window.parseValidatedNumber = parseValidatedNumber;
    window.ensureInfoIconsFocusable = ensureInfoIconsFocusable;
    window.ValueBox = ValueBox;
    window.INFO_ICON_CLASS = INFO_ICON_CLASS;
  }
  if(typeof module !== 'undefined' && module.exports){
    module.exports = {parseValidatedNumber, ensureInfoIconsFocusable, ValueBox, INFO_ICON_CLASS};
  }
})();
