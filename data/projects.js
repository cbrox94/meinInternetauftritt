// Referenzen (Projekte). Vertraulich: Kunden/Projekte anonymisiert beschreiben
// (Branche, keine Namen, keine internen Systeme).
// - station: id aus profile.stations
// - skills: Keys aus skillsData (data/skills.js) – daraus berechnen sich alle Zähler und Filter
// - Datumsformat 'YYYY-MM'; to: null = laufend
// - situation, tasks, result, team sind optional (leere Felder werden nicht angezeigt)

const projects = [
    {
        id: 'register-as-a-service',
        station: 'adesso',
        title: 'Register-as-a-Service für die öffentliche Verwaltung',
        from: '2026-06', to: '2026-09',
        context: 'Öffentliche Verwaltung, zwei Landesbehörden',
        role: 'Requirements Engineer & Teilprojektleitung',
        summary: 'Zwei Behörden dabei begleitet, eine Open-Source-Registerplattform bei sich bereitzustellen und ihre Register darauf aufzubauen – ein Register aus dem Sozialbereich und ein Melderegister.',
        situation: 'Register in Bund, Ländern und Kommunen liegen auf sehr unterschiedlichen Technologien – von Excel und Access bis zu komplexen Fachverfahren. Die von adesso entwickelte Open-Source-Plattform bildet sie generisch und konfigurationsgetrieben ab: Fachliche Register werden über konfigurierbare Strukturen und JSON-Schema-basierte Felddefinitionen beschrieben statt einzeln neu entwickelt, mit Versionierung, Historisierung und revisionssicherem Audit-Log. Nach MVP und Pilotbetrieb wird die Plattform nach dem Register-as-a-Service-Prinzip eingesetzt: Die Registerhaltung ist als wiederverwendbarer Dienst von den Fachverfahren entkoppelt, die standardisiert andocken.',
        tasks: 'Einstieg nach der MVP-Phase. Beratung und Begleitung der beiden Behörden bei der Bereitstellung der Plattform in ihrer Umgebung und beim Aufbau ihrer Register: Anforderungen aufnehmen und strukturieren, fachliche Datenmodelle der Register abstimmen, Workshops moderieren und Stakeholder koordinieren. Als Bindeglied zwischen Fachlichkeit und Entwicklung verantwortlich für Anforderungsmanagement, Stakeholdermanagement und die Leitung des Teilprojekts.',
        result: 'Plattform bei beiden Behörden bereitgestellt und den Aufbau ihrer Register fachlich begleitet – nach einem Baukastenprinzip, das die Anbindung weiterer Register und Behörden deutlich verkürzt.',
        team: 'Agiles Produktteam bei adesso; offene Standards (Quarkus, PostgreSQL, OpenSearch, OIDC/JWT)',
        skills: ['anforderungsmanagement', 'stakeholder', 'workshop', 'jira', 'confluence']
    }
];
