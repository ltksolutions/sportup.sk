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
  function initSchema(root) {
    var fieldDocs = {
      purpose_code: { t: 'Kód účelu', d: 'Jednoznačný identifikátor účelu. Prefix (REG, MKT, ZDR…) určuje kategóriu a governance doménu.' },
      inheritance_level: { t: 'Úroveň vrstvy', d: '0 = univerzálny (všetky športy), 1 = kategóriový, 2 = špecifický, 3 = disciplinárny. Vďaka vrstveniu sa katalóg neškáluje lineárne s 90 športmi.' },
      applicable_scope: { t: 'Rozsah pôsobnosti', d: 'Na ktoré športy, odvetvia a role sa účel vzťahuje. Role pokrývajú všetky typy osôb — nielen športovcov, ale aj trénerov, rozhodcov, dobrovoľníkov.' },
      label_sk: { t: 'Názov (SK)', d: 'Krátky zrozumiteľný názov v slovenčine. Zobrazuje sa dotknutej osobe pri správe jej súhlasov.' },
      description_sk: { t: 'Opis (SK)', d: 'Plný opis účelu. Záznam slúži ako GDPR dokument pre dotknutú osobu — musí byť zrozumiteľný laikovi.' },
      legal_basis: { t: 'Právny základ', d: 'Podľa čl. 6 GDPR: contract, consent, legal_obligation, public_task, legitimate_interest, vital_interests. Určuje, či je súhlas odvolateľný.' },
      legal_reference: { t: 'Právny odkaz', d: 'Konkrétne ustanovenie zákona — napr. § 79 zákona č. 440/2015 Z.z. o športe.' },
      required_data_scopes: { t: 'Potrebné dátové rozsahy', d: 'Ktoré kategórie údajov účel vyžaduje. Princíp minimalizácie — len nevyhnutné.' },
      special_category: { t: 'Osobitná kategória', d: 'Či ide o citlivé údaje podľa čl. 9 GDPR (zdravie, biometria…). Ak áno, samotný súhlas nestačí.' },
      withdrawal_allowed: { t: 'Možnosť odvolania', d: 'Či môže osoba súhlas odvolať. Pri contract/legal_obligation zvyčajne false, pri consent vždy true.' },
      retention_period_days: { t: 'Retenčná doba', d: 'Koľko dní sa údaje uchovávajú. 1825 = 5 rokov. Po uplynutí sa dáta archivujú alebo mažú.' },
      retention_trigger: { t: 'Spúšťač retencie', d: 'Udalosť, od ktorej sa počíta retenčná doba — napr. affiliation_termination, event_end, immediate.' },
      applies_to_minors: { t: 'Platnosť pre maloletých', d: 'with_guardian_consent (súhlas zákonného zástupcu), with_assent (+ asent dieťaťa od 13 r.), not_applicable.' },
      transfer_to_third_country: { t: 'Prenos do tretej krajiny', d: 'Či sa údaje prenášajú mimo EÚ. Pri anti-dopingu (WADA/ADAMS) áno — vyžaduje osobitné záruky.' },
      automated_decision_making: { t: 'Automatizované rozhodovanie', d: 'Či účel zahŕňa profilovanie s právnym účinkom (čl. 22 GDPR). Väčšinou false.' },
      status: { t: 'Stav účelu', d: 'Životný cyklus: draft → active → deprecated → terminated. Nové súhlasy len pri active.' },
      valid_from: { t: 'Platný od', d: 'Dátum vstupu verzie účelu do platnosti. Existujúce súhlasy odkazujú na konkrétnu verziu.' }
    };
    var examples = [
      { id: 'reg', label: 'Registrácia športovca', person: 'športovec', color: '#388FC3', data: {
        purpose_code: '"REG-SPORTOVEC-001"', version: '"1.0"', inheritance_level: '0',
        applicable_scope: '{ sports: "all", roles: ["amatersky_sportovec", "profesionalny_sportovec"] }',
        label_sk: '"Registrácia športovca v zväze a klube"',
        description_sk: '"Evidencia športovca v centrálnom registri, klube a zväze…"',
        legal_basis: '"contract + public_task"', legal_reference: '"§ 79 zák. 440/2015 Z.z."',
        required_data_scopes: '["core_identity", "contact", "photo"]', special_category: '"none"',
        withdrawal_allowed: 'false', retention_period_days: '1825', retention_trigger: '"affiliation_termination"',
        applies_to_minors: '"with_guardian_consent"', transfer_to_third_country: 'false',
        automated_decision_making: 'false', status: '"active"', valid_from: '"2026-09-01"'
      } },
      { id: 'trener', label: 'Registrácia trénera', person: 'tréner', color: '#2E7D5B', data: {
        purpose_code: '"REG-TRENER-001"', version: '"1.0"', inheritance_level: '0',
        applicable_scope: '{ sports: "all", roles: ["trener"] }',
        label_sk: '"Registrácia trénera"',
        description_sk: '"Evidencia trénera vrátane jeho licencií a kvalifikácií…"',
        legal_basis: '"contract"', legal_reference: '"§ 6 zák. 440/2015 Z.z."',
        required_data_scopes: '["core_identity", "contact", "qualifications"]', special_category: '"none"',
        withdrawal_allowed: 'false', retention_period_days: '3650', retention_trigger: '"affiliation_termination"',
        applies_to_minors: '"not_applicable"', transfer_to_third_country: 'false',
        automated_decision_making: 'false', status: '"active"', valid_from: '"2026-09-01"'
      } },
      { id: 'foto', label: 'Foto maloletého (marketing)', person: 'maloletý', color: '#B8860B', data: {
        purpose_code: '"MKT-FOTO-001-MALOLETY"', version: '"1.0"', inheritance_level: '1',
        applicable_scope: '{ sports: "all", roles: ["amatersky_sportovec"] }',
        label_sk: '"Foto/video maloletého na propagáciu"',
        description_sk: '"Zverejnenie fotografií maloletého športovca na propagačné účely…"',
        legal_basis: '"consent"', legal_reference: '"čl. 6(1)(a) + čl. 8 GDPR"',
        required_data_scopes: '["photo", "core_identity"]', special_category: '"none"',
        withdrawal_allowed: 'true', retention_period_days: '730', retention_trigger: '"consent_withdrawal"',
        applies_to_minors: '"with_guardian_consent + assent"', transfer_to_third_country: 'false',
        automated_decision_making: 'false', status: '"active"', valid_from: '"2026-09-01"'
      } },
      { id: 'doping', label: 'Anti-doping test', person: 'športovec', color: '#C8453C', data: {
        purpose_code: '"ZDR-ANTIDOPING-001"', version: '"1.0"', inheritance_level: '2',
        applicable_scope: '{ sports: "all", roles: ["profesionalny_sportovec"] }',
        label_sk: '"Anti-doping testovanie (ADAMS)"',
        description_sk: '"Spracovanie výsledkov dopingových kontrol vrátane prenosu do WADA…"',
        legal_basis: '"legal_obligation + WADA Code"', legal_reference: '"čl. 9(2)(g) GDPR"',
        required_data_scopes: '["core_identity", "health", "test_results"]', special_category: '"health (čl. 9)"',
        withdrawal_allowed: 'false', retention_period_days: '3650', retention_trigger: '"immediate"',
        applies_to_minors: '"with_guardian_consent"', transfer_to_third_country: 'true',
        automated_decision_making: 'false', status: '"active"', valid_from: '"2026-09-01"'
      } }
    ];
    var exWrap = root.querySelector('[data-examples]');
    var jsonBox = root.querySelector('[data-json]');
    var explain = root.querySelector('[data-explain]');
    var activeEx = examples[0], activeField = null, activeBtn = null;
    examples.forEach(function (ex) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'su-ex-btn'; b.style.borderLeft = '3px solid ' + ex.color;
      b.innerHTML = esc(ex.label) + ' <span style="color:var(--text-soft);font-size:0.9em">· ' + esc(ex.person) + '</span>';
      b.addEventListener('click', function () {
        if (activeBtn) activeBtn.classList.remove('is-active');
        activeBtn = b; b.classList.add('is-active');
        activeEx = ex; activeField = null; renderJson(); resetExplain();
      });
      exWrap.appendChild(b);
    });
    function valColor(val) {
      if (/^(true|false)$/.test(val)) return 'var(--code-number)';
      if (/^\d/.test(val)) return 'var(--code-number)';
      if (val[0] === '"') return 'var(--code-string)';
      return '#C8DCEC';
    }
    function renderJson() {
      var d = activeEx.data;
      var html = '<div style="color:var(--code-comment)">{</div>';
      Object.keys(d).forEach(function (k) {
        var attr = fieldDocs[k] ? ' data-field="' + k + '"' : '';
        var cursor = fieldDocs[k] ? '' : 'cursor:default;';
        html += '<div style="padding-left:1rem"><span class="su-key"' + attr + ' style="' + cursor + '">"' + k + '"</span><span style="color:var(--code-comment)">: </span><span style="color:' + valColor(d[k]) + '">' + esc(d[k]) + '</span><span style="color:var(--code-comment)">,</span></div>';
      });
      html += '<div style="color:var(--code-comment)">}</div>';
      jsonBox.innerHTML = html;
      jsonBox.querySelectorAll('.su-key[data-field]').forEach(function (el) {
        el.addEventListener('mouseenter', function () { if (activeField !== el.dataset.field) el.style.background = 'rgba(155,211,240,0.15)'; });
        el.addEventListener('mouseleave', function () { if (activeField !== el.dataset.field) el.style.background = 'transparent'; });
        el.addEventListener('click', function () { selectField(el.dataset.field, el); });
      });
    }
    function selectField(k, el) {
      jsonBox.querySelectorAll('.su-key[data-field]').forEach(function (e) { e.style.background = 'transparent'; });
      activeField = k; el.style.background = 'rgba(56,143,195,0.35)';
      var doc = fieldDocs[k], val = activeEx.data[k];
      explain.innerHTML =
        '<div class="su-explain-code">"' + esc(k) + '"</div>' +
        '<div style="font-weight:700;font-size:0.95rem;margin-bottom:0.4rem">' + esc(doc.t) + '</div>' +
        '<div style="font-size:0.83rem;color:var(--text-muted);line-height:1.55;margin-bottom:0.85rem">' + esc(doc.d) + '</div>' +
        '<div style="border-top:1px dashed var(--border);padding-top:0.7rem"><div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-soft);margin-bottom:0.25rem">Hodnota pri tomto účele</div>' +
        '<div class="su-explain-val">' + esc(val) + '</div></div>';
    }
    function resetExplain() {
      explain.innerHTML = '<div style="color:var(--text-soft);font-size:0.85rem;line-height:1.55"><div style="font-weight:700;color:var(--navy);margin-bottom:0.4rem">' + esc(activeEx.label) + '</div>Klikni na ktorékoľvek pole vľavo (modré názvy) a zobrazí sa jeho význam a hodnota pri tomto účele.</div>';
    }
    activeBtn = exWrap.firstChild; activeBtn.classList.add('is-active');
    renderJson(); resetExplain();
  }

  function initLayers(root) {
    var layers = [
      { n: 0, w: 100, color: '#388FC3', title: 'Univerzálne', scope: 'Pre všetky športy a organizácie', count: '~50',
        ex: ['Registrácia osoby, športovca, trénera, rozhodcu', 'Prestupy a účasť na súťažiach', 'Štatistika a demografia', 'Dotácie a členské'],
        note: 'Pokrýva ~90 % prevádzky. Platí rovnako pre športovca, trénera, rozhodcu, delegáta, dobrovoľníka aj lekára.' },
      { n: 1, w: 80, color: '#2E7D5B', title: 'Kategóriové', scope: 'Podľa typu športu alebo subjektu', count: '~15–20',
        ex: ['Pre-match medical clearance pre úpolové športy', 'Rezervácie športovísk pre hotely a kluby', 'Akreditácie pre organizátorov'],
        note: 'Pridáva sa podľa charakteru športu alebo typu oficiálneho zdroja (zväz, klub, mesto, komerčný subjekt).' },
      { n: 2, w: 60, color: '#B8860B', title: 'Špecifické', scope: 'Pridávajú národné zväzy alebo rezort', count: '~40–60',
        ex: ['Evidencia zbraní (streľba)', 'Biologický pas (cyklistika, atletika)', 'Turistické štatistiky športovísk'],
        note: 'Tu sa prejaví rozmanitosť 90 športov a ich odvetví — napr. Futbal má odvetvia Futbal, Futsal, Plážový futbal.' },
      { n: 3, w: 40, color: '#8250C4', title: 'Disciplinárne', scope: 'Veľmi výnimočné', count: 'jednotky',
        ex: ['Špecifické poistenie pre plážový futbal', 'Ojedinelé regulačné požiadavky odvetvia'],
        note: 'Najužšia vrstva — pár účelov pre veľmi špecifické situácie jednotlivých odvetví.' }
    ];
    var pyr = root.querySelector('[data-pyramid]');
    var detail = root.querySelector('[data-layer-detail]');
    var activeEl = null;
    layers.forEach(function (L) {
      var row = document.createElement('button');
      row.type = 'button'; row.className = 'su-layer-btn'; row.style.width = L.w + '%'; row.style.background = L.color;
      row.innerHTML = '<div style="font-weight:700;font-size:0.85rem">Vrstva ' + L.n + ' · ' + esc(L.title) + '</div><div style="font-size:0.68rem;opacity:0.85;font-family:var(--font-mono);margin-top:0.15rem">' + esc(L.count) + ' účelov</div>';
      row.addEventListener('click', function () {
        if (activeEl) { activeEl.style.transform = 'none'; activeEl.style.opacity = '0.92'; activeEl.style.outline = 'none'; }
        activeEl = row; row.style.transform = 'scale(1.02)'; row.style.opacity = '1'; row.style.outline = '2px solid var(--navy)'; row.style.outlineOffset = '2px';
        detail.innerHTML =
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:0.7rem"><span style="width:24px;height:24px;border-radius:6px;background:' + L.color + ';color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-weight:700;font-size:0.8rem">' + L.n + '</span><span style="font-weight:700;font-size:0.98rem">' + esc(L.title) + '</span><span style="margin-left:auto;font-family:var(--font-mono);font-size:0.72rem;color:' + L.color + ';font-weight:600">' + esc(L.count) + '</span></div>' +
          '<div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.75rem">' + esc(L.scope) + '</div>' +
          '<div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-soft);margin-bottom:0.4rem">Príklady</div>' +
          '<ul style="margin:0 0 0.85rem;padding-left:1.1rem;font-size:0.81rem;color:var(--navy);line-height:1.6">' + L.ex.map(function (e) { return '<li style="margin-bottom:0.2rem">' + esc(e) + '</li>'; }).join('') + '</ul>' +
          '<div style="font-size:0.78rem;color:var(--text-muted);line-height:1.55;background:var(--white);border-left:3px solid ' + L.color + ';padding:0.6rem 0.75rem;border-radius:0 6px 6px 0">' + esc(L.note) + '</div>';
      });
      pyr.appendChild(row);
    });
    detail.innerHTML = '<div style="color:var(--text-soft);font-size:0.85rem;line-height:1.55"><div style="font-weight:700;color:var(--navy);margin-bottom:0.4rem">Vrstvená pyramída</div>Klikni na vrstvu vľavo — čím vyššie číslo, tým užší a špecifickejší rozsah. Základ (vrstva 0) je najširší a pokrýva väčšinu.</div>';
  }

  const inits = {
    reg: initReg,
    transfer: initTransfer,
    multirole: initMultirole,
    verify: initVerify,
    death: initDeath,
    facility: initFacility,
    schema: initSchema,
    layers: initLayers
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
