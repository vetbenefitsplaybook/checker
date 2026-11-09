(function () {
  'use strict';
  var form = document.getElementById('f'), out = document.getElementById('out');
  var selState = document.getElementById('state'), selRating = document.getElementById('rating');
  var PAGES={"Alaska": "alaska", "Arkansas": "arkansas", "Connecticut": "connecticut", "Delaware": "delaware", "Hawaii": "hawaii", "Idaho": "idaho", "Iowa": "iowa", "Kansas": "kansas", "Kentucky": "kentucky", "Louisiana": "louisiana", "Maine": "maine", "Massachusetts": "massachusetts", "Minnesota": "minnesota", "Mississippi": "mississippi", "Montana": "montana", "Nebraska": "nebraska", "Nevada": "nevada", "New Hampshire": "new-hampshire", "New Jersey": "new-jersey", "New Mexico": "new-mexico", "North Dakota": "north-dakota", "Oklahoma": "oklahoma", "Oregon": "oregon", "Rhode Island": "rhode-island", "South Dakota": "south-dakota", "Utah": "utah", "Vermont": "vermont", "West Virginia": "west-virginia", "Wyoming": "wyoming"};
  var DATA = null;
  function gum(url){if(!url||(url.indexOf('gumroad.com')<0&&url.indexOf('shop.vetbenefitsplaybook.com')<0))return url;if(url.indexOf('referrer=')>=0)return url;return url+(url.indexOf('?')>=0?'&':'?')+'referrer='+encodeURIComponent('https://vetbenefitsplaybook.com/checker');}
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function matches(m, r, pt) {
    if (m.kind === 'all') return true;
    if (m.pt_alone && pt) return true;
    if (m.min_rating !== null && r >= m.min_rating && r <= m.max_rating && (!m.pt_required || pt)) return true;
    return false;
  }
  function card(b) {
    return '<li class="item"><div class="row"><h4>' + esc(b.title) + '</h4><span class="tag">' + esc(b.label) + '</span></div>' +
      (b.qualifies ? '<ul class="q">' + b.qualifies.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '<p>' + esc(b.summary) + '</p>') + '<p class="meta"><a href="' + esc(b.source_url) + '" rel="noopener">Official source: ' +
      esc(b.source_label || 'link') + '</a> · Last verified ' + esc(b.last_verified) + '</p></li>';
  }
  function list(arr) { return arr.length ? '<ul class="list">' + arr.map(card).join('') + '</ul>' : '<p class="meta">Nothing in this group for your answers.</p>'; }
  var FOOT = document.querySelector('footer.disc').outerHTML;
  function render(stateVal, r, pt) {
    var L = DATA.links, live = null, name;
    if (stateVal.indexOf('other:') === 0) { name = stateVal.slice(6); }
    else { live = DATA.live_states.filter(function (s) { return s.slug === stateVal; })[0]; name = live ? live.name : ''; }
    var cleared = DATA.benefits.filter(function (b) { return b.status === 'cleared'; });
    var fed = cleared.filter(function (b) { return b.scope === 'federal'; });
    var st = live ? cleared.filter(function (b) { return b.states.indexOf(live.slug) > -1; }) : [];
    var fedM = fed.filter(function (b) { return matches(b.match, r, pt); });
    var stM = st.filter(function (b) { return matches(b.match, r, pt); });
    var stO = st.filter(function (b) { return !matches(b.match, r, pt); });
    var h = '<div class="panel result"><h2 tabindex="-1" id="rh">Benefits to look into: ' + esc(name) + ', ' + r + '%' + (pt ? ', P&amp;T' : '') + '</h2>';
    h += '<p class="meta">These are starting points, not a decision about what you get. Each item has more rules on its official page.</p>';
    var fedO = fed.filter(function (b) { return !matches(b.match, r, pt); });
    h += '<h3>Federal</h3>' + list(fedM);
    if (fedO.length) h += '<details><summary>Other federal benefits with different rules (' + fedO.length + ')</summary>' + list(fedO) + '</details>';
    if (live) {
      h += '<h3>' + esc(name) + '</h3><p class="meta">Last verified ' + esc(live.last_verified) + '</p>' + list(stM);
      if (stO.length) h += '<details><summary>Other ' + esc(name) + ' benefits with different rules (' + stO.length + ')</summary>' + list(stO) + '</details>';
      h += '<div class="ctas"><a class="btn primary" href="' + esc(gum(live.checklist_url)) + '" rel="noopener">Get the full ' + esc(name) + ' checklist ($5)</a>';
    } else {
      var ck = (DATA.checklist_states || []).filter(function (s) { return s.name === name; })[0];
      if (ck && PAGES[name]) {
        h += '<h3>' + esc(name) + '</h3><p>This filter lists federal benefits only. ' + esc(name) + ' state benefits are on the free state page. This checker does not screen them by rating.</p>';
        h += '<div class="ctas"><a class="btn primary" href="' + esc(PAGES[name]) + '/">Browse ' + esc(name) + ' state benefits</a>';
        h += '<a class="btn" href="' + esc(gum(ck.checklist_url)) + '" rel="noopener">Get the full ' + esc(name) + ' checklist ($5)</a>';
      } else if (ck) {
        h += '<h3>' + esc(name) + '</h3><p>' + esc(name) + ' benefits aren\'t in this filter. The ' + esc(name) + ' checklist is ready.</p>';
        h += '<div class="ctas"><a class="btn primary" href="' + esc(gum(ck.checklist_url)) + '" rel="noopener">Get the ' + esc(name) + ' checklist ($5)</a>';
      } else if (name === 'District of Columbia') {
        h += '<h3>' + esc(name) + '</h3><p>We don\'t have a DC checklist. The full guide covers every state + DC.</p>';
        h += '<div class="ctas"><a class="btn primary" href="' + esc(gum(L.guide)) + '" rel="noopener">Get the full guide ($9.99)</a>';
      } else {
        h += '<h3>' + esc(name) + '</h3><p>Our ' + esc(name) + ' checklist isn\'t out yet. The full guide covers every state + DC.</p>';
        h += '<div class="ctas"><a class="btn primary" href="' + esc(gum(L.guide)) + '" rel="noopener">Get the full guide ($9.99)</a>';
      }
    }
    h += '<a class="btn" href="states/">Pick your state (A–Z)</a>';
    h += '<a class="btn" href="' + esc(gum(L.free_checklist)) + '" rel="noopener">Free 100% P&amp;T checklist</a>';
    h += '<a class="btn" href="' + esc(L.subscribe) + '" rel="noopener">Subscribe on YouTube</a></div>';
    h += FOOT + '</div>';
    out.innerHTML = h;
    var rh = document.getElementById('rh'); if (rh) rh.focus();
  }
  function current() {
    var pt = form.querySelector('input[name=pt]:checked');
    return { s: selState.value, r: parseInt(selRating.value, 10), pt: pt && pt.value === 'yes' };
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var c = current();
    if (!c.s) { out.innerHTML = '<p class="panel err" role="alert">Please choose your state.</p>'; selState.focus(); return; }
    if (!DATA) { out.innerHTML = '<p class="panel">Loading…</p>'; return; }
    render(c.s, c.r, c.pt);
    try { history.replaceState(null, '', '?state=' + encodeURIComponent(c.s) + '&rating=' + c.r + '&pt=' + (c.pt ? 'yes' : 'no')); } catch (x) {}
  });
  fetch('data/benefits.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) {
    DATA = d;
    var q = new URLSearchParams(location.search), s = q.get('state');
    if (s && selState.querySelector('option[value="' + s.replace(/"/g, '') + '"]')) {
      selState.value = s;
      var r = q.get('rating'); if (r && /^(100|[0-9]0|0)$/.test(r)) selRating.value = r;
      var p = q.get('pt'); if (p === 'no' || p === 'yes') form.querySelector('input[name=pt][value=' + p + ']').checked = true;
      if (q.get('rating')) form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit'));
    }
  }).catch(function () { out.innerHTML = '<p class="panel err" role="alert">Could not load the benefits list. Please refresh.</p>'; });
})();
