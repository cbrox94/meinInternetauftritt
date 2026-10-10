// Skill-Daten: zentrale Datenquelle für das Kompetenz-Diagramm.
// - category: Key aus `categories` (unten)
// - score: Gewichtung des Skills (bestimmt Balkenhöhe; Kategoriebalken = Summe der Scores)
// - label (optional): Anzeigename mit weichen Trennstellen (\u00AD) für lange Wörter
// - references: Dokumentation der Score-Grundlage (wird nicht angezeigt).
//   Die Zähler „N Referenzen“ kommen ausschließlich aus projects[*].skills (data/projects.js).

// Skills Data
const skillsData = {
    // Requirements Engineering & Business Analysis
    'anforderungsmanagement': {
        name: 'Anforderungsmanagement',
        label: 'Anforderungs\u00ADmanagement',
        category: 'reqeng',
        score: 7,
        references: [
            { type: 'job', title: 'Business Analyst', company: 'S Broker', intensity: 1 },
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 3 },
            { type: 'cert', title: 'IREB CPRE Foundation Level', company: 'IREB', intensity: 3 },
            { type: 'training', title: 'Grundlagen Requirements Engineering nach IREB-Standard', company: 'adesso', intensity: 3 }
        ]
    },
    'stakeholder': {
        name: 'Stakeholder Management',
        category: 'reqeng',
        score: 8,
        references: [
            { type: 'job', title: 'Business Analyst', company: 'S Broker', intensity: 1 },
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 3 },
            { type: 'cert', title: 'IREB CPRE Foundation Level', company: 'IREB', intensity: 2 },
            { type: 'training', title: 'Grundlagen Requirements Engineering', company: 'adesso', intensity: 2 }
        ]
    },
    'workshop': {
        name: 'Workshop Moderation',
        category: 'reqeng',
        score: 4,
        references: [
            { type: 'job', title: 'Business Analyst', company: 'S Broker', intensity: 1 },
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 3 }
        ]
    },
    'bpmn': {
        name: 'BPMN 2.0',
        category: 'reqeng',
        score: 7,
        references: [
            { type: 'job', title: 'Business Analyst', company: 'S Broker', intensity: 1 },
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 3 },
            { type: 'training', title: 'Business Process Model and Notation', company: 'adesso', intensity: 3 }
        ]
    },
    'kontext': {
        name: 'Kontextmodellierung',
        label: 'Kontext\u00ADmodellierung',
        category: 'reqeng',
        score: 2,
        references: [
            { type: 'cert', title: 'IREB CPRE Foundation Level', company: 'IREB', intensity: 1 },
            { type: 'training', title: 'Grundlagen Requirements Engineering', company: 'adesso', intensity: 1 }
        ]
    },
    'uml': {
        name: 'UML-Modellierung',
        category: 'reqeng',
        score: 2,
        references: [
            { type: 'cert', title: 'IREB CPRE Foundation Level', company: 'IREB', intensity: 1 },
            { type: 'training', title: 'Grundlagen Requirements Engineering', company: 'adesso', intensity: 1 }
        ]
    },
    // Data & Analytics
    'excel': {
        name: 'MS Excel',
        category: 'data',
        score: 9,
        references: [
            { type: 'job', title: 'Werkstudent Dataport', company: 'Dataport AöR', intensity: 3 },
            { type: 'job', title: 'Praktikum', company: 'DEKRA SE', intensity: 3 },
            { type: 'job', title: 'Werkstudent', company: 'Cleverbridge AG', intensity: 3 }
        ]
    },
    'python': {
        name: 'Python',
        category: 'data',
        score: 6,
        references: [
            { type: 'edu', title: 'M.Sc. Economics', company: 'Uni Kiel', intensity: 3 },
            { type: 'cert', title: 'Python for Data Science Bootcamp', company: 'Udemy', intensity: 3 }
        ]
    },
    'statistik': {
        name: 'Statistik & Ökonometrie',
        label: 'Statistik & Öko\u00ADnometrie',
        category: 'data',
        score: 4,
        references: [
            { type: 'edu', title: 'M.Sc. Economics', company: 'Uni Kiel', intensity: 3 },
            { type: 'edu', title: 'B.Sc. Economics', company: 'Uni Köln', intensity: 1 }
        ]
    },
    'powerbi': {
        name: 'Power BI',
        category: 'data',
        score: 4,
        references: [
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 1 },
            { type: 'training', title: 'Power BI Masterclass', company: 'Udemy', intensity: 3 }
        ]
    },
    'zeitreihe': {
        name: 'Zeitreihenanalyse & Forecasting',
        label: 'Zeitreihen\u00ADanalyse & Forecasting',
        category: 'data',
        score: 1,
        references: [
            { type: 'edu', title: 'M.Sc. Economics - Masterarbeit', company: 'Uni Kiel', intensity: 1 }
        ]
    },
    'matlab': {
        name: 'Matlab',
        category: 'data',
        score: 3,
        references: [
            { type: 'edu', title: 'M.Sc. Economics', company: 'Uni Kiel', intensity: 3 }
        ]
    },
    'regression': {
        name: 'Regressionsanalysen',
        label: 'Regressions\u00ADanalysen',
        category: 'data',
        score: 1,
        references: [
            { type: 'edu', title: 'M.Sc. Economics', company: 'Uni Kiel', intensity: 1 }
        ]
    },
    'ml': {
        name: 'Machine Learning',
        category: 'data',
        score: 1,
        references: [
            { type: 'edu', title: 'M.Sc. Economics', company: 'Uni Kiel', intensity: 1 }
        ]
    },
    'matomo': {
        name: 'Matomo Analytics',
        category: 'data',
        score: 1,
        references: [
            { type: 'job', title: 'Werkstudent', company: 'Dataport AöR', intensity: 1 }
        ]
    },
    'rstudio': {
        name: 'RStudio',
        category: 'data',
        score: 1,
        references: [
            { type: 'edu', title: 'M.Sc. Economics', company: 'Uni Kiel', intensity: 1 }
        ]
    },
    'stata': {
        name: 'Stata',
        category: 'data',
        score: 1,
        references: [
            { type: 'edu', title: 'M.Sc. Economics', company: 'Uni Kiel', intensity: 1 }
        ]
    },
    // Projektmanagement & Agile
    'scrum': {
        name: 'Scrum Framework',
        category: 'pm',
        score: 6,
        references: [
            { type: 'cert', title: 'Professional Scrum Master I', company: 'Scrum.org', intensity: 3 },
            { type: 'cert', title: 'Professional Scrum Product Owner I', company: 'Scrum.org', intensity: 3 }
        ]
    },
    'backlog': {
        name: 'Product Backlog Management',
        category: 'pm',
        score: 3,
        references: [
            { type: 'cert', title: 'Professional Scrum Product Owner I', company: 'Scrum.org', intensity: 3 }
        ]
    },
    'jira': {
        name: 'Jira',
        category: 'pm',
        score: 4,
        references: [
            { type: 'job', title: 'Business Analyst', company: 'S Broker', intensity: 1 },
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 3 }
        ]
    },
    'confluence': {
        name: 'Confluence',
        category: 'pm',
        score: 4,
        references: [
            { type: 'job', title: 'Business Analyst', company: 'S Broker', intensity: 1 },
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 3 }
        ]
    },
    'reporting': {
        name: 'Reporting',
        category: 'pm',
        score: 6,
        references: [
            { type: 'job', title: 'Werkstudent - Consulting Strategie & Innovation', company: 'Dataport AöR', intensity: 3 },
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 3 }
        ]
    },
    'roadmap': {
        name: 'Roadmap Planning',
        category: 'pm',
        score: 3,
        references: [
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 3 }
        ]
    },
    'incident': {
        name: 'Incident Management',
        category: 'pm',
        score: 1,
        references: [
            { type: 'job', title: 'Business Analyst', company: 'S Broker', intensity: 1 }
        ]
    },
    // Technical Skills
    'prompt': {
        name: 'Prompt Engineering',
        category: 'tech',
        score: 3,
        references: [
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 1 },
            { type: 'training', title: 'Prompt Engineering Basics', company: 'IBM/Coursera', intensity: 2 }
        ]
    },
    'sharepoint': {
        name: 'SharePoint',
        category: 'tech',
        score: 2,
        references: [
            { type: 'job', title: 'Werkstudent', company: 'Dataport AöR', intensity: 2 }
        ]
    },
    'prozessauto': {
        name: 'Prozessautomatisierung',
        label: 'Prozess\u00ADautomatisierung',
        category: 'tech',
        score: 2,
        references: [
            { type: 'job', title: 'Werkstudent', company: 'Cleverbridge AG', intensity: 2 }
        ]
    },
    'llm': {
        name: 'LLM-Training',
        category: 'tech',
        score: 1,
        references: [
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 1 }
        ]
    },
    'docker': {
        name: 'Docker',
        category: 'tech',
        score: 1,
        references: [
            { type: 'hobby', title: 'Home Lab & Self-Hosting', company: 'Privat', intensity: 1 }
        ]
    },
    'linux': {
        name: 'Linux',
        category: 'tech',
        score: 1,
        references: [
            { type: 'hobby', title: 'Home Lab & Self-Hosting', company: 'Privat', intensity: 1 }
        ]
    },
    'webdev': {
        name: 'Web Development',
        category: 'tech',
        score: 1,
        references: [
            { type: 'hobby', title: 'Anwendungsentwicklung', company: 'Privat', intensity: 1 }
        ]
    },
    'git': {
        name: 'Git',
        category: 'tech',
        score: 1,
        references: [
            { type: 'hobby', title: 'Anwendungsentwicklung', company: 'Privat', intensity: 1 }
        ]
    },
    'streamlit': {
        name: 'Streamlit',
        category: 'tech',
        score: 2,
        references: [
            { type: 'hobby', title: 'Anwendungsentwicklung', company: 'Privat', intensity: 2 }
        ]
    }
};

// Kategorien (Key = skillsData[*].category). color verweist auf die CSS-Variablen in css/style.css.
const categories = {
    data: { name: 'Data & Analytics', barLabel: 'Data &\nAnalytics', color: 'var(--cat-data)' },
    reqeng: { name: 'Requirements Engineering & Business Analysis', barLabel: 'Requirements\nEngineering', color: 'var(--cat-reqeng)' },
    pm: { name: 'Projektmanagement & Agile Methoden', barLabel: 'Projekt-\nmanagement', color: 'var(--cat-pm)' },
    tech: { name: 'Technische Skills', barLabel: 'Technische\nSkills', color: 'var(--cat-tech)' }
};
