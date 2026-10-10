// Logik der Seite. Daten kommen aus data/profile.js, data/skills.js, data/projects.js.
// Ablauf: statische Teile einmalig rendern, dynamische Teile über setState() → render().

// ---------- Zustand ----------
// categories: [] = „Alle Kategorien“
const state = { categories: [], skill: null, station: null, openProjects: new Set() };

const BAR_MAX = 220; // px, Höhe des größten Balkens
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktopQuery = window.matchMedia('(min-width: 1025px)');

// ---------- Reine Hilfsfunktionen ----------
function formatMonth(ym) {
    const [y, m] = ym.split('-');
    return `${m}/${y}`;
}

function formatRange(from, to) {
    return to ? `${formatMonth(from)} – ${formatMonth(to)}` : `seit ${formatMonth(from)}`;
}

function formatYears(from, to) {
    const a = from.slice(0, 4);
    const b = to ? to.slice(0, 4) : 'heute';
    return a === b ? a : `${a} – ${b}`;
}

function refLabel(n) {
    return n === 1 ? '1 Referenz' : `${n} Referenzen`;
}

function stationById(id) {
    return profile.stations.find(s => s.id === id);
}

function skillsOfCategory(key) {
    return Object.keys(skillsData).filter(id => skillsData[id].category === key);
}

// Projekte nach aktivem Stations- und Skillfilter, neueste zuerst
function visibleProjects(s) {
    return projects
        .filter(p => !s.station || p.station === s.station)
        .filter(p => !s.skill || p.skills.includes(s.skill))
        .sort((a, b) => b.from.localeCompare(a.from));
}

// Summe der Scores je Kategorie
function categoryTotals() {
    const totals = {};
    Object.keys(categories).forEach(key => {
        totals[key] = skillsOfCategory(key).reduce((sum, id) => sum + skillsData[id].score, 0);
    });
    return totals;
}

function inStation(p, s) {
    return !s.station || p.station === s.station;
}

function countProjectsForSkill(id, s) {
    return projects.filter(p => inStation(p, s) && p.skills.includes(id)).length;
}

function countProjectsForCategory(key, s) {
    const ids = skillsOfCategory(key);
    return projects.filter(p => inStation(p, s) && p.skills.some(id => ids.includes(id))).length;
}

function countProjectsForStation(id) {
    return projects.filter(p => p.station === id).length;
}

// ---------- DOM-Helfer ----------
const $ = id => document.getElementById(id);

// Element mit Klassen, Attributen und Kindern erzeugen; Text immer via textContent
function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'style') Object.assign(node.style, v);
        else node.setAttribute(k, v === true ? '' : v);
    });
    [].concat(children).forEach(c => {
        if (c === null || c === undefined || c === false) return;
        node.append(c instanceof Node ? c : document.createTextNode(c));
    });
    return node;
}

// ---------- Statische Teile (einmalig) ----------
function renderStatic() {
    const photo = $('profilePhoto');
    photo.src = profile.photo;
    photo.alt = `Porträt ${profile.name}`;
    $('profileName').textContent = profile.name;
    $('profileTagline').textContent = profile.tagline;
    $('profileLocation').textContent = profile.location;

    const ext = { target: '_blank', rel: 'noopener noreferrer' };
    $('profileActions').append(
        el('a', { class: 'btn btn-primary btn-cv', href: profile.cv.href, download: profile.cv.download, text: 'Lebenslauf (PDF)' }),
        el('a', { class: 'btn btn-secondary btn-mail', href: `mailto:${profile.contact.email}` }, [
            el('span', { class: 'only-desktop', text: 'E-Mail' }),
            el('span', { class: 'only-mobile', text: 'Kontakt' })
        ]),
        el('a', { class: 'btn btn-secondary btn-social', href: profile.contact.linkedin, ...ext, text: 'LinkedIn' }),
        el('a', { class: 'btn btn-secondary btn-social', href: profile.contact.github, ...ext, text: 'GitHub' })
    );

    // Stationen (Meta + studentische Tätigkeiten); Stations-Buttons sind dynamisch
    $('stationsMeta').textContent = `${profile.stations.length} + ${profile.studentJobs.length} studentisch`;
    setupToggle($('studentToggle'),
        `Studentische Tätigkeiten (${profile.studentJobs.length}) anzeigen`,
        'Studentische Tätigkeiten ausblenden');
    $('studentList').append(...profile.studentJobs.map(job => el('li', {}, [
        el('span', { class: 'sub-title', text: job.title }),
        el('span', { class: 'sub-meta', text: `${job.org} · ${formatYears(job.from, job.to)}` })
    ])));

    // Ausbildung
    $('educationMeta').textContent = profile.education[0] ? profile.education[0].degree : '';
    $('educationList').append(...profile.education.map(e => el('li', {}, [
        el('span', { class: 'item-title', text: e.degree }),
        el('span', { class: 'item-meta', title: e.school, text: [e.schoolShort, formatYears(e.from, e.to), e.note].filter(Boolean).join(' · ') })
    ])));

    // Zertifikate & Schulungen
    $('certificatesMeta').textContent = `${profile.certificates.length} + ${profile.trainings.length}`;
    $('certificateList').append(...profile.certificates.map(c => el('li', { title: `${c.name} · ${c.issuer}` }, [
        el('span', { class: 'dated-name', text: c.shortName }),
        el('span', { class: 'dated-date', text: formatMonth(c.date) })
    ])));
    setupToggle($('trainingToggle'),
        `Weitere Schulungen (${profile.trainings.length}) anzeigen`,
        'Schulungen ausblenden');
    $('trainingList').append(...profile.trainings.map(t => el('li', { title: `${t.name} · ${t.provider}` }, [
        el('span', { class: 'dated-name', text: t.name }),
        el('span', { class: 'dated-date', text: formatMonth(t.date) })
    ])));

    // Profiltext
    $('profil').append(...profile.intro.map(text => el('p', { text })));

    // Eigene Projekte
    $('sideProjects').append(...profile.sideProjects.map(sp => el('li', { class: 'side-project' }, [
        el('h3', { class: 'side-project-title', text: sp.title }),
        sp.description ? el('p', { class: 'side-project-desc', text: sp.description }) : null,
        sp.tech && sp.tech.length ? el('p', { class: 'side-project-tech', text: sp.tech.join(' · ') }) : null
    ])));

    // Ausgleich & Footer
    $('balance').append(el('strong', { text: 'Ausgleich' }), ' ', el('span', { text: profile.hobbies.join(' · ') }));
    $('footer').textContent = profile.footer;
}

function setupToggle(button, showLabel, hideLabel) {
    button.dataset.labelShow = showLabel;
    button.dataset.labelHide = hideLabel;
    button.textContent = showLabel;
}

// Randspalten-Abschnitte: Desktop immer offen (Überschrift), mobil Akkordeon (zu)
function syncSidebarSections() {
    const desktop = desktopQuery.matches;
    document.querySelectorAll('.side-section').forEach(section => {
        section.open = desktop;
        const summary = section.querySelector('summary');
        if (desktop) summary.setAttribute('tabindex', '-1');
        else summary.removeAttribute('tabindex');
    });
}

// ---------- Dynamische Teile ----------
function setState(patch) {
    Object.assign(state, patch);
    render();
}

function render() {
    // Fokus merken, damit Tastaturbedienung nach dem Neuzeichnen erhalten bleibt
    const focusKey = document.activeElement && document.activeElement.dataset
        ? document.activeElement.dataset.focus : null;

    renderStations();
    renderLegend();
    renderChart();
    renderCallout();
    renderFilterText();
    renderProjects();

    if (focusKey) {
        const target = document.querySelector(`[data-focus="${CSS.escape(focusKey)}"]`);
        if (target && target !== document.activeElement) target.focus({ preventScroll: true });
    }
}

function renderStations() {
    $('stationList').replaceChildren(...profile.stations.map(s => {
        const active = state.station === s.id;
        return el('button', {
            type: 'button',
            class: 'station' + (active ? ' is-active' : ''),
            'data-action': 'pick-station',
            'data-station': s.id,
            'data-focus': `station:${s.id}`,
            'aria-pressed': String(active)
        }, [
            el('span', { class: 'station-row' }, [
                el('span', { class: 'station-title', text: s.title }),
                el('span', { class: 'station-count', text: refLabel(countProjectsForStation(s.id)) })
            ]),
            el('span', { class: 'station-meta', text: `${s.orgShort} · ${formatRange(s.from, s.to)}` })
        ]);
    }));
}

function renderLegend() {
    const items = [{ key: 'all', name: 'Alle Kategorien', active: state.categories.length === 0 }]
        .concat(Object.entries(categories).map(([key, c]) => ({
            key, name: c.name, color: c.color, active: state.categories.includes(key)
        })));
    $('legend').replaceChildren(...items.map(item => el('button', {
        type: 'button',
        class: 'legend-item' + (item.active ? ' is-active' : ''),
        'data-action': 'pick-category',
        'data-category': item.key,
        'data-focus': `legend:${item.key}`,
        'aria-pressed': String(item.active)
    }, [
        item.color ? el('span', { class: 'legend-swatch', 'aria-hidden': 'true', style: { background: item.color } }) : null,
        item.name
    ])));
}

// Diagramm: Ebene 1 (Kategorien) oder Ebene 2 (Skills der gewählten Kategorien)
let chartSeen = reducedMotion;
let lastChartKey = null;

function renderChart() {
    const chart = $('chart');
    const level = state.categories.length === 0 ? 1 : 2;
    const chartKey = state.categories.join(',');
    const animate = chartSeen && !reducedMotion && chartKey !== lastChartKey;
    lastChartKey = chartKey;

    const bars = level === 1 ? categoryBars() : skillBars();
    chart.className = `chart chart-level-${level}`;
    chart.replaceChildren(...bars);
    $('chartHint').textContent = level === 1
        ? 'Klicke auf eine Kategorie, um die einzelnen Skills zu sehen'
        : 'Klicke auf einen Skill, um die passenden Referenzen zu sehen';

    const fills = chart.querySelectorAll('.bar-fill');
    if (!chartSeen || animate) fills.forEach(f => { f.style.height = '0px'; });
    if (animate) requestAnimationFrame(() => requestAnimationFrame(growBars));
}

function growBars() {
    $('chart').querySelectorAll('.bar-fill').forEach(f => { f.style.height = f.dataset.height; });
}

function categoryBars() {
    const totals = categoryTotals();
    const maxTotal = Math.max(...Object.values(totals));
    return Object.entries(categories).map(([key, c]) => {
        const n = countProjectsForCategory(key, state);
        const height = `${Math.round((totals[key] / maxTotal) * BAR_MAX)}px`;
        return el('button', {
            type: 'button',
            class: 'bar bar-category',
            'data-action': 'pick-category',
            'data-category': key,
            'data-focus': `catbar:${key}`,
            'aria-label': `${c.name}, ${refLabel(n)} – Skills anzeigen`
        }, [
            el('span', { class: 'bar-count', text: n ? refLabel(n) : '' }),
            el('span', { class: 'bar-fill', 'data-height': height, style: { height, background: c.color } }),
            el('span', { class: 'bar-label', text: c.barLabel })
        ]);
    });
}

function skillBars() {
    const ids = Object.keys(skillsData)
        .filter(id => state.categories.includes(skillsData[id].category))
        .sort((a, b) => skillsData[b].score - skillsData[a].score);
    const maxScore = Math.max(...ids.map(id => skillsData[id].score));
    return ids.map(id => {
        const skill = skillsData[id];
        const n = countProjectsForSkill(id, state);
        const active = state.skill === id;
        const height = `${Math.max(8, Math.round((skill.score / maxScore) * BAR_MAX))}px`;
        return el('button', {
            type: 'button',
            class: 'bar bar-skill' + (active ? ' is-active' : ''),
            'data-action': 'pick-skill',
            'data-skill': id,
            'data-focus': `skillbar:${id}`,
            'aria-pressed': String(active),
            'aria-label': `${skill.name}, Score ${skill.score}, ${refLabel(n)}`
        }, [
            el('span', { class: 'bar-count' + (n ? ' has-refs' : ''), text: n ? refLabel(n) : '–' }),
            el('span', {
                class: 'bar-fill',
                'data-height': height,
                style: { height, background: active ? 'var(--accent)' : categories[skill.category].color }
            }),
            el('span', { class: 'bar-label', text: skill.label || skill.name })
        ]);
    });
}

function renderCallout() {
    const box = $('skillCallout');
    if (!state.skill) {
        box.hidden = true;
        return;
    }
    const n = visibleProjects(state).length;
    box.hidden = false;
    $('skillCalloutText').replaceChildren(
        el('strong', { text: skillsData[state.skill].name }),
        n ? ` · ${refLabel(n)} passend` : ' · noch keine Referenz zu diesem Skill'
    );
}

function renderFilterText() {
    const n = visibleProjects(state).length;
    const parts = [];
    if (state.skill) parts.push(skillsData[state.skill].name);
    if (state.station) {
        const s = stationById(state.station);
        parts.push(`${s.title} · ${s.orgShort}`);
    }
    $('filterText').textContent = parts.length
        ? `Gefiltert nach ${parts.join(' + ')} – ${refLabel(n)}`
        : `Alle Referenzen – ${refLabel(n)}`;
    $('resetFilter').hidden = parts.length === 0;
}

function renderProjects() {
    const list = visibleProjects(state);
    $('emptyState').hidden = list.length > 0;
    $('projectGrid').replaceChildren(...list.map(projectCard));
}

function projectCard(p) {
    const station = stationById(p.station);
    const open = state.openProjects.has(p.id);
    const detailsId = `details-${p.id}`;
    const stationActive = state.station === p.station;
    const details = [
        ['Ausgangslage', p.situation],
        ['Aufgaben', p.tasks],
        ['Ergebnis', p.result],
        ['Team', p.team]
    ].filter(([, value]) => value);

    return el('article', { class: 'project', 'data-project': p.id }, [
        el('div', { class: 'project-top' }, [
            el('button', {
                type: 'button',
                class: 'station-badge' + (stationActive ? ' is-active' : ''),
                'data-action': 'pick-station',
                'data-station': p.station,
                'data-focus': `badge:${p.id}`,
                'aria-pressed': String(stationActive),
                title: `Nach Station filtern: ${station.title} · ${station.orgShort}`,
                text: station.badge
            }),
            el('span', { class: 'project-date', text: formatRange(p.from, p.to) })
        ]),
        el('h3', { class: 'project-title', text: p.title }),
        el('p', { class: 'project-context', text: [p.context, p.role].filter(Boolean).join(' · ') }),
        el('p', { class: 'project-summary', text: p.summary }),
        el('div', { class: 'project-tags' }, p.skills.map(id => {
            const active = state.skill === id;
            return el('button', {
                type: 'button',
                class: 'tag' + (active ? ' is-active' : ''),
                'data-action': 'pick-skill',
                'data-skill': id,
                'data-focus': `tag:${p.id}:${id}`,
                'aria-pressed': String(active),
                text: skillsData[id].name
            });
        })),
        details.length ? el('button', {
            type: 'button',
            class: 'details-toggle',
            'data-action': 'toggle-details',
            'data-project': p.id,
            'data-focus': `details:${p.id}`,
            'aria-expanded': String(open),
            'aria-controls': detailsId,
            text: open ? 'Weniger anzeigen' : 'Details anzeigen'
        }) : null,
        details.length ? el('dl', { class: 'project-details', id: detailsId, hidden: !open },
            details.flatMap(([label, value]) => [el('dt', { text: label }), el('dd', { text: value })])) : null
    ]);
}

// ---------- Aktionen ----------
function pickCategory(key) {
    if (key === 'all') return setState({ categories: [] });
    let next = state.categories.includes(key)
        ? state.categories.filter(k => k !== key)
        : state.categories.concat(key);
    // Alle Kategorien gewählt → zurück zu „Alle“
    if (next.length === Object.keys(categories).length) next = [];
    setState({ categories: next });
}

function scrollToReferences() {
    $('referenzen').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    $('referenzenTitle').focus({ preventScroll: true });
}

function toggleList(button) {
    const list = $(button.getAttribute('aria-controls'));
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(expanded));
    button.textContent = expanded ? button.dataset.labelHide : button.dataset.labelShow;
    list.hidden = !expanded;
}

document.addEventListener('click', e => {
    // Desktop: Abschnittsüberschriften der Randspalte sind keine Akkordeons
    const summary = e.target.closest('.side-section > summary');
    if (summary && desktopQuery.matches) {
        e.preventDefault();
        return;
    }

    const target = e.target.closest('[data-action]');
    if (!target) return;
    const { action } = target.dataset;

    switch (action) {
        case 'pick-category':
            pickCategory(target.dataset.category);
            break;
        case 'pick-skill': {
            const id = target.dataset.skill;
            setState({ skill: state.skill === id ? null : id });
            break;
        }
        case 'pick-station': {
            const id = target.dataset.station;
            setState({ station: state.station === id ? null : id });
            break;
        }
        case 'clear-skill':
            setState({ skill: null });
            break;
        case 'reset-filter':
            setState({ skill: null, station: null });
            break;
        case 'toggle-details': {
            const open = new Set(state.openProjects);
            const id = target.dataset.project;
            if (open.has(id)) open.delete(id);
            else open.add(id);
            setState({ openProjects: open });
            break;
        }
        case 'toggle-list':
            toggleList(target);
            break;
        case 'goto-refs':
            e.preventDefault();
            scrollToReferences();
            break;
    }
});

// ---------- Start ----------
function init() {
    renderStatic();
    syncSidebarSections();
    desktopQuery.addEventListener('change', syncSidebarSections);
    render();

    // Balken wachsen beim ersten Sichtbarwerden
    if (!chartSeen) {
        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                chartSeen = true;
                observer.disconnect();
                requestAnimationFrame(growBars);
            }
        }, { threshold: 0.3 });
        observer.observe($('chartScroll'));
    }
}

init();
