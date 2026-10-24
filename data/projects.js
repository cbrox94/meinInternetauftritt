// Referenzen (Projekte). Vertraulich: Kunden/Projekte anonymisiert beschreiben
// (Branche, keine Namen, keine internen Systeme).
// - station: id aus profile.stations
// - skills: Keys aus skillsData (data/skills.js) – daraus berechnen sich alle Zähler und Filter
// - Datumsformat 'YYYY-MM'; to: null = laufend
// - situation, tasks, result, team sind optional (leere Felder werden nicht angezeigt)

const projects = [
    // BEISPIEL – Platzhalter, wird durch echte Projekte ersetzt. Vorher nicht nach main mergen
    // (der Test „Platzhalter-Wächter“ schlägt bewusst fehl, solange [..]-Platzhalter existieren).
    {
        id: 'beispiel-projekt',
        station: 'adesso-itc',
        title: '[Titel folgt]',
        from: '2025-03', to: '2026-09',
        context: '[Branche / Kontext folgt]',
        role: '[Rolle folgt]',
        summary: '[Ergebnis in einem Satz folgt]',
        situation: '[Ausgangslage folgt]',
        tasks: '[Aufgaben folgen]',
        result: '[Ergebnis folgt]',
        team: '[Team / Setup folgt]',
        skills: ['anforderungsmanagement', 'bpmn', 'stakeholder']
    }
];
