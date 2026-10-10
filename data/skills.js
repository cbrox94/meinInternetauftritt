// Skill-Daten: zentrale Datenquelle für Skill-Diagramme und Skill-Modal.
// - score: Gewichtung des Skills (bestimmt Balkenhöhe; Kategoriebalken = Summe der Scores)
// - references[].title muss in referenceIdMap (unten) auf eine id="ref-..." in index.html zeigen
// - references[].type: job | cert | training | edu | hobby

// Skills Data
const skillsData = {
    // Requirements Engineering & Business Analysis
    'anforderungsmanagement': {
        name: 'Anforderungsmanagement',
        category: 'Requirements Engineering & Business Analysis',
        score: 6,
        references: [
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 3 },
            { type: 'cert', title: 'IREB CPRE Foundation Level', company: 'IREB', intensity: 3 },
            { type: 'training', title: 'Grundlagen Requirements Engineering nach IREB-Standard', company: 'adesso', intensity: 3 }
        ]
    },
    'stakeholder': {
        name: 'Stakeholder Management',
        category: 'Requirements Engineering & Business Analysis',
        score: 7,
        references: [
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 3 },
            { type: 'cert', title: 'IREB CPRE Foundation Level', company: 'IREB', intensity: 2 },
            { type: 'training', title: 'Grundlagen Requirements Engineering', company: 'adesso', intensity: 2 }
        ]
    },
    'workshop': {
        name: 'Workshop Moderation',
        category: 'Requirements Engineering & Business Analysis',
        score: 3,
        references: [
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 3 }
        ]
    },
    'bpmn': {
        name: 'BPMN 2.0',
        category: 'Requirements Engineering & Business Analysis',
        score: 6,
        references: [
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 3 },
            { type: 'training', title: 'Business Process Model and Notation', company: 'adesso', intensity: 3 }
        ]
    },
    'kontext': {
        name: 'Kontextmodellierung',
        category: 'Requirements Engineering & Business Analysis',
        score: 2,
        references: [
            { type: 'cert', title: 'IREB CPRE Foundation Level', company: 'IREB', intensity: 1 },
            { type: 'training', title: 'Grundlagen Requirements Engineering', company: 'adesso', intensity: 1 }
        ]
    },
    'uml': {
        name: 'UML-Modellierung',
        category: 'Requirements Engineering & Business Analysis',
        score: 2,
        references: [
            { type: 'cert', title: 'IREB CPRE Foundation Level', company: 'IREB', intensity: 1 },
            { type: 'training', title: 'Grundlagen Requirements Engineering', company: 'adesso', intensity: 1 }
        ]
    },
    // Data & Analytics
    'excel': {
        name: 'MS Excel',
        category: 'Data & Analytics',
        score: 9,
        references: [
            { type: 'job', title: 'Werkstudent Dataport', company: 'Dataport AöR', intensity: 3 },
            { type: 'job', title: 'Praktikum', company: 'DEKRA SE', intensity: 3 },
            { type: 'job', title: 'Werkstudent', company: 'Cleverbridge AG', intensity: 3 }
        ]
    },
    'python': {
        name: 'Python',
        category: 'Data & Analytics',
        score: 6,
        references: [
            { type: 'edu', title: 'M.Sc. Economics', company: 'Uni Kiel', intensity: 3 },
            { type: 'cert', title: 'Python for Data Science Bootcamp', company: 'Udemy', intensity: 3 }
        ]
    },
    'statistik': {
        name: 'Statistik & Ökonometrie',
        category: 'Data & Analytics',
        score: 4,
        references: [
            { type: 'edu', title: 'M.Sc. Economics', company: 'Uni Kiel', intensity: 3 },
            { type: 'edu', title: 'B.Sc. Economics', company: 'Uni Köln', intensity: 1 }
        ]
    },
    'powerbi': {
        name: 'Power BI',
        category: 'Data & Analytics',
        score: 4,
        references: [
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 1 },
            { type: 'training', title: 'Power BI Masterclass', company: 'Udemy', intensity: 3 }
        ]
    },
    'zeitreihe': {
        name: 'Zeitreihenanalyse & Forecasting',
        category: 'Data & Analytics',
        score: 1,
        references: [
            { type: 'edu', title: 'M.Sc. Economics - Masterarbeit', company: 'Uni Kiel', intensity: 1 }
        ]
    },
    'matlab': {
        name: 'Matlab',
        category: 'Data & Analytics',
        score: 3,
        references: [
            { type: 'edu', title: 'M.Sc. Economics', company: 'Uni Kiel', intensity: 3 }
        ]
    },
    'regression': {
        name: 'Regressionsanalysen',
        category: 'Data & Analytics',
        score: 1,
        references: [
            { type: 'edu', title: 'M.Sc. Economics', company: 'Uni Kiel', intensity: 1 }
        ]
    },
    'ml': {
        name: 'Machine Learning',
        category: 'Data & Analytics',
        score: 1,
        references: [
            { type: 'edu', title: 'M.Sc. Economics', company: 'Uni Kiel', intensity: 1 }
        ]
    },
    'matomo': {
        name: 'Matomo Analytics',
        category: 'Data & Analytics',
        score: 1,
        references: [
            { type: 'job', title: 'Werkstudent', company: 'Dataport AöR', intensity: 1 }
        ]
    },
    'rstudio': {
        name: 'RStudio',
        category: 'Data & Analytics',
        score: 1,
        references: [
            { type: 'edu', title: 'M.Sc. Economics', company: 'Uni Kiel', intensity: 1 }
        ]
    },
    'stata': {
        name: 'Stata',
        category: 'Data & Analytics',
        score: 1,
        references: [
            { type: 'edu', title: 'M.Sc. Economics', company: 'Uni Kiel', intensity: 1 }
        ]
    },
    // Projektmanagement & Agile
    'scrum': {
        name: 'Scrum Framework',
        category: 'Projektmanagement & Agile Methoden',
        score: 6,
        references: [
            { type: 'cert', title: 'Professional Scrum Master I', company: 'Scrum.org', intensity: 3 },
            { type: 'cert', title: 'Professional Scrum Product Owner I', company: 'Scrum.org', intensity: 3 }
        ]
    },
    'backlog': {
        name: 'Product Backlog Management',
        category: 'Projektmanagement & Agile Methoden',
        score: 3,
        references: [
            { type: 'cert', title: 'Professional Scrum Product Owner I', company: 'Scrum.org', intensity: 3 }
        ]
    },
    'jira': {
        name: 'Jira',
        category: 'Projektmanagement & Agile Methoden',
        score: 3,
        references: [
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 3 }
        ]
    },
    'confluence': {
        name: 'Confluence',
        category: 'Projektmanagement & Agile Methoden',
        score: 3,
        references: [
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 3 }
        ]
    },
    'reporting': {
        name: 'Reporting',
        category: 'Projektmanagement & Agile Methoden',
        score: 6,
        references: [
            { type: 'job', title: 'Werkstudent - Consulting Strategie & Innovation', company: 'Dataport AöR', intensity: 3 },
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 3 }
        ]
    },
    'roadmap': {
        name: 'Roadmap Planning',
        category: 'Projektmanagement & Agile Methoden',
        score: 3,
        references: [
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 3 }
        ]
    },
    // Technical Skills
    'prompt': {
        name: 'Prompt Engineering',
        category: 'Technische Skills',
        score: 3,
        references: [
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 1 },
            { type: 'training', title: 'Prompt Engineering Basics', company: 'IBM/Coursera', intensity: 2 }
        ]
    },
    'sharepoint': {
        name: 'SharePoint',
        category: 'Technische Skills',
        score: 2,
        references: [
            { type: 'job', title: 'Werkstudent', company: 'Dataport AöR', intensity: 2 }
        ]
    },
    'prozessauto': {
        name: 'Prozessautomatisierung',
        category: 'Technische Skills',
        score: 2,
        references: [
            { type: 'job', title: 'Werkstudent', company: 'Cleverbridge AG', intensity: 2 }
        ]
    },
    'llm': {
        name: 'LLM-Training',
        category: 'Technische Skills',
        score: 1,
        references: [
            { type: 'job', title: 'IT Consultant', company: 'adesso SE', intensity: 1 }
        ]
    },
    'docker': {
        name: 'Docker',
        category: 'Technische Skills',
        score: 1,
        references: [
            { type: 'hobby', title: 'Home Lab & Self-Hosting', company: 'Privat', intensity: 1 }
        ]
    },
    'linux': {
        name: 'Linux',
        category: 'Technische Skills',
        score: 1,
        references: [
            { type: 'hobby', title: 'Home Lab & Self-Hosting', company: 'Privat', intensity: 1 }
        ]
    },
    'webdev': {
        name: 'Web Development',
        category: 'Technische Skills',
        score: 1,
        references: [
            { type: 'hobby', title: 'Anwendungsentwicklung', company: 'Privat', intensity: 1 }
        ]
    },
    'git': {
        name: 'Git',
        category: 'Technische Skills',
        score: 1,
        references: [
            { type: 'hobby', title: 'Anwendungsentwicklung', company: 'Privat', intensity: 1 }
        ]
    },
    'streamlit': {
        name: 'Streamlit',
        category: 'Technische Skills',
        score: 2,
        references: [
            { type: 'hobby', title: 'Anwendungsentwicklung', company: 'Privat', intensity: 2 }
        ]
    }
};

// Category keys -> category names in skillsData
const categoryMap = {
    'data': 'Data & Analytics',
    'reqeng': 'Requirements Engineering & Business Analysis',
    'pm': 'Projektmanagement & Agile Methoden',
    'tech': 'Technische Skills'
};

// Referenztitel (references[].title) -> id des Abschnitts in index.html
const referenceIdMap = {
    // Jobs
    'IT Consultant': 'ref-it-consultant',
    'Associate IT Consultant': 'ref-associate-it-consultant',
    'Werkstudent Dataport': 'ref-dataport',
    'Werkstudent - Consulting Strategie & Innovation': 'ref-dataport',
    'Praktikum': 'ref-dekra',
    'Praktikum - Strategisches Marketing': 'ref-dekra',
    'Werkstudent': 'ref-cleverbridge',
    'Werkstudent - Payment Processing': 'ref-cleverbridge',
    
    // Education
    'M.Sc. Economics': 'ref-master',
    'M.Sc. Economics - Masterarbeit': 'ref-master',
    'B.Sc. Economics': 'ref-bachelor',
    
    // Certificates
    'IREB CPRE Foundation Level': 'ref-ireb',
    'Professional Scrum Master I': 'ref-psm',
    'Professional Scrum Product Owner I': 'ref-pspo',
    'Python for Data Science Bootcamp': 'ref-python-bootcamp',
    
    // Trainings
    'GenAI Fundamentals for Project Work': 'ref-genai',
    'Power BI Masterclass': 'ref-powerbi',
    'Prompt Engineering Basics': 'ref-prompt-eng',
    'Business Process Model and Notation': 'ref-bpmn',
    'Grundlagen Requirements Engineering nach IREB-Standard': 'ref-re-grundlagen',
    'Grundlagen Requirements Engineering': 'ref-re-grundlagen',
    'Agile Basics': 'ref-agile',
    'Public Branchenschulung': 'ref-public',
    
    // Hobbies
    'Home Lab & Self-Hosting': 'ref-homelab',
    'Anwendungsentwicklung': 'ref-appdev'
};
