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
    var cardsBox = root.querySelector('[data-fieldcards]');
    var explain = root.querySelector('[data-explain]');
    var activeEx = examples[0], activeField = null, activeBtn = null;
    examples.forEach(function (ex) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'su-ex-btn'; b.style.borderLeft = '3px solid ' + ex.color;
      b.innerHTML = esc(ex.label) + ' <span style="color:var(--text-soft);font-size:0.9em">· ' + esc(ex.person) + '</span>';
      b.addEventListener('click', function () {
        if (activeBtn) activeBtn.classList.remove('is-active');
        activeBtn = b; b.classList.add('is-active');
        activeEx = ex; activeField = null; renderFields(); resetExplain();
      });
      exWrap.appendChild(b);
    });
    function humanVal(raw) {
      var v = String(raw).replace(/^"|"$/g, '');
      if (v === 'true') return 'áno';
      if (v === 'false') return 'nie';
      if (v.length > 34) return v.slice(0, 32) + '…';
      return v;
    }
    function renderFields() {
      var d = activeEx.data;
      cardsBox.innerHTML = '';
      Object.keys(d).forEach(function (k) {
        if (!fieldDocs[k]) return;
        var card = document.createElement('button');
        card.type = 'button'; card.className = 'su-field-card';
        card.innerHTML = '<div class="su-fc-name">' + esc(fieldDocs[k].t) + '</div><div class="su-fc-val">' + esc(humanVal(d[k])) + '</div>';
        card.addEventListener('click', function () { selectField(k, card); });
        cardsBox.appendChild(card);
      });
    }
    function selectField(k, el) {
      cardsBox.querySelectorAll('.su-field-card').forEach(function (e) { e.classList.remove('is-active'); });
      activeField = k; el.classList.add('is-active');
      var doc = fieldDocs[k], val = activeEx.data[k];
      explain.innerHTML =
        '<div class="su-explain-code">"' + esc(k) + '"</div>' +
        '<div style="font-weight:700;font-size:0.95rem;margin-bottom:0.4rem">' + esc(doc.t) + '</div>' +
        '<div style="font-size:0.83rem;color:var(--text-muted);line-height:1.55;margin-bottom:0.85rem">' + esc(doc.d) + '</div>' +
        '<div style="border-top:1px dashed var(--border);padding-top:0.7rem"><div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-soft);margin-bottom:0.25rem">Hodnota pri tomto účele</div>' +
        '<div class="su-explain-val">' + esc(val) + '</div></div>';
    }
    function resetExplain() {
      explain.innerHTML = '<div style="color:var(--text-soft);font-size:0.85rem;line-height:1.55"><div style="font-weight:700;color:var(--navy);margin-bottom:0.4rem">' + esc(activeEx.label) + '</div>Klikni na ktorékoľvek pole vľavo a zobrazí sa jeho význam a hodnota pri tomto účele.</div>';
    }
    activeBtn = exWrap.firstChild; activeBtn.classList.add('is-active');
    renderFields(); resetExplain();
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

  // ===== Widget 07: Hobby aktivita (evidovana osoba vs. anonymny agregat) =====
  function initHobby(root) {
    var modeBtns = root.querySelectorAll('[data-hobby-tab]');
    var out = root.querySelector('[data-hobby-out]');
    var views = {
      person: {
        label: 'Evidovaná osoba (dobrovoľník-organizátor)',
        body: '<div style="display:flex;align-items:center;gap:10px;margin-bottom:0.7rem">' +
          '<div class="su-ident">DO</div>' +
          '<div><div style="font-weight:700;font-size:0.9rem">Dobrovoľník — organizátor</div><div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--text-muted)">prs_organizator_…</div></div></div>' +
          '<div style="font-size:0.82rem;color:var(--navy);line-height:1.6">Organizátor rekreačného behu je <strong>evidovaná osoba s rolou</strong> — má afiliáciu k mestu ako dobrovoľník. Systém eviduje všetky typy osôb tam, kde rola existuje.</div>' +
          '<div style="margin-top:0.7rem;font-family:var(--font-mono);font-size:0.72rem;color:var(--blue-dark);background:var(--blue-light);padding:0.5rem 0.6rem;border-radius:6px">role_code: <strong>dobrovolnik</strong> · afiliácia k mestu Prešov</div>'
      },
      aggregate: {
        label: 'Anonymní účastníci (agregát)',
        body: '<div style="display:flex;align-items:center;gap:10px;margin-bottom:0.7rem">' +
          '<div style="width:44px;height:44px;border-radius:50%;background:var(--bg-alt);border:1px dashed var(--border-strong);display:flex;align-items:center;justify-content:center;color:var(--text-soft);font-size:1.2rem">?</div>' +
          '<div><div style="font-weight:700;font-size:0.9rem">Bežci — bez identity</div><div style="font-size:0.72rem;color:var(--text-muted)">žiadne person_id · žiadne PII</div></div></div>' +
          '<div style="font-size:0.82rem;color:var(--navy);line-height:1.6">Pri hobby aktivite sa účastníci <strong>neevidujú menovite</strong> — ukladajú sa len agregátne počty pre plánovanie infraštruktúry.</div>' +
          '<div style="margin-top:0.7rem;font-family:var(--font-mono);font-size:0.72rem;color:var(--code-string);background:var(--code-bg);padding:0.6rem 0.7rem;border-radius:6px;line-height:1.7">estimated_participants: <strong>34</strong><br>age_bands: {U18:4, 18-39:18, 40-59:9, 60+:3}<br>data_form: <strong>aggregate_only_no_pii</strong></div>'
      }
    };
    function render(mode) {
      modeBtns.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-hobby-tab') === mode); });
      var v = views[mode];
      out.innerHTML = '<div class="su-panel-label">' + esc(v.label) + '</div>' + v.body;
    }
    modeBtns.forEach(function (b) {
      b.addEventListener('click', function () { render(b.getAttribute('data-hobby-tab')); });
    });
    render('person');
  }

  // ===== Widget 08: Akademia bulk import (rozne typy osob + partial success) =====
  function initBulk(root) {
    var rows = [
      { ref: '1', name: 'Adam Horváth', role: 'hráč (maloletý, U15)', icon: 'AH', minor: true, status: 'created', note: 'založený + guardian consent (otec)' },
      { ref: '2', name: 'Marek Kováč', role: 'tréner', icon: 'MK', status: 'matched', note: 'už existuje v inom klube — pridaná ďalšia afiliácia' },
      { ref: '3', name: 'Jana Šimková', role: 'fyzioterapeut', icon: 'JŠ', status: 'created', note: 'zdravotnícky personál' },
      { ref: '4', name: 'Ivan Baláž', role: 'technický vedúci', icon: 'IB', status: 'rejected', note: 'chýba rodné číslo — nemožno overiť voči RFO' }
    ];
    var list = root.querySelector('[data-bulk-rows]');
    var summary = root.querySelector('[data-bulk-summary]');
    var runBtn = root.querySelector('[data-bulk-run]');
    var resetBtn = root.querySelector('[data-bulk-reset]');
    var statusStyle = {
      created: { bg: '#EAF5EE', bd: '#2E7D5B', fg: '#2E7D5B', tag: '✓ created' },
      matched: { bg: 'var(--blue-light)', bd: 'var(--blue)', fg: 'var(--blue-dark)', tag: '⇄ matched' },
      rejected: { bg: 'var(--danger-soft)', bd: '#E0A9A4', fg: 'var(--danger)', tag: '✕ rejected' }
    };
    function paintRow(el, r, revealed) {
      var s = statusStyle[r.status];
      el.style.borderLeft = '3px solid ' + (revealed ? s.bd : 'var(--border)');
      el.innerHTML =
        '<div style="display:flex;align-items:center;gap:10px">' +
        '<div style="width:34px;height:34px;border-radius:8px;background:' + (revealed ? s.bg : 'var(--bg-alt)') + ';color:' + (revealed ? s.fg : 'var(--text-soft)') + ';display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.78rem;flex-shrink:0">' + esc(r.icon) + '</div>' +
        '<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:0.85rem">' + esc(r.name) + '</div><div style="font-size:0.73rem;color:var(--text-muted)">' + esc(r.role) + '</div></div>' +
        (revealed ? '<div style="text-align:right"><div style="font-family:var(--font-mono);font-size:0.72rem;font-weight:600;color:' + s.fg + '">' + s.tag + '</div></div>' : '<div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--text-soft)">…</div>') +
        '</div>' +
        (revealed ? '<div style="font-size:0.73rem;color:var(--text-muted);margin-top:0.4rem;padding-left:44px;line-height:1.45">' + esc(r.note) + '</div>' : '');
    }
    var els = [];
    function build() {
      list.innerHTML = ''; els = [];
      rows.forEach(function (r) {
        var el = document.createElement('div');
        el.className = 'su-panel'; el.style.padding = '0.7rem 0.8rem';
        paintRow(el, r, false); list.appendChild(el); els.push(el);
      });
      summary.style.opacity = '0';
      summary.innerHTML = '';
    }
    function run() {
      runBtn.disabled = true;
      rows.forEach(function (r, i) {
        setTimeout(function () {
          paintRow(els[i], r, true);
          if (i === rows.length - 1) {
            summary.innerHTML = '<strong>3 spracované</strong> (1 hráč-maloletý, 1 tréner, 1 fyzioterapeut) · <span style="color:var(--danger)">1 odmietnutý</span>. Dávka nezlyhala ako celok — idempotencia umožní bezpečne opraviť len chybný riadok a nahrať znova.';
            summary.style.opacity = '1';
            runBtn.disabled = false;
          }
        }, 400 * (i + 1));
      });
    }
    runBtn.addEventListener('click', run);
    resetBtn.addEventListener('click', build);
    build();
  }

  // ===== Widget 09: Turizmus TIC (dvojaka konzumacia tej istej Facility) =====
  function initTourism(root) {
    var tabs = root.querySelectorAll('[data-tour-tab]');
    var out = root.querySelector('[data-tour-out]');
    var views = {
      sport: {
        label: 'Konzument: šport (zväz, rezervačný systém)',
        accent: 'var(--blue)',
        rows: [
          ['Účel', 'POD-SPORTOVISKO-001'],
          ['Prístup', 'priradenie k ligovému zápasu, rezervácie'],
          ['Kto číta', 'zväzy (SBA, SHF, SZH), kluby'],
          ['Dáta', 'kapacita, povrchy, dostupnosť pre súťaž']
        ]
      },
      tourism: {
        label: 'Konzument: cestovný ruch (TIC, OOCR)',
        accent: '#2E7D5B',
        rows: [
          ['Účel', 'TUR-KATALOG-001 · TUR-PODUJATIE-001'],
          ['Prístup', 'read-only, verejná mapa a kalendár'],
          ['Kto číta', 'TIC Vysoké Tatry, OOCR, visitslovakia.com'],
          ['Dáta', 'poloha, dostupnosť, mobilita — bez PII']
        ]
      }
    };
    function render(mode) {
      tabs.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-tour-tab') === mode); });
      var v = views[mode];
      out.innerHTML =
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:0.7rem"><span style="width:10px;height:10px;border-radius:50%;background:' + v.accent + '"></span><span style="font-weight:700;font-size:0.88rem">' + esc(v.label) + '</span></div>' +
        v.rows.map(function (r) {
          return '<div style="display:grid;grid-template-columns:88px 1fr;gap:10px;padding:0.4rem 0;border-bottom:1px solid var(--border);font-size:0.8rem"><span style="color:var(--text-soft);font-weight:600">' + esc(r[0]) + '</span><span style="color:var(--navy)">' + r[1].replace(/([A-Z]{3}-[A-Z-]+-\d+)/g, '<code>$1</code>') + '</span></div>';
        }).join('') +
        '<div style="font-size:0.74rem;color:var(--text-soft);margin-top:0.7rem;line-height:1.5">Tá istá <code>Facility</code> — dvaja oficiálni konzumenti, dva právne základy. Turistický scope nikdy nedáva prístup k osobám.</div>';
    }
    tabs.forEach(function (b) { b.addEventListener('click', function () { render(b.getAttribute('data-tour-tab')); }); });
    render('sport');
  }

  // ===== Widget 10: Vymaz dat (GDPR cl. 17) — zmazat / anonymizovat / zachovat =====
  function initErasure(root) {
    var items = [
      { purpose: 'MKT-FOTO-001', label: 'Fotografie', action: 'delete', why: 'Súhlas odvolaný — dáta sa zmažú (crypto-shredding: zničí sa šifrovací kľúč).' },
      { purpose: 'MKT-NEWSLETTER-001', label: 'Marketingové súhlasy', action: 'delete', why: 'Súhlas odvolaný — kontaktné údaje pre marketing sa zmažú.' },
      { purpose: 'REG-DOBROVOLNIK-001', label: 'Dobrovoľnícka evidencia', action: 'delete', why: 'Aktívna činnosť ukončená, žiadny iný právny základ — zmaže sa.' },
      { purpose: 'POD-VYSLEDKY-001', label: 'Historické výkony', action: 'anonymize', why: 'Verejný historický záznam — meno sa nahradí kódom, výkon v časovom rade ostáva (kontinuita rebríčkov).' },
      { purpose: 'DIS-KONANIE-001', label: 'Disciplinárne konanie', action: 'retain', why: 'Prebiehajúce konanie — zachová sa (čl. 17 ods. 3 písm. e, uplatnenie právnych nárokov).' },
      { purpose: 'FIN-DOTACIA-001', label: 'Vyplatené dotácie', action: 'retain', why: 'Zákonná archivačná lehota 10 rokov (čl. 17 ods. 3 písm. b) — nemožno zmazať.' }
    ];
    var actStyle = {
      delete: { bg: 'var(--danger-soft)', bd: '#E0A9A4', fg: 'var(--danger)', tag: 'Zmazať', ico: '✕' },
      anonymize: { bg: 'var(--blue-light)', bd: 'var(--blue)', fg: 'var(--blue-dark)', tag: 'Anonymizovať', ico: '≈' },
      retain: { bg: '#FBF3E0', bd: '#D9B54A', fg: '#8A6D1A', tag: 'Zachovať', ico: '⚿' }
    };
    var list = root.querySelector('[data-erasure-list]');
    var detail = root.querySelector('[data-erasure-detail]');
    var activeEl = null;
    items.forEach(function (it) {
      var s = actStyle[it.action];
      var el = document.createElement('button');
      el.type = 'button'; el.className = 'su-role-btn'; el.style.borderLeftColor = s.bd; el.style.width = '100%';
      el.innerHTML =
        '<div style="display:flex;align-items:center;gap:9px">' +
        '<span style="width:26px;height:26px;border-radius:6px;background:' + s.bg + ';color:' + s.fg + ';display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0">' + s.ico + '</span>' +
        '<span style="flex:1;min-width:0"><span style="display:block;font-weight:600;font-size:0.84rem">' + esc(it.label) + '</span><span style="font-family:var(--font-mono);font-size:0.68rem;color:var(--text-muted)">' + esc(it.purpose) + '</span></span>' +
        '<span style="font-size:0.7rem;font-weight:600;color:' + s.fg + '">' + s.tag + '</span></div>';
      el.addEventListener('click', function () {
        if (activeEl) activeEl.classList.remove('is-active');
        activeEl = el; el.classList.add('is-active');
        detail.innerHTML = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:0.5rem"><span style="font-family:var(--font-mono);font-size:0.72rem;color:' + s.fg + ';font-weight:600">' + s.ico + ' ' + esc(s.tag) + '</span><span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--code-comment)">' + esc(it.purpose) + '</span></div><div style="color:var(--code-text);font-size:0.84rem;line-height:1.55">' + esc(it.why) + '</div>';
      });
      list.appendChild(el);
    });
    detail.innerHTML = '<div class="su-detail-empty">↑ Klikni na položku — uvidíš, či sa zmaže, anonymizuje alebo zachová, a prečo. Právo na výmaz nie je absolútne.</div>';
  }

  // ===== Widget 11: Dobrovolnik safeguarding (Pripad A vs. B) =====
  function initSafeguard(root) {
    var tabs = root.querySelectorAll('[data-sg-tab]');
    var out = root.querySelector('[data-sg-out]');
    var views = {
      valid: {
        label: 'Prípad A — platný certifikát',
        color: '#2E7D5B', bg: '#EAF5EE',
        badge: '✓ afiliácia aktivovaná',
        body: '<div style="font-size:0.83rem;color:var(--navy);line-height:1.6;margin-bottom:0.7rem">Zuzana má platný <code>KVL-SAFEGUARDING-001</code>. Policy engine overí certifikát a <strong>aktivuje</strong> dobrovoľnícku afiliáciu s prístupom k maloletým.</div>' +
          '<div style="font-family:var(--font-mono);font-size:0.72rem;background:var(--code-bg);color:var(--code-string);padding:0.6rem 0.7rem;border-radius:6px;line-height:1.7">status: <strong>active</strong><br>works_with_minors: true<br>safeguarding_verified: <strong>true</strong></div>'
      },
      missing: {
        label: 'Prípad B — chýbajúci certifikát',
        color: 'var(--danger)', bg: 'var(--danger-soft)',
        badge: '✕ aktivácia blokovaná',
        body: '<div style="font-size:0.83rem;color:var(--navy);line-height:1.6;margin-bottom:0.7rem">Bez platného certifikátu policy engine <strong>neaktivuje</strong> afiliáciu s prístupom k maloletým. Ochrana detí je vynútená serverom, nie dôverou v aplikáciu.</div>' +
          '<div style="font-family:var(--font-mono);font-size:0.72rem;background:var(--code-bg);color:#E8A5A0;padding:0.6rem 0.7rem;border-radius:6px;line-height:1.7">status: <strong>pending_safeguarding</strong><br>error_code: <strong>safeguarding_required_for_minors</strong><br>activated: false</div>'
      }
    };
    function render(mode) {
      tabs.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-sg-tab') === mode); });
      var v = views[mode];
      out.innerHTML =
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:0.7rem"><span style="font-weight:700;font-size:0.88rem">' + esc(v.label) + '</span><span style="margin-left:auto;font-size:0.72rem;font-weight:600;color:' + v.color + ';background:' + v.bg + ';padding:0.25rem 0.6rem;border-radius:99px">' + esc(v.badge) + '</span></div>' +
        v.body;
    }
    tabs.forEach(function (b) { b.addEventListener('click', function () { render(b.getAttribute('data-sg-tab')); }); });
    render('valid');
  }

  // ──────────────────────────────────────────────────────────────
  // Discovery — verejný portál (mapa okolia + filtre + balíček)
  // Scenár: návštevník prišiel na víkend do Novej Bane
  // ──────────────────────────────────────────────────────────────
  function initDiscovery(root) {
    // Body v okolí Novej Bane. x/y sú % pozície v schematickej mape
    // (nie geografická projekcia — ukážka bez externého tile servera).
    const CENTER = { name: 'Nová Baňa', x: 50, y: 52 };
    const POINTS = [
      { id: 'hall', kind: 'venue', name: 'Mestská športová hala', cat: 'sport',
        x: 46, y: 45, dist: 0.4, icon: '◆', color: '#388FC3',
        amen: ['parking', 'wifi'], sports: 'volejbal · basketbal · florbal',
        note: 'Indoor hala, 3 športy, bezbariérová.' },
      { id: 'pension', kind: 'venue', name: 'Penzión Zlatý potok', cat: 'stay',
        x: 58, y: 60, dist: 1.2, icon: '⬢', color: '#2E7D5B',
        amen: ['pool', 'tennis', 'spa', 'ebike', 'parking'], sports: 'bazén · tenis · SPA',
        note: 'Ubytovanie s bazénom, SPA a požičovňou e-bikov.' },
      { id: 'trail', kind: 'venue', name: 'Tajch — okruh pre bicykle', cat: 'activity',
        x: 66, y: 38, dist: 2.1, icon: '▲', color: '#B8860B',
        amen: ['ebike', 'bike_trail'], sports: 'cyklo · e-bike · 12 km',
        note: 'Okruh 12 km, náročnosť stredná — vhodné na e-bike.' },
      { id: 'pool', kind: 'venue', name: 'Krytá plaváreň', cat: 'sport',
        x: 38, y: 62, dist: 1.8, icon: '◆', color: '#388FC3',
        amen: ['pool', 'parking'], sports: 'plávanie · 25 m',
        note: '25-metrový bazén, verejné plávanie cez víkend.' },
      { id: 'event', kind: 'event', name: 'Pohronský e-bike maratón', cat: 'event',
        x: 46, y: 45, dist: 0.4, icon: '★', color: '#C8453C',
        amen: ['ebike'], sports: 'sobota 11. 7. · 09:00',
        note: 'Verejné podujatie — dá sa prísť aj len fandiť.' }
    ];
    const AMEN_LABELS = {
      pool: 'bazén', tennis: 'tenisový kurt', spa: 'SPA', ebike: 'e-bike / požičovňa',
      parking: 'parkovanie', wifi: 'wifi', bike_trail: 'cyklookruh'
    };
    // Filtre, ktoré vie používateľ zapnúť
    const FILTERS = [
      { key: 'pool', label: 'bazén' },
      { key: 'tennis', label: 'tenis' },
      { key: 'spa', label: 'SPA' },
      { key: 'ebike', label: 'e-bike' }
    ];
    const active = new Set();

    // Kalendár podujatí — viaceré oficiálne zdroje + komunitný/kultúrny rozmer
    const EVENTS = [
      { name: 'Fortuna liga — MŠK Žilina : Slovan', sport: 'Futbal', src: 'národný zväz', srcType: 'zvaz',
        when: 'so 11. 7. · 17:00', official: true, community: 'none', tags: [] },
      { name: 'Mestský beh Novou Baňou', sport: 'Atletika', src: 'mesto', srcType: 'mesto',
        when: 'so 11. 7. · 10:00', official: false, community: 'local_community', tags: ['rodinne', 'charita'] },
      { name: 'Pohronský e-bike maratón', sport: 'Cyklistika', src: 'komerčný subjekt', srcType: 'komercny',
        when: 'so 11. 7. · 09:00', official: false, community: 'none', tags: [] },
      { name: 'Hodový futbalový zápas', sport: 'Futbal', src: 'obec', srcType: 'obec',
        when: 'ne 12. 7. · 15:00', official: false, community: 'local_community', tags: ['hody', 'obecna_slavnost'] },
      { name: 'Seniorský tenisový turnaj', sport: 'Tenis', src: 'klub', srcType: 'klub',
        when: 'ne 12. 7. · 13:00', official: false, community: 'local_community', tags: ['seniori', 'rodinne'] }
    ];
    const SRC_COLORS = {
      zvaz: '#388FC3', mesto: '#2E7D5B', obec: '#B8860B', klub: '#8250C4', komercny: '#5E6B7D'
    };
    let calMode = 'all'; // 'all' | 'community'

    const map = root.querySelector('[data-map]');
    const filterBox = root.querySelector('[data-filters]');
    const listBox = root.querySelector('[data-list]');
    const pkgBox = root.querySelector('[data-package]');
    const apiBox = root.querySelector('[data-api]');
    const calBox = root.querySelector('[data-calendar]');
    const calTabAll = root.querySelector('[data-cal-all]');
    const calTabCommunity = root.querySelector('[data-cal-community]');

    function matches(p) {
      if (active.size === 0) return true;
      return [...active].every((a) => p.amen.includes(a));
    }

    function buildMap() {
      map.innerHTML = '';
      const c = document.createElement('div');
      c.className = 'su-map-center';
      c.style.left = CENTER.x + '%';
      c.style.top = CENTER.y + '%';
      c.innerHTML = '<span class="su-map-center-dot"></span><span class="su-map-center-label">' + esc(CENTER.name) + '</span>';
      map.appendChild(c);
      const ring = document.createElement('div');
      ring.className = 'su-map-ring';
      ring.style.left = CENTER.x + '%';
      ring.style.top = CENTER.y + '%';
      map.appendChild(ring);

      POINTS.forEach((p) => {
        const on = matches(p);
        const pin = document.createElement('button');
        pin.type = 'button';
        pin.className = 'su-map-pin' + (on ? '' : ' is-dim');
        pin.style.left = p.x + '%';
        pin.style.top = p.y + '%';
        pin.style.setProperty('--pin', p.color);
        pin.setAttribute('aria-label', p.name);
        pin.innerHTML = '<span class="su-pin-ico">' + p.icon + '</span>';
        pin.addEventListener('click', () => showPoint(p));
        map.appendChild(pin);
      });
    }

    function amenChips(p) {
      return p.amen.filter((a) => AMEN_LABELS[a]).map((a) => {
        const hot = active.has(a);
        return '<span class="su-chip' + (hot ? ' is-hot' : '') + '">' + esc(AMEN_LABELS[a]) + '</span>';
      }).join('');
    }

    function buildList() {
      const shown = POINTS.filter(matches);
      listBox.innerHTML = '';
      if (shown.length === 0) {
        listBox.innerHTML = '<div class="su-disc-empty">Žiadne miesto nespĺňa všetky zvolené filtre. Skús ubrať jeden.</div>';
        return;
      }
      shown.sort((a, b) => a.dist - b.dist).forEach((p) => {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'su-disc-item';
        row.style.borderLeftColor = p.color;
        row.innerHTML =
          '<div class="su-disc-item-head">' +
            '<span class="su-disc-ico" style="color:' + p.color + '">' + p.icon + '</span>' +
            '<span class="su-disc-name">' + esc(p.name) + '</span>' +
            '<span class="su-disc-dist">' + p.dist.toFixed(1) + ' km</span>' +
          '</div>' +
          '<div class="su-disc-sub">' + esc(p.sports) + '</div>' +
          '<div class="su-disc-chips">' + amenChips(p) + '</div>';
        row.addEventListener('click', () => showPoint(p));
        listBox.appendChild(row);
      });
    }

    function showPoint(p) {
      apiBox.innerHTML =
        '<div class="su-api-head">GET /v1/public/venues/' + esc(p.id) + '</div>' +
        '<div class="su-api-body">' +
          '<div class="su-api-line"><span class="su-api-k">name_sk</span><span class="su-api-v">"' + esc(p.name) + '"</span></div>' +
          '<div class="su-api-line"><span class="su-api-k">distance_km</span><span class="su-api-v su-api-num">' + p.dist.toFixed(1) + '</span></div>' +
          '<div class="su-api-line"><span class="su-api-k">' + (p.kind === 'event' ? 'tourism_relevance' : 'amenities') + '</span><span class="su-api-v">' + (p.kind === 'event' ? '"regional"' : '[' + p.amen.map((a) => '"' + a + '"').join(', ') + ']') + '</span></div>' +
          '<div class="su-api-line"><span class="su-api-k">data_form</span><span class="su-api-v">"public_no_pii"</span></div>' +
        '</div>' +
        '<div class="su-api-note">' + esc(p.note) + '</div>';
    }

    function buildPackage() {
      const stay = POINTS.find((p) => p.cat === 'stay' && matches(p));
      const act = POINTS.find((p) => p.cat === 'activity');
      const ev = POINTS.find((p) => p.cat === 'event');
      const wantsEbike = active.has('ebike');

      if (!wantsEbike && active.size === 0) {
        pkgBox.innerHTML = '<div class="su-pkg-hint">Zapni filter <b>e-bike</b> a systém ti zloží hotový víkendový balíček — ubytovanie + okruh + podujatie v jednom.</div>';
        return;
      }
      if (!stay) {
        pkgBox.innerHTML = '<div class="su-pkg-hint">Pre tieto filtre nevieme zložiť ubytovaciu časť balíčka. Skús kombináciu bazén + SPA + e-bike.</div>';
        return;
      }
      pkgBox.innerHTML =
        '<div class="su-pkg-title"><span class="su-pkg-badge">Víkendový balíček</span> E-bike víkend v Novej Bani</div>' +
        '<div class="su-pkg-flow">' +
          pkgCard('Ubytovanie', stay.name, 'bazén · SPA · požičiavajú e-biky', '#2E7D5B') +
          pkgArrow() +
          pkgCard('Aktivita', act.name, 'okruh 12 km, vhodné na e-bike', '#B8860B') +
          pkgArrow() +
          pkgCard('Podujatie', ev.name, 'sobota ráno, verejné', '#C8453C') +
        '</div>' +
        '<div class="su-pkg-src">Zložené za behu z <b>verejných</b> dát: miesta z registra (vrstva A) · trasa z OpenStreetMap (B) · dostupnosť z externého API (C). Žiadne osobné údaje.</div>';
    }
    function pkgCard(role, name, note, color) {
      return '<div class="su-pkg-card" style="border-top-color:' + color + '">' +
        '<div class="su-pkg-role">' + esc(role) + '</div>' +
        '<div class="su-pkg-name">' + esc(name) + '</div>' +
        '<div class="su-pkg-note">' + esc(note) + '</div></div>';
    }
    function pkgArrow() { return '<div class="su-pkg-arrow">+</div>'; }

    function buildFilters() {
      filterBox.innerHTML = '';
      FILTERS.forEach((f) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'su-disc-filter';
        b.textContent = f.label;
        b.addEventListener('click', () => {
          if (active.has(f.key)) { active.delete(f.key); b.classList.remove('is-on'); }
          else { active.add(f.key); b.classList.add('is-on'); }
          rerender();
        });
        filterBox.appendChild(b);
      });
    }

    // ── Kalendár podujatí (viaceré zdroje + komunitný rozmer) ──
    const TAG_LABELS = {
      hody: 'hody', obecna_slavnost: 'obecná slávnosť', seniori: 'seniori',
      rodinne: 'rodinné', charita: 'charita', tradicia: 'tradicia'
    };
    function buildCalendar() {
      if (!calBox) return;
      const rows = calMode === 'community'
        ? EVENTS.filter((e) => e.community !== 'none')
        : EVENTS;
      calBox.innerHTML = '';
      rows.forEach((e) => {
        const col = SRC_COLORS[e.srcType] || '#5E6B7D';
        const isCommunity = e.community !== 'none';
        const row = document.createElement('div');
        row.className = 'su-cal-item';
        row.style.borderLeftColor = col;
        row.innerHTML =
          '<div class="su-cal-when">' + esc(e.when) + '</div>' +
          '<div class="su-cal-main">' +
            '<div class="su-cal-name">' + esc(e.name) + '</div>' +
            '<div class="su-cal-meta">' +
              '<span class="su-cal-src" style="color:' + col + '">' + esc(e.src) + '</span>' +
              '<span class="su-cal-sport">' + esc(e.sport) + '</span>' +
              (e.official
                ? '<span class="su-cal-badge su-cal-official">oficiálne</span>'
                : '') +
              (isCommunity
                ? '<span class="su-cal-badge su-cal-community">komunitné / kultúrne</span>'
                : '') +
            '</div>' +
            (isCommunity && e.tags.length
              ? '<div class="su-cal-tags">' + e.tags.map((t) => '<span class="su-chip is-hot">' + esc(TAG_LABELS[t] || t) + '</span>').join('') + '</div>'
              : '') +
          '</div>';
        calBox.appendChild(row);
      });
      if (rows.length === 0) {
        calBox.innerHTML = '<div class="su-disc-empty">V tomto filtri nie sú žiadne podujatia.</div>';
      }
    }
    function setCalMode(m) {
      calMode = m;
      if (calTabAll) calTabAll.classList.toggle('is-active', m === 'all');
      if (calTabCommunity) calTabCommunity.classList.toggle('is-active', m === 'community');
      buildCalendar();
    }
    if (calTabAll) calTabAll.addEventListener('click', () => setCalMode('all'));
    if (calTabCommunity) calTabCommunity.addEventListener('click', () => setCalMode('community'));

    function rerender() { buildMap(); buildList(); buildPackage(); }

    buildFilters();
    rerender();
    setCalMode('all');
    apiBox.innerHTML = '<div class="su-api-idle">Klikni na bod na mape alebo v zozname — uvidíš, aké verejné dáta portál o mieste dostane cez API. Žiadne osobné údaje.</div>';
  }

  const inits = {
    discovery: initDiscovery,
    reg: initReg,
    transfer: initTransfer,
    multirole: initMultirole,
    verify: initVerify,
    death: initDeath,
    facility: initFacility,
    hobby: initHobby,
    bulk: initBulk,
    tourism: initTourism,
    erasure: initErasure,
    safeguard: initSafeguard,
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
