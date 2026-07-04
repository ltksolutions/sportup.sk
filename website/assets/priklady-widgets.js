// SportUp.sk — interaktívne vizualizácie scenárov (priklady.html)
// Vanilla JS, bez závislostí. Každý widget sa inicializuje podľa
// data-su-widget atribútu svojho kontajnera.
// Licencia: viď centrálny REUSE.toml (website/** → CC-BY-4.0)
(() => {
  'use strict';

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
  ));

  // ─────────────────────────────────────────────────────────────
  // Scenár 01 — Registrácia mládežníka (stepper)
  // ─────────────────────────────────────────────────────────────
  function initReg(root) {
    const steps = [
      {
        t: 'Overenie osoby cez Identity Broker',
        d: 'Klub pošle dáta dieťaťa. Broker cez porovnanie s RFO (štátny register fyzických osôb) zistí, že Tomáš existuje, a vráti stabilné interné <code>person_id</code>.',
        tag: 'match-or-create', res: 'verified_by_rfo · is_minor: true'
      },
      {
        t: 'Registrácia zákonného zástupcu',
        d: 'Keďže Tomáš je maloletý, súhlasy udeľuje otec Peter. Ak ešte v systéme nie je, založí sa a vytvorí sa vzťah osoba — zákonný zástupca.',
        tag: 'guardian-relationships', res: 'relationship_type: legal_parent'
      },
      {
        t: 'Udelenie súhlasov',
        d: 'Otec udeľuje tri súhlasy: základná registrácia (<b>contract</b> — neodvolateľná), fotografie na marketing (<b>consent</b> — odvolateľné) a anonymizovaný výskum (<b>public_task</b>).',
        tag: 'consents · batch', res: '3 účely · GDPR granular'
      },
      {
        t: 'Vytvorenie a aktivácia afiliácie',
        d: 'Klub zapíše afiliáciu (šport SK-BAS, odvetvie 5v5, kategória U13). Systém vyprodukuje dva eventy: <code>AffiliationRegistered</code> → po validácii <code>AffiliationActivated</code>.',
        tag: 'affiliations', res: 'status: active'
      }
    ];
    let i = 0;
    const dots = root.querySelector('[data-dots]');
    const panel = root.querySelector('[data-panel]');
    const status = root.querySelector('[data-status]');
    const prev = root.querySelector('[data-prev]');
    const next = root.querySelector('[data-next]');

    steps.forEach((_, k) => {
      const seg = document.createElement('div');
      seg.className = 'su-seg';
      seg.dataset.seg = k;
      dots.appendChild(seg);
    });

    function render() {
      const s = steps[i];
      panel.innerHTML =
        '<div style="display:flex;align-items:center;gap:9px;margin-bottom:0.6rem">' +
          '<span style="width:24px;height:24px;border-radius:50%;background:var(--blue);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:0.78rem;font-weight:600;flex-shrink:0">' + (i + 1) + '</span>' +
          '<span style="font-weight:700;font-size:0.95rem;color:#fff">' + esc(s.t) + '</span>' +
        '</div>' +
        '<div style="font-size:0.84rem;line-height:1.55;color:#C8DCEC;margin-bottom:0.7rem">' + s.d + '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
          '<span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--code-string);background:rgba(155,211,240,0.1);padding:0.25rem 0.55rem;border-radius:5px">POST /v1/' + esc(s.tag) + '</span>' +
          '<span style="font-family:var(--font-mono);font-size:0.7rem;color:#8FC7A0">&#10003; ' + esc(s.res) + '</span>' +
        '</div>';
      steps.forEach((_, k) => {
        root.querySelector('[data-seg="' + k + '"]').classList.toggle('is-on', k <= i);
      });
      status.textContent = 'Krok ' + (i + 1) + ' zo ' + steps.length;
      prev.disabled = i === 0;
      next.textContent = i === steps.length - 1 ? '\u21BB Od začiatku' : 'Ďalší krok →';
    }
    next.addEventListener('click', () => { i = i === steps.length - 1 ? 0 : i + 1; render(); });
    prev.addEventListener('click', () => { if (i > 0) { i--; render(); } });
    render();
  }

  // ─────────────────────────────────────────────────────────────
  // Scenár 02 — Prestup (reťaz udalostí)
  // ─────────────────────────────────────────────────────────────
  function initTransfer(root) {
    const C = { blue: '#388FC3', amber: '#B8860B', green: '#2E7D5B', red: '#C8453C' };
    const base = [
      { type: 'TransferRequested', agg: 'aff_nit_kovac_2026', when: '2026-06-15 14:22', desc: 'HK Nitra iniciuje prestup. Vznikne nová afiliácia v stave pending_transfer.', c: C.blue },
      { type: 'AffiliationTerminated', agg: 'aff_bb_kovac_2023', when: '2026-07-01 00:00', desc: 'K účinnému dátumu sa pôvodná afiliácia v Banskej Bystrici ukončí (reason: transfer).', c: C.amber },
      { type: 'AffiliationActivated', agg: 'aff_nit_kovac_2026', when: '2026-07-01 00:00', desc: 'Nová afiliácia v Nitre sa aktivuje. Tretia udalosť uzatvára reťaz.', c: C.green }
    ];
    const comp = { type: 'TransferCompensated', agg: 'aff_nit_kovac_2026', when: '2026-07-01 00:04', desc: '2. krok zlyhal (napr. neplatná zmluva). Systém sa NEvracia rollbackom — vydá kompenzačnú udalosť, ktorá vráti stav dopredným pohybom. Pôvodná afiliácia ostáva platná.', c: C.red };

    const tl = root.querySelector('[data-timeline]');
    let timer = null;

    function build(events, activeUpTo) {
      tl.innerHTML = '';
      events.forEach((e, k) => {
        const on = k <= activeUpTo;
        const isLast = k === events.length - 1;
        const row = document.createElement('div');
        row.className = 'su-tl-row';
        row.innerHTML =
          '<div style="display:flex;flex-direction:column;align-items:center">' +
            '<div class="su-tl-dot" style="background:' + (on ? e.c : 'var(--bg-alt)') + ';color:' + (on ? '#fff' : 'var(--border-strong)') + ';border:2px solid ' + (on ? e.c : 'var(--border)') + '">' + (k + 1) + '</div>' +
            (isLast ? '' : '<div class="su-tl-line" style="background:' + (on ? e.c : 'var(--border)') + '"></div>') +
          '</div>' +
          '<div style="padding-bottom:' + (isLast ? '0' : '1rem') + ';opacity:' + (on ? '1' : '0.45') + ';transition:opacity 0.3s">' +
            '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:0.25rem">' +
              '<span style="font-family:var(--font-mono);font-size:0.82rem;font-weight:600;color:' + e.c + '">' + esc(e.type) + '</span>' +
              '<span style="font-family:var(--font-mono);font-size:0.68rem;color:var(--text-soft)">' + esc(e.when) + '</span>' +
            '</div>' +
            '<div style="font-size:0.8rem;color:var(--text-muted);line-height:1.5;margin-bottom:0.3rem">' + esc(e.desc) + '</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;font-family:var(--font-mono);font-size:0.66rem">' +
              '<span style="color:var(--text-muted);background:var(--bg-alt);padding:0.15rem 0.45rem;border-radius:4px">aggregate: ' + esc(e.agg) + '</span>' +
              '<span style="color:var(--blue-dark);background:var(--blue-light);padding:0.15rem 0.45rem;border-radius:4px">correlation: txn_transfer_c4f8…</span>' +
            '</div>' +
          '</div>';
        tl.appendChild(row);
      });
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function playSeq(events) {
      stop(); build(events, -1); let k = -1;
      timer = setInterval(() => { k++; build(events, k); if (k >= events.length - 1) stop(); }, 700);
    }
    root.querySelector('[data-play]').addEventListener('click', () => playSeq(base));
    root.querySelector('[data-fail]').addEventListener('click', () => playSeq([base[0], base[1], comp]));
    root.querySelector('[data-reset]').addEventListener('click', () => { stop(); build(base, -1); });
    build(base, -1);
  }

  // ─────────────────────────────────────────────────────────────
  // Scenár 03 — Multi-role osoba (klik na rolu)
  // ─────────────────────────────────────────────────────────────
  function initMultirole(root) {
    const roles = [
      { id: 'aff_1', role: 'Profesionálny športovec', org: 'AC Košice', orgtype: 'atletický klub', sport: 'Atletika', disc: 'Trailový beh', code: 'SK-ATH · SK-ATH-TRAIL', from: '2018-01-01', to: null, color: '#388FC3', icon: '▲' },
      { id: 'aff_2', role: 'Tréner', org: 'ŠK Detva', orgtype: 'bežecký klub', sport: 'Atletika', disc: 'Mládež', code: 'SK-ATH · SK-ATH-YOUTH', from: '2022-09-01', to: null, color: '#2E7D5B', icon: '◆' },
      { id: 'aff_3', role: 'Dobrovoľník', org: 'OV Tatry Ultra 2026', orgtype: 'organizátor podujatia', sport: 'Atletika', disc: '—', code: 'SK-ATH', from: '2026-08-15', to: '2026-09-05', color: '#B8860B', icon: '●' },
      { id: 'aff_4', role: 'Športový rozhodca', org: 'ŠK Rapid', orgtype: 'šachový klub', sport: 'Šach', disc: 'Rapid', code: 'SK-SCH · SK-SCH-RAPID', from: '2020-03-10', to: null, color: '#8250C4', icon: '■' }
    ];
    const wrap = root.querySelector('[data-roles]');
    const detail = root.querySelector('[data-detail]');
    let active = null;

    function field(label, val) {
      return '<div><div class="su-detail-field-label">' + esc(label) + '</div><div class="su-detail-field-val">' + val + '</div></div>';
    }
    roles.forEach((r) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'su-role-btn';
      b.style.borderLeftColor = r.color;
      b.setAttribute('aria-label', r.role + ' — ' + r.org);
      b.innerHTML =
        '<div style="display:flex;align-items:center;gap:7px;margin-bottom:0.2rem"><span style="color:' + r.color + ';font-size:0.7rem">' + r.icon + '</span><span style="font-weight:700;font-size:0.83rem;color:var(--navy)">' + esc(r.role) + '</span></div>' +
        '<div style="font-size:0.75rem;color:var(--text-muted)">' + esc(r.org) + '</div>';
      b.addEventListener('click', () => {
        if (active) active.classList.remove('is-active');
        active = b; b.classList.add('is-active');
        const validity = r.to ? (r.from + ' → ' + r.to) : ('od ' + r.from + ' · trvá');
        detail.innerHTML =
          '<div style="display:flex;align-items:center;gap:9px;margin-bottom:0.7rem">' +
            '<span style="color:' + r.color + ';font-size:0.85rem">' + r.icon + '</span>' +
            '<span style="color:#fff;font-weight:700;font-size:0.98rem">' + esc(r.role) + '</span>' +
            '<span style="font-family:var(--font-mono);font-size:0.68rem;color:var(--code-comment);margin-left:auto">' + esc(r.id) + '</span>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:0.7rem 1.1rem;font-size:0.82rem">' +
            field('Organizácia', esc(r.org) + ' <span style="color:var(--code-comment)">(' + esc(r.orgtype) + ')</span>') +
            field('Šport', esc(r.sport)) +
            field('Odvetvie / kategória', esc(r.disc)) +
            field('Číselníkové kódy', '<span class="su-mono-blue" style="font-size:0.92em">' + esc(r.code) + '</span>') +
            field('Platnosť', esc(validity)) +
          '</div>';
      });
      wrap.appendChild(b);
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Scenár 04 — Komerčné overenie (minimalizácia dát)
  // ─────────────────────────────────────────────────────────────
  function initVerify(root) {
    const fields = [
      { k: 'Meno a priezvisko', v: 'Martina Kučerová' },
      { k: 'Dátum narodenia', v: '1991-04-08' },
      { k: 'Šport a odvetvie', v: 'Atletika · trail' },
      { k: 'Klub', v: 'AC Košice' },
      { k: 'Úroveň', v: 'profesionálny' }
    ];
    const box = root.querySelector('[data-fields]');
    const out = root.querySelector('[data-out]');
    const srcLabel = root.querySelector('[data-src-label]');
    const tabKnown = root.querySelector('[data-tab-known]');
    const tabGets = root.querySelector('[data-tab-gets]');
    let mode = 'known';

    function renderFields(strike) {
      box.innerHTML = '';
      fields.forEach((f) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;justify-content:space-between;gap:10px;font-size:0.8rem;padding:0.3rem 0;border-bottom:1px dashed var(--border);transition:all 0.3s';
        const strikeCss = strike ? 'text-decoration:line-through;color:var(--border-strong)' : 'color:var(--navy)';
        row.innerHTML = '<span style="color:var(--text-soft)">' + esc(f.k) + '</span><span style="font-weight:500;' + strikeCss + '">' + esc(f.v) + '</span>';
        box.appendChild(row);
      });
    }
    function renderOut() {
      if (mode === 'known') {
        out.style.background = 'var(--bg-alt)';
        out.style.border = '1px solid var(--border)';
        out.innerHTML = '<div class="su-panel-label">Odpoveď hotelu</div><div style="font-size:0.82rem;color:var(--text-soft);line-height:1.5">Prepni na <b>„Čo hotel dostane"</b> a uvidíš, čo z ľavej strany reálne prejde bránou.</div>';
      } else {
        out.style.background = 'var(--success-soft)';
        out.style.border = '1px solid var(--success)';
        out.innerHTML =
          '<div class="su-panel-label" style="color:var(--success)">Odpoveď hotelu</div>' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:0.5rem"><span style="width:22px;height:22px;border-radius:50%;background:var(--success);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700">&#10003;</span><span style="font-weight:700;font-size:0.9rem;color:var(--navy)">Áno — registrovaný športovec</span></div>' +
          '<div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--success);background:rgba(46,125,91,0.1);padding:0.4rem 0.55rem;border-radius:5px;line-height:1.5">has_active_athlete_affiliation: true<br>category_tier: "registered"</div>';
      }
    }
    function setMode(m) {
      mode = m;
      const onK = m === 'known';
      tabKnown.classList.toggle('is-active', onK);
      tabGets.classList.toggle('is-active', !onK);
      srcLabel.textContent = onK ? 'Údaje osoby v systéme' : 'Údaje osoby — zablokované bránou';
      renderFields(!onK); renderOut();
    }
    tabKnown.addEventListener('click', () => setMode('known'));
    tabGets.addEventListener('click', () => setMode('gets'));
    setMode('known');
  }

  // ─────────────────────────────────────────────────────────────
  // Scenár 05 — Úmrtie (kaskádová terminácia)
  // ─────────────────────────────────────────────────────────────
  function initDeath(root) {
    const affs = [
      { org: 'SFZ — rozhodca', src: 'zväz', agg: 'aff_sfz_rozhodca_…' },
      { org: 'FK Slovan — funkcionár', src: 'klub', agg: 'aff_fk_funkcionar_…' },
      { org: 'ObFZ — delegát', src: 'zväz', agg: 'aff_obfz_delegat_…' }
    ];
    const box = root.querySelector('[data-affs]');
    const status = root.querySelector('[data-status]');
    const note = root.querySelector('[data-note]');
    const arrow = root.querySelector('[data-arrow]');
    let timer = null;

    function build(activeUpTo) {
      box.innerHTML = '';
      affs.forEach((a, k) => {
        const done = k <= activeUpTo;
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:0.6rem 0.8rem;border-radius:9px;border:1px solid ' + (done ? '#E0A9A4' : 'var(--border)') + ';background:' + (done ? 'var(--danger-soft)' : 'var(--white)') + ';transition:all 0.35s';
        row.innerHTML =
          '<span style="width:22px;height:22px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;background:' + (done ? 'var(--danger)' : 'var(--bg-alt)') + ';color:' + (done ? '#fff' : 'var(--border-strong)') + '">' + (done ? '\u2715' : (k + 1)) + '</span>' +
          '<div style="flex:1"><div style="font-weight:600;font-size:0.83rem;color:var(--navy)">' + esc(a.org) + '</div><div style="font-family:var(--font-mono);font-size:0.66rem;color:var(--text-soft)">' + esc(a.agg) + '</div></div>' +
          '<span style="font-size:0.68rem;color:var(--text-soft);background:var(--bg-alt);padding:0.15rem 0.5rem;border-radius:99px;text-transform:uppercase;letter-spacing:0.04em">' + esc(a.src) + '</span>' +
          (done ? '<span style="font-family:var(--font-mono);font-size:0.66rem;color:var(--danger);font-weight:600">terminated</span>' : '');
        box.appendChild(row);
      });
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    root.querySelector('[data-run]').addEventListener('click', () => {
      stop(); build(-1); note.style.opacity = '0'; arrow.style.color = 'var(--danger)'; let k = -1;
      status.textContent = 'Ukončujem afiliácie…';
      timer = setInterval(() => {
        k++; build(k);
        if (k >= affs.length - 1) { stop(); status.textContent = affs.length + ' afiliácií ukončených (reason: death)'; note.style.opacity = '1'; }
      }, 600);
    });
    root.querySelector('[data-reset]').addEventListener('click', () => {
      stop(); build(-1); status.textContent = ''; note.style.opacity = '0'; arrow.style.color = 'var(--border-strong)';
    });
    build(-1);
  }

  // ─────────────────────────────────────────────────────────────
  // Scenár 06 — Športovisko (dvojhodnota šport / cestovný ruch)
  // ─────────────────────────────────────────────────────────────
  function initFacility(root) {
    const data = {
      sport: [
        { t: 'Športové zväzy (SBA, SHF, SZH)', d: 'priraďujú halu k ligovým zápasom', c: '#388FC3' },
        { t: 'Rezervačné systémy', d: 'ponúkajú voľné termíny na hale', c: '#388FC3' },
        { t: 'Obec / magistrát', d: 'podklad pre výročné hlásenie o infraštruktúre', c: '#388FC3' },
        { t: 'Verejné obstarávanie', d: 'presný popis objektu pre údržbu', c: '#388FC3' }
      ],
      tour: [
        { t: 'Verejná mapa SportUp', d: 'hala viditeľná cez otvorené API', c: '#B8860B' },
        { t: 'Turistické platformy', d: 'visitslovakia.com, GoŽilina ju zobrazia', c: '#B8860B' },
        { t: 'Ubytovanie v okolí', d: 'penzióny a hotely napojené na lokalitu', c: '#B8860B' },
        { t: 'Dostupnosť a mobilita', d: 'MHD 120 m, 95 parkovacích miest, EV nabíjanie', c: '#B8860B' }
      ]
    };
    const box = root.querySelector('[data-consumers]');
    const tabSport = root.querySelector('[data-tab-sport]');
    const tabTour = root.querySelector('[data-tab-tour]');

    function render(mode) {
      const arr = data[mode];
      box.innerHTML = '';
      arr.forEach((x) => {
        const card = document.createElement('div');
        card.style.cssText = 'background:var(--white);border:1px solid var(--border);border-left:3px solid ' + x.c + ';border-radius:9px;padding:0.7rem 0.85rem';
        card.innerHTML = '<div style="font-weight:600;font-size:0.82rem;color:var(--navy);margin-bottom:0.15rem">' + esc(x.t) + '</div><div style="font-size:0.75rem;color:var(--text-muted);line-height:1.45">' + esc(x.d) + '</div>';
        box.appendChild(card);
      });
    }
    function setMode(m) {
      const s = m === 'sport';
      tabSport.classList.toggle('is-active', s);
      tabTour.classList.toggle('is-active', !s);
      // Cestovný ruch používa jantárovú (amber) namiesto navy pre aktívny stav
      tabTour.style.background = s ? '' : '#B8860B';
      tabTour.style.color = s ? '' : '#fff';
      tabSport.style.background = s ? '#388FC3' : '';
      tabSport.style.color = s ? '#fff' : '';
      render(m);
    }
    tabSport.addEventListener('click', () => setMode('sport'));
    tabTour.addEventListener('click', () => setMode('tour'));
    setMode('sport');
  }

  // ─────────────────────────────────────────────────────────────
  // Router
  // ─────────────────────────────────────────────────────────────
  const inits = {
    reg: initReg,
    transfer: initTransfer,
    multirole: initMultirole,
    verify: initVerify,
    death: initDeath,
    facility: initFacility
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-su-widget]').forEach((root) => {
      const kind = root.getAttribute('data-su-widget');
      if (inits[kind]) {
        try { inits[kind](root); } catch (e) { /* fail silently, JSON detail ostáva */ }
      }
    });
  });
})();
