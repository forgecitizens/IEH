// Dashboard Planétaire - Bandeau d'actualités France24
// Version 1.0 - Octobre 2025
console.log('Script Dashboard charge');

// Configuration
const CONFIG = {
    rss: {
        apiUrl: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.france24.com/fr/rss',
        refreshInterval: 300000, // 5 minutes
        shuffleInterval: 120000, // 2 minutes
        maxNews: 10
    },
    performance: {
        scrollThreshold: 100
    }
};

// Gestionnaire de performance et scroll
const PerformanceManager = {
    isScrolledDown: false,
    newsTickerPaused: false,
    
    init() {
        this.setupScrollDetection();
        console.log('Performance Manager initialise');
    },
    
    setupScrollDetection() {
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollY = window.scrollY;
                const shouldPause = scrollY > CONFIG.performance.scrollThreshold;
                if (shouldPause !== this.isScrolledDown) {
                    this.isScrolledDown = shouldPause;
                    this.toggleNewsAnimation(shouldPause);
                }
            }, 100);
        });
    },
    
    toggleNewsAnimation(pause) {
        const ticker = document.querySelector('.news-ticker');
        if (!ticker) return;
        
        if (pause && !this.newsTickerPaused) {
            ticker.style.animationPlayState = 'paused';
            this.newsTickerPaused = true;
            console.log('Animation pause - Economie memoire');
        } else if (!pause && this.newsTickerPaused) {
            ticker.style.animationPlayState = 'running';
            this.newsTickerPaused = false;
            console.log('Animation reprise');
        }
    }
};

// Gestionnaire d'actualités France24
const NewsManager = {
    currentNews: [],
    isLoading: false,
    hasError: false,
    refreshTimer: null,
    shuffleTimer: null,
    
    fallbackNews: [
        'Développements technologiques majeurs dans le secteur de l\'intelligence artificielle',
        'Initiatives climatiques mondiales et transitions énergétiques en cours',
        'Évolutions géopolitiques et diplomatie internationale récente',
        'Actualités économiques et tendances des marchés financiers mondiaux',
        'Innovations en matière d\'énergie renouvelable et développement durable',
        'Coopération internationale et nouveaux accords multilatéraux',
        'Avancées scientifiques récentes et découvertes de recherche',
        'Protection environnementale et politiques de développement durable'
    ],
    
    init() {
        this.createNewsHTML();
        this.loadNews();
        this.setupTimers();
        console.log('News Manager initialise');
    },
    
    createNewsHTML() {
        if (document.querySelector('.news-banner')) return;
        
        const banner = document.createElement('div');
        banner.className = 'news-banner';
        banner.innerHTML = `
            <div class="audio-control">
                <button class="audio-button" id="audio-button" onclick="toggleAudio()">
                    <span class="audio-icon">♪</span>
                </button>
            </div>
            <div class="news-status">
                <span class="status-indicator" id="status-indicator">●</span>
                <span class="status-text" id="status-text">INITIALISATION...</span>
            </div>
            <div class="news-ticker-container">
                <div class="news-ticker" id="news-ticker">
                    Connexion a France24 en cours...
                </div>
            </div>
            <div class="credits-control">
                <button class="credits-button" id="credits-button" onclick="openCreditsModal()">
                    Credits
                </button>
            </div>
        `;
        
        document.body.insertBefore(banner, document.body.firstChild);
    },
    
    async loadNews() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.updateStatus('loading', 'CONNEXION...');
        
        try {
            console.log('Tentative de connexion a France24 RSS...');
            
            const response = await fetch(CONFIG.rss.apiUrl);
            if (!response.ok) {
                throw new Error('Erreur HTTP ' + response.status);
            }
            
            const data = await response.json();
            if (data.status !== 'ok' || !data.items || data.items.length === 0) {
                throw new Error('Données RSS invalides ou vides');
            }
            
            this.currentNews = data.items
                .slice(0, CONFIG.rss.maxNews)
                .map(item => this.cleanHtmlTags(item.title))
                .filter(title => title.length > 5);
            
            this.hasError = false;
            this.updateStatus('live', 'LIVE FRANCE24');
            this.displayNews();
            
            console.log(this.currentNews.length + ' actualites France24 chargees');
            
        } catch (error) {
            console.error('Erreur lors du chargement RSS:', error.message);
            this.handleError();
        } finally {
            this.isLoading = false;
        }
    },
    
    handleError() {
        this.hasError = true;
        this.currentNews = [...this.fallbackNews];
        this.updateStatus('error', 'Problème pour récupérer les informations');
        this.displayNews();
        console.log('Basculement sur actualites de secours active');
    },
    
    cleanHtmlTags(text) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        return (tempDiv.textContent || tempDiv.innerText || '').trim();
    },
    
    updateStatus(type, text) {
        const indicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        if (!indicator || !statusText) return;
        
        const statusConfig = {
            loading: { color: '#ffaa00', animation: 'none' },
            live: { color: '#00ff00', animation: 'pulse 2s infinite' },
            error: { color: '#ff6600', animation: 'pulse 1.5s infinite' }
        };
        
        const config = statusConfig[type] || statusConfig.loading;
        indicator.style.color = config.color;
        indicator.style.animation = config.animation;
        statusText.textContent = text;
    },
    
    displayNews() {
        const ticker = document.getElementById('news-ticker');
        if (!ticker || this.currentNews.length === 0) return;
        
        const newsContent = this.currentNews
            .map(news => '<span class="news-item">' + news + '</span>')
            .join(' • ');
        
        ticker.innerHTML = newsContent;
        
        // Reprendre l'animation si pas en scroll
        if (!PerformanceManager.isScrolledDown) {
            ticker.style.animationPlayState = 'running';
        }
    },
    
    shuffleNews() {
        if (this.currentNews.length <= 1) return;
        
        // Algorithme de Fisher-Yates pour mélanger
        for (let i = this.currentNews.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.currentNews[i], this.currentNews[j]] = [this.currentNews[j], this.currentNews[i]];
        }
        
        this.displayNews();
        console.log('Ordre des actualites melange');
    },
    
    setupTimers() {
        // Actualisation automatique toutes les 5 minutes
        this.refreshTimer = setInterval(() => {
            console.log('Actualisation automatique des actualites...');
            this.loadNews();
        }, CONFIG.rss.refreshInterval);
        
        // Mélange automatique toutes les 2 minutes
        this.shuffleTimer = setInterval(() => {
            this.shuffleNews();
        }, CONFIG.rss.shuffleInterval);
    },
    
    // Méthodes de contrôle manuel
    forceRefresh() {
        console.log('Actualisation forcee demandee');
        this.loadNews();
    },
    
    forceShuffle() {
        console.log('Melange force demande');
        this.shuffleNews();
    }
};

// Contrôleur principal du Dashboard
const Dashboard = {
    initialized: false,
    
    init() {
        if (this.initialized) return;
        
        console.log('=== INITIALISATION DASHBOARD PLANETAIRE ===');
        
        try {
            // Initialisation séquentielle
            PerformanceManager.init();
            NewsManager.init();
            PopulationCounter.init();
            AudioManager.init();
            
            // Outils de debug
            this.setupDebugTools();
            
            this.initialized = true;
            console.log('=== DASHBOARD OPERATIONNEL ===');
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
        }
    },
    
    setupDebugTools() {
        // Interface de debug accessible via console
        window.DashboardDebug = {
            refreshNews: () => NewsManager.forceRefresh(),
            shuffleNews: () => NewsManager.forceShuffle(),
            pauseAnimation: () => PerformanceManager.toggleNewsAnimation(true),
            resumeAnimation: () => PerformanceManager.toggleNewsAnimation(false),
            openPopulation: () => openPopulationModal(),
            closePopulation: () => closePopulationModal(),
            startCounter: () => PopulationCounter.startCounter(),
            stopCounter: () => PopulationCounter.stopCounter(),
            isCounterRunning: () => PopulationCounter.isRunning(),
            getCurrentPop: () => PopulationCounter.getCurrentPopulation(),
            forceUpdate: () => PopulationCounter.updateCounter(),
            toggleAudio: () => AudioManager.toggle(),
            playAudio: () => AudioManager.play(),
            stopAudio: () => AudioManager.stop(),
            getStatus: () => ({
                newsCount: NewsManager.currentNews.length,
                hasError: NewsManager.hasError,
                isScrollPaused: PerformanceManager.newsTickerPaused,
                isLoading: NewsManager.isLoading,
                counterRunning: PopulationCounter.updateInterval !== null,
                audioPlaying: AudioManager.isPlaying
            }),
            showConfig: () => CONFIG
        };
        
        console.log('Outils de debug disponibles: window.DashboardDebug');
    }
};

// Initialisation automatique au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Petit délai pour s'assurer que le CSS est chargé
    setTimeout(() => {
        Dashboard.init();
        // Forcer une mise à jour du compteur après l'initialisation
        setTimeout(() => {
            PopulationCounter.updateCounter();
        }, 200);
    }, 100);
});

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
    console.error('Erreur JavaScript globale:', event.error);
});

// ================================================================
// GESTIONNAIRE COMPTEUR POPULATION LIVE
// ================================================================

// Donnees de base pour le compteur
const PopulationCounter = {
    basePopulation: 8251126900, // estimation au 8 octobre 2025
    growthPerSecond: 2.52, // croissance nette mondiale
    startTime: new Date('2025-10-08T00:00:00Z').getTime(),
    updateInterval: null,
    
    init() {
        this.updateCounter(); // Mise à jour immédiate
        this.startCounter();
        console.log('Compteur population initialise');
    },
    
    updateCounter() {
        const now = Date.now();
        const elapsedSeconds = (now - this.startTime) / 1000;
        const currentPopulation = this.basePopulation + (elapsedSeconds * this.growthPerSecond);
        
        // Mettre a jour le compteur principal
        const mainCounter = document.getElementById('counter');
        if (mainCounter) {
            mainCounter.textContent = this.formatNumber(currentPopulation);
        }
        
        // Mettre a jour le compteur de la modale
        const modalCounter = document.getElementById('modal-counter');
        if (modalCounter) {
            modalCounter.textContent = this.formatNumber(currentPopulation);
        }
    },
    
    formatNumber(number) {
        return number.toLocaleString('fr-FR', {
            maximumFractionDigits: 0
        });
    },
    
    startCounter() {
        // Arrêter le compteur précédent s'il existe
        this.stopCounter();
        
        // Mise à jour immédiate
        this.updateCounter();
        
        // Démarrer le nouveau compteur
        this.updateInterval = setInterval(() => {
            this.updateCounter();
        }, 100); // Mise a jour toutes les 100ms
        
        console.log('Compteur population demarre');
    },
    
    stopCounter() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('Compteur population arrete');
        }
    },
    
    isRunning() {
        return this.updateInterval !== null;
    },
    
    getCurrentPopulation() {
        const now = Date.now();
        const elapsedSeconds = (now - this.startTime) / 1000;
        return this.basePopulation + (elapsedSeconds * this.growthPerSecond);
    }
};

// ================================================================
// GESTIONNAIRE MODALE POPULATION
// ================================================================

function openPopulationModal() {
    const modal = document.getElementById('population-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Empecher le scroll du body
        console.log('Modale population ouverte');
    } else {
        console.error('Modale population non trouvee');
    }
}

function closePopulationModal() {
    const modal = document.getElementById('population-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restaurer le scroll du body
        console.log('Modale population fermee');
    } else {
        console.error('Modale population non trouvee');
    }
}

// Fermer la modale en cliquant sur l'overlay
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('population-modal');
    if (modal) {
        modal.addEventListener('click', (event) => {
            // Fermer seulement si on clique sur l'overlay, pas sur le contenu
            if (event.target === modal) {
                closePopulationModal();
            }
        });
    }
});

// Fermer la modale avec la touche Echap
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const modal = document.getElementById('population-modal');
        if (modal && modal.classList.contains('active')) {
            closePopulationModal();
        }
    }
});

// ================================================================
// GESTIONNAIRE AUDIO
// ================================================================

const AudioManager = {
    audio: null,
    isPlaying: false,
    
    init() {
        this.audio = new Audio('sounds/212025__qubodup__sci-fi-laboratory-ambience.mp3');
        this.audio.loop = true;
        this.audio.volume = 0.3; // Volume modéré par défaut
        console.log('Audio Manager initialise');
    },
    
    toggle() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.play();
        }
    },
    
    play() {
        if (this.audio) {
            this.audio.play().then(() => {
                this.isPlaying = true;
                this.updateButton();
                console.log('Audio demarre');
            }).catch(error => {
                console.error('Erreur lecture audio:', error);
            });
        }
    },
    
    stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.isPlaying = false;
            this.updateButton();
            console.log('Audio arrete');
        }
    },
    
    updateButton() {
        const button = document.getElementById('audio-button');
        const icon = button.querySelector('.audio-icon');
        
        if (this.isPlaying) {
            button.classList.add('active');
            icon.textContent = '♪';
        } else {
            button.classList.remove('active');
            icon.textContent = '♪';
        }
    }
};

function toggleAudio() {
    AudioManager.toggle();
}

// ================================================================
// GESTIONNAIRE MODALE CREDITS
// ================================================================

function openCreditsModal() {
    const modal = document.getElementById('credits-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('Modale credits ouverte');
    } else {
        console.error('Modale credits non trouvee');
    }
}

function closeCreditsModal() {
    const modal = document.getElementById('credits-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        console.log('Modale credits fermee');
    } else {
        console.error('Modale credits non trouvee');
    }
}

// Ajouter les event listeners pour la modale credits
document.addEventListener('DOMContentLoaded', () => {
    const creditsModal = document.getElementById('credits-modal');
    if (creditsModal) {
        creditsModal.addEventListener('click', (event) => {
            if (event.target === creditsModal) {
                closeCreditsModal();
            }
        });
    }
});

// Gerer la touche Echap pour les modales
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const populationModal = document.getElementById('population-modal');
        const creditsModal = document.getElementById('credits-modal');
        
        if (populationModal && populationModal.classList.contains('active')) {
            closePopulationModal();
        } else if (creditsModal && creditsModal.classList.contains('active')) {
            closeCreditsModal();
        }
    }
});

console.log('Script Dashboard France24 - Pret pour initialisation');