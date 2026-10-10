// Filter by Category - Multi-select support
let selectedCategories = ['all'];

function filterByCategory(category) {
    if (category === 'all') {
        // Reset to all categories
        selectedCategories = ['all'];
        document.querySelectorAll('.legend-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-category="all"]`).classList.add('active');
        
        // Show category bars
        document.getElementById('categoryBars').style.display = 'flex';
        document.getElementById('skillBars').classList.remove('active');
        document.getElementById('skillHint').style.display = 'none';
    } else {
        // Remove 'all' if present
        if (selectedCategories.includes('all')) {
            selectedCategories = [];
            document.querySelector(`[data-category="all"]`).classList.remove('active');
        }
        
        // Toggle category
        const index = selectedCategories.indexOf(category);
        if (index > -1) {
            selectedCategories.splice(index, 1);
            document.querySelector(`[data-category="${category}"]`).classList.remove('active');
        } else {
            selectedCategories.push(category);
            document.querySelector(`[data-category="${category}"]`).classList.add('active');
        }
        
        // If no categories selected, go back to all
        if (selectedCategories.length === 0) {
            filterByCategory('all');
            return;
        }
        
        // If all 4 categories selected, show category view
        if (selectedCategories.length === 4) {
            selectedCategories = ['all'];
            document.querySelectorAll('.legend-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`[data-category="all"]`).classList.add('active');
            document.getElementById('categoryBars').style.display = 'flex';
            document.getElementById('skillBars').classList.remove('active');
            document.getElementById('skillHint').style.display = 'none';
        } else {
            // Show filtered skill bars
            document.getElementById('categoryBars').style.display = 'none';
            generateMultiCategorySkillBars(selectedCategories);
            document.getElementById('skillHint').style.display = 'block';
        }
    }
}

// Generate skill bars for multiple selected categories
function generateMultiCategorySkillBars(categories) {
    const skillBarsContainer = document.getElementById('skillBars');
    skillBarsContainer.innerHTML = '';
    skillBarsContainer.classList.add('active');
    
    // Filter skills by selected categories
    const categoryNames = categories.map(cat => categoryMap[cat]);
    
    const filteredSkills = Object.entries(skillsData)
        .filter(([key, skill]) => categoryNames.includes(skill.category))
        .sort((a, b) => b[1].score - a[1].score);
    
    // Find max score for scaling
    const maxScore = Math.max(...filteredSkills.map(([k, s]) => s.score));
    
    // Color map - Green Shades
    const colorMap = {
        'Data & Analytics': 'linear-gradient(180deg, #34d399 0%, #10b981 100%)',
        'Requirements Engineering & Business Analysis': 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
        'Projektmanagement & Agile Methoden': 'linear-gradient(180deg, #059669 0%, #047857 100%)',
        'Technische Skills': 'linear-gradient(180deg, #047857 0%, #065f46 100%)'
    };
    
    filteredSkills.forEach(([key, skill]) => {
        const barItem = document.createElement('div');
        barItem.className = 'skill-bar-item';
        
        const heightPercent = (skill.score / maxScore) * 100;
        
        // Better word wrapping for long skill names
        const skillNameFormatted = skill.name
            .replace('Anforderungsmanagement', 'Anforderungs-<br>management')
            .replace('Stakeholder Management', 'Stakeholder<br>Management')
            .replace('Kontextmodellierung', 'Kontext-<br>modellierung')
            .replace('UML-Modellierung', 'UML-<br>Modellierung')
            .replace('Workshop Moderation', 'Workshop<br>Moderation')
            .replace('Product Backlog Management', 'Product<br>Backlog')
            .replace('Prozessautomatisierung', 'Prozess-<br>automatisierung')
            .replace('Zeitreihenanalyse', 'Zeitreihen-<br>analyse')
            .replace('Regressionsanalysen', 'Regressions-<br>analysen')
            .replace('Machine Learning', 'Machine<br>Learning')
            .replace('Matomo Analytics', 'Matomo<br>Analytics')
            .replace('Statistik & Ökonometrie', 'Statistik &<br>Ökonometrie')
            .replace('Scrum Framework', 'Scrum<br>Framework')
            .replace('Prompt Engineering', 'Prompt<br>Engineering');
        
        barItem.innerHTML = `
            <div class="skill-bar-fill" data-height="${heightPercent}%" style="background: ${colorMap[skill.category]}; height: 0%;"></div>
            <div class="skill-bar-label">${skillNameFormatted}</div>
        `;
        
        barItem.onclick = () => openModal(key);
        skillBarsContainer.appendChild(barItem);
    });
    
    // Animate bars
    setTimeout(() => {
        document.querySelectorAll('#skillBars .skill-bar-fill').forEach(bar => {
            bar.style.height = bar.getAttribute('data-height');
        });
        
        // Check if scrolling is needed
        const container = document.getElementById('skillBars');
        if (container.scrollWidth > container.clientWidth) {
            container.classList.add('scrollable');
        } else {
            container.classList.remove('scrollable');
        }
    }, 100);
}

// Open Modal
function openModal(skillKey) {
    const skill = skillsData[skillKey];
    const modal = document.getElementById('skillModal');
    
    document.getElementById('modalSkillName').textContent = skill.name;
    
    // Set "Was ist das?" Google search link
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(skill.name)}`;
    document.getElementById('modalLearnMore').href = searchUrl;
    
    const referencesHTML = skill.references.map(ref => {
        const typeLabel = {
            'job': 'Berufserfahrung',
            'cert': 'Zertifikat',
            'training': 'Schulung',
            'edu': 'Studium',
            'hobby': 'Hobby'
        }[ref.type] || 'Referenz';
        
        // Get specific ID for this reference
        const specificId = referenceIdMap[ref.title] || '';
        
        return `
            <div class="reference-item" onclick="navigateToReference('${specificId}')">
                <div class="ref-title">${ref.title}</div>
                <div class="ref-company">${typeLabel} • ${ref.company}</div>
            </div>
        `;
    }).join('');
    
    document.getElementById('modalReferences').innerHTML = referencesHTML;
    modal.classList.add('active');
}

// Navigate to specific reference and close modal
function navigateToReference(refId) {
    closeModal();
    if (refId) {
        setTimeout(() => {
            const element = document.getElementById(refId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Highlight effect
                element.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                setTimeout(() => {
                    element.style.transition = 'background-color 1s';
                    element.style.backgroundColor = '';
                }, 1500);
            }
        }, 300);
    }
}

// Close Modal
function closeModal() {
    document.getElementById('skillModal').classList.remove('active');
}

// Close modal on outside click
document.getElementById('skillModal').addEventListener('click', (e) => {
    if (e.target.id === 'skillModal') {
        closeModal();
    }
});

// Animate vertical bars on scroll
function animateVerticalBars() {
    const bars = document.querySelectorAll('.vertical-bar-fill');

    // Category height = sum of skill scores, relative to the largest category
    const totals = {};
    Object.entries(categoryMap).forEach(([key, name]) => {
        totals[key] = Object.values(skillsData)
            .filter(skill => skill.category === name)
            .reduce((sum, skill) => sum + skill.score, 0);
    });
    const maxTotal = Math.max(...Object.values(totals));
    bars.forEach(bar => {
        const percent = (totals[bar.dataset.category] / maxTotal) * 100;
        bar.setAttribute('data-height', `${percent}%`);
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const targetHeight = bar.getAttribute('data-height');
                setTimeout(() => {
                    bar.style.height = targetHeight;
                }, 100);
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });
    
    bars.forEach(bar => observer.observe(bar));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    animateVerticalBars();
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 90,
                behavior: 'smooth'
            });
        }
    });
});
