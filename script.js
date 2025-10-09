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

// ================================================================
// GESTIONNAIRE DE CONTENU AVEC LAZY LOADING
// ================================================================
const ContentManager = {
    cache: new Map(),
    maxCacheSize: 50,
    loadingStates: new Set(),
    
    init() {
        console.log('Content Manager initialise');
    },
    
    async loadContent(type, identifier) {
        const cacheKey = `${type}-${identifier}`;
        
        // Eviter les chargements doubles
        if (this.loadingStates.has(cacheKey)) {
            return this.getFallbackContent(type, identifier);
        }
        
        // Vérifier le cache d'abord
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            // Vérifier l'age du cache (24h pour daily, 1h pour topics)
            const maxAge = type === 'daily' ? 86400000 : 3600000;
            if (Date.now() - cached.timestamp < maxAge) {
                console.log(`Contenu ${cacheKey} chargé depuis le cache`);
                return cached.content;
            } else {
                this.cache.delete(cacheKey);
            }
        }
        
        this.loadingStates.add(cacheKey);
        
        try {
            const url = this.buildContentUrl(type, identifier);
            const response = await fetch(url);
            
            if (!response.ok) {
                console.warn(`Contenu ${cacheKey} non trouvé, utilisation fallback`);
                return this.getFallbackContent(type, identifier);
            }
            
            const content = await response.json();
            this.addToCache(cacheKey, content);
            
            console.log(`Contenu ${cacheKey} chargé depuis le serveur`);
            return content;
            
        } catch (error) {
            console.error(`Erreur chargement ${cacheKey}:`, error);
            return this.getFallbackContent(type, identifier);
        } finally {
            this.loadingStates.delete(cacheKey);
        }
    },
    
    buildContentUrl(type, identifier) {
        const baseUrl = './content/';
        switch(type) {
            case 'daily':
                return `${baseUrl}daily/${identifier}.json`;
            case 'topic':
                return `${baseUrl}topics/${identifier}.json`;
            case 'event':
                return `${baseUrl}events/${identifier}.json`;
            default:
                return `${baseUrl}${type}/${identifier}.json`;
        }
    },
    
    addToCache(key, content) {
        // Gestion limite cache pour éviter surcharge mémoire
        if (this.cache.size >= this.maxCacheSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
            console.log(`Cache nettoyé: suppression de ${oldestKey}`);
        }
        
        this.cache.set(key, {
            content,
            timestamp: Date.now(),
            size: JSON.stringify(content).length
        });
    },
    
    getFallbackContent(type, identifier) {
        const fallbacks = {
            daily: {
                date: identifier,
                title: `Actualités du ${this.formatDate(identifier)}`,
                summary: "Les actualités de cette date sont en cours de chargement...",
                sections: [
                    {
                        type: "geopolitical",
                        title: "Situation Géopolitique",
                        content: "Analyse géopolitique en cours de chargement. Veuillez patienter..."
                    }
                ],
                events: [],
                isLoading: true
            },
            topic: {
                title: "Analyse Thématique",
                content: "Contenu thématique en cours de chargement...",
                isLoading: true
            },
            event: {
                title: "Événement Historique",
                content: "Détails de l'événement en cours de chargement...",
                date: identifier,
                isLoading: true
            }
        };
        
        return fallbacks[type] || { 
            title: "Contenu Indisponible", 
            content: "Le contenu demandé n'est pas disponible actuellement.",
            isLoading: false
        };
    },
    
    formatDate(dateStr) {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    },
    
    // Méthode pour précharger du contenu populaire
    async preloadContent(contentList) {
        const promises = contentList.map(({type, identifier}) => 
            this.loadContent(type, identifier)
        );
        
        try {
            await Promise.allSettled(promises);
            console.log('Préchargement terminé');
        } catch (error) {
            console.warn('Erreur lors du préchargement:', error);
        }
    },
    
    // Statistiques du cache pour debug
    getCacheStats() {
        const totalSize = Array.from(this.cache.values())
            .reduce((sum, item) => sum + item.size, 0);
        
        return {
            items: this.cache.size,
            totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
            maxItems: this.maxCacheSize
        };
    },
    
    // Nettoyer le cache manuellement
    clearCache() {
        this.cache.clear();
        console.log('Cache vidé');
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
        const banner = document.querySelector('.news-banner');
        
        if (!ticker || !banner) return;
        
        if (pause && !this.newsTickerPaused) {
            // Cacher le bandeau et pauser l'animation
            banner.style.transform = 'translateY(-100%)';
            banner.style.opacity = '0';
            ticker.style.animationPlayState = 'paused';
            this.newsTickerPaused = true;
            console.log('Bandeau cache et animation pausee - Economie memoire');
        } else if (!pause && this.newsTickerPaused) {
            // Montrer le bandeau et relancer l'animation
            banner.style.transform = 'translateY(0)';
            banner.style.opacity = '1';
            ticker.style.animationPlayState = 'running';
            this.newsTickerPaused = false;
            console.log('Bandeau affiche et animation reprise');
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
            ContentManager.init();
            PerformanceManager.init();
            NewsManager.init();
            PopulationCounter.init();
            AudioManager.init();
            AudioManager.preloadModalSounds();
            CalendarManager.init();
            
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
                audioPlaying: AudioManager.isPlaying,
                contentCache: ContentManager.getCacheStats()
            }),
            showConfig: () => CONFIG,
            // Outils ContentManager
            loadContent: (type, id) => ContentManager.loadContent(type, id),
            getCacheStats: () => ContentManager.getCacheStats(),
            clearCache: () => ContentManager.clearCache(),
            preloadToday: () => {
                const today = new Date().toISOString().split('T')[0];
                return ContentManager.loadContent('daily', today);
            }
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
        AudioManager.playModalOpen();
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
        AudioManager.playModalClose();
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
    modalSounds: {
        open: null,
        close: null
    },
    modalSoundsEnabled: true,
    
    init() {
        // Audio principal (ambience)
        this.audio = new Audio('sounds/212025__qubodup__sci-fi-laboratory-ambience.mp3');
        this.audio.loop = true;
        this.audio.volume = 0.3; // Volume modéré par défaut
        
        // Précharger les sons de modales
        this.preloadModalSounds();
        
        console.log('Audio Manager initialise avec sons modales');
    },
    
    preloadModalSounds() {
        try {
            // Son d'ouverture de modale
            this.modalSounds.open = new Audio('sounds/expansion1.wav');
            this.modalSounds.open.volume = 0.4;
            this.modalSounds.open.preload = 'auto';
            
            // Son de fermeture de modale
            this.modalSounds.close = new Audio('sounds/expansion2.wav');
            this.modalSounds.close.volume = 0.4;
            this.modalSounds.close.preload = 'auto';
            
            console.log('Sons modales precharges');
        } catch (error) {
            console.warn('Erreur prechargement sons modales:', error);
            this.modalSoundsEnabled = false;
        }
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
        const icon = button ? button.querySelector('.audio-icon') : null;
        
        if (button && icon) {
            if (this.isPlaying) {
                button.classList.add('active');
                icon.textContent = '♪';
            } else {
                button.classList.remove('active');
                icon.textContent = '♪';
            }
        }
    },
    
    // Méthodes pour les sons de modales
    playModalOpen() {
        if (this.modalSoundsEnabled && this.modalSounds.open) {
            try {
                // Réinitialiser le son au début s'il était déjà joué
                this.modalSounds.open.currentTime = 0;
                this.modalSounds.open.play().catch(error => {
                    console.warn('Erreur lecture son ouverture modale:', error);
                });
            } catch (error) {
                console.warn('Erreur son ouverture modale:', error);
            }
        }
    },
    
    playModalClose() {
        if (this.modalSoundsEnabled && this.modalSounds.close) {
            try {
                // Réinitialiser le son au début s'il était déjà joué
                this.modalSounds.close.currentTime = 0;
                this.modalSounds.close.play().catch(error => {
                    console.warn('Erreur lecture son fermeture modale:', error);
                });
            } catch (error) {
                console.warn('Erreur son fermeture modale:', error);
            }
        }
    },
    
    // Méthode pour activer/désactiver les sons de modales
    toggleModalSounds() {
        this.modalSoundsEnabled = !this.modalSoundsEnabled;
        console.log(`Sons modales ${this.modalSoundsEnabled ? 'activés' : 'désactivés'}`);
        return this.modalSoundsEnabled;
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
        AudioManager.playModalOpen();
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
        AudioManager.playModalClose();
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        console.log('Modale credits fermee');
    } else {
        console.error('Modale credits non trouvee');
    }
}

// Ajouter les event listeners pour toutes les modales
document.addEventListener('DOMContentLoaded', () => {
    const creditsModal = document.getElementById('credits-modal');
    const calendarModal = document.getElementById('calendar-modal');
    const dailyContentModal = document.getElementById('daily-content-modal');
    
    if (creditsModal) {
        creditsModal.addEventListener('click', (event) => {
            if (event.target === creditsModal) {
                closeCreditsModal();
            }
        });
    }
    
    if (calendarModal) {
        calendarModal.addEventListener('click', (event) => {
            if (event.target === calendarModal) {
                closeCalendar();
            }
        });
    }
    
    if (dailyContentModal) {
        dailyContentModal.addEventListener('click', (event) => {
            if (event.target === dailyContentModal) {
                closeDailyContent();
            }
        });
    }
});

// ================================================================
// GESTIONNAIRE CALENDRIER
// ================================================================

const CalendarManager = {
    currentDate: new Date(),
    selectedDate: null,
    
    init() {
        this.updateDateButton();
        console.log('Calendar Manager initialise');
    },
    
    updateDateButton() {
        const dateElement = document.getElementById('calendar-date');
        if (dateElement) {
            const today = new Date();
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
            };
            const formattedDate = today.toLocaleDateString('fr-FR', options);
            dateElement.textContent = formattedDate;
        }
    },
    
    generateCalendar() {
        const grid = document.getElementById('calendar-grid');
        const monthYear = document.getElementById('calendar-month-year');
        
        if (!grid || !monthYear) return;
        
        // Effacer le calendrier précédent
        grid.innerHTML = '';
        
        // Afficher mois et année
        const options = { year: 'numeric', month: 'long' };
        monthYear.textContent = this.currentDate.toLocaleDateString('fr-FR', options);
        
        // Ajouter les en-têtes des jours
        const dayHeaders = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            grid.appendChild(dayHeader);
        });
        
        // Calculer le premier jour du mois
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        
        // Ajuster pour commencer lundi (0 = dimanche, 1 = lundi)
        let startDay = firstDay.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1;
        
        // Ajouter les jours du mois précédent
        for (let i = startDay - 1; i >= 0; i--) {
            const prevDate = new Date(firstDay);
            prevDate.setDate(prevDate.getDate() - i - 1);
            this.createDayElement(prevDate, true);
        }
        
        // Ajouter les jours du mois courant
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            this.createDayElement(date, false);
        }
        
        // Compléter avec les jours du mois suivant
        const totalCells = grid.children.length - 7; // Exclure les en-têtes
        const remainingCells = 42 - totalCells; // 6 semaines * 7 jours
        for (let day = 1; day <= remainingCells; day++) {
            const nextDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, day);
            this.createDayElement(nextDate, true);
        }
    },
    
    createDayElement(date, isOtherMonth) {
        const grid = document.getElementById('calendar-grid');
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = date.getDate();
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        // Marquer aujourd'hui
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Gestion du clic
        dayElement.addEventListener('click', () => {
            this.selectDate(date);
        });
        
        grid.appendChild(dayElement);
    },
    
    selectDate(date) {
        // Supprimer la sélection précédente
        document.querySelectorAll('.calendar-day.selected').forEach(day => {
            day.classList.remove('selected');
        });
        
        // Marquer la nouvelle sélection
        event.target.classList.add('selected');
        this.selectedDate = date;
        
        // Charger le contenu de la date sélectionnée
        const dateStr = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
        this.loadDateContent(dateStr);
        
        // Fermer le calendrier après sélection
        setTimeout(() => {
            closeCalendar();
        }, 500);
    },
    
    async loadDateContent(dateStr) {
        try {
            console.log(`Chargement du contenu pour ${dateStr}`);
            const content = await ContentManager.loadContent('daily', dateStr);
            this.displayDateContent(content, dateStr);
        } catch (error) {
            console.error('Erreur lors du chargement du contenu:', error);
            this.displayDateContent(
                ContentManager.getFallbackContent('daily', dateStr), 
                dateStr
            );
        }
    },
    
    displayDateContent(content, dateStr) {
        console.log('Contenu chargé:', content);
        openDailyContentModal(content, dateStr);
    },
    
    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.generateCalendar();
    },
    
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.generateCalendar();
    }
};

function openCalendar() {
    const modal = document.getElementById('calendar-modal');
    if (modal) {
        AudioManager.playModalOpen();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        CalendarManager.generateCalendar();
        console.log('Calendrier ouvert');
    }
}

function closeCalendar() {
    const modal = document.getElementById('calendar-modal');
    if (modal) {
        AudioManager.playModalClose();
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        console.log('Calendrier ferme');
    }
}

function previousMonth() {
    CalendarManager.previousMonth();
}

function nextMonth() {
    CalendarManager.nextMonth();
}

// Gerer la touche Echap pour les modales
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const stabilityTooltip = document.getElementById('stability-tooltip');
        const populationModal = document.getElementById('population-modal');
        const creditsModal = document.getElementById('credits-modal');
        const calendarModal = document.getElementById('calendar-modal');
        const dailyContentModal = document.getElementById('daily-content-modal');
        
        // Fermer d'abord la tooltip si elle est visible
        if (stabilityTooltip && stabilityTooltip.classList.contains('visible')) {
            hideStabilityTooltip();
        } else if (populationModal && populationModal.classList.contains('active')) {
            closePopulationModal();
        } else if (creditsModal && creditsModal.classList.contains('active')) {
            closeCreditsModal();
        } else if (calendarModal && calendarModal.classList.contains('active')) {
            closeCalendar();
        } else if (dailyContentModal && dailyContentModal.classList.contains('active')) {
            closeDailyContent();
        }
    }
});

// ================================================================
// GESTIONNAIRE MODALE CONTENU QUOTIDIEN
// ================================================================

function openDailyContentModal(content, dateStr) {
    const modal = document.getElementById('daily-content-modal');
    if (!modal) return;
    
    // Remplir le titre
    const title = document.getElementById('daily-modal-title');
    if (title) {
        const formattedDate = ContentManager.formatDate(dateStr);
        title.textContent = `Actualités du ${formattedDate}`;
    }
    
    // Remplir le score de stabilité
    updateStabilityScore(content.stability_score || 450, content.stability_justification);
    
    // Remplir le résumé
    const summaryText = document.getElementById('daily-summary-text');
    if (summaryText) {
        summaryText.textContent = content.summary || 'Résumé en cours de chargement...';
    }
    
    // Remplir le résumé complet
    const fullSummary = document.getElementById('full-summary-text');
    if (fullSummary) {
        const fullText = content.full_summary || content.content || 'Résumé complet en cours de chargement...';
        fullSummary.innerHTML = fullText.replace(/\n/g, '<br><br>');
    }
    
    // Réinitialiser l'accordéon
    resetAccordion();
    
    // Ouvrir la modale
    AudioManager.playModalOpen();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    console.log('Modale contenu quotidien ouverte');
}

function closeDailyContent() {
    const modal = document.getElementById('daily-content-modal');
    if (modal) {
        AudioManager.playModalClose();
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        hideStabilityTooltip();
        console.log('Modale contenu quotidien fermée');
    }
}

function updateStabilityScore(score, justification) {
    const scoreElement = document.getElementById('score-value');
    const tooltipContent = document.getElementById('tooltip-content');
    
    if (scoreElement) {
        scoreElement.textContent = score;
        
        // Appliquer la couleur selon le score
        scoreElement.className = 'score-value';
        if (score < 100) {
            scoreElement.classList.add('score-0-100');
        } else if (score < 200) {
            scoreElement.classList.add('score-100-200');
        } else if (score < 300) {
            scoreElement.classList.add('score-200-300');
        } else if (score < 400) {
            scoreElement.classList.add('score-300-400');
        } else if (score < 500) {
            scoreElement.classList.add('score-400-500');
        } else if (score < 600) {
            scoreElement.classList.add('score-500-600');
        } else if (score < 700) {
            scoreElement.classList.add('score-600-700');
        } else if (score < 800) {
            scoreElement.classList.add('score-700-800');
        } else if (score < 900) {
            scoreElement.classList.add('score-800-900');
        } else {
            scoreElement.classList.add('score-900-1000');
        }
    }
    
    const tooltipText = document.getElementById('tooltip-text');
    if (tooltipText) {
        tooltipText.textContent = justification || 'Justification en cours de chargement...';
    }
}

function showStabilityTooltip() {
    const tooltip = document.getElementById('stability-tooltip');
    const overlay = document.getElementById('tooltip-overlay');
    if (tooltip && overlay) {
        overlay.classList.add('visible');
        tooltip.classList.add('visible');
        // Empêcher le scroll du body
        document.body.style.overflow = 'hidden';
    }
}

function hideStabilityTooltip() {
    const tooltip = document.getElementById('stability-tooltip');
    const overlay = document.getElementById('tooltip-overlay');
    if (tooltip && overlay) {
        tooltip.classList.remove('visible');
        overlay.classList.remove('visible');
        // Restaurer le scroll du body seulement si aucune modale n'est active
        const activeModals = document.querySelectorAll('.modal.active');
        if (activeModals.length === 0) {
            document.body.style.overflow = 'auto';
        }
    }
}

function toggleAccordion() {
    const button = document.getElementById('accordion-btn');
    const content = document.getElementById('accordion-content');
    const icon = button.querySelector('.accordion-icon');
    
    if (button.classList.contains('active')) {
        // Fermer l'accordéon
        button.classList.remove('active');
        content.classList.remove('active');
        button.querySelector('span').textContent = 'Afficher le résumé complet';
    } else {
        // Ouvrir l'accordéon
        button.classList.add('active');
        content.classList.add('active');
        button.querySelector('span').textContent = 'Masquer le résumé complet';
    }
}

function resetAccordion() {
    const button = document.getElementById('accordion-btn');
    const content = document.getElementById('accordion-content');
    
    if (button && content) {
        button.classList.remove('active');
        content.classList.remove('active');
        button.querySelector('span').textContent = 'Afficher le résumé complet';
    }
}

console.log('Script Dashboard France24 - Pret pour initialisation');