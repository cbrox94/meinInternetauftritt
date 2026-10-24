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
        summary: 'Zwei Behörden dabei begleitet, eine agentisch entwickelte Open-Source-Registerplattform bei sich bereitzustellen und ihre Register darauf aufzubauen – ein Register aus dem Sozialbereich und ein Melderegister.',
        situation: 'Register in Bund, Ländern und Kommunen liegen auf sehr unterschiedlichen Technologien – von Excel und Access bis zu komplexen Fachverfahren. Die von adesso entwickelte Open-Source-Plattform bildet sie generisch und konfigurationsgetrieben ab: Fachliche Register werden über konfigurierbare Strukturen und JSON-Schema-basierte Felddefinitionen beschrieben statt einzeln neu entwickelt, mit Versionierung, Historisierung und revisionssicherem Audit-Log. Nach MVP und Pilotbetrieb wird die Plattform nach dem Register-as-a-Service-Prinzip eingesetzt: Die Registerhaltung ist als wiederverwendbarer Dienst von den Fachverfahren entkoppelt, die standardisiert andocken. Entwickelt wird das Produkt vollständig agentisch nach adSCAILE: KI-Agenten übernehmen die Implementierung, gesteuert über präzise formulierte Anforderungen und Spezifikationen.',
        tasks: 'Einstieg nach der MVP-Phase. Beratung und Begleitung der beiden Behörden bei der Bereitstellung der Plattform in ihrer Umgebung und beim Aufbau ihrer Register: Anforderungen aufnehmen und strukturieren, fachliche Datenmodelle der Register abstimmen, Workshops moderieren und Stakeholder koordinieren. Anforderungen so aufbereitet, dass sie als Spezifikation direkt in die agentische Entwicklung einfließen. Als Bindeglied zwischen Fachlichkeit und Entwicklung verantwortlich für Anforderungsmanagement, Stakeholdermanagement und die Leitung des Teilprojekts.',
        result: 'Bereitstellung der Plattform und Aufbau der beiden Register fachlich vorangetrieben; der Registeraufbau lief zum Wechsel zu S Broker weiter. Das Baukastenprinzip verkürzt die Anbindung weiterer Register und Behörden deutlich.',
        team: 'Agiles Produktteam bei adesso, agentische Softwareentwicklung nach adSCAILE; offene Standards (Quarkus, PostgreSQL, OpenSearch, OIDC/JWT)',
        skills: ['anforderungsmanagement', 'stakeholder', 'workshop', 'prompt', 'jira', 'confluence']
    },
    {
        id: 'foerderverfahren',
        station: 'adesso',
        title: 'Digitales Fachverfahren für die EU-Förderabwicklung',
        from: '2023-07', to: '2026-04',
        context: 'Öffentliche Verwaltung, Agrar- und Umweltförderung mehrerer Länder',
        role: 'Requirements Engineer & Business Analyst',
        summary: 'Die papierbasierte Antragsbearbeitung EU-geförderter Investitionsmaßnahmen durch ein agil entwickeltes Fachverfahren abgelöst – das Berechnungsmodell für ein Förderverfahren von Grund auf aufgebaut, heute live.',
        situation: 'Anträge auf EU-geförderte Investitionsmaßnahmen im Bereich eines Landwirtschafts- und Umweltministeriums (zuständig für drei Länder) wurden papierbasiert bearbeitet. Ziel war eine Datenplattform für Antrags- und Finanzdaten mit E-Akte und Anbindung einer Online-Antragstellung. Entwickelt wurde agil gemeinsam mit Kammern und Landesbetrieben; den Betrieb übernimmt anschließend ein Landesbetrieb.',
        tasks: 'Anforderungen erheben, analysieren und für die Entwicklung aufbereiten; Fachprozesse in BPMN modellieren; Abstimmung mit Fachstakeholdern und Entwicklungsteam; Moderation von Fachworkshops; Oberflächenentwürfe als Mockups. Schwerpunkt: Konzeption und Aufbau des Berechnungsmodells für ein spezifisches Förderverfahren.',
        result: 'Das Fachverfahren ist in Produktion. Das von Grund auf aufgebaute Berechnungsmodell ist live und wird in der Antragsbearbeitung eingesetzt.',
        team: 'Agiles Team; Spring Boot, Kotlin, Angular; Schnittstellen u. a. für Anmeldung (OAuth), Stammdaten, Zahlungsverkehr und Druck',
        skills: ['anforderungsmanagement', 'stakeholder', 'workshop', 'bpmn', 'jira', 'confluence']
    },
    {
        id: 'ki-pilotprojekte',
        station: 'adesso',
        title: 'KI-Pilotprojekte in der Verwaltung: Partnerauswahl und Steuerung',
        from: '2024-06', to: '2026-09',
        context: 'Öffentliche Verwaltung, IT-Dienstleister mehrerer Länder',
        role: 'PMO & Requirements Engineer',
        summary: 'Behörden bei der Auswahl von Umsetzungspartnern für KI-Pilotprojekte unterstützt – von der Leistungsbeschreibung über die Marktsondierung bis zur Angebotsbewertung.',
        situation: 'Über einen Rahmenvertrag sollen KI-Pilotprojekte in verschiedenen Verwaltungsbereichen umgesetzt werden, um Effizienz und Digitalisierung der öffentlichen Verwaltung voranzubringen. adesso vermittelt dafür geeignete Umsetzungspartner. Dabei müssen die Anforderungen und Erwartungen mehrerer Behörden sowie technische und rechtliche Rahmenbedingungen zusammengebracht werden.',
        tasks: 'Mitarbeit an Leistungsbeschreibungen; Marktsondierung nach potenziellen Umsetzungspartnern; Einholen und systematisches Bewerten von Angeboten; Unterstützung der Behörden bei der Entscheidung für den geeignetsten Partner; Anforderungs- und Stakeholdermanagement über die beteiligten Behörden hinweg.',
        result: 'Diverse KI-Projekte erfolgreich vermittelt und in die Umsetzung gebracht.',
        team: 'Kleines Beratungsmandat mit 1–2 Beratern für die einzelnen Abrufe',
        skills: ['anforderungsmanagement', 'stakeholder', 'workshop']
    }
];
