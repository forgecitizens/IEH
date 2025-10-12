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
// GESTIONNAIRE DE DONNÉES GÉOGRAPHIQUES
// ================================================================
class GeoDataManager {
    constructor() {
        this.countriesData = null;
        this.countryNames = [];
        this.initialized = false;
    }

    async init() {
        try {
            console.log('🌍 Chargement des données géographiques Natural Earth...');
            
            // Essayer d'abord le fichier Natural Earth détaillé
            let response;
            try {
                response = await fetch('./ne_50m_admin_0_countries.geojson');
                console.log('📊 Init - Response status:', response.status);
                console.log('📊 Init - Response ok:', response.ok);
                if (!response.ok) throw new Error('Natural Earth file not found');
                console.log('✅ Fichier Natural Earth trouvé');
            } catch (neError) {
                console.log('⚠️ Fichier Natural Earth non trouvé:', neError.message);
                console.log('🔄 Tentative countries.json...');
                response = await fetch('./countries.json');
                if (!response.ok) throw new Error('Aucun fichier géographique trouvé');
            }
            
            this.countriesData = await response.json();
            console.log('📁 Fichier GeoJSON chargé, features:', this.countriesData.features?.length);
            
            // Vérifier que les données sont valides
            if (!this.countriesData || !this.countriesData.features || this.countriesData.features.length === 0) {
                throw new Error('Données GeoJSON invalides ou vides');
            }
            
            // Extraire les noms de pays pour la détection
            this.extractCountryNames();
            this.initialized = true;
            console.log(`✅ Données géographiques Natural Earth chargées : ${this.countryNames.length} pays`);
            console.log('📝 Premiers pays:', this.countryNames.slice(0, 5).map(c => c.name));
            
            // Activer la détection des pays dans les textes existants
            this.highlightCountriesInExistingText();
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement des données géographiques:', error);
            console.error('🔍 Type d\'erreur:', error.name);
            console.error('📄 Message:', error.message);
            console.error('🌐 URL tentée:', error.url || 'URL non disponible');
            
            // Fallback : utiliser une liste de pays basique pour tester
            this.initializeFallbackCountries();
        }
    }

    initializeFallbackCountries() {
        console.log('🔄 Activation du mode fallback avec pays de base...');
        this.countryNames = [
            { name: 'France', nameEn: 'France', nameFr: 'France', fallbackIcon: '🇫🇷' },
            { name: 'United States', nameEn: 'United States', nameFr: 'États-Unis', fallbackIcon: '🇺🇸' },
            { name: 'United Kingdom', nameEn: 'United Kingdom', nameFr: 'Royaume-Uni', fallbackIcon: '🇬🇧' },
            { name: 'Germany', nameEn: 'Germany', nameFr: 'Allemagne', fallbackIcon: '🇩🇪' },
            { name: 'China', nameEn: 'China', nameFr: 'Chine', fallbackIcon: '🇨🇳' },
            { name: 'Russia', nameEn: 'Russia', nameFr: 'Russie', fallbackIcon: '🇷🇺' },
            { name: 'Ukraine', nameEn: 'Ukraine', nameFr: 'Ukraine', fallbackIcon: '🇺🇦' },
            { name: 'Israel', nameEn: 'Israel', nameFr: 'Israël', fallbackIcon: '🇮🇱' },
            { name: 'Palestine', nameEn: 'Palestine', nameFr: 'Palestine', fallbackIcon: '🇵🇸' },
            { name: 'Iran', nameEn: 'Iran', nameFr: 'Iran', fallbackIcon: '🇮🇷' },
            { name: 'Syria', nameEn: 'Syria', nameFr: 'Syrie', fallbackIcon: '🇸🇾' },
            { name: 'Turkey', nameEn: 'Turkey', nameFr: 'Turquie', fallbackIcon: '🇹🇷' },
            { name: 'Egypt', nameEn: 'Egypt', nameFr: 'Égypte', fallbackIcon: '🇪🇬' },
            { name: 'Cameroon', nameEn: 'Cameroon', nameFr: 'Cameroun', fallbackIcon: '🇨🇲' },
            { name: 'Gabon', nameEn: 'Gabon', nameFr: 'Gabon', fallbackIcon: '🇬🇦' },
            { name: 'Czech Republic', nameEn: 'Czech Republic', nameFr: 'République tchèque', fallbackIcon: '🇨🇿' },
            { name: 'Nepal', nameEn: 'Nepal', nameFr: 'Népal', fallbackIcon: '🇳🇵' },
            { name: 'Italy', nameEn: 'Italy', nameFr: 'Italie', fallbackIcon: '🇮🇹' },
            { name: 'Spain', nameEn: 'Spain', nameFr: 'Espagne', fallbackIcon: '🇪🇸' },
            { name: 'Japan', nameEn: 'Japan', nameFr: 'Japon', fallbackIcon: '🇯🇵' },
            { name: 'India', nameEn: 'India', nameFr: 'Inde', fallbackIcon: '🇮🇳' },
            { name: 'Brazil', nameEn: 'Brazil', nameFr: 'Brésil', fallbackIcon: '🇧🇷' },
            { name: 'Canada', nameEn: 'Canada', nameFr: 'Canada', fallbackIcon: '🇨🇦' },
            { name: 'Australia', nameEn: 'Australia', nameFr: 'Australie', fallbackIcon: '🇦🇺' },
            { name: 'South Africa', nameEn: 'South Africa', nameFr: 'Afrique du Sud', fallbackIcon: '🇿🇦' },
            // Pays africains supplémentaires pour les résumés d'octobre
            { name: 'Africa', nameEn: 'Africa', nameFr: 'Afrique', fallbackIcon: '🌍' },
            { name: 'Middle East', nameEn: 'Middle East', nameFr: 'Moyen-Orient', fallbackIcon: '🕌' },
            { name: 'Gaza Strip', nameEn: 'Gaza Strip', nameFr: 'Bande de Gaza', fallbackIcon: '🇵🇸' }
        ];
        
        this.initialized = true;
        console.log(`✅ Mode fallback activé avec ${this.countryNames.length} pays`);
        
        // Activer la détection des pays dans les textes existants
        setTimeout(() => {
            this.highlightCountriesInExistingText();
        }, 100);
    }

    extractCountryNames() {
        if (!this.countriesData || !this.countriesData.features) return;
        
        this.countryNames = this.countriesData.features.map(feature => {
            // Natural Earth a des propriétés différentes
            const props = feature.properties;
            return {
                name: props.NAME || props.NAME_EN,
                nameEn: props.NAME_EN || props.NAME,
                nameFr: props.NAME_FR || props.NAME_LONG || props.NAME,
                nameShort: props.NAME_SHORT,
                geometry: feature.geometry,
                properties: feature.properties,
                // Propriétés Natural Earth spécifiques
                admin: props.ADMIN,
                iso2: props.ISO_A2,
                iso3: props.ISO_A3
            };
        });
        
        console.log('🏷️ Exemple pays Natural Earth:', this.countryNames[0]);
    }

    // Détection des pays dans un texte
    detectCountriesInText(text) {
        if (!this.initialized || !text) return [];
        
        const detectedCountries = new Set();
        
        this.countryNames.forEach(country => {
            // Recherche du nom français, anglais et variations communes
            const names = [
                country.name,
                country.nameEn,
                country.nameFr,
                // Variations communes
                this.getCountryVariations(country.name)
            ].flat().filter(Boolean);
            
            names.forEach(name => {
                const pattern = new RegExp(`\\b${this.escapeRegex(name)}s?\\b`, 'gi');
                if (pattern.test(text)) {
                    detectedCountries.add(country);
                }
            });
        });
        
        return Array.from(detectedCountries);
    }

    getCountryVariations(countryName) {
        const variations = {
            'United States of America': ['États-Unis', 'USA', 'Amérique', 'États Unis'],
            'United Kingdom': ['Royaume-Uni', 'Grande-Bretagne', 'Angleterre'],
            'Russian Federation': ['Russie'],
            'China': ['Chine'],
            'Palestine': ['Gaza', 'Cisjordanie', 'bande de Gaza'],
            'Israel': ['Israël'],
            'Ukraine': ['Ukraine'],
            'France': ['France'],
            'Germany': ['Allemagne'],
            'Italy': ['Italie'],
            'Spain': ['Espagne'],
            'Netherlands': ['Pays-Bas'],
            'Belgium': ['Belgique'],
            'Switzerland': ['Suisse'],
            'Turkey': ['Turquie'],
            'Egypt': ['Égypte'],
            'Saudi Arabia': ['Arabie Saoudite'],
            'Iran': ['Iran'],
            'Iraq': ['Irak'],
            'Syria': ['Syrie'],
            'Lebanon': ['Liban'],
            'Jordan': ['Jordanie'],
            'India': ['Inde'],
            'Japan': ['Japon'],
            'South Korea': ['Corée du Sud'],
            'North Korea': ['Corée du Nord'],
            'Brazil': ['Brésil'],
            'Mexico': ['Mexique'],
            'Canada': ['Canada'],
            'Australia': ['Australie'],
            'South Africa': ['Afrique du Sud'],
            'Nigeria': ['Nigeria'],
            'Kenya': ['Kenya'],
            'Morocco': ['Maroc'],
            'Algeria': ['Algérie'],
            'Tunisia': ['Tunisie'],
            'Libya': ['Libye'],
            'Sudan': ['Soudan'],
            'Ethiopia': ['Éthiopie'],
            'Ghana': ['Ghana'],
            'Senegal': ['Sénégal'],
            'Mali': ['Mali'],
            'Burkina Faso': ['Burkina Faso'],
            'Niger': ['Niger'],
            'Chad': ['Tchad'],
            'Cameroon': ['Cameroun'],
            'Gabon': ['Gabon'],
            'Democratic Republic of the Congo': ['République démocratique du Congo', 'RDC'],
            'Central African Republic': ['République centrafricaine', 'RCA'],
            'Madagascar': ['Madagascar'],
            'Zimbabwe': ['Zimbabwe'],
            'Botswana': ['Botswana'],
            'Namibia': ['Namibie'],
            'Angola': ['Angola'],
            'Mozambique': ['Mozambique'],
            'Tanzania': ['Tanzanie'],
            'Uganda': ['Ouganda'],
            'Rwanda': ['Rwanda'],
            'Burundi': ['Burundi'],
            'Somalia': ['Somalie'],
            'Djibouti': ['Djibouti'],
            'Eritrea': ['Érythrée'],
            'Czech Republic': ['République tchèque', 'Tchéquie'],
            'Slovakia': ['Slovaquie'],
            'Poland': ['Pologne'],
            'Hungary': ['Hongrie'],
            'Romania': ['Roumanie'],
            'Bulgaria': ['Bulgarie'],
            'Croatia': ['Croatie'],
            'Serbia': ['Serbie'],
            'Bosnia and Herzegovina': ['Bosnie-Herzégovine'],
            'Montenegro': ['Monténégro'],
            'North Macedonia': ['Macédoine du Nord'],
            'Albania': ['Albanie'],
            'Greece': ['Grèce'],
            'Portugal': ['Portugal'],
            'Norway': ['Norvège'],
            'Sweden': ['Suède'],
            'Denmark': ['Danemark'],
            'Finland': ['Finlande'],
            'Iceland': ['Islande'],
            'Ireland': ['Irlande'],
            'Austria': ['Autriche'],
            'Luxembourg': ['Luxembourg'],
            'Slovenia': ['Slovénie'],
            'Estonia': ['Estonie'],
            'Latvia': ['Lettonie'],
            'Lithuania': ['Lituanie'],
            'Belarus': ['Biélorussie'],
            'Moldova': ['Moldavie'],
            'Georgia': ['Géorgie'],
            'Armenia': ['Arménie'],
            'Azerbaijan': ['Azerbaïdjan'],
            'Kazakhstan': ['Kazakhstan'],
            'Uzbekistan': ['Ouzbékistan'],
            'Turkmenistan': ['Turkménistan'],
            'Kyrgyzstan': ['Kirghizistan'],
            'Tajikistan': ['Tadjikistan'],
            'Afghanistan': ['Afghanistan'],
            'Pakistan': ['Pakistan'],
            'Bangladesh': ['Bangladesh'],
            'Sri Lanka': ['Sri Lanka'],
            'Nepal': ['Népal'],
            'Bhutan': ['Bhoutan'],
            'Myanmar': ['Myanmar', 'Birmanie'],
            'Thailand': ['Thaïlande'],
            'Vietnam': ['Vietnam'],
            'Cambodia': ['Cambodge'],
            'Laos': ['Laos'],
            'Malaysia': ['Malaisie'],
            'Singapore': ['Singapour'],
            'Indonesia': ['Indonésie'],
            'Philippines': ['Philippines'],
            'Mongolia': ['Mongolie'],
            'Argentina': ['Argentine'],
            'Chile': ['Chili'],
            'Peru': ['Pérou'],
            'Colombia': ['Colombie'],
            'Venezuela': ['Venezuela'],
            'Ecuador': ['Équateur'],
            'Bolivia': ['Bolivie'],
            'Paraguay': ['Paraguay'],
            'Uruguay': ['Uruguay'],
            'Guyana': ['Guyana'],
            'Suriname': ['Suriname'],
            'French Guiana': ['Guyane française'],
            'Cuba': ['Cuba'],
            'Jamaica': ['Jamaïque'],
            'Haiti': ['Haïti'],
            'Dominican Republic': ['République dominicaine'],
            'Puerto Rico': ['Porto Rico'],
            'Trinidad and Tobago': ['Trinité-et-Tobago'],
            'Barbados': ['Barbade'],
            'Bahamas': ['Bahamas'],
            'Belize': ['Belize'],
            'Guatemala': ['Guatemala'],
            'Honduras': ['Honduras'],
            'El Salvador': ['Salvador'],
            'Nicaragua': ['Nicaragua'],
            'Costa Rica': ['Costa Rica'],
            'Panama': ['Panama'],
            'New Zealand': ['Nouvelle-Zélande'],
            'Papua New Guinea': ['Papouasie-Nouvelle-Guinée'],
            'Fiji': ['Fidji'],
            'Solomon Islands': ['Îles Salomon'],
            'Vanuatu': ['Vanuatu'],
            'New Caledonia': ['Nouvelle-Calédonie'],
            'French Polynesia': ['Polynésie française'],
            'Samoa': ['Samoa'],
            'Tonga': ['Tonga'],
            'Palau': ['Palaos'],
            'Marshall Islands': ['Îles Marshall'],
            'Micronesia': ['Micronésie'],
            'Kiribati': ['Kiribati'],
            'Tuvalu': ['Tuvalu'],
            'Nauru': ['Nauru']
        };
        
        return variations[countryName] || [];
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Mettre en surbrillance les pays dans un élément DOM
    highlightCountriesInElement(element) {
        if (!this.initialized || !element) {
            console.log('⚠️ GeoDataManager non initialisé ou élément manquant');
            return;
        }
        
        // Éviter la double application sur le même élément
        if (element.hasAttribute('data-countries-highlighted')) {
            console.log('⚠️ Élément déjà traité, éviter la récursion');
            return;
        }
        
        // Marquer l'élément comme traité
        element.setAttribute('data-countries-highlighted', 'true');
        
        // Utiliser le textContent pour éviter les problèmes avec HTML existant
        const originalText = element.textContent;
        console.log(`🔍 Analyse du texte: "${originalText?.substring(0, 100)}..."`);
        
        const detectedCountries = this.detectCountriesInText(originalText);
        console.log(`🌍 Pays détectés:`, detectedCountries.map(c => c.name));
        
        if (detectedCountries.length === 0) {
            console.log('❌ Aucun pays détecté dans ce texte');
            return;
        }
        
        // Reconstruire le HTML proprement
        let newHTML = originalText;
        
        // Trier les pays par longueur de nom (plus long en premier) pour éviter les conflits
        detectedCountries.sort((a, b) => b.name.length - a.name.length);
        
        detectedCountries.forEach(country => {
            const names = [
                country.name,
                country.nameEn,
                country.nameFr,
                ...this.getCountryVariations(country.name)
            ].filter(Boolean);
            
            // Supprimer les doublons
            const uniqueNames = [...new Set(names)];
            console.log(`🔤 Noms uniques à rechercher pour ${country.name}:`, uniqueNames);
            
            uniqueNames.forEach(name => {
                const pattern = new RegExp(`\\b(${this.escapeRegex(name)}s?)\\b`, 'gi');
                const matches = newHTML.match(pattern);
                if (matches) {
                    console.log(`✅ Correspondances trouvées pour "${name}":`, matches);
                    newHTML = newHTML.replace(pattern, (match) => {
                        console.log(`🎯 Remplacement: "${match}" → surbrillance`);
                        return `<span class="country-highlight" data-country="${this.escapeHtml(country.name)}" onmouseover="showCountryMap('${this.escapeHtml(country.name)}')" onmouseout="hideCountryMap()">${match}</span>`;
                    });
                }
            });
        });
        
        element.innerHTML = newHTML;
        console.log(`✅ HTML mis à jour pour l'élément`);
        
        // Vérifier que les éléments .country-highlight sont bien créés
        const highlightedElements = element.querySelectorAll('.country-highlight');
        console.log(`🎯 Éléments .country-highlight créés:`, highlightedElements.length);
    }

    // Échapper les caractères HTML pour éviter les problèmes d'injection
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Fonction de test pour diagnostiquer le chargement
    async testNaturalEarthLoading() {
        console.log('🧪 Test de chargement Natural Earth...');
        try {
            const response = await fetch('./ne_50m_admin_0_countries.geojson');
            console.log('📊 Response status:', response.status);
            console.log('📊 Response ok:', response.ok);
            console.log('📊 Response headers:', [...response.headers.entries()]);
            
            if (response.ok) {
                const text = await response.text();
                console.log('📏 Taille du fichier:', text.length, 'caractères');
                console.log('🔤 Début du fichier:', text.substring(0, 100));
                
                const data = JSON.parse(text);
                console.log('🗺️ Nombre de features:', data.features?.length);
                console.log('🏷️ Premier pays:', data.features?.[0]?.properties?.NAME);
                return data;
            }
        } catch (error) {
            console.error('❌ Erreur test Natural Earth:', error);
        }
        return null;
    }

    // Appliquer la surbrillance aux textes existants
    highlightCountriesInExistingText() {
        console.log('🔍 Recherche des éléments de résumé...');
        // Surbrillance dans les résumés quotidiens et le résumé principal
        const summaryElements = document.querySelectorAll('.summary-text:not([data-countries-highlighted]), .daily-summary-section .summary-text:not([data-countries-highlighted]), #daily-summary-text:not([data-countries-highlighted]), #full-summary-text:not([data-countries-highlighted]), .summary-section .summary-text:not([data-countries-highlighted])');
        console.log(`📝 Éléments non traités trouvés:`, summaryElements.length);
        
        summaryElements.forEach((element, index) => {
            console.log(`📄 Élément ${index}:`, element.tagName, element.className, element.id);
            console.log(`📄 Contenu (50 premiers caractères):`, element.textContent?.substring(0, 50));
            this.highlightCountriesInElement(element);
        });
        
        console.log(`🌍 Détection appliquée à ${summaryElements.length} nouveaux éléments de résumé`);
    }

    // Appliquer la détection spécifiquement au résumé principal
    highlightMainSummary() {
        const mainSummary = document.querySelector('.summary-section .summary-text');
        if (mainSummary && this.initialized) {
            this.highlightCountriesInElement(mainSummary);
            console.log('🌍 Détection appliquée au résumé principal');
        }
    }

    // Obtenir les données d'un pays spécifique
    getCountryData(countryName) {
        const country = this.countryNames.find(country => 
            country.name === countryName || 
            country.nameEn === countryName || 
            country.nameFr === countryName
        );
        
        // Ajouter l'icône de fallback si elle n'existe pas
        if (country && !country.fallbackIcon) {
            const flagEmojis = {
                'France': '🇫🇷', 'United States': '🇺🇸', 'United Kingdom': '🇬🇧',
                'Germany': '🇩🇪', 'China': '🇨🇳', 'Russia': '🇷🇺', 'Ukraine': '🇺🇦',
                'Israel': '🇮🇱', 'Palestine': '🇵🇸', 'Iran': '🇮🇷', 'Syria': '🇸🇾',
                'Turkey': '🇹🇷', 'Egypt': '🇪🇬', 'Cameroon': '🇨🇲', 'Gabon': '🇬🇦',
                'Czech Republic': '🇨🇿', 'Nepal': '🇳🇵', 'Italy': '🇮🇹', 'Spain': '🇪🇸',
                'Japan': '🇯🇵', 'India': '🇮🇳', 'Brazil': '🇧🇷', 'Canada': '🇨🇦',
                'Australia': '🇦🇺', 'South Africa': '🇿🇦'
            };
            country.fallbackIcon = flagEmojis[country.name] || '🗺️';
        }
        
        return country;
    }

    // Générer le SVG pour un pays avec vraie carte du monde
    generateCountrySVG(countryData) {
        if (!countryData) return '';
        
        // Mode fallback : affichage simplifié avec drapeau et informations
        if (!countryData.geometry || !this.countriesData?.features) {
            return this.generateFallbackCountrySVG(countryData);
        }
        
        try {
            console.log('🗺️ Génération carte du monde avec pays en surbrillance...');
            return this.generateWorldMapWithCountryHighlight(countryData);
        } catch (error) {
            console.error('❌ Erreur génération carte du monde:', error);
            return this.generateFallbackCountrySVG(countryData);
        }
    }

    // Générer une vraie carte du monde avec le pays en surbrillance
    generateWorldMapWithCountryHighlight(highlightedCountry) {
        let worldPaths = '';
        let highlightedPath = '';
        
        // Calculer les bounds globaux pour la projection
        const worldBounds = this.calculateWorldBounds();
        const { minX, minY, maxX, maxY } = worldBounds;
        
        console.log('🗺️ World bounds:', { minX, minY, maxX, maxY });
        console.log('🎯 Looking for country:', highlightedCountry.name);
        
        const mapWidth = 580;
        const mapHeight = 280;
        const scaleX = mapWidth / (maxX - minX);
        const scaleY = mapHeight / (maxY - minY);
        const scale = Math.min(scaleX, scaleY) * 0.95;
        
        const offsetX = (600 - (maxX - minX) * scale) / 2;
        const offsetY = (300 - (maxY - minY) * scale) / 2;
        
        // Générer tous les pays
        this.countriesData.features.forEach((feature, index) => {
            if (!feature.geometry) return;
            
            try {
                const pathData = this.geometryToPath(feature.geometry, scale, minX, minY, offsetX, offsetY);
                
                const isHighlighted = feature.properties.NAME === highlightedCountry.name || 
                                    feature.properties.NAME_EN === highlightedCountry.name ||
                                    feature.properties.ADMIN === highlightedCountry.name;
                
                if (isHighlighted) {
                    console.log('🎯 Found matching country:', feature.properties);
                }
                
                if (isHighlighted) {
                    // Pays en surbrillance
                    highlightedPath += `
                        <path d="${pathData}" 
                              class="highlighted-country" 
                              fill="#00ffff" 
                              stroke="#ffffff" 
                              stroke-width="2"
                              filter="url(#countryGlow)"/>
                    `;
                } else {
                    // Autres pays
                    worldPaths += `
                        <path d="${pathData}" 
                              class="world-country" 
                              fill="#333" 
                              stroke="#555" 
                              stroke-width="0.5"
                              opacity="0.7"/>
                    `;
                }
            } catch (err) {
                // Ignorer les erreurs sur des pays individuels
                if (index < 5) console.log(`⚠️ Erreur pays ${feature.properties?.NAME}:`, err.message);
            }
        });
        
        return `
            <!-- Définitions des effets -->
            <defs>
                <filter id="countryGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
                <pattern id="worldGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#222" stroke-width="0.5" opacity="0.3"/>
                </pattern>
            </defs>
            
            <!-- Fond -->
            <rect width="600" height="300" fill="#0a0a0a"/>
            <rect width="600" height="300" fill="url(#worldGrid)"/>
            
            <!-- Océans (optionnel) -->
            <rect width="600" height="300" fill="#001122" opacity="0.3"/>
            
            <!-- Tous les pays du monde -->
            ${worldPaths}
            
            <!-- Pays en surbrillance -->
            ${highlightedPath}
            
            <!-- Bordure -->
            <rect width="600" height="300" fill="none" stroke="#00ffff" stroke-width="1"/>
            
            <!-- Nom du pays -->
            <text x="300" y="25" text-anchor="middle" fill="#00ffff" font-size="14" font-family="Orbitron, monospace">
                ${highlightedCountry.name}
            </text>
        `;
    }

    // Calculer les bounds du monde entier
    calculateWorldBounds() {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        this.countriesData.features.forEach(feature => {
            if (feature.geometry) {
                const bounds = this.calculateBounds(feature.geometry);
                minX = Math.min(minX, bounds.minX);
                minY = Math.min(minY, bounds.minY);
                maxX = Math.max(maxX, bounds.maxX);
                maxY = Math.max(maxY, bounds.maxY);
            }
        });
        
        return { minX, minY, maxX, maxY };
    }

    // Convertir une géométrie en path SVG avec projection
    geometryToPath(geometry, scale, worldMinX, worldMinY, offsetX, offsetY) {
        if (!geometry) return '';
        
        if (geometry.type === 'Polygon') {
            return this.polygonToWorldPath(geometry.coordinates[0], scale, worldMinX, worldMinY, offsetX, offsetY);
        } else if (geometry.type === 'MultiPolygon') {
            return geometry.coordinates
                .map(polygon => this.polygonToWorldPath(polygon[0], scale, worldMinX, worldMinY, offsetX, offsetY))
                .join(' ');
        }
        
        return '';
    }

    // Convertir un polygone en path avec projection mondiale
    polygonToWorldPath(coordinates, scale, worldMinX, worldMinY, offsetX, offsetY) {
        if (!coordinates || coordinates.length === 0) return '';
        
        return coordinates.map((coord, index) => {
            const x = (coord[0] - worldMinX) * scale + offsetX;
            const y = 300 - ((coord[1] - worldMinY) * scale + offsetY); // Inverser Y pour SVG (0 en haut)
            return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
        }).join(' ') + ' Z';
    }

    // Génération SVG de fallback avec carte du monde simplifiée
    generateFallbackCountrySVG(countryData) {
        const flag = countryData.fallbackIcon || '🗺️';
        const countryName = countryData.name || 'Pays inconnu';
        
        // Obtenir la position approximative du pays sur une carte du monde
        const countryPosition = this.getCountryPosition(countryName);
        
        return `
            <!-- Fond avec grille -->
            <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#333" stroke-width="0.5"/>
                </pattern>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <rect width="600" height="300" fill="#0a0a0a"/>
            <rect width="600" height="300" fill="url(#grid)" opacity="0.2"/>
            
            <!-- Contour principal -->
            <rect width="600" height="300" fill="none" stroke="#00ffff" stroke-width="1"/>
            
            <!-- Carte du monde simplifiée -->
            ${this.generateSimplifiedWorldMap()}
            
            <!-- Position du pays avec animation -->
            <circle cx="${countryPosition.x}" cy="${countryPosition.y}" r="8" fill="none" stroke="#00ffff" stroke-width="2" filter="url(#glow)">
                <animate attributeName="r" values="8;12;8" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="${countryPosition.x}" cy="${countryPosition.y}" r="4" fill="#00ffff" opacity="0.8">
                <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            
            <!-- Drapeau du pays -->
            <text x="${countryPosition.x}" y="${countryPosition.y - 20}" text-anchor="middle" font-size="20" fill="#00ffff">${flag}</text>
            
            <!-- Nom du pays -->
            <text x="300" y="280" text-anchor="middle" font-size="14" fill="#00ffff" font-family="Orbitron, monospace">${countryName}</text>
            
            <!-- Lignes de connexion -->
            <line x1="${countryPosition.x}" y1="${countryPosition.y}" x2="300" y2="265" stroke="#00ffff" stroke-width="1" opacity="0.5" stroke-dasharray="2,2">
                <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite"/>
            </line>
        `;
    }

    // Générer une carte du monde simplifiée
    generateSimplifiedWorldMap() {
        return `
            <!-- Continents simplifiés -->
            <!-- Amérique du Nord -->
            <path d="M 50 80 Q 80 70 120 90 L 140 120 Q 130 140 100 130 Q 70 120 50 100 Z" fill="#333" stroke="#555" stroke-width="0.5"/>
            
            <!-- Amérique du Sud -->
            <path d="M 100 140 Q 120 160 110 200 Q 100 220 90 210 Q 80 180 85 160 Q 90 145 100 140 Z" fill="#333" stroke="#555" stroke-width="0.5"/>
            
            <!-- Europe -->
            <path d="M 280 70 Q 320 65 340 80 Q 330 100 310 95 Q 290 90 280 80 Z" fill="#333" stroke="#555" stroke-width="0.5"/>
            
            <!-- Afrique -->
            <path d="M 290 100 Q 330 95 340 130 Q 350 170 330 190 Q 310 185 290 175 Q 285 140 290 110 Z" fill="#333" stroke="#555" stroke-width="0.5"/>
            
            <!-- Asie -->
            <path d="M 350 60 Q 420 55 480 70 Q 500 90 490 110 Q 460 105 430 100 Q 380 95 350 80 Z" fill="#333" stroke="#555" stroke-width="0.5"/>
            
            <!-- Océanie -->
            <path d="M 480 160 Q 520 155 530 170 Q 525 180 510 175 Q 490 170 480 165 Z" fill="#333" stroke="#555" stroke-width="0.5"/>
            
            <!-- Groenland -->
            <path d="M 180 30 Q 200 25 210 40 Q 205 50 190 45 Q 175 40 180 35 Z" fill="#333" stroke="#555" stroke-width="0.5"/>
        `;
    }

    // Obtenir la position approximative d'un pays sur la carte
    getCountryPosition(countryName) {
        const positions = {
            // Europe
            'France': { x: 300, y: 85 },
            'Germany': { x: 320, y: 80 },
            'United Kingdom': { x: 290, y: 75 },
            'Italy': { x: 315, y: 90 },
            'Spain': { x: 285, y: 95 },
            'Czech Republic': { x: 325, y: 82 },
            
            // Amérique du Nord
            'United States': { x: 100, y: 100 },
            'Canada': { x: 90, y: 70 },
            
            // Amérique du Sud
            'Brazil': { x: 110, y: 170 },
            
            // Asie
            'China': { x: 450, y: 85 },
            'Russia': { x: 420, y: 65 },
            'Japan': { x: 480, y: 90 },
            'India': { x: 400, y: 110 },
            'Nepal': { x: 410, y: 105 },
            'Iran': { x: 380, y: 95 },
            'Syria': { x: 365, y: 90 },
            'Turkey': { x: 355, y: 85 },
            'Israel': { x: 360, y: 95 },
            'Palestine': { x: 360, y: 96 },
            
            // Afrique
            'Egypt': { x: 345, y: 105 },
            'South Africa': { x: 320, y: 185 },
            'Cameroon': { x: 310, y: 135 },
            'Gabon': { x: 305, y: 140 },
            
            // Europe de l'Est
            'Ukraine': { x: 345, y: 78 },
            
            // Océanie
            'Australia': { x: 510, y: 170 }
        };
        
        return positions[countryName] || { x: 300, y: 150 }; // Position par défaut au centre
    }

    calculateBounds(geometry) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        const processCoordinates = (coords) => {
            if (Array.isArray(coords[0])) {
                coords.forEach(processCoordinates);
            } else {
                const [x, y] = coords;
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        };
        
        if (geometry.type === 'Polygon') {
            geometry.coordinates.forEach(processCoordinates);
        } else if (geometry.type === 'MultiPolygon') {
            geometry.coordinates.forEach(polygon => {
                polygon.forEach(processCoordinates);
            });
        }
        
        return { minX, minY, maxX, maxY };
    }

    polygonToPath(coordinates, scale, centerX, centerY) {
        if (!coordinates || coordinates.length === 0) return '';
        
        return coordinates.map((coord, index) => {
            const x = (coord[0] - centerX) * scale + 300;
            const y = (centerY - coord[1]) * scale + 150; // Inverser Y pour SVG
            return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
        }).join(' ') + ' Z';
    }
}

// Instance globale avec initialisation complète
window.geoDataManager = new GeoDataManager();

// Initialisation avec tentative de chargement Natural Earth
console.log('🌍 Initialisation du gestionnaire géographique...');
window.geoDataManager.init().catch(error => {
    console.log('⚠️ Chargement Natural Earth échoué, mode fallback activé');
});

// Fonction de retry pour s'assurer que la détection s'applique
let retryCount = 0;
const maxRetries = 5;

function ensureCountryDetection() {
    retryCount++;
    console.log(`🔄 Tentative ${retryCount}/${maxRetries} d'application de la détection...`);
    
    if (window.geoDataManager && window.geoDataManager.initialized) {
        const summaryElements = document.querySelectorAll('.summary-text, .summary-section .summary-text');
        console.log(`📝 Éléments trouvés: ${summaryElements.length}`);
        
        let applied = false;
        summaryElements.forEach(element => {
            if (element.textContent && !element.hasAttribute('data-countries-highlighted')) {
                console.log(`🎯 Application sur: ${element.textContent.substring(0, 50)}...`);
                window.geoDataManager.highlightCountriesInElement(element);
                applied = true;
            }
        });
        
        if (applied) {
            console.log('✅ Détection appliquée avec succès');
            return true;
        }
    }
    
    if (retryCount < maxRetries) {
        setTimeout(ensureCountryDetection, 1000);
    } else {
        console.log('❌ Échec après toutes les tentatives');
    }
    return false;
}

// Démarrer le processus de retry
setTimeout(ensureCountryDetection, 500);

// ================================================================
// GESTIONNAIRE DE CONTENU AVEC LAZY LOADING
// ================================================================
const ContentManager = {
    cache: new Map(),
    maxCacheSize: 50,
    
    // Données intégrées pour site statique
    staticData: {
        'daily-2025-10-08': {
            date: "2025-10-08",
            title: "Actualités du 8 octobre 2025",
            stability_score: 450,
            stability_justification: "Ce score reflète un équilibre précaire entre les progrès diplomatiques (cessez-le-feu Israël-Hamas) et les tensions systémiques (guerre Ukraine-Russie, shutdown américain, défis économiques des BRICS face au dollar). Les conflits armés, les risques nucléaires et les crises politiques maintiennent le monde dans une zone de volatilité modérée, à mi-chemin entre le chaos et la prospérité.",
            summary: "Le 8 octobre 2025 marque une journée charnière avec un cessez-le-feu fragile entre Israël et le Hamas négocié par Trump en Égypte, tandis que la guerre Ukraine-Russie s'enlise avec des frappes de drones massives et des menaces nucléaires. Aux États-Unis, le shutdown gouvernemental paralyse le pays pendant que Trump négocie avec Xi Jinping face à un BRICS élargi défiant l'hégémonie du dollar.",
            full_summary: "1. DIPLOMATIE FRAGILE AU MOYEN-ORIENT\n\nIsraël et le Hamas ont conclu la première phase d'un accord de cessez-le-feu le 8 octobre 2025, négocié par les États-Unis, l'Égypte, le Qatar et la Turquie à Charm el-Cheikh. Cet accord prévoit un retrait partiel des troupes israéliennes de Gaza, l'échange de 48 otages israéliens contre des prisonniers palestiniens, et l'entrée d'aide humanitaire. Trump a salué un 'succès diplomatique majeur', mais des questions persistent sur le désarmement du Hamas et la gouvernance future de Gaza.\n\n2. GUERRE UKRAINE-RUSSIE : ESCALADE HYBRIDE\n\nLa guerre s'enlise avec des gains russes limités (environ 3 500 km² en 2025). L'Ukraine a mené des frappes de drones massives contre des installations russes, causant 714 millions $ de dommages et mettant 40% de la capacité de raffinage hors ligne. La Russie menace sur le nucléaire avec la suspension de l'accord PMDA, tandis que des drones russes survolent l'Europe (Belgique, Allemagne).\n\n3. ÉTATS-UNIS : SHUTDOWN ET ISOLATIONNISME\n\nLe shutdown gouvernemental entre dans sa 8e journée, paralysant les opérations fédérales. Trump accentue son 'America First' avec des tarifs record et négocie directement avec Xi Jinping, remettant en question l'ordre multilatéral établi depuis 1945.\n\n4. DÉFI DES BRICS À L'HÉGÉMONIE OCCIDENTALE\n\nLe BRICS élargi (10 membres) défie le système financier occidental avec l'or à plus de 4 000$ l'once et Bitcoin à plus de 125 000$. L'initiative remet en question la domination du dollar dans les échanges internationaux, créant une alternative géopolitique majeure.",
            content: "Analyse géopolitique complète du 8 octobre 2025 montrant un monde multipolaire en transition, entre diplomatie fragile et tensions systémiques.",
            sections: [
                {
                    type: "geopolitical",
                    title: "Situation Géopolitique",
                    content: "Le monde du 8 octobre 2025 se caractérise par une multipolarité croissante et des tensions géopolitiques intenses, avec des avancées diplomatiques fragiles au Moyen-Orient contrebalancées par l'enlisement du conflit ukrainien et les défis économiques mondiaux."
                }
            ],
            events: [],
            isLoading: false
        },
        'daily-2025-10-09': {
            date: "2025-10-09",
            title: "Actualités du 9 octobre 2025",
            stability_score: 475,
            stability_justification: "Légère amélioration grâce à la confirmation du cessez-le-feu israélo-palestinien et aux signaux de désescalade diplomatique. Cependant, l'instabilité persiste avec les tensions Ukraine-Russie, les défis économiques américains et les rivalités géopolitiques. Le score reste dans la zone de volatilité modérée.",
            summary: "Le 9 octobre 2025 confirme le cessez-le-feu israélo-palestinien avec l'approbation du cabinet Netanyahu, apportant un espoir fragile de stabilisation au Moyen-Orient. La diplomatie internationale s'active pour consolider cet accord tandis que les autres foyers de tension mondiale persistent.",
            full_summary: "Suite des développements du 8 octobre avec la consolidation diplomatique au Moyen-Orient et les efforts internationaux pour stabiliser la région.",
            content: "Confirmation des accords diplomatiques et efforts de stabilisation régionale.",
            sections: [
                {
                    type: "geopolitical",
                    title: "Consolidation Diplomatique",
                    content: "Les efforts diplomatiques se concentrent sur la consolidation du cessez-le-feu israélo-palestinien et la recherche de solutions durables aux conflits régionaux."
                }
            ],
            events: [],
            isLoading: false
        },
        'daily-2025-10-10': {
            date: "2025-10-10",
            title: "Actualités du 10 octobre 2025",
            stability_score: 455,
            stability_justification: "Score légèrement amélioré reflétant l'entrée en vigueur du cessez-le-feu Israël-Hamas et les premiers signes de retour à la normale à Gaza, mais tempéré par la chute des marchés mondiaux due aux menaces tarifaires de Trump, les tensions persistantes (Yémen, Syrie) et les protestations anti-austérité en Europe. Le monde reste dans une zone de volatilité modérée avec des progrès diplomatiques fragiles contrebalancés par l'instabilité économique et géopolitique.",
            summary: "Le 10 octobre 2025 marque un tournant historique au Moyen-Orient avec l'entrée en vigueur de la première phase d'un accord de cessez-le-feu entre Israël et le Hamas, négocié sous l'égide du président américain Donald Trump : des milliers de Palestiniens rentrent dans leurs foyers dévastés à Gaza tandis que des otages israéliens doivent être libérés dès la semaine prochaine contre plus d'un millier de prisonniers palestiniens, sous les applaudissements mondiaux de leaders comme Emmanuel Macron et Keir Starmer, bien que des doutes persistent sur la reconstruction d'un système de santé gazouin au bord de l'effondrement selon l'OMS. Sur le front économique, les marchés mondiaux chutent face aux nouvelles menaces de tarifs douaniers de Trump contre la Chine, l'or dépassant les 4 000 dollars l'once et les indices boursiers comme le Dow Jones reculant de 0,5 %, tandis que le Nobel de la paix attribué à l'opposante vénézuélienne María Corina Machado pour sa défense des droits démocratiques suscite des critiques de la Maison Blanche qualifiant le choix de trop \"politique\". À l'international, des tensions persistent avec des frappes israéliennes récentes au Yémen et en Syrie, des protestations anti-austérité en France et au Népal, et une recrudescence de violences contre les chrétiens au Nigeria, alors que la Journée mondiale de la santé mentale rappelle l'urgence d'un accès équitable aux soins dans un monde fracturé par les conflits et les inégalités climatiques.",
            full_summary: "AFRIQUE\n\nLe 10 octobre 2025, l'Afrique fait face à une confluence de défis sécuritaires, économiques et humanitaires, exacerbés par les conflits persistants et les impacts climatiques. Au Soudan, la crise humanitaire à El Fasher s'aggrave avec des avancées des Forces de soutien rapide contre les forces gouvernementales, menaçant une catastrophe imminente pour des centaines de milliers de déplacés, selon l'ONU, qui appelle à une prévention proactive des conflits plutôt qu'à des solutions militaires. En Éthiopie, plus de 100 000 enfants souffrent de malnutrition aiguë sévère traitée entre juillet et août, tandis qu'Erythrée rejette les accusations éthiopiennes de préparation à la guerre comme une \"provocation\", ravivant les tensions dans la Corne de l'Afrique. Au Nigeria, les qualifications pour la Coupe du Monde 2026 voient les Super Eagles préparer un match crucial contre le Lesotho, au milieu d'une pauvreté touchant 139 millions de personnes d'après la Banque mondiale. En Afrique du Sud, la mort de l'ambassadeur Nathi Mthethwa à Paris suscite un deuil national avec des funérailles officielles, tandis que Joburg Water boycotte une réunion sur la crise hydrique à Johannesburg, frustrant les communautés locales. Économiquement, l'Afrique subsaharienne maintient une croissance résiliente à 3,8 % pour 2025, mais le chômage reste un urgence, avec un appel à des réformes pour créer des emplois de qualité via le tourisme et d'autres secteurs, selon le rapport \"Africa's Pulse\" de la Banque mondiale. La RDC commence à bâtir des réserves d'or face à la flambée des prix, et l'Égypte voit des négociations indirectes pour un cessez-le-feu à Gaza, avec l'OMS insistant sur la reconstruction du système de santé. Enfin, les qualifications FIFA pour 2026 s'intensifient, avec le Sénégal et la Côte d'Ivoire proches de la qualification, illustrant un rare moment d'unité continentale à travers le sport.\n\nAMÉRIQUES\n\nDans les Amériques, le 10 octobre 2025 est marqué par une polarisation politique accrue aux États-Unis, où le shutdown gouvernemental entre dans sa deuxième semaine, causant des retards massifs aux aéroports comme Denver et Newark en raison d'un manque de contrôleurs aériens, avec des sondages CBS indiquant que 39 % des Américains blâment Trump et les républicains. Le président Trump annonce des poursuites judiciaires contre l'ancien directeur du FBI James Comey et l'avocate générale de New York Letitia James pour fraude hypothécaire, intensifiant sa \"guerre contre la gauche\", tandis que des troupes de la Garde nationale sont déployées près de Chicago pour des opérations anti-immigration, risquant des pénuries alimentaires dues à un choc d'approvisionnement en main-d'œuvre agricole, selon le Département du Travail. Au Venezuela, l'opposante María Corina Machado reçoit le Nobel de la Paix pour sa défense des droits démocratiques, un choix critiqué par la Maison Blanche comme \"trop politique\", au milieu de la libération de six otages américains suite à des négociations avec Nicolás Maduro. Au Mexique et au Canada, les nouveaux tarifs douaniers de 25 % imposés par Trump sur les importations entrent en vigueur, provoquant des représailles potentielles et une chute des marchés boursiers, avec le Dow Jones en recul de 0,5 %. Au Brésil, le sommet COP30 approche, tandis qu'en Argentine, le peso se renforce suite à des mesures du Trésor américain. Globalement, les Amériques naviguent entre tensions commerciales et avancées diplomatiques, avec l'or dépassant les 4 000 dollars l'once comme refuge face à l'incertitude.\n\nASIE\n\nL'Asie du 10 octobre 2025 est secouée par des catastrophes naturelles et des tensions géopolitiques, sur fond de dynamisme économique inégal. Aux Philippines, un séisme de magnitude 7,4 frappe le sud de Mindanao, tuant huit personnes et blessant plus de 352, aggravant les vulnérabilités dans un archipel déjà marqué par des tremblements de terre récents comme celui de Cebu en septembre. En Chine, le typhon Matmo touche terre dans le Guangdong, avec des pluies torrentielles jusqu'à 30 cm attendues, menaçant d'inondations massives dans le Guangxi, tandis que les exportations textiles se réorientent vers l'Europe pour contourner les tarifs trumpiens de 20 % sur les biens chinois, inondant l'Asie du Sud-Est de produits bon marché et provoquant des pertes d'emplois locales. Au Japon, le typhon Halong fait une victime à Oiso et force l'évacuation de centaines de personnes dans les îles Izu, coïncidant avec l'élection présidentielle du Parti libéral-démocrate qui peine à rassurer sur le yen affaibli. En Inde, l'OMS intervient face à une épidémie de sirop pour la toux toxique au Madhya Pradesh, avec au moins 20 morts, et la Banque mondiale prévoit un ralentissement de la croissance sud-asiatique à 6,6 % malgré un potentiel via le commerce et la technologie. Au Pakistan, 11 soldats et 19 talibans pakistanais périssent dans une embuscade à Orakzai. Économiquement, l'Indonésie injecte 12 milliards de dollars pour booster la croissance à 6 %, tandis que le bitcoin dépasse 123 000 dollars, porté par les flux ETF et l'accumulation des baleines. L'Asie, pivot géostratégique, voit aussi des avancées comme la cumbia en Amérique latine influençant la culture pop, mais les risques climatiques et commerciaux dominent.\n\nEUROPE\n\nL'Europe du 10 octobre 2025 est en ébullition sociale et politique, avec des grèves massives perturbant les transports et des élections remodelant les coalitions. En France, une grève des contrôleurs aériens du 7 au 10 octobre cause des annulations en cascade, affectant des centaines de milliers de passagers, tandis que des manifestations anti-austérité rassemblent des foules, avec plus de 250 arrestations et 80 000 forces de l'ordre déployées contre les coupes budgétaires du gouvernement Bayrou, rendant le \"modèle social européen\" – santé, éducation, retraites – de plus en plus inabordable selon le Washington Post. En République tchèque, le parti populiste ANO d'Andrej Babiš remporte 35 % des élections législatives mais sans majorité, entamant des négociations avec l'extrême droite, tandis qu'en Pologne, l'armée abat des drones russes pour la première fois depuis le début de la guerre en Ukraine, signalant une escalade. Au Royaume-Uni, le Premier ministre Keir Starmer applaudit l'accord de cessez-le-feu Israël-Hamas comme un \"soulagement mondial\", et en Allemagne, un tribunal condamne à perpétuité un Syrien pour le massacre de Solingen en 2024. Des drones non identifiés survolent les infrastructures critiques en République tchèque, Allemagne et Belgique, alimentant les craintes d'ingérence russe. Économiquement, les obligations françaises grimpent face à l'évitement d'élections anticipées, mais les rendements à 10 ans atteignent 3,529 %, reflétant l'instabilité. L'UE pousse pour un \"Acte d'innovation\" et des réformes postales, tandis que le Vatican nomme la première archevêque de Cantorbéry féminine. L'Europe, berceau de la Journée mondiale de la santé mentale, lutte contre les inégalités croissantes et les menaces hybrides.\n\nOCÉANIE\n\nEn Océanie, le 10 octobre 2025 est relativement calme, focalisé sur des événements culturels et environnementaux au milieu des échos mondiaux. En Australie, la Première ministre célèbre l'accord de cessez-le-feu à Gaza comme un pas vers la paix, tandis que le brise-glace RSV Nuyina appareille de Tasmanie pour une mission de 52 jours en Antarctique avec 99 scientifiques, marquant le début de la saison australe. Des retards de vols dus au shutdown américain affectent les liaisons transpacifiques, et le scandale du cancer de la peau – le plus élevé au monde – suscite un backlash contre les protections insuffisantes. En Nouvelle-Zélande, le festival de matchmaking de Lisdoonvarna inspire des événements locaux, et les qualifications pour le Championnat d'Australie 2025 captivent les fans de sport. Économiquement, la région prépare la Gala Ceremony Asie-Océanie à Hong Kong le 13 octobre pour booster le tourisme singapourien. Globalement, l'Océanie observe les tensions mondiales comme les tarifs trumpiens impactant ses exportations, mais priorise la résilience climatique et culturelle.\n\nANTARCTIQUE\n\nL'Antarctique, bien que inhabité, domine les gros titres scientifiques le 10 octobre 2025 avec des découvertes alarmantes sur le changement climatique. Des scientifiques internationaux révèlent des suintements de méthane sous-marins dans la mer de Ross, émettant un gaz à effet de serre 25 fois plus puissant que le CO2, potentiellement libéré par la fonte des glaces et menaçant d'accélérer le réchauffement global, selon une étude utilisant des drones et des plongeurs à des profondeurs de 5 à 240 mètres. La glace de mer atteint son troisième pic hivernal le plus bas en 47 ans de relevés satellites, à 17,81 millions de km² le 17 septembre, bien en deçà des moyennes historiques, lié à l'océan plus chaud érodant la couverture glaciaire. Un astéroïde de la taille d'une petite voiture, 2025 TF, frôle l'atmosphère à 428 km au-dessus du continent le 1er octobre, détecté après coup par l'ESA, soulignant les vulnérabilités planétaires. La campagne de soutien scientifique 2024-25 de l'US Air National Guard s'achève avec neuf évacuations médicales via des LC-130, et le brise-glace japonais Shirase ravitaille à Fremantle. Une carte détaillée du sous-sol glaciaire (Bedmap3) est publiée, aidant à prédire la montée des eaux, tandis qu'un réchauffement stratosphérique soudain en septembre élève les températures de 30°C. Ces événements rappellent l'urgence de la coopération internationale pour protéger ce bastion climatique.",
            content: "Analyse géopolitique du 10 octobre 2025 : cessez-le-feu historique à Gaza, tensions économiques mondiales et catastrophes naturelles en Asie.",
            sections: [
                {
                    type: "geopolitical",
                    title: "Tournant Historique au Moyen-Orient",
                    content: "L'entrée en vigueur du cessez-le-feu Israël-Hamas marque un tournant diplomatique majeur, avec le retour des Palestiniens à Gaza et la préparation de l'échange d'otages, bien que des défis subsistent pour la reconstruction."
                }
            ],
            events: [],
            isLoading: false
        },
        'daily-2025-10-11': {
            date: "2025-10-11",
            title: "Actualités du 11 octobre 2025",
            stability_score: 442,
            stability_justification: "Aujourd'hui, le score de stabilité mondiale s'établit à 442 / 1000. Justification : Malgré des signes positifs comme le fragile cessez-le-feu à Gaza et l'attribution du Nobel de la Paix à María Corina Machado au Venezuela, les menaces de Trump sur des tarifs douaniers massifs contre la Chine, la poursuite du shutdown gouvernemental américain avec ses impacts économiques croissants, et le défilé nord-coréen dévoilant un nouveau missile ICBM ont accentué les tensions commerciales et militaires, entraînant une légère détérioration par rapport à hier.",
            summary: "Le 11 octobre 2025, le monde géopolitique a bougé sur plusieurs fronts : aux États-Unis, le président Trump a menacé d'imposer 100 % de tarifs douaniers sur les importations chinoises dès le 1er novembre, en riposte aux restrictions de Pékin sur les métaux rares, ce qui a fait chuter les marchés boursiers mondiaux et ravivé les craintes d'une guerre commerciale ; en parallèle, le shutdown du gouvernement fédéral américain entre dans sa deuxième semaine, entraînant des milliers de licenciements de fonctionnaires et des pertes économiques estimées à 110 milliards de dollars. Au Moyen-Orient, un fragile cessez-le-feu entre Israël et le Hamas est entré en vigueur à Gaza, avec le début du retrait des troupes israéliennes, l'arrivée d'aide humanitaire et l'échange imminent d'otages contre prisonniers palestiniens, tandis que des frappes aériennes israéliennes ont visé des sites du Hezbollah au Liban, tuant un civil. En Corée du Nord, un défilé militaire a dévoilé un nouveau missile balistique intercontinental capable de frapper les États-Unis, sous les yeux d'officiels chinois et russes, signalant une escalade des tensions en Asie. Enfin, le Prix Nobel de la Paix a été décerné à l'opposante vénézuélienne María Corina Machado pour sa lutte pour la démocratie, et une explosion tragique dans une usine d'explosifs au Tennessee a fait plusieurs morts et 18 disparus. Ces événements soulignent un monde plus fragmenté, entre espoirs de paix et risques de conflits.",
            full_summary: "AFRIQUE\n\nLe 11 octobre 2025, l'Afrique fait face à une persistance des conflits armés et des défis sécuritaires, malgré une croissance économique prévue comme la deuxième plus rapide au monde. Au Nigeria, les groupes ISWAP et Boko Haram ont intensifié leurs embuscades contre les bases militaires dans l'État de Borno, avec plus de 20 attaques depuis le début de l'année, entraînant pillages d'équipements et déplacements massifs vers le Cameroun. Au Soudan, les affrontements entre les Forces armées soudanaises (SAF) et les Forces de soutien rapide (RSF) ont culminé en septembre avec la prise de Bara par les SAF, un nœud stratégique reliant Darfour à Khartoum, aggravant la crise humanitaire dans le Kordofan du Nord. Au Mali, un embargo sur le carburant imposé par les juntes militaires a provoqué des pénuries aiguës dans des régions comme Kayes et Bamako, avec des hausses de prix fulgurantes et des patrouilles renforcées contre les militants. Sur le plan diplomatique, l'Union européenne a promis 11,5 milliards d'euros d'investissements en Afrique du Sud pour l'énergie propre et les infrastructures, tandis que la Guinée a inculpé 60 personnes pour émeutes mortelles dans une mine d'or. Ces tensions soulignent une frustration sociale croissante due à la pauvreté, au changement climatique et à une gouvernance faible, malgré des élections récentes comme celle au Mozambique qui a plongé le pays dans le chaos.\n\nASIE\n\nEn Asie, les tensions géopolitiques s'intensifient autour de la compétition sino-américaine et des instabilités internes. En Corée du Nord, un défilé militaire le 11 octobre a révélé un nouveau missile balistique intercontinental (ICBM) capable d'atteindre les États-Unis, en présence d'officiels chinois et russes, signalant une escalade des alliances anti-occidentales et ravivant les craintes d'une course aux armements. Au Japon, la nouvelle Première ministre conservatrice Sanae Takaichi, issue d'un gouvernement d'opposition fragile après la chute de la coalition LDP-Komeito, doit naviguer entre les visites à Yasukuni, les relations avec la Corée du Sud et un accord tarifaire coercitif de 550 milliards de dollars avec les États-Unis, risquant de polariser la région. En Chine, le quatrième plénum du Parti communiste (prévu pour fin octobre) prépare un renouvellement massif du Comité central et le plan quinquennal 2026-2030, tandis que Pékin accélère la construction de réserves pétrolières (169 millions de barils supplémentaires d'ici 2026) face aux vulnérabilités d'approvisionnement liées à la Russie et à l'Iran. Au Pakistan, l'armée a éliminé 30 militants impliqués dans une attaque tuant 11 soldats, et en Indonésie, le ministre des Finances anticipe une croissance de 6 % grâce à une injection de liquidités de 12 milliards de dollars. La mer de Chine méridionale reste un point chaud avec des confrontations non militaires accrues, tandis que l'Australie inverse sa politique pour maintenir l'usage du charbon, impactant la transition énergétique régionale.\n\nEUROPE\n\nL'Europe est marquée par des incertitudes fiscales et électorales qui redessinent son paysage politique au 11 octobre 2025. En Allemagne, après l'effondrement de la coalition d'Olaf Scholz en novembre 2024, les élections de février ont porté les conservateurs CDU/CSU au pouvoir, mais sans majorité absolue, forçant une nouvelle coalition qui peine à stabiliser l'économie de la plus grande puissance européenne face à la fragmentation commerciale mondiale. En France, une crise politique s'aggrave avec la démission d'un autre Premier ministre, tandis que le sommet sur l'IA les 10-11 février vise à contrer les inégalités technologiques, mais des tensions budgétaires persistent. Au Royaume-Uni, des préoccupations sur la sécurité européenne émergent avec des incidents soulignant la dérive Est-Ouest, et l'UE renégocie ses accords commerciaux avec le Mexique et le Chili pour diversifier ses partenaires face aux tarifs trumpiens. En Norvège, les partis de centre-gauche conservent le pouvoir après les élections de septembre, mais l'expiration du mandat du Forum de gouvernance d'Internet fin 2025 pousse à un renouvellement sous l'égide de l'ONU. Globalement, l'Europe fait face à une vulnérabilité accrue aux cyberattaques sur son infrastructure énergétique et à des risques de polarisation, avec une croissance du PIB de la zone euro révisée à la hausse pour le deuxième trimestre, mais freinée par la perte d'accès au gaz russe bon marché.\n\nAMÉRIQUES\n\nAux Amériques, les États-Unis dominent l'actualité géopolitique le 11 octobre 2025 avec un shutdown gouvernemental entrant dans sa deuxième semaine, causant des milliers de licenciements temporaires et des pertes économiques estimées à 110 milliards de dollars, exacerbant les divisions internes sous l'administration Trump. Le président menace d'imposer 100 % de tarifs douaniers sur les importations chinoises dès le 1er novembre en réponse aux restrictions de Pékin sur les métaux rares, provoquant une chute des bourses mondiales et une redirection des flux commerciaux (Chine vers l'Europe +6 %, Mexique/Canada +25 %). Au Venezuela, l'opposante María Corina Machado reçoit le Prix Nobel de la Paix pour sa lutte pour la démocratie, au milieu d'une strife politique persistante et d'un risque d'invasion du Guyana jugé faible mais latent. Au Canada, la démission de Justin Trudeau en janvier a conduit à l'élection de Mark Carney comme leader libéral, avec des élections fédérales prévues d'ici le 20 octobre, centrées sur l'inflation, l'immigration et les craintes d'une guerre commerciale avec les États-Unis (tarifs potentiels de 25 % sur les exportations canadiennes). En Équateur, une foule de 500 manifestants a attaqué le cortège du président Daniel Noboa avec des pierres et possiblement des tirs, soulignant les tensions sur les infrastructures. Au Brésil, des manifestations Gen-Z éclatent au Pérou voisin, et au Chili, des élections générales sont prévues pour le 16 novembre. Ces événements illustrent une fragmentation accrue, avec des impacts sur la sécurité alimentaire et les chaînes d'approvisionnement.\n\nMOYEN-ORIENT\n\nLe Moyen-Orient connaît un tournant fragile le 11 octobre 2025, avec l'entrée en vigueur d'un cessez-le-feu entre Israël et le Hamas à Gaza, marquant la première phase d'un accord de paix deux ans après l'attaque du 7 octobre 2023 : retrait partiel des troupes israéliennes, arrivée d'aide humanitaire, et échange imminent d'otages contre prisonniers palestiniens (Israël libérera 11 membres du Hamas au lieu de Fatah). Donald Trump annonce une visite imminente (11 ou 12 octobre) pour sceller l'accord, qualifié de \"très proche\", potentiellement ouvrant une nouvelle ère de paix régionale. Cependant, des frappes israéliennes au Liban ont tué un civil en visant des sites du Hezbollah, et en septembre, une attaque sur le Yémen a éliminé le Premier ministre houthi et sept autres officiels, déclenchant une escalade avec des tirs de missiles sur Israël. En Syrie, des affrontements renouvelés opposent les forces gouvernementales aux Forces démocratiques syriennes (SDF) kurdes dans le nord, tandis que des négociations israélo-syriennes à Paris portent sur la désescalade. Au Liban, les opérations israéliennes s'étendent, et en Irak, des confrontations intra-kurdes les plus graves depuis 2003 précèdent des élections. Israël refuse les visas à des gymnastes israéliens en Indonésie en signe de protestation contre Gaza, et des manifestations en Israël n'ont pas altéré la politique de guerre. Ces développements, mêlant espoirs de trêve et risques d'escalade, redessinent potentiellement la carte du Levant, avec des implications pour la sécurité énergétique mondiale.\n\nOCÉANIE\n\nEn Océanie, les dynamiques géopolitiques sont marquées par une compétition croissante entre la Chine et les alliés occidentaux, bien que l'actualité du 11 octobre 2025 soit relativement calme. L'Australie, sous pression des tarifs américains, inverse sa politique énergétique pour prolonger l'usage du charbon au Queensland, impactant la transition verte et les relations avec les îles du Pacifique vulnérables au climat. La Chine continue ses avancées via le commerce et les infrastructures, érodant l'influence des États-Unis, de l'Australie et de la Nouvelle-Zélande : Huawei fait face à des interdictions sécuritaires, tandis que des pays comme Vanuatu et Samoa soutiennent ouvertement Pékin, risquant une polarisation régionale. Lors du Forum des îles du Pacifique en septembre, les îles ont exclu les États-Unis et la Chine pour se concentrer sur des enjeux locaux comme Taïwan et la géopolitique. L'Australie renforce ses liens avec l'Inde et le Japon via des visites présidentielles, et le parlement australien reprend ses sessions avec des débats sur l'IA et les alliances. Ces tensions soulignent le rôle stratégique de l'Océanie dans la chaîne d'approvisionnement mondiale et la sécurité maritime, avec des risques de division si la rivalité sino-américaine s'intensifie.",
            content: "Analyse géopolitique du 11 octobre 2025 : tensions commerciales sino-américaines, shutdown gouvernemental, cessez-le-feu fragile à Gaza et escalade militaire nord-coréenne.",
            sections: [
                {
                    type: "geopolitical",
                    title: "Tensions Commerciales et Militaires",
                    content: "Les menaces tarifaires de Trump contre la Chine (100%), le shutdown américain et le nouveau missile ICBM nord-coréen créent un environnement de tensions accrues, contrebalancées par le fragile cessez-le-feu à Gaza et le Nobel de la Paix à María Corina Machado."
                }
            ],
            events: [],
            isLoading: false
        },
        'daily-2025-10-12': {
            date: "2025-10-12",
            title: "Actualités du 12 octobre 2025",
            stability_score: 440,
            stability_justification: "Les élections au Cameroun (où Paul Biya, 92 ans, brigue un huitième mandat dans un climat de tensions sécuritaires persistantes) et au Gabon (consolidation post-coup d'État) ajoutent une légère incertitude en Afrique, tandis que le shutdown budgétaire partiel aux États-Unis pèse sur l'économie globale sans escalade majeure. Au Moyen-Orient, la trêve fragile à Gaza tient bon malgré des incidents internes, et les tensions US-Chine s'apaisent avec des signaux diplomatiques positifs de Trump. Globalement, les conflits chroniques (Ukraine, Soudan) stagnent sans flambée, et le commerce international reste robuste malgré les politiques protectionnistes – pas de dérapage notable, mais une vigilance accrue sur les risques climatiques et cyber. Si de nouveaux événements émergent, cela pourrait évoluer rapidement !",
            summary: "En Afrique, l'élection présidentielle au Cameroun voit Paul Biya, au pouvoir depuis 42 ans, favori pour un septième mandat dans un contexte tendu par les crises anglophone et sécuritaire, tandis qu'au Gabon, Brice Oligui Nguema consolide son autorité post-coup d'État de 2023. Au Moyen-Orient, un fragile accord de trêve à Gaza prévoit l'échange de 48 otages contre 250 prisonniers palestiniens, mais des violences internes éclatent avec des attaques du Hamas contre des clans rivaux, soulignant l'instabilité persistante, et Israël intercepte une flottille humanitaire en octobre, arrêtant des militants dont Greta Thunberg. En Europe et Asie, les élections législatives en République tchèque donnent la pluralité à Andrej Babiš sans majorité claire, fragilisant la coalition pro-UE, et au Népal, la Première ministre Sushila Karki affronte des manifestations Gen Z contre la corruption. Globalement, un shutdown budgétaire partiel aux États-Unis accentue la crise budgétaire, la Russie fait face à des pénuries de carburant dues aux sanctions, et Zelensky espère que le plan Trump pour Gaza inspire une pression accrue sur Poutine pour l'Ukraine.",
            content: "Analyse géopolitique du 12 octobre 2025 : élections africaines tendues, trêve fragile à Gaza avec incidents internes, instabilité politique en Europe et Asie, shutdown américain persistant.",
            sections: [
                {
                    type: "geopolitical",
                    title: "Instabilité Politique Globale",
                    content: "Le 12 octobre 2025 révèle une instabilité politique généralisée avec des élections tendues en Afrique, une trêve fragile au Moyen-Orient, des coalitions fragilisées en Europe, et un shutdown persistant aux États-Unis, créant un environnement géopolitique incertain mais sans escalade majeure."
                }
            ],
            events: [],
            isLoading: false
        }
    },
    
    init() {
        console.log('Content Manager initialise avec données statiques');
    },
    
    async loadContent(type, identifier) {
        const cacheKey = `${type}-${identifier}`;
        
        // Vérifier le cache d'abord
        if (this.cache.has(cacheKey)) {
            console.log(`Contenu ${cacheKey} chargé depuis le cache`);
            return this.cache.get(cacheKey);
        }
        
        // Charger depuis les données statiques
        const content = this.getStaticContent(type, identifier);
        if (content) {
            this.cache.set(cacheKey, content);
            console.log(`Contenu ${cacheKey} chargé depuis les données statiques`);
            return content;
        }
        
        // Fallback si pas trouvé
        console.warn(`Contenu ${cacheKey} non trouvé, utilisation fallback`);
        return this.getFallbackContent(type, identifier);
    },
    
    getStaticContent(type, identifier) {
        const key = `${type}-${identifier}`;
        console.log(`Recherche de la clé: ${key}`);
        console.log('Clés disponibles:', Object.keys(this.staticData));
        const content = this.staticData[key] || null;
        console.log('Contenu trouvé:', content ? 'Oui' : 'Non');
        return content;
    },
    

    
    getFallbackContent(type, identifier) {
        const fallbacks = {
            daily: {
                date: identifier,
                title: `Actualités du ${this.formatDate(identifier)}`,
                stability_score: 500,
                stability_justification: "Score de stabilité non disponible pour cette date.",
                summary: "Les actualités de cette date ne sont pas encore disponibles. Veuillez consulter les dates disponibles dans le calendrier.",
                full_summary: "Contenu détaillé non disponible pour cette date.",
                content: "Contenu en cours de préparation.",
                sections: [
                    {
                        type: "geopolitical",
                        title: "Situation Géopolitique",
                        content: "Analyse géopolitique non disponible pour cette date."
                    }
                ],
                events: [],
                isLoading: false
            },
            topic: {
                title: "Analyse Thématique",
                content: "Contenu thématique non disponible.",
                isLoading: false
            },
            event: {
                title: "Événement Historique",
                content: "Détails de l'événement non disponibles.",
                date: identifier,
                isLoading: false
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
        return {
            items: this.cache.size,
            staticDataItems: Object.keys(this.staticData).length,
            maxItems: this.maxCacheSize
        };
    },
    
    // Méthode pour lister les dates disponibles
    getAvailableDates() {
        const dates = [];
        for (const key in this.staticData) {
            if (key.startsWith('daily-')) {
                const date = key.replace('daily-', '');
                dates.push(date);
            }
        }
        return dates.sort();
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
    previousNewsHash: null,
    isLoading: false,
    hasError: false,
    refreshTimer: null,
    shuffleTimer: null,
    isFirstLoad: true,
    
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
            
            const newNews = data.items
                .slice(0, CONFIG.rss.maxNews)
                .map(item => this.cleanHtmlTags(item.title))
                .filter(title => title.length > 5);
            
            // Vérifier s'il y a de nouvelles actualités
            this.checkForNewsChanges(newNews);
            
            this.currentNews = newNews;
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

    // Générer un hash simple du contenu des actualités pour détecter les changements
    generateNewsHash(newsArray) {
        return newsArray.join('|').split('').reduce((hash, char) => {
            const chr = char.charCodeAt(0);
            hash = ((hash << 5) - hash) + chr;
            return hash & hash; // Convertir en 32bit integer
        }, 0);
    },

    // Vérifier si les actualités ont changé et jouer le jingle si nécessaire
    checkForNewsChanges(newNews) {
        const newHash = this.generateNewsHash(newNews);
        
        // Ne pas jouer le jingle au premier chargement
        if (!this.isFirstLoad && this.previousNewsHash !== null && this.previousNewsHash !== newHash) {
            console.log('🔔 Nouvelles actualités détectées, jingle déclenché');
            AudioManager.playNewsJingle();
        }
        
        this.previousNewsHash = newHash;
        this.isFirstLoad = false;
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
            
            // Le GeoDataManager est déjà initialisé plus haut avec mode fallback
            console.log('🌍 GeoDataManager déjà initialisé, tentative de détection...');
            setTimeout(() => {
                if (window.geoDataManager?.initialized) {
                    window.geoDataManager.highlightCountriesInExistingText();
                }
            }, 300);
            
            // Forcer l'ouverture de l'accordéon du graphique
            this.ensureChartAccordionOpen();
            
            // Initialiser le graphique avec un délai pour s'assurer que le DOM est prêt
            setTimeout(() => {
                console.log('🚀 Initialisation différée du graphique...');
                StabilityChartManager.init();
            }, 500);
            
            // Pas de simulation - mise à jour uniquement avec de nouvelles données
            
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
    },
    
    startStabilitySimulation() {
        // Simulation de fluctuations de stabilité toutes les 20 secondes
        setInterval(() => {
            // Sélectionner une date au hasard
            const dateIndex = Math.floor(Math.random() * StabilityChartManager.data.length);
            const dataPoint = StabilityChartManager.data[dateIndex];
            
            if (dataPoint) {
                // Récupérer le score de base depuis les données statiques
                const dateStr = `2025-10-${dataPoint.date.split('/')[0]}`;
                const content = ContentManager.getStaticContent('daily', dateStr);
                const baseScore = content ? content.stabilityScore : dataPoint.score;
                
                // Simuler une fluctuation réaliste
                const fluctuation = (Math.random() - 0.5) * 40; // ±20 points
                const newScore = Math.max(200, Math.min(800, baseScore + fluctuation));
                
                // Mettre à jour le graphique
                StabilityChartManager.updateScore(dataPoint.date, Math.round(newScore));
                
                console.log(`📊 Stabilité simulée: ${dataPoint.date} → ${Math.round(newScore)}`);
            }
        }, 20000);
        
        console.log('🔄 Simulation de stabilité activée (mise à jour toutes les 20s)');
    },
    
    ensureChartAccordionOpen() {
        console.log('📂 Vérification de l\'ouverture de l\'accordéon...');
        
        const accordionButton = document.getElementById('chart-accordion-btn');
        const accordionContent = document.getElementById('chart-accordion-content');
        
        if (accordionButton && accordionContent) {
            accordionButton.classList.add('active');
            accordionContent.classList.add('active');
            console.log('✅ Accordéon forcé ouvert');
        } else {
            console.error('❌ Éléments accordéon non trouvés');
        }
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
        
        // Force supplémentaire d'initialisation GeoDataManager si pas initialisé
        setTimeout(() => {
            if (!window.geoDataManager?.initialized) {
                console.log('🔄 Force initialisation GeoDataManager...');
                window.geoDataManager.initializeFallbackCountries();
                setTimeout(() => {
                    window.geoDataManager.highlightCountriesInExistingText();
                }, 200);
            }
        }, 1000);
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
    newsJingle: null,
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
            
            // Jingle d'actualités
            this.newsJingle = new Audio('sounds/news_jingle.wav');
            this.newsJingle.volume = 0.5;
            this.newsJingle.preload = 'auto';
            
            console.log('Sons modales et jingle actualites precharges');
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
        // Toggle modal sounds and news jingle with main audio
        this.modalSoundsEnabled = this.isPlaying;
        console.log(`Sons effets ${this.modalSoundsEnabled ? 'activés' : 'désactivés'} avec audio principal`);
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
    
    // Méthode pour jouer le jingle d'actualités
    playNewsJingle() {
        // Vérifier si les sons sont activés (respecter le bouton audio-control)
        if (this.modalSoundsEnabled && this.newsJingle) {
            try {
                // Réinitialiser le son au début s'il était déjà joué
                this.newsJingle.currentTime = 0;
                this.newsJingle.play().catch(error => {
                    console.warn('Erreur lecture jingle actualites:', error);
                });
                console.log('🔔 Jingle actualites joue');
            } catch (error) {
                console.warn('Erreur jingle actualites:', error);
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
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        console.log('Modale credits fermee');
    } else {
        console.error('Modale credits non trouvee');
    }
}

// ================================================================
// MODALE DONNÉES PÉTROLIÈRES
// ================================================================

function openOilDataModal() {
    const modal = document.getElementById('oil-data-modal');
    if (modal) {
        AudioManager.playModalOpen();
        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('🛢️ Modale données pétrolières ouverte');
    } else {
        console.error('Modale données pétrolières non trouvée');
    }
}

function closeOilDataModal() {
    const modal = document.getElementById('oil-data-modal');
    if (modal) {
        AudioManager.playModalClose();
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        console.log('🛢️ Modale données pétrolières fermée');
    } else {
        console.error('Modale données pétrolières non trouvée');
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

    // Event listener pour la modale données pétrolières
    const oilDataModal = document.getElementById('oil-data-modal');
    if (oilDataModal) {
        oilDataModal.addEventListener('click', (event) => {
            if (event.target === oilDataModal) {
                closeOilDataModal();
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
        
        // Marquer la date précédemment sélectionnée
        if (this.selectedDate && date.toDateString() === this.selectedDate.toDateString()) {
            dayElement.classList.add('selected');
        }
        
        // Ajouter la pastille de score de stabilité si la date a des données
        this.addStabilityIndicator(dayElement, date);
        
        // Gestion du clic
        dayElement.addEventListener('click', () => {
            this.selectDate(date);
        });
        
        grid.appendChild(dayElement);
    },
    
    addStabilityIndicator(dayElement, date) {
        // Format de la date pour chercher dans les données statiques
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        // Vérifier si on a des données pour cette date
        const content = ContentManager.getStaticContent('daily', dateStr);
        if (content && content.stability_score) {
            const indicator = document.createElement('div');
            indicator.className = 'stability-indicator';
            
            // Déterminer la couleur basée sur le score
            const color = this.getStabilityColor(content.stability_score);
            indicator.style.backgroundColor = color;
            
            dayElement.appendChild(indicator);
        }
    },
    
    getStabilityColor(score) {
        if (score < 100) return '#ff0000'; // Rouge vif (0-100)
        if (score < 200) return '#ff4400'; // Rouge-orange (100-200)
        if (score < 300) return '#ff8800'; // Orange (200-300)
        if (score < 400) return '#ffaa00'; // Orange-jaune (300-400)
        if (score < 500) return '#ffdd00'; // Jaune (400-500)
        if (score < 600) return '#ddff00'; // Jaune-vert (500-600)
        if (score < 700) return '#88ff00'; // Vert-jaune (600-700)
        if (score < 800) return '#44ff00'; // Vert (700-800)
        if (score < 900) return '#00ff44'; // Vert vif (800-900)
        return '#808000'; // Vert olive (900-1000)
    },
    
    selectDate(date) {
        // Supprimer la sélection précédente
        document.querySelectorAll('.calendar-day.selected').forEach(day => {
            day.classList.remove('selected');
        });
        
        // Marquer la nouvelle sélection
        event.target.classList.add('selected');
        this.selectedDate = date;
        
        // Charger le contenu de la date sélectionnée (éviter les problèmes de fuseau horaire)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`; // Format YYYY-MM-DD
        this.loadDateContent(dateStr);
        
        // Fermer le calendrier silencieusement après sélection (pas de son pour éviter collision)
        setTimeout(() => {
            closeCalendarSilent();
        }, 500);
    },
    
    async loadDateContent(dateStr) {
        try {
            console.log(`Chargement du contenu pour ${dateStr}`);
            const content = await ContentManager.loadContent('daily', dateStr);
            console.log('Contenu trouvé:', content);
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
        
        // Restaurer le mois de la date sélectionnée si elle existe
        if (CalendarManager.selectedDate) {
            CalendarManager.currentDate = new Date(CalendarManager.selectedDate.getFullYear(), CalendarManager.selectedDate.getMonth(), 1);
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        CalendarManager.generateCalendar();
        console.log('Calendrier ouvert');
    }
}

function closeCalendar() {
    const modal = document.getElementById('calendar-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        console.log('Calendrier ferme');
    }
}

function closeCalendarSilent() {
    const modal = document.getElementById('calendar-modal');
    if (modal) {
        // Fermeture silencieuse sans son
        modal.classList.remove('active');
        // Ne pas restaurer le scroll car on va ouvrir une autre modale
        console.log('Calendrier ferme silencieusement');
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
        const oilDataModal = document.getElementById('oil-data-modal');
        
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
        } else if (oilDataModal && oilDataModal.classList.contains('active')) {
            closeOilDataModal();
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
        // Réduire l'espacement entre paragraphes : un seul <br> au lieu de deux
        fullSummary.innerHTML = fullText.replace(/\n/g, '<br>');
    }
    
    // Appliquer la détection des pays après avoir rempli les textes
    setTimeout(() => {
        if (window.geoDataManager && window.geoDataManager.initialized) {
            if (summaryText) {
                // Supprimer l'attribut de traitement pour forcer la re-détection
                summaryText.removeAttribute('data-countries-highlighted');
                window.geoDataManager.highlightCountriesInElement(summaryText);
            }
            if (fullSummary) {
                // Supprimer l'attribut de traitement pour forcer la re-détection
                fullSummary.removeAttribute('data-countries-highlighted');
                window.geoDataManager.highlightCountriesInElement(fullSummary);
            }
            console.log('🌍 Détection des pays appliquée au contenu quotidien');
        } else {
            console.log('⚠️ GeoDataManager pas encore initialisé, nouvelle tentative...');
            // Réessayer après un délai plus long
            setTimeout(() => {
                if (window.geoDataManager && window.geoDataManager.initialized) {
                    if (summaryText) summaryText.removeAttribute('data-countries-highlighted');
                    if (fullSummary) fullSummary.removeAttribute('data-countries-highlighted');
                    if (summaryText) window.geoDataManager.highlightCountriesInElement(summaryText);
                    if (fullSummary) window.geoDataManager.highlightCountriesInElement(fullSummary);
                    console.log('🌍 Détection des pays appliquée au contenu quotidien (2e tentative)');
                }
            }, 500);
        }
    }, 100);
    
    // Réinitialiser l'accordéon
    resetAccordion();
    
    // Ouvrir la modale (sans son car déjà dans le contexte calendrier)
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    console.log('Modale contenu quotidien ouverte');
}

function closeDailyContent() {
    const modal = document.getElementById('daily-content-modal');
    if (modal) {
        modal.classList.remove('active');
        hideStabilityTooltip();
        
        // Rouvrir le calendrier après un court délai pour une transition fluide
        // Ne pas restaurer le scroll du body car on va rouvrir une modale
        setTimeout(() => {
            openCalendar();
        }, 200);
        
        console.log('Modale contenu quotidien fermée, retour au calendrier');
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
        // Ne pas modifier body overflow car la modale parent le gère déjà
    }
}

function hideStabilityTooltip() {
    const tooltip = document.getElementById('stability-tooltip');
    const overlay = document.getElementById('tooltip-overlay');
    if (tooltip && overlay) {
        tooltip.classList.remove('visible');
        overlay.classList.remove('visible');
        // Ne pas modifier body overflow - la modale parent gère le scroll
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

// ================================================================
// GESTIONNAIRE GRAPHIQUE STABILITÉ
// ================================================================

function toggleChartAccordion() {
    console.log('🔄 Toggle accordéon graphique...');
    
    const button = document.getElementById('chart-accordion-btn');
    const content = document.getElementById('chart-accordion-content');
    
    if (!button || !content) {
        console.error('❌ Éléments accordéon non trouvés');
        return;
    }
    
    if (button.classList.contains('active')) {
        // Fermer l'accordéon
        console.log('📁 Fermeture accordéon');
        button.classList.remove('active');
        content.classList.remove('active');
    } else {
        // Ouvrir l'accordéon
        console.log('📂 Ouverture accordéon');
        button.classList.add('active');
        content.classList.add('active');
        
        // Redessiner le graphique au cas où (avec la bonne méthode)
        setTimeout(() => {
            if (StabilityChartManager && StabilityChartManager.renderSVGChart) {
                StabilityChartManager.renderSVGChart();
            }
        }, 300);
    }
}

const StabilityChartManager = {
    data: [],
    container: null,
    
    init() {
        console.log('🎯 Stability Chart Manager - Initialisation SVG...');
        this.container = document.getElementById('stability-chart-svg');
        
        if (!this.container) {
            console.error('❌ Container #stability-chart-svg introuvable !');
            return;
        }
        
        console.log('✅ Container SVG trouvé');
        this.loadStabilityData();
        this.updateFooter();
    },
    

    
    loadStabilityData() {
        console.log('📊 Chargement des données de stabilité...');
        
        // Récupérer les vraies données de stabilité avec fallback robuste
        const dates = ['2025-10-08', '2025-10-09', '2025-10-10', '2025-10-11', '2025-10-12'];
        this.data = dates.map((dateStr, index) => {
            const content = ContentManager.getStaticContent('daily', dateStr);
            let score = 450 + index * 25; // Fallback par défaut
            
            if (content && content.stability_score) {
                score = content.stability_score;
                console.log(`✅ Score réel trouvé pour ${dateStr}: ${score}`);
            } else {
                console.log(`⚠️ Score fallback pour ${dateStr}: ${score}`);
            }
            
            const displayDate = `${dateStr.split('-')[2]}/${dateStr.split('-')[1]}`;
            return {
                date: displayDate,
                score: score,
                timestamp: new Date().getTime()
            };
        });
        
        console.log('📊 Données finales chargées:', this.data);
        
        console.log('📋 Données chargées:', this.data);
        this.renderSVGChart();
    },
    
    renderSVGChart() {
        console.log('🎨 Rendu du graphique SVG...');
        
        if (!this.container || this.data.length === 0) {
            console.error('❌ Container ou données manquants');
            return;
        }
        
        const width = 760;
        const height = 250;
        const padding = { top: 20, right: 40, bottom: 40, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        
        // Créer le SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'stability-chart-svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        
        // Grille et axes
        this.createGrid(svg, padding, chartWidth, chartHeight);
        
        // Courbe et points
        this.createCurve(svg, padding, chartWidth, chartHeight);
        this.createPoints(svg, padding, chartWidth, chartHeight);
        
        // Labels
        this.createLabels(svg, padding, chartWidth, chartHeight);
        
        // Remplacer le contenu
        this.container.innerHTML = '';
        this.container.appendChild(svg);
        
        console.log('✅ Graphique SVG rendu');
    },
    
    createGrid(svg, padding, chartWidth, chartHeight) {
        // Lignes de grille horizontales - 5 divisions
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + chartHeight - (i / 4) * chartHeight;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('class', 'chart-grid-line');
            line.setAttribute('x1', padding.left);
            line.setAttribute('y1', y);
            line.setAttribute('x2', padding.left + chartWidth);
            line.setAttribute('y2', y);
            svg.appendChild(line);
        }
        
        // Axes principaux
        const axisY = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        axisY.setAttribute('class', 'chart-axis');
        axisY.setAttribute('x1', padding.left);
        axisY.setAttribute('y1', padding.top);
        axisY.setAttribute('x2', padding.left);
        axisY.setAttribute('y2', padding.top + chartHeight);
        svg.appendChild(axisY);
        
        const axisX = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        axisX.setAttribute('class', 'chart-axis');
        axisX.setAttribute('x1', padding.left);
        axisX.setAttribute('y1', padding.top + chartHeight);
        axisX.setAttribute('x2', padding.left + chartWidth);
        axisX.setAttribute('y2', padding.top + chartHeight);
        svg.appendChild(axisX);
    },
    
    createCurve(svg, padding, chartWidth, chartHeight) {
        if (this.data.length < 2) return;
        
        // Calculer les valeurs min/max pour une meilleure échelle
        const scores = this.data.map(d => d.score);
        const minScore = Math.min(...scores);
        const maxScore = Math.max(...scores);
        
        // Ajouter une marge pour éviter les limites
        const margin = (maxScore - minScore) * 0.1 || 50;
        const scaleMin = Math.max(0, minScore - margin);
        const scaleMax = Math.min(1000, maxScore + margin);
        const scaleRange = scaleMax - scaleMin;
        
        let pathData = '';
        this.data.forEach((point, index) => {
            const x = padding.left + (index / (this.data.length - 1)) * chartWidth;
            const normalizedScore = (point.score - scaleMin) / scaleRange;
            const y = padding.top + chartHeight - (normalizedScore * chartHeight);
            
            if (index === 0) {
                pathData += `M ${x} ${y}`;
            } else {
                pathData += ` L ${x} ${y}`;
            }
        });
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'chart-curve');
        path.setAttribute('d', pathData);
        svg.appendChild(path);
        

    },
    
    createPoints(svg, padding, chartWidth, chartHeight) {
        // Nettoyer les tooltips existantes pour éviter l'accumulation
        const existingTooltips = document.querySelectorAll('.chart-tooltip-advanced');
        existingTooltips.forEach(t => t.remove());
        
        // Utiliser la même échelle que pour la courbe
        const scores = this.data.map(d => d.score);
        const minScore = Math.min(...scores);
        const maxScore = Math.max(...scores);
        const margin = (maxScore - minScore) * 0.1 || 50;
        const scaleMin = Math.max(0, minScore - margin);
        const scaleMax = Math.min(1000, maxScore + margin);
        const scaleRange = scaleMax - scaleMin;
        
        this.data.forEach((point, index) => {
            const x = padding.left + (index / (this.data.length - 1)) * chartWidth;
            const normalizedScore = (point.score - scaleMin) / scaleRange;
            const y = padding.top + chartHeight - (normalizedScore * chartHeight);
            
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('class', 'chart-point');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', 4);
            circle.setAttribute('data-score', point.score);
            circle.setAttribute('data-date', point.date);
            
            // Tooltip avancé au survol
            circle.addEventListener('mouseenter', (e) => {
                // Nettoyer les tooltips existantes d'abord
                document.querySelectorAll('.chart-tooltip-advanced').forEach(t => t.remove());
                
                // Récupérer les données de contenu détaillé
                const dateStr = `2025-${point.date.split('/')[1]}-${point.date.split('/')[0]}`;
                const content = ContentManager.getStaticContent('daily', dateStr);
                const scoreColor = CalendarManager.getStabilityColor(point.score);
                
                const fullSummary = content && content.summary ? content.summary : 'Données non disponibles';
                const truncatedSummary = fullSummary.length > 200 ? fullSummary.substring(0, 200) + '...' : fullSummary;
                const needsExpansion = fullSummary.length > 200;
                
                const tooltip = document.createElement('div');
                tooltip.className = 'chart-tooltip-advanced';
                tooltip.style.cssText = `
                    position: fixed;
                    background: rgba(0, 0, 0, 0.95);
                    color: white;
                    padding: 15px;
                    border-radius: 8px;
                    font-size: 12px;
                    line-height: 1.4;
                    border: 1px solid #00ffff;
                    max-width: 350px;
                    z-index: 9999;
                    box-shadow: 0 4px 20px rgba(0,255,255,0.3);
                    pointer-events: auto;
                `;
                
                tooltip.innerHTML = `
                    <div style="border-bottom: 1px solid #00ffff; margin-bottom: 10px; padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <strong style="color: #00ffff; font-size: 14px;">${point.date}/2025</strong>
                        <span style="background: #000000; color: ${scoreColor}; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; font-family: 'Orbitron', monospace;">
                            ${point.score}/1000
                        </span>
                    </div>
                    <div style="color: #ddd; font-size: 11px;">
                        <div id="summary-text">${truncatedSummary}</div>
                        ${needsExpansion ? `
                            <div style="margin-top: 10px; text-align: center;">
                                <button id="expand-btn" style="
                                    background: linear-gradient(45deg, #00ffff, #0088cc);
                                    color: black;
                                    border: none;
                                    padding: 6px 15px;
                                    border-radius: 5px;
                                    font-size: 10px;
                                    cursor: pointer;
                                    transition: all 0.2s ease;
                                    font-weight: bold;
                                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" 
                                   onclick="
                                       const summaryText = this.parentNode.previousElementSibling;
                                       if (this.textContent.includes('Afficher plus')) {
                                           summaryText.innerHTML = \`${fullSummary.replace(/`/g, '\\`').replace(/'/g, "\\'")}\`;
                                           this.innerHTML = '📄 Afficher moins';
                                           this.parentNode.parentNode.parentNode.style.maxWidth = '500px';
                                           this.parentNode.parentNode.parentNode.style.maxHeight = '400px';
                                           this.parentNode.parentNode.parentNode.style.overflow = 'auto';
                                       } else {
                                           summaryText.innerHTML = \`${truncatedSummary.replace(/`/g, '\\`').replace(/'/g, "\\'")}\`;
                                           this.innerHTML = '📖 Afficher plus';
                                           this.parentNode.parentNode.parentNode.style.maxWidth = '350px';
                                           this.parentNode.parentNode.parentNode.style.maxHeight = 'auto';
                                           this.parentNode.parentNode.parentNode.style.overflow = 'visible';
                                       }
                                   ">📖 Afficher plus</button>
                            </div>
                        ` : ''}
                    </div>
                `;
                
                document.body.appendChild(tooltip);
                
                // Position initiale
                const updateTooltipPosition = (event) => {
                    tooltip.style.left = (event.clientX + 10) + 'px';
                    tooltip.style.top = (event.clientY - 30) + 'px';
                };
                
                updateTooltipPosition(e);
                
                let hideTimeout;
                
                // Fonction pour supprimer la tooltip avec délai
                const scheduleHide = () => {
                    hideTimeout = setTimeout(() => {
                        if (tooltip && tooltip.parentNode) {
                            tooltip.remove();
                        }
                    }, 300); // 300ms de délai
                };
                
                // Fonction pour annuler la suppression
                const cancelHide = () => {
                    if (hideTimeout) {
                        clearTimeout(hideTimeout);
                        hideTimeout = null;
                    }
                };
                
                // Gestion des événements sur le cercle
                circle.addEventListener('mousemove', updateTooltipPosition);
                circle.addEventListener('mouseleave', scheduleHide);
                
                // Gestion des événements sur la tooltip elle-même
                tooltip.addEventListener('mouseenter', cancelHide);
                tooltip.addEventListener('mouseleave', scheduleHide);
            });
            
            svg.appendChild(circle);
        });
    },
    
    createLabels(svg, padding, chartWidth, chartHeight) {
        // Utiliser la même échelle adaptée
        const scores = this.data.map(d => d.score);
        const minScore = Math.min(...scores);
        const maxScore = Math.max(...scores);
        const margin = (maxScore - minScore) * 0.1 || 50;
        const scaleMin = Math.max(0, minScore - margin);
        const scaleMax = Math.min(1000, maxScore + margin);
        const scaleRange = scaleMax - scaleMin;
        
        // Labels Y (scores) - 5 divisions
        for (let i = 0; i <= 4; i++) {
            const score = scaleMin + (i / 4) * scaleRange;
            const y = padding.top + chartHeight - (i / 4) * chartHeight;
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('class', 'chart-label');
            text.setAttribute('x', padding.left - 10);
            text.setAttribute('y', y + 4);
            text.setAttribute('text-anchor', 'end');
            text.textContent = Math.round(score);
            svg.appendChild(text);
        }
        
        // Labels X (dates)
        this.data.forEach((point, index) => {
            const x = padding.left + (index / (this.data.length - 1)) * chartWidth;
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('class', 'chart-label');
            text.setAttribute('x', x);
            text.setAttribute('y', padding.top + chartHeight + 20);
            text.textContent = point.date;
            svg.appendChild(text);
        });
    },
    
    updateFooter() {
        const lastUpdate = document.getElementById('last-update');
        const trendIndicator = document.getElementById('trend-indicator');
        
        if (lastUpdate) {
            lastUpdate.textContent = new Date().toLocaleTimeString();
        }
        
        if (trendIndicator && this.data.length >= 2) {
            const trend = this.calculateTrend();
            trendIndicator.textContent = trend.text;
            trendIndicator.className = trend.class;
        }
    },
    
    calculateTrend() {
        if (this.data.length < 2) return { text: '--', class: '' };
        
        const firstScore = this.data[0].score;
        const lastScore = this.data[this.data.length - 1].score;
        const diff = lastScore - firstScore;
        
        if (Math.abs(diff) < 10) {
            return { text: 'Stable', class: 'stable' };
        } else if (diff > 0) {
            return { text: `+${diff} ↗`, class: 'positive' };
        } else {
            return { text: `${diff} ↘`, class: 'negative' };
        }
    },
    
    // Méthode pour mettre à jour avec de nouvelles données
    updateScore(date, newScore) {
        const dataPoint = this.data.find(d => d.date === date);
        if (dataPoint) {
            dataPoint.score = newScore;
            dataPoint.timestamp = new Date().getTime();
            this.renderSVGChart();
            this.updateFooter();
            console.log(`📊 Score mis à jour: ${date} → ${newScore}`);
        }
    },
    
    // Méthode pour ajouter une nouvelle journée
    addNewDay(date, score) {
        this.data.push({
            date: date,
            score: score,
            timestamp: new Date().getTime()
        });
        this.renderSVGChart();
        this.updateFooter();
        console.log(`📅 Nouvelle journée ajoutée: ${date} → ${score}`);
    },
    
    startAutoUpdate() {
        // Mise à jour toutes les 5 secondes
        setInterval(() => {
            this.loadStabilityData();
        }, 5000);
    },
    
    drawChart() {
        console.log('🎨 Début du dessin du graphique...');
        
        if (!this.canvas || !this.ctx) {
            console.error('❌ Canvas ou contexte manquant');
            return;
        }
        
        if (this.data.length === 0) {
            console.error('❌ Aucune donnée à afficher');
            return;
        }
        
        console.log('📊 Données à dessiner:', this.data);
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        console.log('📐 Dimensions canvas:', width, 'x', height);
        
        // Effacer le canvas (garde le carré rouge pour le moment)
        // this.ctx.clearRect(0, 0, width, height);
        
        // Configuration
        const padding = 60;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        // Échelles
        const minScore = 0;
        const maxScore = 1000;
        const scoreRange = maxScore - minScore;
        
        // Style
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = '12px Roboto';
        this.ctx.lineWidth = 2;
        
        console.log('🎯 Début du dessin des éléments...');
        
        // Test simple : dessiner un rectangle bleu
        this.ctx.fillStyle = '#0000ff';
        this.ctx.fillRect(100, 100, 100, 50);
        console.log('🔵 Rectangle bleu de test dessiné');
        
        // Dessiner les axes
        try {
            this.drawAxes(this.ctx, padding, chartWidth, chartHeight, minScore, maxScore);
            console.log('📏 Axes dessinés');
        } catch (e) {
            console.error('❌ Erreur axes:', e);
        }
        
        // Dessiner la courbe
        try {
            this.drawCurve(this.ctx, padding, chartWidth, chartHeight, minScore, scoreRange);
            console.log('📈 Courbe dessinée');
        } catch (e) {
            console.error('❌ Erreur courbe:', e);
        }
        
        // Dessiner les points
        try {
            this.drawPoints(this.ctx, padding, chartWidth, chartHeight, minScore, scoreRange);
            console.log('🔴 Points dessinés');
        } catch (e) {
            console.error('❌ Erreur points:', e);
        }
        
        // Afficher les valeurs actuelles
        try {
            this.drawCurrentValues(this.ctx, padding, chartWidth, chartHeight);
            console.log('📊 Valeurs actuelles affichées');
        } catch (e) {
            console.error('❌ Erreur valeurs:', e);
        }
        
        console.log('✅ Graphique terminé');
    },
    
    drawAxes(ctx, padding, chartWidth, chartHeight, minScore, maxScore) {
        // Axe Y (scores)
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, padding + chartHeight);
        ctx.stroke();
        
        // Axe X (dates)
        ctx.beginPath();
        ctx.moveTo(padding, padding + chartHeight);
        ctx.lineTo(padding + chartWidth, padding + chartHeight);
        ctx.stroke();
        
        // Graduations Y (tous les 100 points)
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Roboto';
        for (let score = minScore; score <= maxScore; score += 100) {
            const y = padding + chartHeight - (score / 1000) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(padding - 5, y);
            ctx.lineTo(padding, y);
            ctx.strokeStyle = '#666666';
            ctx.stroke();
            ctx.fillText(score.toString(), padding - 30, y + 3);
        }
        
        // Labels des dates
        this.data.forEach((point, index) => {
            const x = padding + (index / (this.data.length - 1)) * chartWidth;
            ctx.fillText(point.date, x - 15, padding + chartHeight + 20);
        });
        
        // Titre des axes
        ctx.fillStyle = '#00ffff';
        ctx.font = '12px Roboto';
        ctx.fillText('Score de Stabilité', 10, 20);
        ctx.fillText('Octobre 2025', padding + chartWidth / 2 - 30, padding + chartHeight + 40);
    },
    
    drawCurrentValues(ctx, padding, chartWidth, chartHeight) {
        // Afficher les valeurs actuelles en temps réel
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Roboto';
        
        const currentDate = new Date().toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit' 
        });
        
        const currentData = this.data.find(d => d.date === currentDate);
        if (currentData) {
            ctx.fillStyle = this.getScoreColor(currentData.score);
            ctx.fillText(`ACTUEL: ${currentData.score}`, padding + chartWidth - 100, 25);
        }
        
        // Dernière mise à jour
        ctx.fillStyle = '#888888';
        ctx.font = '10px Roboto';
        const now = new Date();
        ctx.fillText(`Mis à jour: ${now.toLocaleTimeString()}`, padding, padding + chartHeight + 60);
    },
    
    getScoreColor(score) {
        if (score >= 600) return '#00ff00'; // Vert - Stable
        if (score >= 400) return '#ffff00'; // Jaune - Modéré
        if (score >= 200) return '#ff8800'; // Orange - Instable
        return '#ff0000'; // Rouge - Critique
    },
    
    // Méthode pour mettre à jour un score spécifique
    updateScore(date, newScore) {
        const dataPoint = this.data.find(d => d.date === date);
        if (dataPoint) {
            dataPoint.score = newScore;
            dataPoint.timestamp = new Date().getTime();
            this.drawChart();
            console.log(`Score mis à jour pour ${date}: ${newScore}`);
        }
    },
    
    drawCurve(ctx, padding, chartWidth, chartHeight, minScore, scoreRange) {
        if (this.data.length < 2) return;
        
        ctx.beginPath();
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        
        this.data.forEach((point, index) => {
            const x = padding + (index / (this.data.length - 1)) * chartWidth;
            const y = padding + chartHeight - ((point.score - minScore) / scoreRange) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    },
    
    drawPoints(ctx, padding, chartWidth, chartHeight, minScore, scoreRange) {
        this.data.forEach((point, index) => {
            const x = padding + (index / (this.data.length - 1)) * chartWidth;
            const y = padding + chartHeight - ((point.score - minScore) / scoreRange) * chartHeight;
            
            // Point
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#00ffff';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Score au-dessus du point
            ctx.fillStyle = '#ffffff';
            ctx.font = '11px Roboto';
            ctx.fillText(point.score.toString(), x - 10, y - 10);
        });
    }
};

function drawStabilityChart() {
    StabilityChartManager.drawChart();
}

// ================================================================
// FONCTIONS POPUP CARTOGRAPHIQUE
// ================================================================
let countryMapPopup = null;

window.showCountryMap = function(countryName) {
    console.log('🗺️ showCountryMap appelée pour:', countryName);
    
    if (!window.geoDataManager || !window.geoDataManager.initialized) {
        console.log('❌ GeoDataManager non initialisé');
        return;
    }
    
    window.hideCountryMap(); // Fermer popup existante
    
    const countryData = window.geoDataManager.getCountryData(countryName);
    console.log('🔍 Données pays trouvées:', countryData ? countryData.name : 'Aucune');
    
    if (!countryData) {
        console.log('❌ Pas de données pour ce pays');
        return;
    }
    
    // Créer la popup
    console.log('🎨 Création de la popup...');
    countryMapPopup = document.createElement('div');
    countryMapPopup.className = 'country-map-popup';
    
    // Générer le SVG (ou version simplifiée si ça échoue)
    let svgContent = '';
    try {
        svgContent = window.geoDataManager.generateCountrySVG(countryData);
        console.log('✅ SVG généré avec données:', countryData.geometry ? 'géométrie complète' : 'mode fallback');
    } catch (error) {
        console.log('❌ Erreur génération SVG:', error);
        svgContent = window.geoDataManager.generateFallbackCountrySVG(countryData);
        console.log('🔄 Utilisation du SVG de fallback de secours');
    }
    
    countryMapPopup.innerHTML = `
        <h4>${countryData.name}</h4>
        <div class="country-map-container">
            <svg class="country-map-svg" viewBox="0 0 600 300">
                <rect width="600" height="300" fill="#0a0a0a"/>
                ${svgContent}
            </svg>
        </div>
        <div class="country-info">
            Nom EN: ${countryData.nameEn || countryData.name} | 
            Géométrie: ${countryData.geometry ? countryData.geometry.type : 'Non disponible'}
        </div>
    `;
    
    console.log('📍 Ajout au DOM...');
    // Positionnement dynamique
    document.addEventListener('mousemove', window.updateCountryMapPosition);
    document.body.appendChild(countryMapPopup);
    console.log('✅ Popup ajoutée au DOM');
    
    // Position initiale
    const event = window.event || { clientX: 300, clientY: 200 };
    window.updateCountryMapPosition(event);
    console.log('📍 Position initiale définie');
}

window.updateCountryMapPosition = function(event) {
    if (!countryMapPopup) return;
    
    const margin = 20;
    const popupRect = countryMapPopup.getBoundingClientRect();
    
    let x = event.clientX + margin;
    let y = event.clientY + margin;
    
    // Ajuster si la popup dépasse de l'écran
    if (x + popupRect.width > window.innerWidth) {
        x = event.clientX - popupRect.width - margin;
    }
    if (y + popupRect.height > window.innerHeight) {
        y = event.clientY - popupRect.height - margin;
    }
    
    countryMapPopup.style.left = Math.max(margin, x) + 'px';
    countryMapPopup.style.top = Math.max(margin, y) + 'px';
}

window.hideCountryMap = function() {
    if (countryMapPopup) {
        document.removeEventListener('mousemove', updateCountryMapPosition);
        countryMapPopup.remove();
        countryMapPopup = null;
    }
}

// Fonction pour nettoyer les éléments corrompus
window.cleanCorruptedHighlights = function() {
    console.log('🧹 Nettoyage des surbrillances corrompues...');
    
    // Supprimer tous les attributs de traitement
    const allElements = document.querySelectorAll('[data-countries-highlighted]');
    allElements.forEach(el => {
        el.removeAttribute('data-countries-highlighted');
    });
    
    // Supprimer toutes les surbrillances existantes et restaurer le texte original
    const corruptedElements = document.querySelectorAll('.summary-text, #daily-summary-text, #full-summary-text');
    corruptedElements.forEach(element => {
        // Extraire juste le texte brut et le remettre
        const cleanText = element.textContent;
        element.innerHTML = cleanText;
        console.log('🧹 Élément nettoyé:', cleanText.substring(0, 50));
    });
    
    console.log('✅ Nettoyage terminé. Relancez la détection avec window.geoDataManager.highlightCountriesInExistingText()');
};

// Fonction de test pour forcer la surbrillance (à utiliser dans la console)
window.testCountryHighlight = function() {
    console.log('🧪 Test manuel de surbrillance des pays');
    
    // Forcer la surbrillance sur tous les éléments de résumé
    const summaryElements = document.querySelectorAll('.summary-text, #daily-summary-text, #full-summary-text');
    console.log(`📝 Éléments trouvés pour le test:`, summaryElements.length);
    
    summaryElements.forEach((element, index) => {
        console.log(`🔍 Test élément ${index}:`, element.tagName, element.textContent?.substring(0, 50));
        
        // Injecter un test simple
        if (element.textContent && element.textContent.includes('Ukraine')) {
            const originalHTML = element.innerHTML;
            const newHTML = originalHTML.replace(/Ukraine/g, '<span class="country-highlight" style="background: red !important; color: yellow !important; padding: 5px !important;">Ukraine</span>');
            element.innerHTML = newHTML;
            console.log('✅ Test forcé sur Ukraine');
        }
    });
    
    // Vérifier les éléments créés
    const highlighted = document.querySelectorAll('.country-highlight');
    console.log(`🎯 Nombre d'éléments .country-highlight après test:`, highlighted.length);
};

// Fonction de test simple pour la popup
window.testCountryPopup = function() {
    console.log('🧪 Test popup simple...');
    
    const testPopup = document.createElement('div');
    testPopup.className = 'country-map-popup';
    testPopup.style.position = 'fixed';
    testPopup.style.top = '50px';
    testPopup.style.left = '50px';
    testPopup.style.zIndex = '10000';
    
    testPopup.innerHTML = `
        <h4>Test Pays</h4>
        <div class="country-map-container">
            <svg class="country-map-svg" viewBox="0 0 600 300">
                <rect width="600" height="300" fill="#0a0a0a"/>
                <text x="300" y="150" text-anchor="middle" fill="#00ffff">Test Carte</text>
            </svg>
        </div>
        <div class="country-info">
            Test popup cartographique
        </div>
    `;
    
    document.body.appendChild(testPopup);
    console.log('✅ Popup de test créée');
    
    // Auto-suppression après 3 secondes
    setTimeout(() => {
        testPopup.remove();
        console.log('🗑️ Popup de test supprimée');
    }, 3000);
};

// Fonction de diagnostic complète
window.debugGeoDataManager = function() {
    console.log('🔧 === DIAGNOSTIC GEODATAMANAGER ===');
    console.log('Initialized:', window.geoDataManager?.initialized);
    console.log('Countries loaded:', window.geoDataManager?.countryNames?.length);
    console.log('First countries:', window.geoDataManager?.countryNames?.slice(0, 3)?.map(c => c.name));
    
    // Tester la détection sur le résumé principal
    const mainSummary = document.querySelector('.summary-section .summary-text');
    if (mainSummary) {
        console.log('📄 Résumé principal trouvé:', mainSummary.textContent?.substring(0, 100));
        
        // Test de détection
        const detectedCountries = window.geoDataManager?.detectCountriesInText(mainSummary.textContent);
        console.log('🌍 Pays détectés:', detectedCountries?.map(c => c.name));
        
        // Forcer la surbrillance
        if (window.geoDataManager?.initialized) {
            mainSummary.removeAttribute('data-countries-highlighted');
            window.geoDataManager.highlightCountriesInElement(mainSummary);
            console.log('✅ Surbrillance forcée');
        }
    } else {
        console.log('❌ Résumé principal non trouvé');
    }
    
    // Forcer réinitialisation si nécessaire
    if (!window.geoDataManager?.initialized) {
        console.log('🔄 Réinitialisation forcée...');
        window.geoDataManager.initializeFallbackCountries();
        setTimeout(() => {
            window.geoDataManager.highlightCountriesInExistingText();
        }, 100);
    }
};

// Force application immédiate (à utiliser en dernier recours)
window.forceCountryDetection = function() {
    console.log('� FORCE APPLICATION DÉTECTION PAYS');
    if (!window.geoDataManager?.initialized) {
        window.geoDataManager.initializeFallbackCountries();
    }
    
    document.querySelectorAll('[data-countries-highlighted]').forEach(el => {
        el.removeAttribute('data-countries-highlighted');
    });
    
    window.geoDataManager.highlightCountriesInExistingText();
    console.log('✅ Force application terminée');
};

// Test spécifique de détection sur le texte donné
window.testDetectionOnText = function(text) {
    console.log('🧪 Test de détection sur:', text);
    if (window.geoDataManager?.initialized) {
        const detected = window.geoDataManager.detectCountriesInText(text);
        console.log('🌍 Pays détectés:', detected.map(c => c.name));
        return detected;
    }
    return [];
};

console.log('Script Dashboard France24 - Pret pour initialisation');
console.log('💡 Tapez "forceCountryDetection()" si les pays ne sont pas en surbrillance');
console.log('💡 Tapez "testDetectionOnText(\'texte à tester\')" pour tester la détection');
console.log('💡 Tapez "testCountryPopup()" pour tester la popup cartographique');