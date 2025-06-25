(function(){
  function detectLang(){
    const urlParams = new URLSearchParams(window.location.search);
    let lang = urlParams.get('lang') || 'sv';
    if(!['sv','en','fi'].includes(lang)) lang = 'sv';
    window.SELECTED_LANG = lang;
  }

  function getString(key){
    if(typeof STRINGS === 'undefined' || !STRINGS.hasOwnProperty(key)) return '[no string found]';
    const entry = STRINGS[key];
    if(typeof entry === 'string') return entry;
    const val = entry[window.SELECTED_LANG];
    if(val !== undefined) return val;
    if(entry.sv !== undefined) return entry.sv;
    return '';
  }

  function getPrintUiString(key){
    if(typeof PRINT_UI_STRINGS === 'undefined' || !PRINT_UI_STRINGS.hasOwnProperty(key)) return '[no string found]';
    const entry = PRINT_UI_STRINGS[key];
    if(typeof entry === 'string') return entry;
    const val = entry[window.SELECTED_LANG];
    if(val !== undefined) return val;
    if(entry.sv !== undefined) return entry.sv;
    return '';
  }

  function getPrintString(key){
    if(typeof PRINT_STRINGS === 'undefined' || !PRINT_STRINGS.hasOwnProperty(key)) return '[no string found]';
    const entry = PRINT_STRINGS[key];
    if(typeof entry === 'string') return entry;
    const val = entry[window.SELECTED_LANG];
    if(val !== undefined) return val;
    if(entry.sv !== undefined) return entry.sv;
    return '';
  }

  function setupHelp(iconId, boxId, key){
    try {
      const icon = document.getElementById(iconId);
      const box  = document.getElementById(boxId);
      if(!icon || !box){
        console.warn('setupHelp: missing element', {iconId, boxId});
        return;
      }
      const txt = getString(key) || '';
      if(!txt){
        icon.style.display = 'none';
        return;
      }
      icon.textContent = getString('info_icon');
      icon.title = '';
      icon.setAttribute('aria-label', getString('help_icon_label'));
      icon.setAttribute('role', 'button');
      icon.setAttribute('aria-controls', boxId);
      icon.setAttribute('aria-expanded', 'false');
      icon.tabIndex = 0;
      const toggle = () => {
        const shouldShow = box.style.display !== 'block';
        box.innerHTML = txt;
        box.style.display = shouldShow ? 'block' : 'none';
        icon.setAttribute('aria-expanded', shouldShow ? 'true' : 'false');
      };
      icon.onclick = toggle;
      icon.addEventListener('keydown', ev => {
        if(ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          toggle();
        }
      });
    } catch(err){
      console.error(`setupHelp(${iconId}, ${boxId}, ${key}) failed:`, err);
      const icon = document.getElementById(iconId);
      if(icon) icon.style.display = 'none';
    }
  }

  function applyLanguage(){
    if (typeof document !== 'undefined') {
      document.documentElement.lang = window.SELECTED_LANG;
    }
    document.querySelectorAll('.lang-button').forEach(btn => {
      btn.style.opacity = btn.dataset.lang === window.SELECTED_LANG ? '1' : '0.5';
    });
    const keys = [];
    const helpBases = [];
    Object.keys(STRINGS).forEach(k => {
      const txt = getString(k).trim();
      if(k.endsWith('_help')){
        if(txt !== '') helpBases.push(k.slice(0,-5));
      } else {
        keys.push(k);
      }
    });
    keys.forEach(key => {
      const el = document.getElementById(key);
      if(!el) return;
      const str = getString(key) || '';
      if(key === 'disclaimer'){
        el.innerHTML = str;
        el.style.display = str ? 'block' : 'none';
      } else {
        el.innerHTML = str;
      }
    });
    helpBases.forEach(base => {
      const iconId = `${base}_help_icon`;
      const boxId  = `${base}_help`;
      let icon = document.getElementById(iconId);
      let box  = document.getElementById(boxId);
      const ref = document.getElementById(`lbl_${base}`) || document.getElementById(base);
      if(!ref) return;
      if(!icon){
        icon = document.createElement('span');
        icon.className = 'info-icon';
        icon.id = iconId;
        ref.parentNode.insertBefore(icon, ref.nextSibling);
      }
      if(!box){
        box = document.createElement('div');
        box.className = 'help-box';
        box.id = boxId;
        icon.parentNode.insertBefore(box, icon.nextSibling);
      }
      setupHelp(iconId, boxId, `${base}_help`);
    });
    const repoLink = document.getElementById('footer_repo_link');
    if(repoLink && typeof CONFIG !== 'undefined' && CONFIG.APP_INFO){
      repoLink.href = CONFIG.APP_INFO.REPO_URL;
      repoLink.textContent = CONFIG.APP_INFO.REPO_URL;
    }
    const verEl = document.getElementById('app_version');
    if(verEl && typeof CONFIG !== 'undefined' && CONFIG.APP_INFO){
      verEl.textContent = CONFIG.APP_INFO.VERSION;
    }
    const repoLbl = document.getElementById('footer_repo_label');
    if(repoLbl){
      repoLbl.textContent = getString('footer_repo_label');
    }
    const verLbl = document.getElementById('footer_version_label');
    if(verLbl){
      verLbl.textContent = getString('footer_version_label');
    }
  }

  if(typeof window !== 'undefined'){
    window.detectLang = detectLang;
    window.getString = getString;
    window.getPrintUiString = getPrintUiString;
    window.getPrintString = getPrintString;
    window.applyLanguage = applyLanguage;
    window.setupHelp = setupHelp;
  }

  if(typeof module !== 'undefined' && module.exports){
    module.exports = {detectLang, getString, getPrintUiString, getPrintString, applyLanguage, setupHelp};
  }
})();
