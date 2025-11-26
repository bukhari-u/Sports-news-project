// games.js - Enhanced with dynamic data from database + all existing features

class SportPageManager {
    constructor() {
        this.sport = this.getCurrentSport();
        this.currentUser = null;
        this.isLoading = false;
        this.cache = new Map();
        this.init();
    }

    getCurrentSport() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        return filename || 'football';
    }

    async init() {
        console.log(`Initializing ${this.sport} page manager`);
        await this.checkAuthStatus();
        this.setupEventListeners();
        await this.loadPageData();
        this.initSportsFollowFunctionality();
        
        // Setup existing UI features
        this.setupCardInteractions();
        this.setupLiveScoreUpdates();
        this.setupVideoPlayers();
        this.setupRightSidebar();
    }

    setupRightSidebar() {
        // Ensure right sidebar containers exist
        this.ensureRightSidebarContainers();
        
        // Load followed sports widget if user is logged in - with better timing
        if (this.currentUser) {
            // Wait for AllSportsApp to be fully initialized
            const initSportsWidget = () => {
                if (window.AllSportsApp && typeof window.AllSportsApp.createSportsFollowWidget === 'function') {
                    window.AllSportsApp.createSportsFollowWidget();
                } else {
                    // Retry after a short delay if not ready
                    setTimeout(initSportsWidget, 100);
                }
            };
            
            // Start the initialization check
            setTimeout(initSportsWidget, 500);
        }
    }

    ensureRightSidebarContainers() {
        const rightColumn = document.querySelector('.right-column');
        if (!rightColumn) {
            console.warn('Right column not found');
            return;
        }

        // Create featured teams container if it doesn't exist
        if (!document.getElementById('featuredTeamsContainer')) {
            const teamsWidget = document.createElement('div');
            teamsWidget.className = 'widget';
            teamsWidget.innerHTML = `
                <h3>Featured Teams</h3>
                <div id="featuredTeamsContainer" class="top-picks-grid">
                    <div class="top-pick">
                        <div class="top-pick-content">
                            <h4>Loading teams...</h4>
                            <div class="top-pick-meta">Loading data</div>
                        </div>
                    </div>
                </div>
            `;
            rightColumn.appendChild(teamsWidget);
        }

        // Create news container if it doesn't exist
        if (!document.getElementById('newsContainer')) {
            const newsWidget = document.createElement('div');
            newsWidget.className = 'widget';
            newsWidget.innerHTML = `
                <h3>Top News</h3>
                <div id="newsContainer" class="top-picks-grid">
                    <div class="top-pick">
                        <div class="top-pick-content">
                            <h4>Loading news...</h4>
                            <div class="top-pick-meta">Loading data</div>
                        </div>
                    </div>
                </div>
            `;
            rightColumn.appendChild(newsWidget);
        }

        // Create standings container if it doesn't exist
        if (!document.getElementById('standingsContainer')) {
            const standingsWidget = document.createElement('div');
            standingsWidget.className = 'widget';
            standingsWidget.innerHTML = `
                <h3>Standings</h3>
                <div id="standingsContainer">
                    <div style="font-size: 14px; color: #666; text-align: center; padding: 20px;">
                        Loading standings...
                    </div>
                </div>
            `;
            rightColumn.appendChild(standingsWidget);
        }
    }

    setupCardInteractions() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
                card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
            });
        });
    }

    setupLiveScoreUpdates() {
        const scores = document.querySelectorAll('.live-score');
        scores.forEach((score, index) => {
            if (score.querySelector('.live-indicator')) {
                setTimeout(() => {
                    const scoreElement = score.querySelector('.score');
                    if (scoreElement) {
                        const [home, away] = scoreElement.textContent.split('-').map(num => parseInt(num.trim()));
                        if (!isNaN(home) && !isNaN(away)) {
                            const homeChange = Math.random() > 0.7 ? 1 : 0;
                            const awayChange = Math.random() > 0.7 ? 1 : 0;
                            const newHome = Math.min(home + homeChange, 5);
                            const newAway = Math.min(away + awayChange, 5);
                            scoreElement.textContent = `${newHome}-${newAway}`;
                            scoreElement.style.transform = 'scale(1.2)';
                            setTimeout(() => {
                                scoreElement.style.transform = 'scale(1)';
                            }, 300);
                        }
                    }
                }, 5000 + (index * 2000));
            }
        });
        setTimeout(() => this.setupLiveScoreUpdates(), 10000);
    }

    setupVideoPlayers() {
        const videoCards = document.querySelectorAll('.card[href*="youtube.com"], .card[href*="youtu.be"]');
        videoCards.forEach(card => {
            card.addEventListener('click', function(e) {
                if (window.AllSportsApp && window.AllSportsApp.state.user) {
                    const videoId = this.href.split('v=')[1]?.split('&')[0];
                    if (videoId) {
                        fetch('/api/user/track-watch', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                videoId: videoId,
                                title: this.querySelector('h3')?.textContent || 'Unknown Video',
                                duration: this.querySelector('.card-badge')?.textContent || '0:00'
                            })
                        }).catch(console.error);
                    }
                }
            });
        });
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/user', {
                credentials: 'include'
            });
            const result = await response.json();
            if (result.success && result.user) {
                this.currentUser = result.user;
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }

        // Follow button events
        this.setupFollowButtonEvents();

        // Refresh button if exists
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadPageData());
        }

        // Hero image lazy loading
        this.setupLazyLoading();
    }

    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    setupFollowButtonEvents() {
        const heroFollowBtn = document.getElementById('footballFollowBtn');
        if (heroFollowBtn) {
            heroFollowBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleHeroFollowClick(heroFollowBtn);
            });
        }
    }

    async loadPageData() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingState();

        try {
            await Promise.all([
                this.loadVideos(),
                this.loadLiveScores(),
                this.loadStandings(),
                this.loadTeams(),
                this.loadNews(),
                this.loadHeroContent()
            ]);
        } catch (error) {
            console.error('Error loading page data:', error);
            this.showError('Failed to load content. Please try again.');
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    async loadHeroContent() {
        try {
            console.log('Loading hero content for sport:', this.sport);
            
            // Try to get featured videos first
            const videosResponse = await fetch(`/api/sports/${this.sport}/videos?featured=true&limit=1`);
            const videosResult = await videosResponse.json();

            let heroData = null;

            if (videosResult.success && videosResult.videos.length > 0) {
                heroData = videosResult.videos[0];
                console.log('Found featured video for hero:', heroData);
            } else {
                // Fallback to fixtures
                const fixturesResponse = await fetch(`/api/sports/${this.sport}/fixtures?featured=true&limit=1`);
                const fixturesResult = await fixturesResponse.json();
                
                if (fixturesResult.success && fixturesResult.fixtures.length > 0) {
                    heroData = fixturesResult.fixtures[0];
                    console.log('Found featured fixture for hero:', heroData);
                } else {
                    // Final fallback - get any video
                    const allVideosResponse = await fetch(`/api/sports/${this.sport}/videos?limit=1`);
                    const allVideosResult = await allVideosResponse.json();
                    
                    if (allVideosResult.success && allVideosResult.videos.length > 0) {
                        heroData = allVideosResult.videos[0];
                        console.log('Found any video for hero:', heroData);
                    }
                }
            }

            if (heroData) {
                this.updateHeroContent(heroData);
            } else {
                console.warn('No hero content found for sport:', this.sport);
                this.updateHeroWithFallback();
            }
        } catch (error) {
            console.error('Error loading hero content:', error);
            this.updateHeroWithFallback();
        }
    }

    updateHeroWithFallback() {
        const heroImage = document.getElementById('heroImage');
        const heroTitle = document.getElementById('heroTitle');
        const heroDescription = document.getElementById('heroDescription');
        
        if (heroImage) {
            heroImage.src = 'https://i.pinimg.com/736x/14/31/56/143156d98ce3004bbd0d18ab9d0ee1a1.jpg';
            heroImage.alt = `${this.sport} action`;
        }
        
        if (heroTitle) {
            heroTitle.textContent = `Latest ${this.sport.charAt(0).toUpperCase() + this.sport.slice(1)} Action`;
        }
        
        if (heroDescription) {
            heroDescription.textContent = 'Watch the latest highlights and matches';
        }
    }

    updateHeroContent(data) {
        const heroImage = document.getElementById('heroImage');
        const heroTitle = document.getElementById('heroTitle');
        const heroDescription = document.getElementById('heroDescription');
        const heroWatchLink = document.getElementById('heroWatchLink');
        const heroBadge = document.getElementById('heroBadge');

        if (heroImage && data.thumbnail) {
            heroImage.src = data.thumbnail;
            heroImage.alt = data.title || data.name || `${this.sport} content`;
        }

        if (heroTitle) {
            heroTitle.textContent = data.title || `${data.homeTeam?.name} vs ${data.awayTeam?.name}` || `Featured ${this.sport} Content`;
        }

        if (heroDescription) {
            heroDescription.textContent = data.description || data.venue || 'Live coverage and highlights';
        }

        if (heroWatchLink) {
            if (data.videoId) {
                heroWatchLink.href = `https://youtu.be/${data.videoId}`;
                heroWatchLink.style.display = 'flex';
            } else {
                heroWatchLink.style.display = 'none';
            }
        }

        if (heroBadge) {
            if (data.status === 'live' || data.type === 'live') {
                heroBadge.textContent = 'LIVE';
                heroBadge.style.display = 'block';
            } else {
                heroBadge.style.display = 'none';
            }
        }
    }

    async loadVideos() {
        try {
            console.log(`Loading videos for sport: ${this.sport}`);
            const response = await fetch(`/api/sports/${this.sport}/videos?limit=12`);
            const result = await response.json();
            
            console.log('Videos API response:', result);
            
            if (result.success) {
                this.renderVideos(result.videos);
            } else {
                throw new Error(result.message || 'Failed to load videos');
            }
        } catch (error) {
            console.error('Error loading videos:', error);
            this.showSectionError('videos-section', 'Failed to load videos');
            this.renderFallbackVideos();
        }
    }

    renderFallbackVideos() {
        const highlightsContainer = document.getElementById('highlightsContainer');
        const featuresContainer = document.getElementById('featuresContainer');
        
        if (highlightsContainer) {
            highlightsContainer.innerHTML = `
                <div class="card">
                    <div class="card-image">
                        <img src="https://i.pinimg.com/736x/14/31/56/143156d98ce3004bbd0d18ab9d0ee1a1.jpg" alt="Football Highlights" loading="lazy">
                        <div class="card-badge">8:45</div>
                        <div class="youtube-overlay">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF0000">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="card-content">
                        <h3>${this.sport.charAt(0).toUpperCase() + this.sport.slice(1)} Highlights</h3>
                        <div class="card-meta">
                            <span class="sport-badge badge-${this.sport}">Highlights</span>
                            <span>Recently</span>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-image">
                        <img src="https://i.pinimg.com/736x/02/12/58/021258c035d77f92b2f873fafab2f097.jpg" alt="Match Analysis" loading="lazy">
                        <div class="card-badge">12:30</div>
                        <div class="youtube-overlay">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF0000">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="card-content">
                        <h3>Match Analysis & Features</h3>
                        <div class="card-meta">
                            <span class="sport-badge badge-${this.sport}">Analysis</span>
                            <span>Recently</span>
                        </div>
                    </div>
                </div>
            `;
        }

        if (featuresContainer) {
            featuresContainer.innerHTML = `
                <div class="card">
                    <div class="card-image">
                        <img src="https://i.pinimg.com/736x/95/c3/81/95c3815b8907724df588110224d2aff0.jpg" alt="Tactical Analysis" loading="lazy">
                        <div class="card-badge">15:20</div>
                        <div class="youtube-overlay">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF0000">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="card-content">
                        <h3>Tactical Breakdown</h3>
                        <div class="card-meta">
                            <span class="sport-badge badge-${this.sport}">Tactics</span>
                            <span>Recently</span>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-image">
                        <img src="https://i.pinimg.com/736x/4e/05/ba/4e05baa52f89b44efda2c702c12fddd2.jpg" alt="Player Focus" loading="lazy">
                        <div class="card-badge">10:15</div>
                        <div class="youtube-overlay">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF0000">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="card-content">
                        <h3>Player Spotlight</h3>
                        <div class="card-meta">
                            <span class="sport-badge badge-${this.sport}">Feature</span>
                            <span>Recently</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    renderVideos(videos) {
        const highlightsContainer = document.getElementById('highlightsContainer');
        const featuresContainer = document.getElementById('featuresContainer');
        
        console.log('Rendering videos:', videos);
        
        if (highlightsContainer && videos.length > 0) {
            // Filter for highlights (category === 'Highlights' or type includes 'highlight')
            const highlights = videos.filter(video => 
                video.category === 'Highlights' || 
                video.type?.includes('highlight') ||
                video.tags?.some(tag => tag.toLowerCase().includes('highlight'))
            ).slice(0, 4);
            
            if (highlights.length > 0) {
                highlightsContainer.innerHTML = highlights.map(video => this.createVideoCard(video)).join('');
            } else {
                // If no specific highlights, use first few videos
                highlightsContainer.innerHTML = videos.slice(0, 4).map(video => this.createVideoCard(video)).join('');
            }
        }

        if (featuresContainer && videos.length > 0) {
            // Filter for features/analysis (category === 'Feature' or 'Analysis')
            const features = videos.filter(video => 
                video.category === 'Feature' || 
                video.category === 'Analysis' ||
                video.type?.includes('feature') ||
                video.tags?.some(tag => tag.toLowerCase().includes('analysis') || tag.toLowerCase().includes('feature'))
            ).slice(0, 4);
            
            if (features.length > 0) {
                featuresContainer.innerHTML = features.map(video => this.createVideoCard(video)).join('');
            } else {
                // If no specific features, use next set of videos
                featuresContainer.innerHTML = videos.slice(4, 8).map(video => this.createVideoCard(video)).join('');
            }
        }
    }

    createVideoCard(video) {
        const videoId = video.videoId || video.youtubeId;
        const youtubeUrl = videoId ? `https://youtu.be/${videoId}` : '#';
        
        return `
            <a href="${youtubeUrl}" target="_blank" class="card">
                <div class="card-image">
                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy" data-src="${video.thumbnail}">
                    <div class="card-badge">${video.duration || '0:00'}</div>
                    <div class="youtube-overlay">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF0000">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                        </svg>
                    </div>
                </div>
                <div class="card-content">
                    <h3>${video.title}</h3>
                    <div class="card-meta">
                        <span class="sport-badge badge-${this.sport}">${video.category || 'Video'}</span>
                        <span>${this.formatTimeAgo(video.createdAt)}</span>
                    </div>
                </div>
            </a>
        `;
    }

    async loadLiveScores() {
        try {
            console.log(`Loading live scores for sport: ${this.sport}`);
            const response = await fetch(`/api/sports/${this.sport}/scores?status=live&limit=5`);
            const result = await response.json();
            
            console.log('Live scores API response:', result);
            
            if (result.success) {
                this.renderLiveScores(result.scores);
            } else {
                this.renderFallbackLiveScores();
            }
        } catch (error) {
            console.error('Error loading live scores:', error);
            this.renderFallbackLiveScores();
        }
    }

    renderFallbackLiveScores() {
        const container = document.getElementById('liveScoresContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="live-score">
                <div class="teams">Loading live matches...</div>
                <div class="score">-</div>
                <div class="live-indicator live-pulse">Loading</div>
            </div>
        `;
    }

    renderLiveScores(scores) {
        const container = document.getElementById('liveScoresContainer');
        if (!container) return;

        if (scores && scores.length > 0) {
            container.innerHTML = scores.map(score => `
                <div class="live-score">
                    <div class="teams">${score.teams.home.name} vs ${score.teams.away.name}</div>
                    <div class="score">${score.teams.home.score}-${score.teams.away.score}</div>
                    <div class="${score.status === 'live' ? 'live-indicator live-pulse' : 'match-status'}">
                        ${score.minute || score.status}
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div class="live-score">
                    <div class="teams">No live matches currently</div>
                    <div class="score">-</div>
                    <div class="match-status">Check later</div>
                </div>
            `;
        }
    }

    async loadStandings() {
        try {
            console.log(`Loading standings for sport: ${this.sport}`);
            const response = await fetch(`/api/sports/${this.sport}/standings`);
            const result = await response.json();
            
            console.log('Standings API response:', result);
            
            if (result.success && result.standings.length > 0) {
                this.renderStandings(result.standings[0]);
            } else {
                this.renderFallbackStandings();
            }
        } catch (error) {
            console.error('Error loading standings:', error);
            this.renderFallbackStandings();
        }
    }

    renderFallbackStandings() {
        const container = document.getElementById('standingsContainer');
        if (!container) {
            console.warn('Standings container not found');
            return;
        }

        container.innerHTML = `
            <div style="font-size: 14px; color: #666; text-align: center; padding: 20px;">
                Loading standings data...
            </div>
        `;
    }

    renderStandings(standings) {
        const container = document.getElementById('standingsContainer');
        if (!container) {
            console.warn('Standings container not found');
            return;
        }

        if (standings && standings.table && standings.table.length > 0) {
            container.innerHTML = `
                <div class="standings-table">
                    <div class="standings-header">
                        <span>Team</span>
                        <span>Pts</span>
                    </div>
                    ${standings.table.slice(0, 5).map(team => `
                        <div class="standings-row">
                            <div class="team-name">
                                <span class="team-position">${team.position}.</span>
                                <span class="team-name-text">${team.team}</span>
                            </div>
                            <span class="team-points">${team.points || team.wins || 0}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            this.renderFallbackStandings();
        }
    }

    async loadTeams() {
        try {
            console.log(`Loading teams for sport: ${this.sport}`);
            const response = await fetch(`/api/sports/${this.sport}/teams?featured=true&limit=3`);
            const result = await response.json();
            
            console.log('Teams API response:', result);
            
            if (result.success && result.teams.length > 0) {
                this.renderFeaturedTeams(result.teams);
            } else {
                this.renderFallbackTeams();
            }
        } catch (error) {
            console.error('Error loading teams:', error);
            this.renderFallbackTeams();
        }
    }

    renderFallbackTeams() {
        const container = document.getElementById('featuredTeamsContainer');
        if (!container) {
            console.warn('Featured teams container not found');
            return;
        }

        container.innerHTML = `
            <div class="top-pick">
                <div class="top-pick-content">
                    <h4>Top ${this.sport.charAt(0).toUpperCase() + this.sport.slice(1)} Teams</h4>
                    <div class="top-pick-meta">Loading teams data...</div>
                </div>
            </div>
        `;
    }

    renderFeaturedTeams(teams) {
        const container = document.getElementById('featuredTeamsContainer');
        if (!container) {
            console.warn('Featured teams container not found');
            return;
        }

        if (teams && teams.length > 0) {
            container.innerHTML = teams.map(team => `
                <div class="top-pick">
                    <div class="top-pick-content">
                        <h4>${team.name}</h4>
                        <div class="top-pick-meta">${team.league} • ${team.stats?.overall?.wins || 0}-${team.stats?.overall?.losses || 0}</div>
                    </div>
                </div>
            `).join('');
        } else {
            this.renderFallbackTeams();
        }
    }

    async loadNews() {
        try {
            console.log(`Loading news for sport: ${this.sport}`);
            const response = await fetch(`/api/news?sport=${this.sport}&limit=3`);
            const result = await response.json();
            
            console.log('News API response:', result);
            
            if (result.success && result.news.length > 0) {
                this.renderNews(result.news);
            } else {
                this.renderFallbackNews();
            }
        } catch (error) {
            console.error('Error loading news:', error);
            this.renderFallbackNews();
        }
    }

    renderFallbackNews() {
        const container = document.getElementById('newsContainer');
        if (!container) {
            console.warn('News container not found');
            return;
        }

        container.innerHTML = `
            <div class="top-pick">
                <div class="top-pick-content">
                    <h4>Latest ${this.sport.charAt(0).toUpperCase() + this.sport.slice(1)} News</h4>
                    <div class="top-pick-meta">Loading news updates...</div>
                </div>
            </div>
        `;
    }

    renderNews(news) {
        const container = document.getElementById('newsContainer');
        if (!container) {
            console.warn('News container not found');
            return;
        }

        if (news && news.length > 0) {
            container.innerHTML = news.map(article => `
                <div class="top-pick">
                    <div class="top-pick-content">
                        <h4>${article.title}</h4>
                        <div class="top-pick-meta">${this.formatTimeAgo(article.date)}</div>
                    </div>
                </div>
            `).join('');
        } else {
            this.renderFallbackNews();
        }
    }

    async handleHeroFollowClick(button) {
        if (!this.currentUser) {
            this.showToast('Please log in to follow sports', 'error');
            return;
        }

        const sportId = button.getAttribute('data-sport-id');
        const sportName = button.getAttribute('data-sport-name');
        const sportIcon = button.getAttribute('data-sport-icon');

        button.classList.add('loading', 'btn-loading');
        button.disabled = true;

        try {
            const isCurrentlyFollowed = await this.isSportFollowed(sportId);
            let result;

            if (isCurrentlyFollowed) {
                result = await this.unfollowSport(sportId);
            } else {
                result = await this.followSport(sportId, sportName, sportIcon);
            }

            if (result.success) {
                this.showToast(result.message, 'success');
                this.updateFollowButtonState(button, !isCurrentlyFollowed);
                
                if (window.AllSportsApp && window.AllSportsApp.updateSportFollowButtons) {
                    window.AllSportsApp.updateSportFollowButtons();
                }
            } else {
                this.showToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Error handling sport follow:', error);
            this.showToast('Error updating follow status', 'error');
        } finally {
            button.classList.remove('loading', 'btn-loading');
            button.disabled = false;
        }
    }

    async isSportFollowed(sportId) {
        try {
            const response = await fetch('/api/user/followed-sports', {
                credentials: 'include'
            });
            const result = await response.json();
            
            if (result.success) {
                return result.followedSports.some(sport => sport.sportId === sportId);
            }
            return false;
        } catch (error) {
            console.error('Error checking followed sports:', error);
            return false;
        }
    }

    async followSport(sportId, sportName, sportIcon) {
        const response = await fetch('/api/user/follow-sport', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                sportId,
                sportName,
                icon: sportIcon,
                category: 'Team Sport',
                action: 'follow'
            })
        });
        return await response.json();
    }

    async unfollowSport(sportId) {
        const response = await fetch('/api/user/follow-sport', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                sportId,
                action: 'unfollow'
            })
        });
        return await response.json();
    }

    updateFollowButtonState(button, isFollowing) {
        const followText = button.querySelector('.follow-text');
        const followIcon = button.querySelector('.follow-icon-hero');

        if (isFollowing) {
            button.classList.add('following');
            followText.textContent = 'Followed';
            followIcon.textContent = '❤️';
        } else {
            button.classList.remove('following');
            followText.textContent = 'Follow';
            followIcon.textContent = '🤍';
        }
    }

    async initSportsFollowFunctionality() {
        const heroFollowBtn = document.getElementById('footballFollowBtn');
        if (heroFollowBtn && this.currentUser) {
            const sportId = heroFollowBtn.getAttribute('data-sport-id');
            const isFollowed = await this.isSportFollowed(sportId);
            this.updateFollowButtonState(heroFollowBtn, isFollowed);
        }
    }

    async handleSearch(query) {
        if (!query || query.length < 2) return;

        try {
            const response = await fetch(`/api/search/fixtures?query=${encodeURIComponent(query)}`);
            const result = await response.json();
            
            if (result.success) {
                this.displaySearchResults(result.fixtures);
            }
        } catch (error) {
            console.error('Error searching:', error);
        }
    }

    displaySearchResults(fixtures) {
        if (window.AllSportsApp && window.AllSportsApp.showSearchResults) {
            window.AllSportsApp.showSearchResults(fixtures);
        }
    }

    showLoadingState() {
        document.body.classList.add('content-loading');
    }

    hideLoadingState() {
        document.body.classList.remove('content-loading');
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            ${message}
            <button class="retry-button" onclick="sportPageManager.loadPageData()">Retry</button>
        `;
        
        const main = document.querySelector('main');
        if (main) {
            main.prepend(errorDiv);
        }
    }

    showSectionError(sectionId, message) {
        const section = document.getElementById(sectionId);
        if (section) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `
                ${message}
                <button class="retry-button" onclick="sportPageManager.loadPageData()">Retry</button>
            `;
            section.appendChild(errorDiv);
        }
    }

    showToast(message, type = 'success') {
        if (window.AllSportsApp && window.AllSportsApp.showToast) {
            window.AllSportsApp.showToast(message, type);
        } else {
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: ${type === 'error' ? '#ff4444' : '#34a853'};
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    }

    formatTimeAgo(dateString) {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Database and Authentication Management
const Database = {
  init: function() {
    const storedUsers = localStorage.getItem('allsports_users');
    if (!storedUsers) {
      mockUsers = [
        {
          id: 1,
          username: 'sportsfan',
          email: 'fan@example.com',
          password: 'password123',
          favoriteSports: ['Football', 'Basketball'],
          favoriteTeams: ['Manchester United', 'Los Angeles Lakers'],
          preferences: {
            notifications: true,
            theme: 'dark'
          },
          createdAt: new Date()
        },
        {
          id: 2,
          username: 'admin',
          email: 'admin@allsports.com',
          password: 'admin123',
          favoriteSports: ['Football', 'Cricket', 'Tennis'],
          favoriteTeams: ['Arsenal', 'India', 'Federer'],
          preferences: {
            notifications: true,
            theme: 'dark'
          },
          createdAt: new Date()
        }
      ];
      localStorage.setItem('allsports_users', JSON.stringify(mockUsers));
    } else {
      mockUsers = JSON.parse(storedUsers);
    }

    const currentSession = localStorage.getItem('allsports_current_user');
    if (currentSession) {
      currentUser = JSON.parse(currentSession);
    }

    const storedFollowedSports = localStorage.getItem('allsports_followed_sports');
    if (storedFollowedSports) {
      followedSports = JSON.parse(storedFollowedSports);
    }
  },

  getUsers: function() {
    return JSON.parse(localStorage.getItem('allsports_users') || '[]');
  },

  saveUsers: function(users) {
    localStorage.setItem('allsports_users', JSON.stringify(users));
  },

  findUserByCredentials: function(email, password) {
    const users = this.getUsers();
    return users.find(user => user.email === email && user.password === password);
  },

  findUserByEmail: function(email) {
    const users = this.getUsers();
    return users.find(user => user.email === email);
  },

  createUser: function(userData) {
    const users = this.getUsers();
    const newUser = {
      id: Date.now(),
      ...userData,
      favoriteSports: [],
      favoriteTeams: [],
      preferences: {
        notifications: true,
        theme: 'dark'
      },
      createdAt: new Date()
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  },

  updateUser: function(userId, updates) {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      this.saveUsers(users);
      return users[userIndex];
    }
    return null;
  },

  setCurrentUser: function(user) {
    currentUser = user;
    if (user) {
      localStorage.setItem('allsports_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('allsports_current_user');
    }
  },

  getCurrentUser: function() {
    const storedUser = localStorage.getItem('allsports_current_user');
    return storedUser ? JSON.parse(storedUser) : null;
  },

  clearCurrentUser: function() {
    currentUser = null;
    localStorage.removeItem('allsports_current_user');
  },

  saveFollowedSports: function(sports) {
    followedSports = sports;
    localStorage.setItem('allsports_followed_sports', JSON.stringify(sports));
  },

  getFollowedSports: function() {
    return followedSports;
  }
};

const AuthManager = {
  login: function(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = Database.findUserByCredentials(email, password);
        if (user) {
          Database.setCurrentUser(user);
          currentUser = user;
          resolve({
            success: true,
            user: user,
            message: 'Login successful!'
          });
        } else {
          reject({
            success: false,
            message: 'Invalid email or password'
          });
        }
      }, 1000);
    });
  },

  register: function(userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingUser = Database.findUserByEmail(userData.email);
        if (existingUser) {
          reject({
            success: false,
            message: 'User with this email already exists'
          });
          return;
        }

        const newUser = Database.createUser(userData);
        Database.setCurrentUser(newUser);
        currentUser = newUser;
        
        resolve({
          success: true,
          user: newUser,
          message: 'Registration successful!'
        });
      }, 1000);
    });
  },

  logout: function() {
    return new Promise((resolve) => {
      setTimeout(() => {
        Database.clearCurrentUser();
        currentUser = null;
        resolve({
          success: true,
          message: 'Logged out successfully'
        });
      }, 500);
    });
  },

  isAuthenticated: function() {
    return currentUser !== null;
  },

  getCurrentUser: function() {
    return currentUser;
  },

  updateProfile: function(userId, updates) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const updatedUser = Database.updateUser(userId, updates);
        if (updatedUser) {
          if (currentUser && currentUser.id === userId) {
            Database.setCurrentUser(updatedUser);
            currentUser = updatedUser;
          }
          resolve({
            success: true,
            user: updatedUser,
            message: 'Profile updated successfully'
          });
        } else {
          reject({
            success: false,
            message: 'Failed to update profile'
          });
        }
      }, 500);
    });
  }
};

const SportsManager = {
  followSport: async function(sportId, sportName, icon = '🏆', category = 'General') {
    try {
      if (currentUser) {
        try {
          const response = await fetch('/api/user/follow-sport', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sportId,
              sportName,
              category,
              icon,
              description: `${sportName} - The world's most popular sports`,
              popularity: 85,
              action: 'follow'
            })
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              const newSport = {
                sportId,
                sportName,
                icon,
                category,
                followedAt: new Date().toISOString()
              };
              
              const currentFollowed = Database.getFollowedSports();
              const updatedFollowed = [...currentFollowed, newSport];
              Database.saveFollowedSports(updatedFollowed);
              
              return result;
            }
          }
        } catch (apiError) {
          console.log('API call failed, using local storage:', apiError);
        }
      }

      return new Promise((resolve) => {
        setTimeout(() => {
          const newSport = {
            sportId,
            sportName,
            icon,
            category,
            followedAt: new Date().toISOString()
          };
          
          const currentFollowed = Database.getFollowedSports();
          const updatedFollowed = [...currentFollowed, newSport];
          Database.saveFollowedSports(updatedFollowed);
          
          resolve({
            success: true,
            message: `You are now following ${sportName}`,
            sport: newSport
          });
        }, 500);
      });
    } catch (error) {
      console.error('Error following sport:', error);
      return {
        success: false,
        message: 'Error following sport'
      };
    }
  },

  unfollowSport: async function(sportId) {
    try {
      if (currentUser) {
        try {
          const response = await fetch('/api/user/follow-sport', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sportId,
              action: 'unfollow'
            })
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              const currentFollowed = Database.getFollowedSports();
              const sportToRemove = currentFollowed.find(sport => sport.sportId === sportId);
              const updatedFollowed = currentFollowed.filter(sport => sport.sportId !== sportId);
              Database.saveFollowedSports(updatedFollowed);
              
              return result;
            }
          }
        } catch (apiError) {
          console.log('API call failed, using local storage:', apiError);
        }
      }

      return new Promise((resolve) => {
        setTimeout(() => {
          const currentFollowed = Database.getFollowedSports();
          const sportToRemove = currentFollowed.find(sport => sport.sportId === sportId);
          const updatedFollowed = currentFollowed.filter(sport => sport.sportId !== sportId);
          Database.saveFollowedSports(updatedFollowed);
          
          resolve({
            success: true,
            message: sportToRemove ? `You have unfollowed ${sportToRemove.sportName}` : 'Sport unfollowed',
            sportId: sportId
          });
        }, 500);
      });
    } catch (error) {
      console.error('Error unfollowing sport:', error);
      return {
        success: false,
        message: 'Error unfollowing sport'
      };
    }
  },

  getFollowedSports: async function() {
    try {
      if (currentUser) {
        try {
          const response = await fetch('/api/user/followed-sports');
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              Database.saveFollowedSports(result.followedSports);
              return result;
            }
          }
        } catch (apiError) {
          console.log('API call failed, using local storage:', apiError);
        }
      }

      return new Promise((resolve) => {
        setTimeout(() => {
          const followedSports = Database.getFollowedSports();
          resolve({
            success: true,
            followedSports: followedSports
          });
        }, 300);
      });
    } catch (error) {
      console.error('Error getting followed sports:', error);
      return {
        success: false,
        followedSports: []
      };
    }
  },

  getAllSports: async function() {
    try {
      try {
        const response = await fetch('/api/sports');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            return result;
          }
        }
      } catch (apiError) {
        console.log('API call failed, using mock data:', apiError);
      }

      return new Promise((resolve) => {
        setTimeout(() => {
          const allSports = [
            {
              sportId: 'football',
              sportName: 'Football',
              category: 'Team Sport',
              icon: '⚽',
              description: 'The world\'s most popular sport played between two teams of eleven players.',
              popularity: 95
            },
            {
              sportId: 'cricket',
              sportName: 'Cricket',
              category: 'Team Sport',
              icon: '🏏',
              description: 'Bat-and-ball game played between two teams of eleven players.',
              popularity: 85
            },
            {
              sportId: 'basketball',
              sportName: 'Basketball',
              category: 'Team Sport',
              icon: '🏀',
              description: 'Fast-paced team sport played on a rectangular court.',
              popularity: 90
            },
            {
              sportId: 'tennis',
              sportName: 'Tennis',
              category: 'Racquet Sport',
              icon: '🎾',
              description: 'Racquet sport that can be played individually or between two teams.',
              popularity: 80
            },
            {
              sportId: 'baseball',
              sportName: 'Baseball',
              category: 'Team Sport',
              icon: '⚾',
              description: 'Bat-and-ball sport played between two teams of nine players.',
              popularity: 75
            },
            {
              sportId: 'hockey',
              sportName: 'Hockey',
              category: 'Team Sport',
              icon: '🏒',
              description: 'Fast-paced sport played on ice or field with sticks and a puck/ball.',
              popularity: 70
            },
            {
              sportId: 'golf',
              sportName: 'Golf',
              category: 'Individual Sport',
              icon: '⛳',
              description: 'Precision club-and-ball sport where players use clubs to hit balls.',
              popularity: 65
            },
            {
              sportId: 'rugby',
              sportName: 'Rugby',
              category: 'Team Sport',
              icon: '🏉',
              description: 'Contact team sport that originated in England in the first half of the 19th century.',
              popularity: 60
            },
            {
              sportId: 'formula1',
              sportName: 'Formula 1',
              category: 'Motorsport',
              icon: '🏎️',
              description: 'Highest class of international auto racing for single-seater formula racing cars.',
              popularity: 85
            },
            {
              sportId: 'boxing',
              sportName: 'Boxing',
              category: 'Combat Sport',
              icon: '🥊',
              description: 'Combat sport in which two people throw punches at each other.',
              popularity: 70
            },
            {
              sportId: 'mma',
              sportName: 'MMA',
              category: 'Combat Sport',
              icon: '🥋',
              description: 'Full-contact combat sport based on striking, grappling and ground fighting.',
              popularity: 75
            },
            {
              sportId: 'olympics',
              sportName: 'Olympics',
              category: 'Multi-Sport',
              icon: '🏅',
              description: 'International sporting events featuring summer and winter sports competitions.',
              popularity: 95
            }
          ];
          resolve({
            success: true,
            sports: allSports
          });
        }, 300);
      });
    } catch (error) {
      console.error('Error getting sports:', error);
      return {
        success: false,
        sports: []
      };
    }
  },

  isSportFollowed: function(sportId) {
    return followedSports.some(sport => sport.sportId === sportId);
  },

  updateFollowedSportsCache: function(sports) {
    followedSports = sports || [];
    Database.saveFollowedSports(sports);
  }
};

class LoginPageHandler {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkExistingSession();
  }

  setupEventListeners() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }

    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    const toggleButtons = document.querySelectorAll('.password-toggle');
    toggleButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.togglePasswordVisibility(e.target);
      });
    });

    document.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const activeForm = document.querySelector('.auth-form.active');
        if (activeForm) {
          const submitButton = activeForm.querySelector('.btn-primary');
          if (submitButton) {
            submitButton.click();
          }
        }
      }
    });
  }

  checkExistingSession() {
    const user = AuthManager.getCurrentUser();
    if (user && window.location.pathname.includes('../login.html')) {
      this.redirectToHome();
    }
  }

  async handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe') ? document.getElementById('rememberMe').checked : false;

    if (!email || !password) {
      this.showMessage('Please fill in all fields', 'error');
      return;
    }

    if (!this.validateEmail(email)) {
      this.showMessage('Please enter a valid email address', 'error');
      return;
    }

    this.setLoadingState('login', true);

    try {
      const result = await AuthManager.login(email, password);
      
      if (result.success) {
        this.showMessage(result.message, 'success');
        
        if (rememberMe) {
          localStorage.setItem('allsports_remember_me', 'true');
        } else {
          localStorage.removeItem('allsports_remember_me');
        }

        setTimeout(() => {
          this.redirectToHome();
        }, 1000);
      }
    } catch (error) {
      this.showMessage(error.message, 'error');
    } finally {
      this.setLoadingState('login', false);
    }
  }

  async handleRegister() {
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;

    if (!username || !email || !password || !confirmPassword) {
      this.showMessage('Please fill in all fields', 'error');
      return;
    }

    if (!this.validateEmail(email)) {
      this.showMessage('Please enter a valid email address', 'error');
      return;
    }

    if (password.length < 6) {
      this.showMessage('Password must be at least 6 characters long', 'error');
      return;
    }

    if (password !== confirmPassword) {
      this.showMessage('Passwords do not match', 'error');
      return;
    }

    if (!agreeTerms) {
      this.showMessage('Please agree to the terms and conditions', 'error');
      return;
    }

    this.setLoadingState('register', true);

    try {
      const result = await AuthManager.register({
        username,
        email,
        password
      });

      if (result.success) {
        this.showMessage(result.message, 'success');
        
        setTimeout(() => {
          this.redirectToHome();
        }, 1500);
      }
    } catch (error) {
      this.showMessage(error.message, 'error');
    } finally {
      this.setLoadingState('register', false);
    }
  }

  switchTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(button => {
      button.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    document.querySelectorAll('.auth-form').forEach(form => {
      form.classList.remove('active');
    });
    document.getElementById(`${tabName}Form`).classList.add('active');

    this.resetForms();
  }

  resetForms() {
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(form => {
      form.reset();
    });

    this.hideMessage();
  }

  togglePasswordVisibility(button) {
    const input = button.previousElementSibling;
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    
    button.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
  }

  setLoadingState(formType, isLoading) {
    const button = document.querySelector(`#${formType}Form .btn-primary`);
    if (!button) return;
    
    const originalText = button.dataset.originalText || button.textContent;
    
    if (isLoading) {
      button.dataset.originalText = originalText;
      button.innerHTML = '<div class="spinner"></div> Loading...';
      button.disabled = true;
    } else {
      button.textContent = originalText;
      button.disabled = false;
    }
  }

  showMessage(message, type) {
    this.hideMessage();

    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message auth-message-${type}`;
    messageDiv.innerHTML = `
      <span class="auth-message-text">${message}</span>
      <button class="auth-message-close" onclick="this.parentElement.remove()">×</button>
    `;

    const authContainer = document.querySelector('.auth-container');
    if (authContainer) {
      authContainer.insertBefore(messageDiv, authContainer.firstChild);

      setTimeout(() => {
        if (messageDiv.parentElement) {
          messageDiv.remove();
        }
      }, 5000);
    }
  }

  hideMessage() {
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) {
      existingMessage.remove();
    }
  }

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  redirectToHome() {
    window.location.href = 'index.html';
  }
}

class AllSportsApp {
    constructor() {
        this.state = {
            user: null,
            news: [],
            liveEvents: [],
            videos: [],
            fixtures: [],
            standings: [],
            filters: {
                sports: [],
                leagues: {},
                statuses: ['All', 'Live', 'Upcoming', 'Finished']
            },
            currentSport: 'All',
            currentLeague: 'All',
            currentStatus: 'All',
            currentView: 'grid',
            following: JSON.parse(localStorage.getItem('following')) || [],
            page: 1,
            hasMore: true,
            isLoading: false,
            searchQuery: '',
            userPreferences: JSON.parse(localStorage.getItem('userPreferences')) || {
                favoriteSports: [],
                favoriteTeams: [],
                notifications: true,
                theme: 'dark'
            }
        };
        
        this.debounceTimer = null;
        this.scrollTimer = null;
        this.searchDebounceTimer = null;
        this.currentPage = this.getCurrentPage();
    }

    async init() {
        console.log('AllSports App Initializing...');
        Database.init();
        await this.checkAuthStatus();
        this.setupEventListeners();
        
        if (this.currentPage === 'home') {
            await this.loadInitialData();
            this.startLiveUpdates();
            this.updateTicker();
            this.initializeLeagueFilters();
            this.applyUserPreferences();
            this.enhanceCards();
            this.setupBackToTop();
        }
        
        this.updateLoginUI();
        this.setupFollowFunctionality();
        
        this.initPageSpecific();
        
        await this.initSportsFollowFunctionality();
        
        this.initHeroFollowButton();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('login.html')) return 'login';
        if (path.includes('scores.html')) return 'scores';
        if (path.includes('watch.html')) return 'watch';
        if (path.includes('teams.html')) return 'teams';
        if (path.includes('fixtures.html')) return 'fixtures';
        return 'home';
    }

    initPageSpecific() {
        switch (this.currentPage) {
            case 'login':
                this.initLoginPage();
                break;
            case 'scores':
                this.initScoresPage();
                break;
            case 'watch':
                this.initWatchPage();
                break;
            case 'teams':
                this.initTeamsPage();
                break;
            case 'fixtures':
                this.initFixturesPage();
                break;
        }
    }

    initLoginPage() {
        new LoginPageHandler();
    }

    initHeroFollowButton() {
        const heroFollowBtn = document.getElementById('footballFollowBtn');
        if (heroFollowBtn) {
            const sportId = heroFollowBtn.getAttribute('data-sport-id');
            const isFollowed = this.isSportFollowed(sportId);
            
            this.updateHeroFollowButton(heroFollowBtn, isFollowed);
            
            heroFollowBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleHeroFollowClick(heroFollowBtn);
            });
        }
    }

    async handleHeroFollowClick(button) {
        if (!this.state.user) {
            this.showToast('Please log in to follow sports', 'error');
            return;
        }

        const sportId = button.getAttribute('data-sport-id');
        const sportName = button.getAttribute('data-sport-name');
        const sportIcon = button.getAttribute('data-sport-icon');
        const isCurrentlyFollowed = this.isSportFollowed(sportId);

        button.classList.add('loading');
        button.disabled = true;

        try {
            let result;
            if (isCurrentlyFollowed) {
                result = await SportsManager.unfollowSport(sportId);
            } else {
                result = await SportsManager.followSport(sportId, sportName, sportIcon);
            }

            if (result.success) {
                this.showToast(result.message, 'success');
                
                button.classList.add('animating');
                setTimeout(() => button.classList.remove('animating'), 500);
                
                this.updateHeroFollowButton(button, !isCurrentlyFollowed);
                
                await this.loadFollowedSports();
                
                this.updateSportFollowButtons();
                
                this.updateSportsWidget();
            } else {
                this.showToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Error handling sport follow:', error);
            this.showToast('Error updating sport follow status', 'error');
        } finally {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    updateHeroFollowButton(button, isFollowed) {
        if (isFollowed) {
            button.classList.add('following');
            button.querySelector('.follow-text').textContent = 'Followed';
        } else {
            button.classList.remove('following');
            button.querySelector('.follow-text').textContent = 'Follow';
        }
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/user', {
                credentials: 'include'
            });
            const result = await response.json();
            
            if (result.success && result.user) {
                this.state.user = result.user;
                console.log('User authenticated:', result.user.username);
            } else {
                const user = Database.getCurrentUser();
                if (user) {
                    this.state.user = user;
                    console.log('User authenticated from localStorage:', user.username);
                }
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            const user = Database.getCurrentUser();
            if (user) {
                this.state.user = user;
            }
        }
    }

    setupEventListeners() {
        this.initDropdowns();
        this.initMobileMenu();
        this.initScrollEffects();
        this.initSearchFunctionality();
        this.initCarousel();
        this.initUserPreferences();
        
        this.enhanceCards();
        
        this.updateLiveScores();
        
        this.initTicker();
    }

    async initSportsFollowFunctionality() {
        await this.loadFollowedSports();
        
        this.addFollowButtonsToSports();
        
        this.addSportsFollowSection();
    }

    async loadFollowedSports() {
        try {
            const result = await SportsManager.getFollowedSports();
            if (result.success) {
                followedSports = result.followedSports;
                SportsManager.updateFollowedSportsCache(followedSports);
                console.log('Followed sports loaded:', followedSports);
                this.updateSportFollowButtons();
            }
        } catch (error) {
            console.error('Error loading followed sports:', error);
        }
    }

    addFollowButtonsToSports() {
        const sportsDropdown = document.querySelector('.sports-dropdown .dropdown-grid');
        const mobileSportsDropdown = document.querySelector('.mobile-dropdown-menu');
        
        if (sportsDropdown) {
            const sportItems = sportsDropdown.querySelectorAll('.dropdown-item');
            sportItems.forEach(item => {
                this.addFollowButtonToSportItem(item);
            });
        }
        
        if (mobileSportsDropdown) {
            const mobileSportItems = mobileSportsDropdown.querySelectorAll('.mobile-dropdown-item');
            mobileSportItems.forEach(item => {
                this.addFollowButtonToMobileSportItem(item);
            });
        }
    }

    addFollowButtonToSportItem(sportItem) {
        const sportLink = sportItem.querySelector('a');
        if (!sportLink) return;
        
        const sportName = sportLink.textContent.trim();
        const sportIcon = sportLink.querySelector('.sport-icon')?.textContent || '🏆';
        const sportHref = sportLink.getAttribute('href');
        const sportId = sportHref ? sportHref.replace('.html', '') : sportName.toLowerCase();
        
        const followButton = document.createElement('button');
        followButton.className = 'sport-follow-btn';
        followButton.setAttribute('data-sport-id', sportId);
        followButton.setAttribute('data-sport-name', sportName);
        followButton.setAttribute('data-sport-icon', sportIcon);
        
        const isFollowed = this.isSportFollowed(sportId);
        this.updateFollowButtonAppearance(followButton, isFollowed);
        
        followButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleSportFollowClick(followButton);
        });
        
        sportItem.appendChild(followButton);
    }

    addFollowButtonToMobileSportItem(sportItem) {
        const sportLink = sportItem.querySelector('a');
        if (!sportLink) return;
        
        const sportName = sportLink.textContent.trim();
        const sportIcon = sportLink.querySelector('.sport-icon')?.textContent || sportLink.textContent.charAt(0);
        const sportHref = sportLink.getAttribute('href');
        const sportId = sportHref ? sportHref.replace('.html', '') : sportName.toLowerCase();
        
        const followButton = document.createElement('button');
        followButton.className = 'sport-follow-btn mobile';
        followButton.setAttribute('data-sport-id', sportId);
        followButton.setAttribute('data-sport-name', sportName);
        followButton.setAttribute('data-sport-icon', sportIcon);
        
        const isFollowed = this.isSportFollowed(sportId);
        this.updateFollowButtonAppearance(followButton, isFollowed);
        
        followButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleSportFollowClick(followButton);
        });
        
        sportItem.appendChild(followButton);
    }

    async handleSportFollowClick(button) {
        if (!this.state.user) {
            this.showToast('Please log in to follow sports', 'error');
            return;
        }

        const sportId = button.getAttribute('data-sport-id');
        const sportName = button.getAttribute('data-sport-name');
        const sportIcon = button.getAttribute('data-sport-icon');
        const isCurrentlyFollowed = this.isSportFollowed(sportId);

        button.classList.add('loading');
        const icon = button.querySelector('.follow-icon');
        if (icon) {
            icon.textContent = '⏳';
        }

        try {
            let result;
            if (isCurrentlyFollowed) {
                result = await SportsManager.unfollowSport(sportId);
            } else {
                result = await SportsManager.followSport(sportId, sportName, sportIcon);
            }

            if (result.success) {
                this.showToast(result.message, 'success');
                await this.loadFollowedSports();
                this.updateSportFollowButtons();
                this.updateSportsWidget();
            } else {
                this.showToast(result.message, 'error');
                this.updateFollowButtonAppearance(button, isCurrentlyFollowed);
            }
        } catch (error) {
            console.error('Error handling sport follow:', error);
            this.showToast('Error updating sport follow status', 'error');
            this.updateFollowButtonAppearance(button, isCurrentlyFollowed);
        } finally {
            button.classList.remove('loading');
        }
    }

    isSportFollowed(sportId) {
        return followedSports.some(sport => sport.sportId === sportId);
    }

    updateFollowButtonAppearance(button, isFollowed) {
        const icon = button.querySelector('.follow-icon');
        if (icon) {
            if (isFollowed) {
                icon.textContent = '❤️';
                icon.className = 'follow-icon heart-filled';
                button.classList.add('following');
            } else {
                icon.textContent = '🤍';
                icon.className = 'follow-icon heart-outline';
                button.classList.remove('following');
            }
        }
    }

    updateSportFollowButtons() {
        const followButtons = document.querySelectorAll('.sport-follow-btn');
        followButtons.forEach(button => {
            const sportId = button.getAttribute('data-sport-id');
            const isFollowed = this.isSportFollowed(sportId);
            this.updateFollowButtonAppearance(button, isFollowed);
        });

        const heroFollowBtn = document.getElementById('footballFollowBtn');
        if (heroFollowBtn) {
            const sportId = heroFollowBtn.getAttribute('data-sport-id');
            const isFollowed = this.isSportFollowed(sportId);
            this.updateHeroFollowButton(heroFollowBtn, isFollowed);
        }

        const toggleButtons = document.querySelectorAll('.follow-toggle-btn');
        toggleButtons.forEach(button => {
            const sportId = button.getAttribute('data-sport-id');
            const isFollowed = this.isSportFollowed(sportId);
            this.updateToggleButtonAppearance(button, isFollowed);
        });
    }

    updateToggleButtonAppearance(button, isFollowed) {
        if (isFollowed) {
            button.classList.add('following');
            const icon = button.querySelector('.btn-icon');
            if (icon) {
                icon.className = 'btn-icon heart-filled';
            }
            button.innerHTML = `<span class="btn-icon heart-filled"></span> Following`;
        } else {
            button.classList.remove('following');
            const icon = button.querySelector('.btn-icon');
            if (icon) {
                icon.className = 'btn-icon heart-outline';
            }
            button.innerHTML = `<span class="btn-icon heart-outline"></span> Follow`;
        }
    }

    addSportsFollowSection() {
        if (this.state.user && this.currentPage === 'home') {
            this.createSportsFollowWidget();
        }
    }

    createSportsFollowWidget() {
        const rightColumn = document.querySelector('.right-column');
        if (!rightColumn) {
            console.warn('Right column not found for sports follow widget');
            return;
        }

        if (document.getElementById('followedSportsWidget')) {
            return;
        }

        const sportsWidget = document.createElement('div');
        sportsWidget.className = 'widget';
        sportsWidget.id = 'followedSportsWidget';
        sportsWidget.innerHTML = `
            <h3>Followed Sports</h3>
            <div id="followedSportsList" class="followed-sports-list">
                ${followedSports.length === 0 ? 
                    '<div class="empty-followed-sports">' +
                    '<div class="empty-icon">🏆</div>' +
                    '<p>No sports followed yet</p>' +
                    '<p style="font-size: 12px;">Follow sports to see them here</p>' +
                    '</div>' : 
                    followedSports.map(sport => `
                        <div class="followed-sport-item" data-sport-id="${sport.sportId}">
                            <span class="sport-icon">${sport.icon}</span>
                            <span class="sport-name">${sport.sportName}</span>
                            <button class="unfollow-btn" data-sport-id="${sport.sportId}" data-sport-name="${sport.sportName}">×</button>
                        </div>
                    `).join('')
                }
            </div>
            <div class="widget-footer">
                <button id="manageSportsBtn" class="btn-secondary">Manage Sports</button>
            </div>
        `;

        const firstWidget = rightColumn.querySelector('.widget');
        if (firstWidget) {
            rightColumn.insertBefore(sportsWidget, firstWidget.nextSibling);
        } else {
            rightColumn.prepend(sportsWidget);
        }

        this.setupSportsWidgetEvents();
    }

    setupSportsWidgetEvents() {
        const unfollowButtons = document.querySelectorAll('.unfollow-btn');
        unfollowButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                const sportId = button.getAttribute('data-sport-id');
                const sportName = button.getAttribute('data-sport-name');
                await this.handleSportUnfollow(sportId, sportName);
            });
        });

        const manageSportsBtn = document.getElementById('manageSportsBtn');
        if (manageSportsBtn) {
            manageSportsBtn.addEventListener('click', () => {
                this.showSportsManagementModal();
            });
        }
    }

    async handleSportUnfollow(sportId, sportName) {
        if (!this.state.user) return;

        try {
            const result = await SportsManager.unfollowSport(sportId);
            if (result.success) {
                this.showToast(`Unfollowed ${sportName}`, 'success');
                await this.loadFollowedSports();
                this.updateSportFollowButtons();
                this.updateSportsWidget();
            } else {
                this.showToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Error unfollowing sport:', error);
            this.showToast('Error unfollowing sport', 'error');
        }
    }

    updateSportsWidget() {
        const followedSportsList = document.getElementById('followedSportsList');
        if (followedSportsList) {
            if (followedSports.length === 0) {
                followedSportsList.innerHTML = 
                    '<div class="empty-followed-sports">' +
                    '<div class="empty-icon">🏆</div>' +
                    '<p>No sports followed yet</p>' +
                    '<p style="font-size: 12px;">Follow sports to see them here</p>' +
                    '</div>';
            } else {
                followedSportsList.innerHTML = followedSports.map(sport => `
                    <div class="followed-sport-item" data-sport-id="${sport.sportId}">
                        <span class="sport-icon">${sport.icon}</span>
                        <span class="sport-name">${sport.sportName}</span>
                        <button class="unfollow-btn" data-sport-id="${sport.sportId}" data-sport-name="${sport.sportName}">×</button>
                    </div>
                `).join('');

                const unfollowButtons = followedSportsList.querySelectorAll('.unfollow-btn');
                unfollowButtons.forEach(button => {
                    button.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const sportId = button.getAttribute('data-sport-id');
                        const sportName = button.getAttribute('data-sport-name');
                        await this.handleSportUnfollow(sportId, sportName);
                    });
                });
            }
        }
    }

    async showSportsManagementModal() {
        const allSportsResult = await SportsManager.getAllSports();
        if (!allSportsResult.success) {
            this.showToast('Error loading sports', 'error');
            return;
        }

        const allSports = allSportsResult.sports;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="AllSportsApp.closeModal()"></div>
            <div class="modal-content large">
                <div class="modal-header">
                    <h2>Manage Followed Sports</h2>
                    <button class="modal-close" onclick="AllSportsApp.closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="sports-management">
                        <div class="search-bar">
                            <input type="text" id="sportsSearch" placeholder="Search sports..." class="search-input">
                        </div>
                        <div class="sports-stats">
                            <div class="sport-stat">
                                <span class="sport-stat-value">${followedSports.length}</span>
                                <span class="sport-stat-label">Following</span>
                            </div>
                            <div class="sport-stat">
                                <span class="sport-stat-value">${allSports.length}</span>
                                <span class="sport-stat-label">Available</span>
                            </div>
                            <div class="sport-stat">
                                <span class="sport-stat-value">${Math.round((followedSports.length / allSports.length) * 100)}%</span>
                                <span class="sport-stat-label">Coverage</span>
                            </div>
                        </div>
                        <div class="sports-grid">
                            ${allSports.map(sport => {
                                const isFollowed = this.isSportFollowed(sport.sportId);
                                return `
                                    <div class="sport-management-item ${isFollowed ? 'followed' : ''}" data-sport-id="${sport.sportId}">
                                        <div class="sport-info">
                                            <span class="sport-icon">${sport.icon}</span>
                                            <div class="sport-details">
                                                <h4>${sport.sportName}</h4>
                                                <p>${sport.description}</p>
                                                <span class="sport-category">${sport.category}</span>
                                            </div>
                                        </div>
                                        <button class="follow-toggle-btn ${isFollowed ? 'following' : ''}" 
                                                data-sport-id="${sport.sportId}" 
                                                data-sport-name="${sport.sportName}"
                                                data-sport-icon="${sport.icon}">
                                            ${isFollowed ? '<span class="btn-icon heart-filled"></span> Following' : '<span class="btn-icon heart-outline"></span> Follow'}
                                        </button>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        this.setupSportsManagementEvents();
    }

    setupSportsManagementEvents() {
        const followToggleBtns = document.querySelectorAll('.follow-toggle-btn');
        followToggleBtns.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                const sportId = button.getAttribute('data-sport-id');
                const sportName = button.getAttribute('data-sport-name');
                const sportIcon = button.getAttribute('data-sport-icon');
                const isCurrentlyFollowed = this.isSportFollowed(sportId);

                try {
                    let result;
                    if (isCurrentlyFollowed) {
                        result = await SportsManager.unfollowSport(sportId);
                    } else {
                        result = await SportsManager.followSport(sportId, sportName, sportIcon);
                    }

                    if (result.success) {
                        this.showToast(result.message, 'success');
                        await this.loadFollowedSports();
                        this.updateSportFollowButtons();
                        this.updateSportsWidget();
                        this.updateSportsManagementModal();
                    } else {
                        this.showToast(result.message, 'error');
                    }
                } catch (error) {
                    console.error('Error toggling sport follow:', error);
                    this.showToast('Error updating sport follow status', 'error');
                }
            });
        });

        const sportsSearch = document.getElementById('sportsSearch');
        if (sportsSearch) {
            sportsSearch.addEventListener('input', (e) => {
                this.filterSportsManagement(e.target.value);
            });
        }
    }

    filterSportsManagement(query) {
        const sportItems = document.querySelectorAll('.sport-management-item');
        const searchTerm = query.toLowerCase().trim();

        sportItems.forEach(item => {
            const sportName = item.querySelector('h4').textContent.toLowerCase();
            const sportCategory = item.querySelector('.sport-category').textContent.toLowerCase();
            const sportDescription = item.querySelector('p').textContent.toLowerCase();

            const matches = sportName.includes(searchTerm) || 
                           sportCategory.includes(searchTerm) || 
                           sportDescription.includes(searchTerm);

            item.style.display = matches ? 'flex' : 'none';
        });
    }

    updateSportsManagementModal() {
        const sportItems = document.querySelectorAll('.sport-management-item');
        sportItems.forEach(item => {
            const sportId = item.getAttribute('data-sport-id');
            const isFollowed = this.isSportFollowed(sportId);
            const button = item.querySelector('.follow-toggle-btn');

            item.classList.toggle('followed', isFollowed);
            this.updateToggleButtonAppearance(button, isFollowed);
        });

        const allSportsResult = SportsManager.getAllSports();
        const stats = document.querySelector('.sports-stats');
        if (stats && allSportsResult.sports) {
            stats.innerHTML = `
                <div class="sport-stat">
                    <span class="sport-stat-value">${followedSports.length}</span>
                    <span class="sport-stat-label">Following</span>
                </div>
                <div class="sport-stat">
                    <span class="sport-stat-value">${allSportsResult.sports.length}</span>
                    <span class="sport-stat-label">Available</span>
                </div>
                <div class="sport-stat">
                    <span class="sport-stat-value">${Math.round((followedSports.length / allSportsResult.sports.length) * 100)}%</span>
                    <span class="sport-stat-label">Coverage</span>
                </div>
            `;
        }
    }

    initDropdowns() {
        const dropdownButtons = document.querySelectorAll('.has-dropdown .nav-button');
        
        dropdownButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                
                AllSportsApp.closeAllDropdowns();
                
                this.setAttribute('aria-expanded', !isExpanded);
                const dropdown = this.closest('.has-dropdown').querySelector('.dropdown');
                dropdown.setAttribute('aria-hidden', isExpanded);
                
                const parentLi = this.closest('.has-dropdown');
                if (!isExpanded) {
                    parentLi.classList.add('dropdown-active');
                } else {
                    parentLi.classList.remove('dropdown-active');
                }
            });
        });

        document.addEventListener('click', function(e) {
            if (!e.target.closest('.has-dropdown')) {
                AllSportsApp.closeAllDropdowns();
            }
        });
    }

    static closeAllDropdowns() {
        const dropdowns = document.querySelectorAll('.has-dropdown');
        dropdowns.forEach(dropdown => {
            const button = dropdown.querySelector('.nav-button');
            const menu = dropdown.querySelector('.dropdown');
            if (button) button.setAttribute('aria-expanded', 'false');
            if (menu) menu.setAttribute('aria-hidden', 'true');
            dropdown.classList.remove('dropdown-active');
        });
        
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.classList.remove('active');
        }
    }

    initMobileMenu() {
        const mobileToggle = document.getElementById('mobileToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileToggle) {
            mobileToggle.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !isExpanded);
                mobileMenu.classList.toggle('open');
                mobileMenu.setAttribute('aria-hidden', isExpanded);
                document.body.style.overflow = !isExpanded ? 'hidden' : '';
            });
        }
    }

    static closeMobileMenu() {
        const mobileToggle = document.getElementById('mobileToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
        if (mobileMenu) {
            mobileMenu.classList.remove('open');
            mobileMenu.setAttribute('aria-hidden', 'true');
        }
        document.body.style.overflow = '';
    }

    static toggleMobileDropdown(button) {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', !isExpanded);
        const menu = button.nextElementSibling;
        if (menu) menu.setAttribute('aria-hidden', isExpanded);
    }

    initScrollEffects() {
        let scrollTimer;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(function() {
                const header = document.getElementById('siteHeader');
                if (window.scrollY > 100) {
                    header.classList.add('header--compact');
                } else {
                    header.classList.remove('header--compact');
                }
            }, 10);
        });
    }

    initSearchFunctionality() {
        const searchInput = document.getElementById('searchInput');
        const mobileSearchInput = document.getElementById('mobileSearchInput');
        
        if (!document.getElementById('searchResults')) {
            const searchContainer = document.querySelector('.search');
            if (searchContainer) {
                const searchResults = document.createElement('div');
                searchResults.id = 'searchResults';
                searchResults.className = 'search-results';
                searchContainer.appendChild(searchResults);
            }
        }
        
        if (searchInput) {
            searchInput.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
                if (this.value.trim().length > 0) {
                    this.showSearchResults(this.value);
                }
            });
            
            searchInput.addEventListener('blur', function() {
                setTimeout(() => {
                    this.parentElement.classList.remove('focused');
                }, 200);
            });
            
            searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }
        
        if (mobileSearchInput) {
            mobileSearchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            mobileSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                    AllSportsApp.closeMobileMenu();
                    mobileSearchInput.blur();
                    const mainSearchInput = document.getElementById('searchInput');
                    if (mainSearchInput) {
                        mainSearchInput.focus();
                        mainSearchInput.value = e.target.value;
                    }
                }
            });
        }
    }

    handleSearchInput(query) {
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(() => {
            if (query.trim().length > 0) {
                this.showSearchResults(query);
            } else {
                this.hideSearchResults();
            }
        }, 300);
    }

    showSearchResults(query) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        if (!query || query.trim().length === 0) {
            this.hideSearchResults();
            return;
        }

        const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(term => term.length > 0);

        if (searchTerms.length === 0) {
            this.hideSearchResults();
            return;
        }

        if (mockNewsData.length === 0) {
            mockNewsData = this.getMockNewsData();
        }

        const scoredResults = mockNewsData.map(item => {
            let score = 0;
            const fields = {
                title: item.title.toLowerCase(),
                sport: item.sport.toLowerCase(),
                league: item.league.toLowerCase(),
                homeTeam: item.teams?.home?.toLowerCase() || '',
                awayTeam: item.teams?.away?.toLowerCase() || '',
                excerpt: item.excerpt.toLowerCase(),
                venue: item.venue?.toLowerCase() || '',
                author: item.author?.toLowerCase() || ''
            };

            searchTerms.forEach(term => {
                if (fields.title === term) score += 10;
                if (fields.sport === term) score += 8;
                if (fields.league === term) score += 7;
                if (fields.homeTeam === term || fields.awayTeam === term) score += 9;
                
                const wordBoundaryRegex = new RegExp(`\\b${term}\\b`, 'gi');
                
                if (wordBoundaryRegex.test(item.title)) score += 6;
                if (wordBoundaryRegex.test(item.sport)) score += 5;
                if (wordBoundaryRegex.test(item.league)) score += 4;
                if (wordBoundaryRegex.test(item.teams?.home || '')) score += 5;
                if (wordBoundaryRegex.test(item.teams?.away || '')) score += 5;
                if (wordBoundaryRegex.test(item.excerpt)) score += 3;
                if (wordBoundaryRegex.test(item.venue || '')) score += 2;
                
                if (fields.title.includes(term)) score += 2;
                if (fields.sport.includes(term)) score += 1;
                if (fields.league.includes(term)) score += 1;
                if (fields.homeTeam.includes(term) || fields.awayTeam.includes(term)) score += 2;
                if (fields.excerpt.includes(term)) score += 1;
            });

            if (item.status === 'Live') score += 3;
            
            const articleDate = new Date(item.date);
            const now = new Date();
            const daysAgo = (now - articleDate) / (1000 * 60 * 60 * 24);
            if (daysAgo < 1) score += 2;
            else if (daysAgo < 7) score += 1;

            return { ...item, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);

        if (scoredResults.length > 0) {
            searchResults.innerHTML = scoredResults.map(item => {
                let highlightedTitle = item.title;
                searchTerms.forEach(term => {
                    const regex = new RegExp(`(${term})`, 'gi');
                    highlightedTitle = highlightedTitle.replace(regex, '<mark>$1</mark>');
                });

                return `
                <div class="search-result-item" data-article-id="${item._id}">
                    <div class="search-result-content">
                        <div class="search-result-title">${highlightedTitle}</div>
                        <div class="search-result-meta">
                            <span class="search-result-sport">${item.sport}</span>
                            <span class="search-result-league">${item.league}</span>
                            ${item.status ? `<span class="search-result-status ${item.status.toLowerCase()}">${item.status}</span>` : ''}
                        </div>
                        <div class="search-result-excerpt">${this.highlightTerms(item.excerpt, searchTerms)}</div>
                    </div>
                </div>
                `;
            }).join('');

            searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const articleId = item.dataset.articleId;
                    const article = mockNewsData.find(a => a._id === articleId);
                    if (article) {
                        this.openArticleModal(article);
                        this.hideSearchResults();
                        
                        const searchInput = document.getElementById('searchInput');
                        const mobileSearchInput = document.getElementById('mobileSearchInput');
                        if (searchInput) searchInput.value = '';
                        if (mobileSearchInput) mobileSearchInput.value = '';
                    }
                });
            });

            searchResults.classList.add('active');
        } else {
            searchResults.innerHTML = `
                <div class="search-result-item no-results">
                    <div class="search-result-content">
                        <div class="search-result-title">No results found for "${query}"</div>
                        <div class="search-result-meta">Try different keywords or check spelling</div>
                    </div>
                </div>
            `;
            searchResults.classList.add('active');
        }
    }

    highlightTerms(text, terms) {
        let highlighted = text;
        terms.forEach(term => {
            const regex = new RegExp(`(${term})`, 'gi');
            highlighted = highlighted.replace(regex, '<mark>$1</mark>');
        });
        return highlighted;
    }

    hideSearchResults() {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.classList.remove('active');
        }
    }

    performSearch(query) {
        if (query.trim()) {
            console.log('Performing search for:', query);
            this.hideSearchResults();
            
            this.showToast(`Searching for: ${query}`);
            
            const mobileSearchInput = document.getElementById('mobileSearchInput');
            if (mobileSearchInput && mobileSearchInput.value !== query) {
                mobileSearchInput.value = query;
            }
        }
    }

    initCarousel() {
        const carousels = document.querySelectorAll('.hero-carousel');
        carousels.forEach(carousel => {
            const items = carousel.querySelectorAll('.hero-item');
            if (items.length > 1) {
                let currentIndex = 0;
                items[currentIndex].classList.add('active');
                setInterval(() => {
                    items[currentIndex].classList.remove('active');
                    currentIndex = (currentIndex + 1) % items.length;
                    items[currentIndex].classList.add('active');
                }, 5000);
            } else if (items.length === 1) {
                items[0].classList.add('active');
            }
        });
    }

    updateLiveScores() {
        const scores = document.querySelectorAll('.live-score');
        scores.forEach((score, index) => {
            if (score.querySelector('.live-indicator')) {
                setTimeout(() => {
                    const scoreElement = score.querySelector('.score');
                    if (scoreElement) {
                        const [home, away] = scoreElement.textContent.split('-').map(num => parseInt(num.trim()));
                        if (!isNaN(home) && !isNaN(away)) {
                            const homeChange = Math.random() > 0.7 ? 1 : 0;
                            const awayChange = Math.random() > 0.7 ? 1 : 0;
                            const newHome = Math.min(home + homeChange, 5);
                            const newAway = Math.min(away + awayChange, 5);
                            scoreElement.textContent = `${newHome}-${newAway}`;
                            scoreElement.style.transform = 'scale(1.2)';
                            setTimeout(() => {
                                scoreElement.style.transform = 'scale(1)';
                            }, 300);
                        }
                    }
                }, 5000 + (index * 2000));
            }
        });
        setTimeout(() => this.updateLiveScores(), 10000);
    }

    enhanceCards() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
                card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
            });
            
            card.addEventListener('click', function() {
                this.style.transform = 'translateY(-4px) scale(1.01)';
                setTimeout(() => {
                    this.style.transform = 'translateY(-8px) scale(1.02)';
                }, 150);
            });
        });
    }

    initTicker() {
        const tickerContent = [
            "⚽ Man Utd 2-1 Liverpool (75') - Rashford scores!",
            "🏀 Lakers vs Warriors: 98-95 in Q4",
            "🎾 Nadal wins first set 6-4 against Djokovic",
            "🏎️ Verstappen leads Bahrain GP",
            "🏏 India 285/4 (45 overs) vs Australia",
            "⚾ Yankees 3-2 Red Sox: Bottom 7th"
        ];
        
        const marqueeInner = document.getElementById('marqueeInner');
        if (marqueeInner) {
            const repeatedContent = [...tickerContent, ...tickerContent];
            marqueeInner.innerHTML = repeatedContent.map(item => 
                `<span class="ticker-item">${item}</span>`
            ).join(' • ');
            this.updateTicker();
            setInterval(() => this.updateTicker(), 60000);
        }
    }

    updateTicker() {
        const tickerTime = document.getElementById('tickerTime');
        if (tickerTime) {
            const now = new Date();
            tickerTime.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
    }

    initUserPreferences() {
        if (this.state.user) {
            const preferences = this.state.user.preferences || {
                favoriteSports: [],
                favoriteTeams: [],
                notifications: true,
                theme: 'dark'
            };
            
            document.documentElement.setAttribute('data-theme', preferences.theme);
        }
    }

    updateLoginUI() {
        const loginBtn = document.getElementById('loginBtn');
        const mobileLoginBtn = document.getElementById('mobileLoginBtn');
        
        if (this.state.user) {
            if (loginBtn) {
                loginBtn.innerHTML = `
                <div class="user-dropdown">
                    <button class="user-button">
                        <span class="user-avatar">👤</span>
                        <span class="user-name">${this.state.user.username}</span>
                        <span class="dropdown-arrow">▼</span>
                    </button>
                    <div class="user-menu">
                        <div class="user-info">
                            <strong>${this.state.user.username}</strong>
                            <span>${this.state.user.email}</span>
                        </div>
                        <div class="dropdown-divider"></div>
                        <button class="dropdown-item" onclick="AllSportsApp.logout()">
                            <span class="icon">🚪</span>
                            Sign Out
                        </button>
                    </div>
                </div>
                `;
                this.initUserDropdown();
            }
            
            if (mobileLoginBtn) {
                mobileLoginBtn.innerHTML = `
                <div class="user-info-mobile">
                    <span class="user-avatar">👤</span>
                    <span class="user-name">${this.state.user.username}</span>
                </div>
                <div class="dropdown-divider"></div>
                <button class="mobile-nav-button" onclick="AllSportsApp.logout()">
                    <span class="icon">🚪</span>
                    Sign Out
                </button>
                `;
            }
        } else {
            if (loginBtn) {
                loginBtn.innerHTML = `
                <div class="user-dropdown">
                    <button class="user-button">
                        <span class="user-avatar">👤</span>
                        <span class="user-name">Login</span>
                        <span class="dropdown-arrow">▼</span>
                    </button>
                    <div class="user-menu">
                        <a href="../login.html" class="dropdown-item">
                            <span class="icon">🔑</span>
                            Sign In
                        </a>
                    </div>
                </div>
                `;
                this.initUserDropdown();
            }
            
            if (mobileLoginBtn) {
                mobileLoginBtn.innerHTML = `
                <a href="../login.html" class="btn btn-login mobile-login" onclick="AllSportsApp.closeMobileMenu();">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    Login
                </a>
                `;
            }
        }
    }

    initUserDropdown() {
        const userButtons = document.querySelectorAll('.user-button');
        
        userButtons.forEach(userButton => {
            const userMenu = userButton.nextElementSibling;
            
            if (userButton && userMenu) {
                userButton.addEventListener('mouseenter', function() {
                    userMenu.classList.add('active');
                });
                
                userButton.addEventListener('mouseleave', function() {
                    setTimeout(() => {
                        if (!userMenu.matches(':hover')) {
                            userMenu.classList.remove('active');
                        }
                    }, 100);
                });
                
                userMenu.addEventListener('mouseenter', function() {
                    this.classList.add('active');
                });
                
                userMenu.addEventListener('mouseleave', function() {
                    this.classList.remove('active');
                });
            }
        });
    }

    static async logout() {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
            const result = await response.json();
            
            if (result.success) {
                AllSportsApp.showToast(result.message, 'success');
                
                const app = new AllSportsApp();
                app.state.user = null;
                app.updateLoginUI();
                
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1000);
            }
        } catch (error) {
            console.error('Logout error:', error);
            AllSportsApp.showToast('Error during logout', 'error');
        }
    }

    openArticleModal(article) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="AllSportsApp.closeModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${article.title}</h2>
                    <button class="modal-close" onclick="AllSportsApp.closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="article-header">
                        <div class="sport-league">
                            <span class="tag">${article.sport}</span>
                            <span class="league-tag">${article.league}</span>
                        </div>
                        <div class="article-meta">
                            By <strong>${article.author || 'Sports Desk'}</strong> • ${this.formatDate(article.date)}
                        </div>
                    </div>
                    <div class="article-content">
                        <p>${article.excerpt}</p>
                        
                        <div class="match-details">
                            <h4>Match Information</h4>
                            <div class="match-info-grid">
                                ${article.teams ? `
                                    <div class="match-info-item">
                                        <span>Teams:</span>
                                        <strong>${article.teams.home} vs ${article.teams.away}</strong>
                                    </div>
                                ` : ''}
                                
                                ${article.score ? `
                                    <div class="match-info-item">
                                        <span>Score:</span>
                                        <strong style="color: var(--accent);">${article.score}</strong>
                                    </div>
                                ` : ''}
                                
                                ${article.status ? `
                                    <div class="match-info-item">
                                        <span>Status:</span>
                                        <span class="status ${article.status.toLowerCase()}">${article.status}</span>
                                    </div>
                                ` : ''}
                                
                                ${article.venue ? `
                                    <div class="match-info-item">
                                        <span>Venue:</span>
                                        <span>${article.venue}</span>
                                    </div>
                                ` : ''}
                                
                                ${article.date ? `
                                    <div class="match-info-item">
                                        <span>Date & Time:</span>
                                        <span>${new Date(article.date).toLocaleString()}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <h4>Match Analysis</h4>
                        <p>This is a detailed analysis of the match. In a real application, this would include:</p>
                        <ul>
                            <li>Key moments and turning points</li>
                            <li>Player performances and statistics</li>
                            <li>Tactical analysis and formations</li>
                            <li>Expert commentary and insights</li>
                            <li>Post-match interviews and reactions</li>
                        </ul>
                        <p>The ${article.teams?.home || 'Team A'} and ${article.teams?.away || 'Team B'} delivered an exciting match that kept fans on the edge of their seats throughout the game.</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }

    static closeModal() {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.remove();
        }
        document.body.style.overflow = '';
    }

    static showToast(message, type = 'success') {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: ${type === 'error' ? '#ff4444' : 'var(--accent)'};
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
                font-weight: 500;
                pointer-events: none;
                max-width: 300px;
                text-align: center;
            `;
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.backgroundColor = type === 'error' ? '#ff4444' : 'var(--accent)';
        toast.style.opacity = '1';
        
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 3000);
    }

    formatDate(dateString) {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getMockNewsData() {
        return [
            {
                _id: '1',
                sport: 'Football',
                league: 'Premier League',
                teams: { home: 'Manchester United', away: 'Liverpool' },
                title: 'EPL Clash: Manchester United vs Liverpool',
                excerpt: 'Exciting match between two historic rivals with incredible atmosphere at Old Trafford',
                score: '2-1',
                status: 'Live',
                venue: 'Old Trafford',
                date: new Date().toISOString(),
                author: 'John Smith',
                img: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=400'
            },
            {
                _id: '2',
                sport: 'Cricket',
                league: 'ICC World Cup',
                teams: { home: 'India', away: 'Australia' },
                title: 'World Cup Final: India vs Australia',
                excerpt: 'Thrilling final match of the World Cup with record-breaking performances',
                score: '245/3 - 280/6',
                status: 'Finished',
                venue: 'MCG',
                date: new Date(Date.now() - 86400000).toISOString(),
                author: 'Mike Johnson',
                img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400'
            },
            {
                _id: '3',
                sport: 'Basketball',
                league: 'NBA',
                teams: { home: 'Lakers', away: 'Warriors' },
                title: 'NBA Showdown: Lakers vs Warriors',
                excerpt: 'Western Conference battle between two basketball giants',
                status: 'Upcoming',
                venue: 'Staples Center',
                date: new Date(Date.now() + 86400000).toISOString(),
                author: 'Sarah Wilson',
                img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400'
            },
            {
                _id: '4',
                sport: 'Tennis',
                league: 'Wimbledon',
                teams: { home: 'Novak Djokovic', away: 'Carlos Alcaraz' },
                title: 'Wimbledon Finals: Djokovic vs Alcaraz',
                excerpt: 'Epic battle for the Wimbledon title between veteran and rising star',
                score: '6-4, 5-7, 6-4',
                status: 'Finished',
                venue: 'Centre Court',
                date: new Date(Date.now() - 172800000).toISOString(),
                author: 'Emma Davis',
                img: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=400'
            },
            {
                _id: '5',
                sport: 'Baseball',
                league: 'MLB',
                teams: { home: 'Yankees', away: 'Red Sox' },
                title: 'MLB Classic: Yankees vs Red Sox',
                excerpt: 'Historic rivalry continues in this intense baseball matchup',
                status: 'Live',
                venue: 'Yankee Stadium',
                date: new Date().toISOString(),
                author: 'Chris Thompson',
                img: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400'
            }
        ];
    }

    async loadInitialData() {
        return new Promise(resolve => {
            setTimeout(() => {
                mockNewsData = this.getMockNewsData();
                this.state.news = mockNewsData;
                resolve();
            }, 1000);
        });
    }

    startLiveUpdates() {
        setInterval(() => {
            this.updateLiveScores();
        }, 15000);
    }

    initializeLeagueFilters() {
        console.log('League filters initialized');
    }

    applyUserPreferences() {
        if (this.state.userPreferences.theme) {
            document.documentElement.setAttribute('data-theme', this.state.userPreferences.theme);
        }
    }

    setupBackToTop() {
        const backToTop = document.createElement('button');
        backToTop.id = 'backToTop';
        backToTop.innerHTML = '↑';
        backToTop.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--accent);
            color: white;
            border: none;
            font-size: 20px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s, transform 0.3s;
            z-index: 1000;
        `;
        document.body.appendChild(backToTop);

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.style.opacity = '1';
                backToTop.style.transform = 'scale(1)';
            } else {
                backToTop.style.opacity = '0';
                backToTop.style.transform = 'scale(0.8)';
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    setupFollowFunctionality() {
        console.log('Follow functionality initialized');
    }

    initScoresPage() {
        console.log('Initializing scores page');
    }

    initWatchPage() {
        console.log('Initializing watch page');
    }

    initTeamsPage() {
        console.log('Initializing teams page');
    }

    initFixturesPage() {
        console.log('Initializing fixtures page');
    }

    showToast(message, type = 'success') {
        AllSportsApp.showToast(message, type);
    }
}

// Global variables
let currentUser = null;
let mockNewsData = [];
let mockUsers = [];
let followedSports = [];
let sportPageManager;

// Global initialization - UPDATED with better timing
document.addEventListener('DOMContentLoaded', function() {
    console.log("AllSports site loaded");

    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (isLoginPage) {
        new LoginPageHandler();
    } else {
        // Initialize AllSportsApp first and make it available globally
        const app = new AllSportsApp();
        window.AllSportsApp = app;
        
        // Then initialize SportPageManager for individual sport pages with a small delay
        if (document.getElementById('footballFollowBtn')) {
            setTimeout(() => {
                sportPageManager = new SportPageManager();
                window.sportPageManager = sportPageManager;
            }, 100);
        }
        
        // Initialize the main app
        app.init();
    }
});

// Make methods available globally
window.AllSportsApp = AllSportsApp;
window.closeMobileMenu = AllSportsApp.closeMobileMenu;
window.toggleMobileDropdown = AllSportsApp.toggleMobileDropdown;