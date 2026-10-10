// Referenzen (Projekte) – Hauptinhalt der Seite.
// Vertraulich: Kunden/Projekte anonymisiert beschreiben (Branche, keine Namen, keine internen Systeme).
// - station: id aus profile.stations
// - skills: Keys aus skillsData (data/skills.js); daraus berechnen sich alle Zähler und Filter
// - from/to: 'YYYY-MM', to: null = laufend
// - situation/tasks/result/team: optional (leer = Feld wird nicht angezeigt)
//
// ACHTUNG: Das folgende Objekt ist ein Platzhalter. Solange hier Text in [eckigen Klammern]
// steht, schlägt der Test „Platzhalter-Wächter“ bewusst fehl – nicht auf main mergen.
const projects = [
    {
        id: 'beispiel-projekt',
        station: 'adesso-itc',
        title: '[Titel folgt]',
        from: '2025-03', to: '2026-09',
        context: '[Branche / Kontext, anonymisiert]',
        role: '[Rolle]',
        summary: '[Ein Satz zum Ergebnis]',
        situation: '[Welches Problem oder Ziel gab es?]',
        tasks: '[Was wurde konkret gemacht?]',
        result: '[Wirkung – Zahlen nur, wenn belegbar]',
        team: '[Teamgröße, Setup, Methode]',
        skills: ['anforderungsmanagement', 'bpmn', 'stakeholder', 'workshop']
    }
];
