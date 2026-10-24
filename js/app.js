// Rendering und Interaktion der Seite.
// Daten: data/profile.js (profile), data/skills.js (skillsData, categories), data/projects.js (projects)

const BAR_MAX = 220;   // maximale Balkenhöhe in px
const BAR_MIN = 8;     // Mindesthöhe einzelner Skill-Balken

// Zentraler Zustand: categories [] = „Alle“
const state = { categories: [], skill: null, station: null, openProjects: new Set() };

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const desktopQuery = window.matchMedia('(min-width: 1025px)');

// ==========================================================================
// Reine Hilfsfunktionen
// ==========================================================================

/** '2026-10' → '10/2026' */
function formatMonth(ym) {
    const [year, month] = ym.split('-');
    return `${month}/${year}`;
}

/** Zeitraum 'MM/JJJJ – MM/JJJJ' bzw. 'seit MM/JJJJ' */
function formatRange(from, to) {
    return to ? `${formatMonth(from)} – ${formatMonth(to)}` : `seit ${formatMonth(from)}`;
}

/** Zeitraum in Jahren 'JJJJ – JJJJ' (gleiches Jahr nur einmal) */
function formatYears(from, to) {
    const start = from.slice(0, 4);
    const end = to ? to.slice(0, 4) : 'heute';
    return start === end ? start : `${start} – ${end}`;
}

function formatRefs(n) {
    return n === 1 ? '1 Referenz' : `${n} Referenzen`;
}

function findStation(id) {
    return profile.stations.find((s) => s.id === id);
}

/** Projekte nach Skill- und Stationsfilter, neueste zuerst */
function visibleProjects(s) {
    return projects
        .filter((p) => (!s.skill || p.skills.includes(s.skill)) && (!s.station || p.station === s.station))
        .sort((a, b) => b.from.localeCompare(a.from));
}

/** Summe der Scores je Kategorie */
function categoryTotals() {
    const totals = Object.fromEntries(Object.keys(categories).map((key) => [key, 0]));
    Object.values(skillsData).forEach((skill) => { totals[skill.category] += skill.score; });
    return totals;
}

function countProjectsForSkill(id, s) {
    return visibleProjects({ ...s, skill: id }).length;
}

/** Projekte mit mindestens einem Skill der Kategorie (Stationsfilter wird berücksichtigt) */
function countProjectsForCategory(key, s) {
    return visibleProjects({ ...s, skill: null })
        .filter((p) => p.skills.some((id) => skillsData[id] && skillsData[id].category === key))
        .length;
}

function countProjectsForStation(id, s) {
    return visibleProjects({ ...s, station: id }).length;
}

/** Legenden-Logik: Mehrfachauswahl; keine oder alle Kategorien → „Alle“ */
function toggleCategory(current, key) {
    if (key === 'all') return [];
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    return next.length === Object.keys(categories).length ? [] : next;
}

function skillsForCategories(keys) {
    return Object.entries(skillsData)
        .filter(([, skill]) => keys.includes(skill.category))
        .sort((a, b) => b[1].score - a[1].score);
}

// ==========================================================================
// DOM-Helfer (Texte immer als Textknoten, nie per innerHTML)
// ==========================================================================

function h(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
        if (value === null || value === undefined || value === false) return;
        if (key === 'class') node.className = value;
        else if (key === 'text') node.textContent = value;
        else if (key === 'data') Object.assign(node.dataset, value);
        else node.setAttribute(key, value === true ? '' : value);
    });
    children.flat(Infinity).forEach((child) => {
        if (child !== null && child !== undefined && child !== false) node.append(child);
    });
    return node;
}

const $ = (selector) => document.querySelector(selector);

// ==========================================================================
// Statische Bereiche (einmalig beim Laden)
// ==========================================================================

function renderStatic() {
    const { contact, cv } = profile;

    $('#sideHead').append(
        h('img', { class: 'portrait', src: profile.photo, alt: `Porträt ${profile.name}`, width: 112, height: 112 }),
        h('div', { class: 'identity' },
            h('h1', { text: profile.name }),
            h('p', { class: 'tagline', text: profile.tagline }),
            h('p', { class: 'location', text: profile.location })
        ),
        h('div', { class: 'contact' },
            h('div', { class: 'contact-main' },
                h('a', { class: 'btn btn-primary cv-download', href: cv.href, download: cv.download, text: 'Lebenslauf (PDF)' }),
                h('a', { class: 'btn btn-secondary', href: `mailto:${contact.email}` },
                    h('span', { class: 'only-desktop', text: 'E-Mail' }),
                    h('span', { class: 'only-mobile', text: 'Kontakt' })
                )
            ),
            h('div', { class: 'contact-links' },
                h('a', { class: 'btn btn-secondary contact-link', href: contact.linkedin, target: '_blank', rel: 'noopener noreferrer', text: 'LinkedIn' }),
                h('a', { class: 'btn btn-secondary contact-link', href: contact.github, target: '_blank', rel: 'noopener noreferrer', text: 'GitHub' })
            )
        )
    );

    // Stationen (Buttons; Zähler/aktiv werden in render() aktualisiert).
    // student: true → filterbar, aber in der aufklappbaren Liste der studentischen Tätigkeiten
    const stationButton = (station, compact) => h('button', {
        type: 'button', class: compact ? 'station station-compact' : 'station', 'aria-pressed': 'false',
        data: { action: 'pick-station', station: station.id, focusKey: `station:${station.id}` }
    },
        h('span', { class: 'station-title', text: station.title }),
        h('span', { class: 'station-count' }),
        h('span', {
            class: 'station-meta',
            text: compact ? `${station.orgShort} · ${formatYears(station.from, station.to)}` : `${station.orgShort} · ${formatRange(station.from, station.to)}`
        })
    );
    const mainStations = profile.stations.filter((s) => !s.student);
    const studentStations = profile.stations.filter((s) => s.student);
    $('#stationList').append(...mainStations.map((station) => h('li', {}, stationButton(station, false))));

    const studentEntries = [
        ...studentStations.map((station) => ({ from: station.from, node: stationButton(station, true) })),
        ...profile.studentJobs.map((job) => ({
            from: job.from,
            node: [
                h('p', { class: 'sub-title', text: job.title }),
                h('p', { class: 'sub-meta', text: `${job.org} · ${formatYears(job.from, job.to)}` })
            ]
        }))
    ].sort((a, b) => b.from.localeCompare(a.from));
    $('#studentList').append(...studentEntries.map((entry) => h('li', {}, entry.node)));
    $('#metaStations').textContent = `${mainStations.length} + ${studentEntries.length} studentisch`;

    setupToggleList('#toggleStudents',
        `Studentische Tätigkeiten (${studentEntries.length}) anzeigen`,
        'Studentische Tätigkeiten ausblenden');

    $('#educationList').append(...profile.education.map((edu) => h('li', { title: edu.school },
        h('p', { class: 'item-title', text: edu.degree }),
        h('p', { class: 'item-meta', text: [edu.schoolShort, formatYears(edu.from, edu.to), edu.note].filter(Boolean).join(' · ') })
    )));
    $('#metaEducation').textContent = profile.education[0].degree;

    $('#certificateList').append(...profile.certificates.map((cert) => h('li', { title: `${cert.name} · ${cert.issuer}` },
        h('span', { class: 'row-name', text: cert.shortName }),
        h('span', { class: 'row-date', text: formatMonth(cert.date) })
    )));
    $('#metaCertificates').textContent = `${profile.certificates.length} + ${profile.trainings.length}`;

    setupToggleList('#toggleTrainings',
        `Weitere Schulungen (${profile.trainings.length}) anzeigen`,
        'Schulungen ausblenden');
    $('#trainingList').append(...profile.trainings.map((training) => h('li', { title: `${training.name} · ${training.provider}` },
        h('span', { class: 'row-name', text: training.name }),
        h('span', { class: 'row-date', text: formatMonth(training.date) })
    )));

    // Hauptbereich
    $('#profil').append(...profile.intro.map((text) => h('p', { text })));

    $('#legend').append(
        h('button', { type: 'button', class: 'pill', data: { action: 'pick-category', category: 'all' }, text: 'Alle Kategorien' }),
        ...Object.entries(categories).map(([key, cat]) => h('button', { type: 'button', class: 'pill', data: { action: 'pick-category', category: key } },
            h('span', { class: 'swatch', style: `background: ${cat.color}`, 'aria-hidden': 'true' }),
            cat.name
        ))
    );

    $('#sideProjects').append(...profile.sideProjects.map((sp) => h('li', { class: 'sp-tile' },
        h('p', { class: 'sp-title', text: sp.title }),
        sp.description ? h('p', { class: 'sp-desc', text: sp.description }) : null,
        sp.tech.length ? h('p', { class: 'sp-tech', text: sp.tech.join(' · ') }) : null
    )));

    $('#balance').append(h('strong', { text: 'Ausgleich' }), profile.hobbies.join(' · '));
    $('#footer').append(h('p', { text: profile.footer }));
}

function setupToggleList(selector, labelShow, labelHide) {
    const button = $(selector);
    button.dataset.labelShow = labelShow;
    button.dataset.labelHide = labelHide;
    button.textContent = labelShow;
}

/** Desktop: Randspalten-Gruppen immer offen; Mobil: Akkordeons, standardmäßig zu */
function syncAccordions() {
    document.querySelectorAll('.side-group').forEach((group) => {
        group.open = desktopQuery.matches;
        group.querySelector('summary').tabIndex = desktopQuery.matches ? -1 : 0;
    });
}

// ==========================================================================
// Diagramm
// ==========================================================================

let chartKey = null;    // aktuell gezeichnete Ebene/Auswahl
let chartSeen = false;  // Balken wachsen erst, wenn das Diagramm sichtbar ist

function buildChart() {
    const chart = $('#chart');
    const level = state.categories.length ? 'skills' : 'categories';
    chart.dataset.level = level;
    chart.replaceChildren();

    if (level === 'categories') {
        const totals = categoryTotals();
        const max = Math.max(...Object.values(totals));
        Object.entries(categories).forEach(([key, cat]) => {
            chart.append(h('button', { type: 'button', class: 'bar cbar', data: { action: 'pick-category', category: key, focusKey: `cat:${key}` } },
                h('span', { class: 'bar-count' }),
                h('span', { class: 'bar-fill', style: `background: ${cat.color}`, data: { height: (totals[key] / max) * BAR_MAX } }),
                h('span', { class: 'bar-label', text: cat.barLabel })
            ));
        });
    } else {
        const skills = skillsForCategories(state.categories);
        const max = Math.max(...skills.map(([, skill]) => skill.score));
        skills.forEach(([id, skill]) => {
            chart.append(h('button', { type: 'button', class: 'bar sbar', data: { action: 'pick-skill', skill: id, focusKey: `skill:${id}` } },
                h('span', { class: 'bar-count' }),
                h('span', { class: 'bar-fill', style: `background: ${categories[skill.category].color}`, data: { height: Math.max(BAR_MIN, (skill.score / max) * BAR_MAX) } }),
                h('span', { class: 'bar-label', text: skill.label || skill.name })
            ));
        });
    }

    $('#chartHint').textContent = level === 'categories'
        ? 'Klicke auf eine Kategorie, um die einzelnen Skills zu sehen'
        : 'Klicke auf einen Skill, um die passenden Referenzen zu sehen';
    growBars();
}

function growBars() {
    const fills = document.querySelectorAll('#chart .bar-fill');
    const apply = () => fills.forEach((fill) => { fill.style.height = `${fill.dataset.height}px`; });
    if (reducedMotion.matches) apply();
    else if (chartSeen) requestAnimationFrame(() => requestAnimationFrame(apply));
}

function updateChart() {
    document.querySelectorAll('#chart .cbar').forEach((bar) => {
        const key = bar.dataset.category;
        const count = countProjectsForCategory(key, state);
        bar.querySelector('.bar-count').textContent = count ? formatRefs(count) : '';
        bar.setAttribute('aria-label', `${categories[key].name}, ${formatRefs(count)}`);
    });
    document.querySelectorAll('#chart .sbar').forEach((bar) => {
        const id = bar.dataset.skill;
        const count = countProjectsForSkill(id, state);
        const countEl = bar.querySelector('.bar-count');
        countEl.textContent = count ? formatRefs(count) : '–';
        countEl.classList.toggle('has-refs', count > 0);
        bar.setAttribute('aria-pressed', String(state.skill === id));
        bar.setAttribute('aria-label', `${skillsData[id].name}, Score ${skillsData[id].score}, ${formatRefs(count)}`);
    });
}

function renderCallout() {
    const callout = $('#skillCallout');
    if (!state.skill) {
        callout.hidden = true;
        callout.replaceChildren();
        return;
    }
    const count = visibleProjects(state).length;
    callout.replaceChildren(
        h('p', {},
            h('strong', { text: skillsData[state.skill].name }),
            count ? ` · ${formatRefs(count)} passend` : ' · noch keine Referenz zu diesem Skill'
        ),
        h('div', { class: 'callout-actions' },
            h('a', { class: 'btn btn-primary', href: '#referenzen', data: { action: 'goto-refs' }, text: 'Zu den Referenzen' }),
            h('button', { type: 'button', class: 'btn btn-secondary', data: { action: 'clear-skill' }, text: 'Auswahl aufheben' })
        )
    );
    callout.hidden = false;
}

// ==========================================================================
// Referenzen
// ==========================================================================

function projectCard(project) {
    const station = findStation(project.station);
    const open = state.openProjects.has(project.id);
    const detailsId = `details-${project.id}`;
    const details = [
        ['Ausgangslage', project.situation],
        ['Aufgaben', project.tasks],
        ['Ergebnis', project.result],
        ['Team', project.team]
    ].filter(([, value]) => value);

    return h('article', { class: 'ref-card', data: { project: project.id } },
        h('div', { class: 'card-top' },
            h('button', {
                type: 'button', class: 'badge', 'aria-pressed': String(state.station === station.id),
                title: `Nach Station filtern: ${station.title} · ${station.orgShort}`,
                data: { action: 'pick-station', station: station.id, focusKey: `badge:${project.id}` }
            }, station.badge),
            h('span', { class: 'card-date', text: formatRange(project.from, project.to) })
        ),
        h('h3', { class: 'card-title', text: project.title }),
        h('p', { class: 'card-meta', text: [project.context, project.role].filter(Boolean).join(' · ') }),
        project.summary ? h('p', { class: 'card-summary', text: project.summary }) : null,
        h('div', { class: 'tags', role: 'group', 'aria-label': 'Skills' },
            project.skills.map((id) => h('button', {
                type: 'button', class: 'tag', 'aria-pressed': String(state.skill === id),
                data: { action: 'pick-skill', skill: id, focusKey: `tag:${project.id}:${id}` }
            }, skillsData[id].name))
        ),
        details.length ? [
            h('button', {
                type: 'button', class: 'text-btn details-toggle', 'aria-expanded': String(open), 'aria-controls': detailsId,
                data: { action: 'toggle-details', project: project.id, focusKey: `details:${project.id}` }
            }, open ? 'Weniger anzeigen' : 'Details anzeigen'),
            h('dl', { class: 'card-details', id: detailsId, hidden: !open },
                details.map(([label, value]) => [h('dt', { text: label }), h('dd', { text: value })])
            )
        ] : null
    );
}

function filterDescription() {
    const parts = [];
    if (state.skill) parts.push(skillsData[state.skill].name);
    if (state.station) {
        const station = findStation(state.station);
        parts.push(`${station.title} · ${station.orgShort}`);
    }
    return parts.join(' + ');
}

function renderProjects() {
    const list = visibleProjects(state);
    const filter = filterDescription();
    $('#filterText').textContent = filter
        ? `Gefiltert nach ${filter} – ${formatRefs(list.length)}`
        : `Alle Referenzen – ${formatRefs(list.length)}`;
    $('#resetFilters').hidden = !filter;
    $('#refGrid').replaceChildren(...list.map(projectCard));
    $('#refGrid').hidden = list.length === 0;
    $('#refEmpty').hidden = list.length > 0;
}

// ==========================================================================
// Zustand & Rendering
// ==========================================================================

function setState(patch) {
    Object.assign(state, patch);
    render();
}

function render() {
    // Fokus merken, da Teile der Seite neu gezeichnet werden
    const active = document.activeElement;
    const focusKey = active && active.dataset ? active.dataset.focusKey : null;

    document.querySelectorAll('.sidebar .station').forEach((button) => {
        const id = button.dataset.station;
        button.setAttribute('aria-pressed', String(state.station === id));
        button.querySelector('.station-count').textContent = formatRefs(countProjectsForStation(id, state));
    });

    document.querySelectorAll('#legend .pill').forEach((pill) => {
        const key = pill.dataset.category;
        const pressed = key === 'all' ? state.categories.length === 0 : state.categories.includes(key);
        pill.setAttribute('aria-pressed', String(pressed));
    });

    const key = state.categories.length ? state.categories.slice().sort().join(',') : 'all';
    if (key !== chartKey) {
        chartKey = key;
        buildChart();
    }
    updateChart();
    renderCallout();
    renderProjects();

    if (focusKey && document.activeElement !== active) {
        const target = document.querySelector(`[data-focus-key="${focusKey}"]`)
            || (/^(cat|skill):/.test(focusKey) ? document.querySelector('#chart .bar') : null);
        if (target) target.focus({ preventScroll: true });
    }
}

function scrollToReferences() {
    $('#referenzen').scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
    $('#referenzenTitle').focus({ preventScroll: true });
}

function toggleList(button) {
    const list = document.getElementById(button.getAttribute('aria-controls'));
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    list.hidden = !expanded;
    button.setAttribute('aria-expanded', String(expanded));
    button.textContent = expanded ? button.dataset.labelHide : button.dataset.labelShow;
}

function handleClick(event) {
    // Desktop: Randspalten-Gruppen sind keine Akkordeons
    if (event.target.closest('.side-summary') && desktopQuery.matches) {
        event.preventDefault();
        return;
    }

    const target = event.target.closest('[data-action]');
    if (!target) return;

    switch (target.dataset.action) {
        case 'pick-category':
            setState({ categories: toggleCategory(state.categories, target.dataset.category) });
            break;
        case 'pick-skill':
            setState({ skill: state.skill === target.dataset.skill ? null : target.dataset.skill });
            break;
        case 'pick-station':
            setState({ station: state.station === target.dataset.station ? null : target.dataset.station });
            break;
        case 'clear-skill': {
            const previous = state.skill;
            setState({ skill: null });
            const bar = document.querySelector(`[data-focus-key="skill:${previous}"]`);
            (bar || document.querySelector('#legend .pill[aria-pressed="true"]')).focus({ preventScroll: true });
            break;
        }
        case 'reset-filters':
            setState({ skill: null, station: null });
            $('#referenzenTitle').focus({ preventScroll: true });
            break;
        case 'toggle-details': {
            const openProjects = new Set(state.openProjects);
            const id = target.dataset.project;
            if (openProjects.has(id)) openProjects.delete(id);
            else openProjects.add(id);
            setState({ openProjects });
            break;
        }
        case 'toggle-list':
            toggleList(target);
            break;
        case 'goto-refs':
            event.preventDefault();
            scrollToReferences();
            break;
    }
}

function init() {
    renderStatic();
    syncAccordions();
    desktopQuery.addEventListener('change', syncAccordions);
    document.addEventListener('click', handleClick);
    render();

    // Balken wachsen beim ersten Sichtbarwerden
    const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
            chartSeen = true;
            growBars();
            observer.disconnect();
        }
    }, { threshold: 0.3 });
    observer.observe($('.chart-card'));
}

init();
