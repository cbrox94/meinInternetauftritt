// Profil- und Lebenslaufdaten: Randspalte, Profiltext, Eigene Projekte, Ausgleich, Footer.
// Datumsformat überall 'YYYY-MM'; to: null = laufend.
// Anzeigeformate (MM/JJJJ, seit MM/JJJJ, JJJJ – JJJJ) erzeugt js/app.js.

const profile = {
    name: 'Christoph Bröxkes',
    tagline: 'IT Consultant. Economist. Teamplayer.',
    location: 'Frankfurt am Main',
    photo: 'Portrait.jpg',
    cv: { href: 'CV_BroexkesC.pdf', download: 'CV_Christoph_Broexkes.pdf' },
    contact: {
        email: 'christoph.broexkes@yahoo.de',
        linkedin: 'https://www.linkedin.com/in/christoph-bröxkes-99820a202',
        github: 'https://github.com/cbrox94'
    },
    intro: [
        'Studierter Ökonom (Economics M.Sc.) mit Nebenfach Informatik und Schwerpunkt in Statistik & Ökonometrie.',
        'Seit Oktober 2026 als Business Analyst bei S Broker in Wiesbaden. Zuvor drei Jahre IT Consulting bei adesso SE, eingesetzt vor allem als Requirements Engineer und Product Owner in agilen Softwareprojekten.'
    ],
    // Filterbare Stationen (Reihenfolge = Anzeige); projects[*].station verweist auf id.
    // student: true → filterbar, aber unter „Studentische Tätigkeiten“ (aufklappbar) angezeigt
    stations: [
        { id: 'sbroker', title: 'Business Analyst', org: 'S Broker AG & Co. KG', orgShort: 'S Broker', location: 'Wiesbaden', badge: 'S Broker', from: '2026-10', to: null },
        { id: 'adesso', title: 'IT Consultant', org: 'adesso SE', orgShort: 'adesso SE', location: 'Kiel', badge: 'adesso SE', from: '2023-07', to: '2026-09' },
        { id: 'dataport', title: 'Werkstudent Consulting Strategie & Innovation', org: 'Dataport AöR', orgShort: 'Dataport AöR', location: 'Kiel', badge: 'Dataport · Werkstudent', from: '2022-04', to: '2023-04', student: true }
    ],
    // Nicht filterbar, aufklappbar unter den Stationen
    studentJobs: [
        { title: 'Praktikum Strategisches Marketing', org: 'DEKRA SE', location: 'Stuttgart', from: '2020-04', to: '2020-07' },
        { title: 'Werkstudent Payment Processing', org: 'Cleverbridge AG', location: 'Köln', from: '2016-03', to: '2018-05' }
    ],
    education: [
        { degree: 'M.Sc. Economics', school: 'Christian-Albrechts-Universität zu Kiel', schoolShort: 'CAU Kiel', from: '2020-10', to: '2023-07', note: 'Nebenfach Informatik' },
        { degree: 'B.Sc. Economics', school: 'Universität zu Köln', schoolShort: 'Universität zu Köln', from: '2016-04', to: '2019-09', note: '' }
    ],
    certificates: [
        { name: 'IREB Certified Professional for Requirements Engineering (FL)', shortName: 'IREB CPRE Foundation Level', issuer: 'IREB', date: '2024-04' },
        { name: 'Professional Scrum Master I', shortName: 'Professional Scrum Master I', issuer: 'Scrum.org', date: '2024-02' },
        { name: 'Professional Scrum Product Owner I', shortName: 'Professional Scrum Product Owner I', issuer: 'Scrum.org', date: '2024-02' },
        { name: 'Python for Data Science and Machine Learning Bootcamp', shortName: 'Python for Data Science & ML', issuer: 'Udemy', date: '2025-04' }
    ],
    trainings: [
        { name: 'GenAI Fundamentals for Project Work', provider: 'adesso', date: '2025-11' },
        { name: 'Power BI Masterclass', provider: 'Udemy', date: '2025-10' },
        { name: 'Generative AI: Prompt Engineering Basics', provider: 'IBM / Coursera', date: '2024-11' },
        { name: 'Business Process Model and Notation (BPMN)', provider: 'adesso', date: '2024-04' },
        { name: 'Grundlagen Requirements Engineering nach IREB-Standard', provider: 'adesso', date: '2024-01' },
        { name: 'Agile Basics', provider: 'adesso', date: '2023-11' },
        { name: 'Public Branchenschulung', provider: 'adesso', date: '2023-09' }
    ],
    // description optional (Zeile entfällt, wenn leer); tech darf leer sein
    sideProjects: [
        { title: 'Home Lab', description: 'Raspberry-Pi-Server mit Docker-Containern', tech: ['Docker', 'Linux'] },
        { title: 'Handball-Spielbericht-Generator', description: 'Erzeugt aus Spieldaten automatisch einen Spielbericht', tech: ['Python', 'Streamlit', 'KI/LLMs'] },
        { title: 'Immobilien-Wirtschaftlichkeitsanalyse', description: 'Rechnet Kauf, Finanzierung und Rendite einer Immobilie durch', tech: ['Python', 'Streamlit'] },
        { title: 'Diese Website', description: 'Statische Portfolio-Seite mit interaktivem Skill-Diagramm, agentisch mit Claude Code entwickelt', tech: ['HTML', 'CSS', 'JavaScript', 'Git', 'Playwright'] }
    ],
    hobbies: ['Handball', 'Fitnesstraining', 'Segeln', 'Surfen', 'Wandern'],
    footer: '© 2026 Christoph Bröxkes | IT Consultant'
};
