// games.js - Updated to use API calls instead of videosData

// Global flag to prevent recursion
let isCreatingSportsWidget = false;

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
        
        // Setup existing UI features
        this.setupCardInteractions();
        this.setupLiveScoreUpdates();
        this.setupVideoPlayers();
        this.setupRightSidebar();
        
        // IMPORTANT: Initialize hero follow button for this sport
        this.initHeroFollowButton();
    }

    initHeroFollowButton() {
        const heroFollowBtn = document.getElementById('heroFollowBtn');
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

    isSportFollowed(sportId) {
        return followedSports.some(sport => sport.sportId === sportId);
    }

    updateHeroFollowButton(button, isFollowed) {
        const followText = button.querySelector('.follow-text');
        const followIcon = button.querySelector('.follow-icon-hero');
        
        if (!followText || !followIcon) {
            console.warn('Hero follow button elements not found');
            return;
        }

        // Use requestAnimationFrame for smoother transitions
        requestAnimationFrame(() => {
            if (isFollowed) {
                button.classList.add('following');
                followText.textContent = 'Followed';
                followIcon.textContent = '❤️';
                followIcon.style.transform = 'scale(1.2)';
                
                // Reset transform after animation
                setTimeout(() => {
                    followIcon.style.transform = 'scale(1)';
                }, 300);
            } else {
                button.classList.remove('following');
                followText.textContent = 'Follow';
                followIcon.textContent = '🤍';
                followIcon.style.transform = 'scale(1.2)';
                
                // Reset transform after animation
                setTimeout(() => {
                    followIcon.style.transform = 'scale(1)';
                }, 300);
            }
            
            // Force reflow for smooth transition
            button.offsetHeight;
        });
    }

    async handleHeroFollowClick(button) {
        if (!this.currentUser) {
            this.showToast('Please log in to follow sports', 'error');
            return;
        }

        const sportId = button.getAttribute('data-sport-id');
        const sportName = button.getAttribute('data-sport-name');
        const sportIcon = button.getAttribute('data-sport-icon');
        const isCurrentlyFollowed = this.isSportFollowed(sportId);

        // Add loading state with proper transitions
        button.classList.add('loading', 'btn-loading');
        button.disabled = true;
        
        // Store original content for restoration if needed
        const originalContent = button.innerHTML;

        try {
            let result;
            if (isCurrentlyFollowed) {
                result = await SportsManager.unfollowSport(sportId);
            } else {
                result = await SportsManager.followSport(sportId, sportName, sportIcon);
            }

            if (result.success) {
                this.showToast(result.message, 'success');
                
                // Add animation class for smooth transition
                button.classList.add('animating');
                setTimeout(() => button.classList.remove('animating'), 600);
                
                // Update button state with smooth transition
                this.updateHeroFollowButton(button, !isCurrentlyFollowed);
                
                await this.loadFollowedSports();
                
                if (window.AllSportsApp) {
                    window.AllSportsApp.updateSportFollowButtons();
                    window.AllSportsApp.updateSportsWidget();
                }
            } else {
                this.showToast(result.message, 'error');
                // Restore original content on error
                button.innerHTML = originalContent;
                this.updateHeroFollowButton(button, isCurrentlyFollowed);
            }
        } catch (error) {
            console.error('Error handling sport follow:', error);
            this.showToast('Error updating sport follow status', 'error');
            // Restore original content on error
            button.innerHTML = originalContent;
            this.updateHeroFollowButton(button, isCurrentlyFollowed);
        } finally {
            button.classList.remove('loading', 'btn-loading');
            button.disabled = false;
        }
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

    updateSportFollowButtons() {
        const heroFollowBtn = document.getElementById('heroFollowBtn');
        if (heroFollowBtn) {
            const sportId = heroFollowBtn.getAttribute('data-sport-id');
            const isFollowed = this.isSportFollowed(sportId);
            this.updateHeroFollowButton(heroFollowBtn, isFollowed);
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

    // ... rest of the SportPageManager class methods remain the same ...
    // Setup right sidebar, load data, render videos, etc.

    setupRightSidebar() {
        this.ensureRightSidebarContainers();
        
        if (this.currentUser && window.AllSportsApp) {
            console.log('Sports widget will be handled by AllSportsApp');
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
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }

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
            
            // Try multiple endpoints to get hero content
            let heroData = null;
            
            // First try featured videos
            const featuredResponse = await fetch(`/api/sports/${this.sport}/videos?featured=true&limit=1`);
            const featuredResult = await featuredResponse.json();
            
            if (featuredResult.success && featuredResult.videos && featuredResult.videos.length > 0) {
                heroData = featuredResult.videos[0];
                console.log('Found featured video for hero:', heroData);
            } else {
                // Try any video for this sport
                const sportResponse = await fetch(`/api/sports/${this.sport}/videos?limit=1`);
                const sportResult = await sportResponse.json();
                if (sportResult.success && sportResult.videos && sportResult.videos.length > 0) {
                    heroData = sportResult.videos[0];
                    console.log('Found any video for hero:', heroData);
                } else {
                    // Try general videos endpoint
                    const generalResponse = await fetch(`/api/videos?sport=${this.sport}&limit=1`);
                    const generalResult = await generalResponse.json();
                    if (generalResult.success && generalResult.videos && generalResult.videos.length > 0) {
                        heroData = generalResult.videos[0];
                        console.log('Found video from general endpoint:', heroData);
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
            // Use sport-specific fallback images
            const fallbackImages = {
                'cricket': 'https://i.pinimg.com/1200x/be/0a/2a/be0a2a037b1b4ec55bbc277f30aea823.jpg',
                'mma': 'https://i.pinimg.com/736x/c3/f1/47/c3f147411a3e49fda4be077fad6da972.jpg',
                'football': 'https://i.pinimg.com/736x/14/31/56/143156d98ce3004bbd0d18ab9d0ee1a1.jpg',
                'basketball': 'https://i.pinimg.com/1200x/7f/99/b9/7f99b9e379872f897914fc8ecf7166f4.jpg',
                'baseball': 'https://i.pinimg.com/736x/d8/30/61/d83061c05799c7da5c001641a1536ad9.jpg',
                'tennis': 'https://i.pinimg.com/1200x/84/fd/45/84fd45fd4c65d6b6a1874366b55a9b70.jpg',
                'hockey': 'https://i.pinimg.com/1200x/3d/17/b3/3d17b30fd0e8050b07671914b5ee3306.jpg',
                'golf': 'https://i.pinimg.com/1200x/38/f5/60/38f560ec46c94fc1b2a1ea214684f4f7.jpg',
                'rugby': 'https://i.pinimg.com/736x/29/b1/2b/29b12b443d179a1001cd6ab3c8fe854c.jpg',
                'formula1': 'https://i.pinimg.com/736x/4c/dd/b9/4cddb9b24675881cc11fa4c23f101fe5.jpg',
                'boxing': 'https://i.pinimg.com/1200x/9e/d2/80/9ed28029fea7fa1f976dcf2669e17a8a.jpg',
                'olympics': 'https://i.pinimg.com/736x/98/8a/b9/988ab9655d9705ff570ca2f88d6e3cc8.jpg'
            };
            
            heroImage.src = fallbackImages[this.sport] || 'https://i.pinimg.com/736x/14/31/56/143156d98ce3004bbd0d18ab9d0ee1a1.jpg';
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
            if (data.youtubeId) {
                heroWatchLink.href = `https://youtu.be/${data.youtubeId}`;
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
            console.log(`Loading videos for sport: ${this.sport} from API`);
            
            // Try multiple endpoints to get videos
            let videos = [];
            
            // First try sport-specific endpoint
            const sportResponse = await fetch(`/api/sports/${this.sport}/videos?limit=50`);
            const sportResult = await sportResponse.json();
            
            if (sportResult.success && sportResult.videos && sportResult.videos.length > 0) {
                videos = sportResult.videos;
                console.log(`Found ${videos.length} videos from sport-specific endpoint`);
            } else {
                // Try general videos endpoint with sport filter
                const generalResponse = await fetch(`/api/videos?sport=${this.sport}&limit=20`);
                const generalResult = await generalResponse.json();
                
                if (generalResult.success && generalResult.videos && generalResult.videos.length > 0) {
                    videos = generalResult.videos;
                    console.log(`Found ${videos.length} videos from general endpoint`);
                } else {
                    // Try search endpoint as last resort
                    const searchResponse = await fetch(`/api/videos/search?q=${this.sport}&limit=20`);
                    const searchResult = await searchResponse.json();
                    
                    if (searchResult.success && searchResult.videos && searchResult.videos.length > 0) {
                        videos = searchResult.videos;
                        console.log(`Found ${videos.length} videos from search endpoint`);
                    } else {
                        throw new Error('No videos available from any endpoint');
                    }
                }
            }

            if (videos.length > 0) {
                console.log(`Rendering ${videos.length} videos for ${this.sport}`);
                this.renderVideos(videos);
            } else {
                throw new Error('No videos found for this sport');
            }
        } catch (error) {
            console.error('Error loading videos:', error);
            this.showSectionError('videos-section', 'Failed to load videos. Using sample data.');
            this.renderFallbackVideos();
        }
    }

    renderFallbackVideos() {
        const highlightsContainer = document.getElementById('highlightsContainer');
        const featuresContainer = document.getElementById('featuresContainer');
        
        console.log('Rendering fallback videos for sport:', this.sport);
        
        const fallbackContent = this.getComprehensiveFallbackVideos();
        
        if (highlightsContainer) {
            highlightsContainer.innerHTML = fallbackContent.highlights.map(video => this.createVideoCard(video)).join('');
        }

        if (featuresContainer) {
            featuresContainer.innerHTML = fallbackContent.features.map(video => this.createVideoCard(video)).join('');
        }
    }

    getComprehensiveFallbackVideos() {
        const sport = this.sport;
        const sportName = sport.charAt(0).toUpperCase() + sport.slice(1);
        
        // Sport-specific fallback videos
        switch(sport) {
            case 'cricket':
                return {
                    highlights: [
                        {
                            title: 'India vs Australia: T20 World Cup Final Highlights',
                            thumbnail: 'https://i.pinimg.com/736x/06/e8/2d/06e82d79a909496b05a312b428f21a1d.jpg',
                            duration: '10:30',
                            category: 'Highlights',
                            youtubeId: 'R2rYf7Y7VXI',
                            sport: 'cricket'
                        },
                        {
                            title: 'England vs Pakistan: Day 4 Highlights',
                            thumbnail: 'https://i.pinimg.com/1200x/46/a6/6f/46a66fa555e7d4ce6c19677bbd26445a.jpg',
                            duration: '22:30',
                            category: 'Highlights',
                            youtubeId: 'CbMLUaGwVUk',
                            sport: 'cricket'
                        },
                        {
                            title: 'T20 World Cup Super Over Thriller',
                            thumbnail: 'https://i.pinimg.com/1200x/be/0a/2a/be0a2a037b1b4ec55bbc277f30aea823.jpg',
                            duration: '18:45',
                            category: 'Highlights',
                            youtubeId: 'm60WK8BoryY',
                            sport: 'cricket'
                        },
                        {
                            title: 'The Ashes: Epic Test Match Moments',
                            thumbnail: 'https://i.pinimg.com/1200x/e0/76/6b/e0766b589c6f1e404dee8544a7f889ce.jpg',
                            duration: '22:15',
                            category: 'Highlights',
                            youtubeId: 'qVb4irhX9Cw',
                            sport: 'cricket'
                        }
                    ],
                    features: [
                        {
                            title: 'Virat Kohli Century Masterclass',
                            thumbnail: 'https://i.pinimg.com/736x/d4/c8/b0/d4c8b0bc89ebfe8749833a1bc5498682.jpg',
                            duration: '25:10',
                            category: 'Analysis',
                            youtubeId: 'm8u-18Q0s7I',
                            sport: 'cricket'
                        },
                        {
                            title: 'Australia Road to Final: Tactical Review',
                            thumbnail: 'https://i.pinimg.com/1200x/6d/22/79/6d22791c4f98d9ec6a154481bae54e77.jpg',
                            duration: '15:40',
                            category: 'Feature',
                            youtubeId: 'PzHZGefMx9Q',
                            sport: 'cricket'
                        },
                        {
                            title: 'Breaking Down Modern Cricket Batting',
                            thumbnail: 'https://i.pinimg.com/1200x/96/38/29/96382929546214435455c11fba8af270.jpg',
                            duration: '12:15',
                            category: 'Analysis',
                            youtubeId: '6QB8C48DHlA',
                            sport: 'cricket'
                        },
                        {
                            title: 'IPL Final: Mumbai vs Chennai Highlights',
                            thumbnail: 'https://i.pinimg.com/736x/00/bf/c2/00bfc216dc1d3898011ebec63b74ede9.jpg',
                            duration: '16:40',
                            category: 'Highlights',
                            youtubeId: 'tdC2whKyvas',
                            sport: 'cricket'
                        }
                    ]
                };
            
            case 'mma':
                return {
                    highlights: [
                        {
                            title: 'Khabib vs Conor Fight Analysis',
                            thumbnail: 'https://i.pinimg.com/736x/c3/f1/47/c3f147411a3e49fda4be077fad6da972.jpg',
                            duration: '25:45',
                            category: 'Highlights',
                            youtubeId: '4bbxI4K0z_A',
                            sport: 'mma'
                        },
                        {
                            title: 'Adesanya vs Pereira 3: Co-main Event',
                            thumbnail: 'https://i.pinimg.com/736x/10/c8/96/10c8961d69d40b55673d99ea905170b0.jpg',
                            duration: '18:20',
                            category: 'Highlights',
                            youtubeId: 'yaWukOFeBAI',
                            sport: 'mma'
                        },
                        {
                            title: 'UFC Main Event: Full Fight Breakdown',
                            thumbnail: 'https://i.pinimg.com/736x/c8/6e/68/c86e687da9e788b44eed8c87e13e2791.jpg',
                            duration: '32:15',
                            category: 'Analysis',
                            youtubeId: 'Tmu6vNdAaPc',
                            sport: 'mma'
                        },
                        {
                            title: 'Submission of the Year Candidates',
                            thumbnail: 'https://i.pinimg.com/736x/bc/36/cd/bc36cd9d286e58ef2a62b157b0f64f45.jpg',
                            duration: '19:45',
                            category: 'Highlights',
                            youtubeId: 'Y1SESf1MoSc',
                            sport: 'mma'
                        }
                    ],
                    features: [
                        {
                            title: 'Jon Jones: The Greatest of All Time?',
                            thumbnail: 'https://i.pinimg.com/736x/11/08/ae/1108ae4f9d26e52790545647c97158cc.jpg',
                            duration: '16:30',
                            category: 'Feature',
                            youtubeId: 'GTonLEN-v4M',
                            sport: 'mma'
                        },
                        {
                            title: 'Breaking Down Ngannou\'s Punching Power',
                            thumbnail: 'https://i.pinimg.com/736x/15/2b/a5/152ba52050ed78ef2a96282dde439db3.jpg',
                            duration: '12:15',
                            category: 'Analysis',
                            youtubeId: 'jLqyRdwDzBQ',
                            sport: 'mma'
                        },
                        {
                            title: 'Khabib: The Eagle\'s Journey',
                            thumbnail: 'https://i.pinimg.com/736x/c8/6e/68/c86e687da9e788b44eed8c87e13e2791.jpg',
                            duration: '26:30',
                            category: 'Feature',
                            youtubeId: 'x0Xgx9sTsKs',
                            sport: 'mma'
                        },
                        {
                            title: 'MMA Technique: Ground Game Masterclass',
                            thumbnail: 'https://i.pinimg.com/736x/91/d7/ea/91d7ea9f4a60af7273af2f5f8761f532.jpg',
                            duration: '22:45',
                            category: 'Analysis',
                            youtubeId: 'mx-QZcBhZZM',
                            sport: 'mma'
                        }
                    ]
                };
            
            case 'football':
            default:
                return {
                    highlights: [
                        {
                            title: `${sportName} Match Highlights`,
                            thumbnail: 'https://i.pinimg.com/736x/14/31/56/143156d98ce3004bbd0d18ab9d0ee1a1.jpg',
                            duration: '8:45',
                            category: 'Highlights',
                            youtubeId: 'dQw4w9WgXcQ',
                            sport: sport
                        },
                        {
                            title: `${sportName} Top Plays`,
                            thumbnail: 'https://i.pinimg.com/736x/cf/5f/9a/cf5f9a1ba5080c29a58e6a6e3fbe9986.jpg',
                            duration: '10:20',
                            category: 'Highlights', 
                            youtubeId: 'dQw4w9WgXcQ',
                            sport: sport
                        },
                        {
                            title: `${sportName} Championship Moments`,
                            thumbnail: 'https://i.pinimg.com/736x/02/12/58/021258c035d77f92b2f873fafab2f097.jpg',
                            duration: '12:30',
                            category: 'Highlights',
                            youtubeId: 'dQw4w9WgXcQ',
                            sport: sport
                        },
                        {
                            title: `${sportName} Best Goals`,
                            thumbnail: 'https://i.pinimg.com/736x/6c/1b/14/6c1b143a9c84a78c3dd2752b5ca638ec.jpg',
                            duration: '9:15',
                            category: 'Highlights',
                            youtubeId: 'dQw4w9WgXcQ',
                            sport: sport
                        }
                    ],
                    features: [
                        {
                            title: `${sportName} Tactical Analysis`,
                            thumbnail: 'https://i.pinimg.com/736x/95/c3/81/95c3815b8907724df588110224d2aff0.jpg',
                            duration: '15:20',
                            category: 'Analysis',
                            youtubeId: 'dQw4w9WgXcQ',
                            sport: sport
                        },
                        {
                            title: `${sportName} Player Spotlight`,
                            thumbnail: 'https://i.pinimg.com/736x/4e/05/ba/4e05baa52f89b44efda2c702c12fddd2.jpg',
                            duration: '11:45',
                            category: 'Feature',
                            youtubeId: 'dQw4w9WgXcQ',
                            sport: sport
                        },
                        {
                            title: `${sportName} Training Secrets`,
                            thumbnail: 'https://i.pinimg.com/736x/b4/ce/24/b4ce24f9aa10b6950fc1ef556d7a6503.jpg',
                            duration: '13:30',
                            category: 'Feature',
                            youtubeId: 'dQw4w9WgXcQ',
                            sport: sport
                        },
                        {
                            title: `${sportName} Championship Review`,
                            thumbnail: 'https://i.pinimg.com/736x/d4/c8/b0/d4c8b0bc89ebfe8749833a1bc5498682.jpg',
                            duration: '18:20',
                            category: 'Analysis',
                            youtubeId: 'dQw4w9WgXcQ',
                            sport: sport
                        }
                    ]
                };
        }
    }

    renderVideos(videos) {
        const highlightsContainer = document.getElementById('highlightsContainer');
        const featuresContainer = document.getElementById('featuresContainer');
        
        console.log('Rendering videos:', videos.length);
        
        if (highlightsContainer && videos.length > 0) {
            const highlights = videos.filter(video => 
                video.category === 'Highlights' || 
                video.type?.includes('highlight') ||
                video.tags?.some(tag => 
                    tag.toLowerCase().includes('highlight') ||
                    tag.toLowerCase().includes('goal') ||
                    tag.toLowerCase().includes('match') ||
                    tag.toLowerCase().includes('game') ||
                    tag.toLowerCase().includes('fight') ||
                    tag.toLowerCase().includes('knockout')
                ) ||
                video.title.toLowerCase().includes('highlight') ||
                video.title.toLowerCase().includes('goal') ||
                video.title.toLowerCase().includes('match') ||
                video.title.toLowerCase().includes('fight') ||
                video.title.toLowerCase().includes('knockout')
            );
            
            console.log('Filtered highlights:', highlights.length);
            
            if (highlights.length > 0) {
                highlightsContainer.innerHTML = highlights.slice(0, 4).map(video => this.createVideoCard(video)).join('');
            } else {
                const nonAnalysisVideos = videos.filter(video => 
                    !video.category?.includes('Interview') && 
                    !video.category?.includes('Analysis') &&
                    !video.title.toLowerCase().includes('interview') &&
                    !video.title.toLowerCase().includes('analysis')
                ).slice(0, 4);
                
                if (nonAnalysisVideos.length > 0) {
                    highlightsContainer.innerHTML = nonAnalysisVideos.map(video => this.createVideoCard(video)).join('');
                } else {
                    highlightsContainer.innerHTML = videos.slice(0, 4).map(video => this.createVideoCard(video)).join('');
                }
            }
        }

        if (featuresContainer && videos.length > 0) {
            const features = videos.filter(video => 
                video.category === 'Feature' || 
                video.category === 'Analysis' ||
                video.type?.includes('feature') ||
                video.tags?.some(tag => 
                    tag.toLowerCase().includes('analysis') || 
                    tag.toLowerCase().includes('feature') ||
                    tag.toLowerCase().includes('tactical') ||
                    tag.toLowerCase().includes('breakdown') ||
                    tag.toLowerCase().includes('masterclass') ||
                    tag.toLowerCase().includes('technique')
                ) ||
                video.title.toLowerCase().includes('analysis') ||
                video.title.toLowerCase().includes('feature') ||
                video.title.toLowerCase().includes('tactical') ||
                video.title.toLowerCase().includes('breakdown') ||
                video.title.toLowerCase().includes('technique')
            );
            
            console.log('Filtered features:', features.length);
            
            if (features.length > 0) {
                featuresContainer.innerHTML = features.slice(0, 4).map(video => this.createVideoCard(video)).join('');
            } else {
                const highlights = videos.filter(video => 
                    video.category === 'Highlights' || 
                    video.type?.includes('highlight') ||
                    video.tags?.some(tag => tag.toLowerCase().includes('highlight'))
                );
                
                const nonHighlightVideos = videos.filter(video => 
                    !highlights.some(highlight => highlight.videoId === video.videoId)
                ).slice(0, 4);
                
                if (nonHighlightVideos.length > 0) {
                    featuresContainer.innerHTML = nonHighlightVideos.map(video => this.createVideoCard(video)).join('');
                } else {
                    featuresContainer.innerHTML = videos.slice(4, 8).map(video => this.createVideoCard(video)).join('');
                }
            }
        }
        
        this.ensureMinimumVideos();
    }

    ensureMinimumVideos() {
        const highlightsContainer = document.getElementById('highlightsContainer');
        const featuresContainer = document.getElementById('featuresContainer');
        
        if (highlightsContainer && highlightsContainer.children.length < 2) {
            console.log('Adding fallback videos to highlights');
            this.addFallbackVideos(highlightsContainer, 'highlights');
        }
        
        if (featuresContainer && featuresContainer.children.length < 2) {
            console.log('Adding fallback videos to features');
            this.addFallbackVideos(featuresContainer, 'features');
        }
    }

    addFallbackVideos(container, type) {
        const fallbackVideos = this.getFallbackVideosForSport(type);
        const currentCount = container.children.length;
        const needed = 4 - currentCount;
        
        if (needed > 0) {
            const additionalVideos = fallbackVideos.slice(0, needed);
            container.innerHTML += additionalVideos.map(video => this.createVideoCard(video)).join('');
        }
    }

    getFallbackVideosForSport(type) {
        const sport = this.sport;
        const baseVideos = [
            {
                title: `${sport.charAt(0).toUpperCase() + sport.slice(1)} ${type === 'highlights' ? 'Highlights' : 'Analysis'}`,
                thumbnail: this.getSportFallbackThumbnail(sport),
                duration: '10:30',
                category: type === 'highlights' ? 'Highlights' : 'Analysis',
                youtubeId: 'dQw4w9WgXcQ',
                sport: sport
            },
            {
                title: `Top ${sport} Moments`,
                thumbnail: this.getSportFallbackThumbnail(sport, 1),
                duration: '8:45',
                category: type === 'highlights' ? 'Highlights' : 'Feature',
                youtubeId: 'dQw4w9WgXcQ',
                sport: sport
            }
        ];
        
        return baseVideos;
    }

    getSportFallbackThumbnail(sport, index = 0) {
        const thumbnails = {
            'cricket': [
                'https://i.pinimg.com/736x/06/e8/2d/06e82d79a909496b05a312b428f21a1d.jpg',
                'https://i.pinimg.com/1200x/46/a6/6f/46a66fa555e7d4ce6c19677bbd26445a.jpg'
            ],
            'mma': [
                'https://i.pinimg.com/736x/c3/f1/47/c3f147411a3e49fda4be077fad6da972.jpg',
                'https://i.pinimg.com/736x/10/c8/96/10c8961d69d40b55673d99ea905170b0.jpg'
            ],
            'football': [
                'https://i.pinimg.com/736x/14/31/56/143156d98ce3004bbd0d18ab9d0ee1a1.jpg',
                'https://i.pinimg.com/736x/02/12/58/021258c035d77f92b2f873fafab2f097.jpg'
            ],
            'basketball': [
                'https://i.pinimg.com/1200x/7f/99/b9/7f99b9e379872f897914fc8ecf7166f4.jpg',
                'https://i.pinimg.com/1200x/c9/ff/a2/c9ffa26fca83bcdd69e4a56fd1d2a26a.jpg'
            ],
            'baseball': [
                'https://i.pinimg.com/736x/d8/30/61/d83061c05799c7da5c001641a1536ad9.jpg',
                'https://i.pinimg.com/1200x/a4/3d/67/a43d67d09741fad533578b25d97b8c52.jpg'
            ]
        };
        
        return thumbnails[sport]?.[index] || thumbnails.football[index];
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
                        <span>${this.formatTimeAgo(video.publishedAt)}</span>
                    </div>
                </div>
            </a>
        `;
    }

    async loadLiveScores() {
        try {
            console.log(`Loading live scores for sport: ${this.sport}`);
            
            // Try multiple endpoints
            let liveStreams = [];
            
            const liveResponse = await fetch(`/api/videos/live?sport=${this.sport}`);
            const result = await liveResponse.json();
            
            if (result.success && result.liveStreams && result.liveStreams.length > 0) {
                liveStreams = result.liveStreams;
            } else {
                // Try scores endpoint
                const scoresResponse = await fetch(`/api/scores/live?sport=${this.sport}`);
                const scoresResult = await scoresResponse.json();
                
                if (scoresResult.success && scoresResult.scores && scoresResult.scores.length > 0) {
                    liveStreams = scoresResult.scores;
                }
            }
            
            if (liveStreams.length > 0) {
                this.renderLiveScores(liveStreams);
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

        // Sport-specific fallback live scores
        switch(this.sport) {
            case 'cricket':
                container.innerHTML = `
                    <div class="live-score">
                        <div class="teams">IND vs AUS</div>
                        <div class="score">185/6</div>
                        <div class="live-indicator">LIVE</div>
                    </div>
                    <div class="live-score">
                        <div class="teams">ENG vs PAK</div>
                        <div class="score">312 & 145/2</div>
                        <div>Day 4</div>
                    </div>
                    <div class="live-score">
                        <div class="teams">NZ vs SA</div>
                        <div class="score">Starts 23:00</div>
                        <div>T20</div>
                    </div>
                `;
                break;
            
            case 'mma':
                container.innerHTML = `
                    <div class="live-score">
                        <div class="teams">UFC 300: Main Card</div>
                        <div class="score">LIVE</div>
                        <div class="live-indicator">876K viewers</div>
                    </div>
                    <div class="live-score">
                        <div class="teams">UFC Fight Night</div>
                        <div class="score">Prelims</div>
                        <div>Next: 01:00</div>
                    </div>
                    <div class="live-score">
                        <div class="teams">Bellator 300</div>
                        <div class="score">Main Event</div>
                        <div>Live Now</div>
                    </div>
                `;
                break;
            
            default:
                container.innerHTML = `
                    <div class="live-score">
                        <div class="teams">No live matches currently</div>
                        <div class="score">-</div>
                        <div class="match-status">Check later</div>
                    </div>
                `;
        }
    }

    renderLiveScores(liveStreams) {
        const container = document.getElementById('liveScoresContainer');
        if (!container) return;

        if (liveStreams && liveStreams.length > 0) {
            container.innerHTML = liveStreams.map(stream => {
                const teams = stream.title ? stream.title.split(' vs ') : 
                    [stream.homeTeam?.name || 'Team A', stream.awayTeam?.name || 'Team B'];
                const homeTeam = teams[0] || 'Team A';
                const awayTeam = teams[1] || 'Team B';
                
                return `
                    <div class="live-score">
                        <div class="teams">${homeTeam} vs ${awayTeam}</div>
                        <div class="score">LIVE</div>
                        <div class="live-indicator live-pulse">
                            ${stream.viewers || 'Live'}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            this.renderFallbackLiveScores();
        }
    }

    async loadStandings() {
        try {
            console.log(`Loading standings for sport: ${this.sport}`);
            
            const response = await fetch(`/api/sports/${this.sport}/standings`);
            const result = await response.json();
            
            if (result.success && result.standings && result.standings.length > 0) {
                this.renderStandings(result.standings);
            } else {
                // Try league tables endpoint
                const tablesResponse = await fetch(`/api/league-tables/${this.sport}`);
                const tablesResult = await tablesResponse.json();
                
                if (tablesResult.success && tablesResult.table) {
                    this.renderStandings([tablesResult.table]);
                } else {
                    this.renderFallbackStandings();
                }
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

        const standingsData = this.getFallbackStandings();
        container.innerHTML = standingsData;
    }

    renderStandings(standings) {
        const container = document.getElementById('standingsContainer');
        if (!container) return;

        if (standings && standings.length > 0) {
            const table = standings[0];
            container.innerHTML = `
                <div style="font-size: 14px;">
                    <div style="display: flex; justify-content: space-between; background: var(--sky-gray); padding: 8px 10px; font-weight: bold;">
                        <span>Team</span>
                        <span>Pts</span>
                    </div>
                    ${table.table ? table.table.slice(0, 5).map(team => `
                        <div style="display: flex; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid var(--sky-border);">
                            <span>${team.position}. ${team.team}</span>
                            <span>${team.points || team.wins}</span>
                        </div>
                    `).join('') : `
                        <div style="padding: 20px; text-align: center; color: #666;">
                            Standings data not available
                        </div>
                    `}
                </div>
            `;
        } else {
            this.renderFallbackStandings();
        }
    }

    getFallbackStandings() {
        switch(this.sport.toLowerCase()) {
            case 'cricket':
                return `
                    <div style="font-size: 14px;">
                        <div style="display: flex; justify-content: space-between; background: var(--sky-gray); padding: 8px 10px;">
                            <span>Team</span>
                            <span>Pts</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid var(--sky-border);">
                            <span>1. India</span>
                            <span>12</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid var(--sky-border);">
                            <span>2. Australia</span>
                            <span>10</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid var(--sky-border);">
                            <span>3. England</span>
                            <span>8</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid var(--sky-border);">
                            <span>4. New Zealand</span>
                            <span>6</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid var(--sky-border);">
                            <span>5. Pakistan</span>
                            <span>4</span>
                        </div>
                    </div>
                `;
            case 'mma':
                return `
                    <div style="font-size: 14px;">
                        <div style="display: flex; justify-content: space-between; background: var(--sky-gray); padding: 8px 10px;">
                            <span>Fighter</span>
                            <span>W-L</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid var(--sky-border);">
                            <span>1. Jon Jones</span>
                            <span>27-1</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid var(--sky-border);">
                            <span>2. Islam Makhachev</span>
                            <span>25-1</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid var(--sky-border);">
                            <span>3. Alex Pereira</span>
                            <span>9-2</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid var(--sky-border);">
                            <span>4. Leon Edwards</span>
                            <span>22-3</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid var(--sky-border);">
                            <span>5. Sean O'Malley</span>
                            <span>17-1</span>
                        </div>
                    </div>
                `;
            case 'football':
                return `
                    <div style="font-size: 14px;">
                        <div style="display: flex; justify-content: space-between; background: var(--sky-gray); padding: 8px 10px;">
                            <span>Team</span>
                            <span>Pts</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid var(--sky-border);">
                            <span>1. Manchester City</span>
                            <span>45</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid var(--sky-border);">
                            <span>2. Arsenal</span>
                            <span>42</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid var(--sky-border);">
                            <span>3. Liverpool</span>
                            <span>41</span>
                        </div>
                    </div>
                `;
            case 'basketball':
                return `
                    <div style="font-size: 14px;">
                        <div style="display: flex; justify-content: space-between; background: var(--sky-gray); padding: 8px 10px;">
                            <span>Team</span>
                            <span>W-L</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid var(--sky-border);">
                            <span>1. Celtics</span>
                            <span>58-24</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid var(--sky-border);">
                            <span>2. Bucks</span>
                            <span>55-27</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid var(--sky-border);">
                            <span>3. Knicks</span>
                            <span>52-30</span>
                        </div>
                    </div>
                `;
            default:
                return `
                    <div style="font-size: 14px; color: #666; text-align: center; padding: 20px;">
                        Standings data not available
                    </div>
                `;
        }
    }

    async loadTeams() {
        try {
            console.log(`Loading teams for sport: ${this.sport}`);
            
            const response = await fetch(`/api/sports/${this.sport}/teams?featured=true&limit=3`);
            const result = await response.json();
            
            if (result.success && result.teams && result.teams.length > 0) {
                this.renderFeaturedTeams(result.teams);
            } else {
                // Try general teams endpoint
                const teamsResponse = await fetch(`/api/teams?sport=${this.sport}&limit=3`);
                const teamsResult = await teamsResponse.json();
                
                if (teamsResult.success && teamsResult.teams && teamsResult.teams.length > 0) {
                    this.renderFeaturedTeams(teamsResult.teams);
                } else {
                    this.renderFallbackTeams();
                }
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

        // Sport-specific fallback teams
        switch(this.sport) {
            case 'cricket':
                container.innerHTML = `
                    <div class="top-pick">
                        <div class="top-pick-content">
                            <h4>India</h4>
                            <div class="top-pick-meta">ICC Ranking: 1 • Wins: 45</div>
                        </div>
                    </div>
                    <div class="top-pick">
                        <div class="top-pick-content">
                            <h4>Australia</h4>
                            <div class="top-pick-meta">ICC Ranking: 2 • Wins: 42</div>
                        </div>
                    </div>
                    <div class="top-pick">
                        <div class="top-pick-content">
                            <h4>England</h4>
                            <div class="top-pick-meta">ICC Ranking: 3 • Wins: 38</div>
                        </div>
                    </div>
                `;
                break;
            
            case 'mma':
                container.innerHTML = `
                    <div class="top-pick">
                        <div class="top-pick-content">
                            <h4>UFC</h4>
                            <div class="top-pick-meta">MMA • 300+ Events</div>
                        </div>
                    </div>
                    <div class="top-pick">
                        <div class="top-pick-content">
                            <h4>Bellator</h4>
                            <div class="top-pick-meta">MMA • 100+ Events</div>
                        </div>
                    </div>
                    <div class="top-pick">
                        <div class="top-pick-content">
                            <h4>ONE Championship</h4>
                            <div class="top-pick-meta">MMA • 50+ Events</div>
                        </div>
                    </div>
                `;
                break;
            
            default:
                container.innerHTML = `
                    <div class="top-pick">
                        <div class="top-pick-content">
                            <h4>Top ${this.sport.charAt(0).toUpperCase() + this.sport.slice(1)} Teams</h4>
                            <div class="top-pick-meta">Loading teams data...</div>
                        </div>
                    </div>
                `;
        }
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
                        <div class="top-pick-meta">${team.league || team.sport} • ${team.stats?.overall?.wins || 0}-${team.stats?.overall?.losses || 0}</div>
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
            
            if (result.success && result.news && result.news.length > 0) {
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

        // Sport-specific fallback news
        switch(this.sport) {
            case 'cricket':
                container.innerHTML = `
                    <div class="top-pick">
                        <div class="top-pick-content">
                            <h4>Kohli Announces T20 World Cup Retirement</h4>
                            <div class="top-pick-meta">1 hour ago</div>
                        </div>
                    </div>
                    <div class="top-pick">
                        <div class="top-pick-content">
                            <h4>Australia Names New Test Captain</h4>
                            <div class="top-pick-meta">3 hours ago</div>
                        </div>
                    </div>
                    <div class="top-pick">
                        <div class="top-pick-content">
                            <h4>IPL 2024 Auction Highlights</h4>
                            <div class="top-pick-meta">Yesterday</div>
                        </div>
                    </div>
                `;
                break;
            
            case 'mma':
                container.innerHTML = `
                    <div class="top-pick">
                        <div class="top-pick-content">
                            <h4>Jones vs Miocic Fight Announced</h4>
                            <div class="top-pick-meta">2 hours ago</div>
                        </div>
                    </div>
                    <div class="top-pick">
                        <div class="top-pick-content">
                            <h4>UFC 300 Main Card Revealed</h4>
                            <div class="top-pick-meta">5 hours ago</div>
                        </div>
                    </div>
                    <div class="top-pick">
                        <div class="top-pick-content">
                            <h4>McGregor Announces Comeback Fight</h4>
                            <div class="top-pick-meta">Yesterday</div>
                        </div>
                    </div>
                `;
                break;
            
            default:
                container.innerHTML = `
                    <div class="top-pick">
                        <div class="top-pick-content">
                            <h4>Latest ${this.sport.charAt(0).toUpperCase() + this.sport.slice(1)} News</h4>
                            <div class="top-pick-meta">Loading news updates...</div>
                        </div>
                    </div>
                `;
        }
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

    async handleSearch(query) {
        if (!query || query.length < 2) return;

        try {
            const response = await fetch(`/api/videos/search?q=${encodeURIComponent(query)}&sport=${this.sport}`);
            const result = await response.json();
            
            if (result.success) {
                this.displaySearchResults(result.videos);
            }
        } catch (error) {
            console.error('Error searching:', error);
        }
    }

    displaySearchResults(results) {
        if (window.AllSportsApp && window.AllSportsApp.showSearchResults) {
            window.AllSportsApp.showSearchResults(results);
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

    formatTimeAgo(dateString) {
        if (!dateString) return 'Recently';
        
        if (typeof dateString === 'string' && dateString.toLowerCase().includes('live')) {
            return 'Live';
        }
        
        try {
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
        } catch (error) {
            return 'Recently';
        }
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
    console.log('Database initialized with server connection');
  },

  getUsers: function() {
    return [];
  },

  saveUsers: function(users) {
    // No longer needed - handled by server
  },

  findUserByCredentials: async function(email, password) {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const result = await response.json();
      return result.success ? result.user : null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  findUserByEmail: async function(email) {
    try {
      const response = await fetch('/api/user', { credentials: 'include' });
      const result = await response.json();
      return result.success && result.user.email === email ? result.user : null;
    } catch (error) {
      console.error('Find user error:', error);
      return null;
    }
  },

  createUser: async function(userData) {
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });
      const result = await response.json();
      return result.success ? result.user : null;
    } catch (error) {
      console.error('Signup error:', error);
      return null;
    }
  },

  updateUser: function(userId, updates) {
    // Handled by server - not implemented in client
    return null;
  },

  setCurrentUser: function(user) {
    currentUser = user;
  },

  getCurrentUser: function() {
    return currentUser;
  },

  clearCurrentUser: function() {
    currentUser = null;
  },

  saveFollowedSports: function(sports) {
    followedSports = sports;
  },

  getFollowedSports: function() {
    return followedSports;
  }
};

const AuthManager = {
  login: async function(email, password) {
    try {
      const user = await Database.findUserByCredentials(email, password);
      if (user) {
        Database.setCurrentUser(user);
        currentUser = user;
        return {
          success: true,
          user: user,
          message: 'Login successful!'
        };
      } else {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  },

  register: async function(userData) {
    try {
      const newUser = await Database.createUser(userData);
      if (newUser) {
        Database.setCurrentUser(newUser);
        currentUser = newUser;
        return {
          success: true,
          user: newUser,
          message: 'Registration successful!'
        };
      } else {
        return {
          success: false,
          message: 'Registration failed. User may already exist.'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  },

  logout: async function() {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      const result = await response.json();
      
      Database.clearCurrentUser();
      currentUser = null;
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Logout failed'
      };
    }
  },

  isAuthenticated: function() {
    return currentUser !== null;
  },

  getCurrentUser: function() {
    return currentUser;
  },

  updateProfile: function(userId, updates) {
    return Promise.resolve({
      success: false,
      message: 'Profile update not implemented'
    });
  }
};

const SportsManager = {
  followSport: async function(sportId, sportName, icon = '🏆', category = 'General') {
    try {
      const response = await fetch('/api/user/follow-sport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
      return {
        success: false,
        message: 'Failed to follow sport'
      };
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
      return {
        success: false,
        message: 'Failed to unfollow sport'
      };
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
      const response = await fetch('/api/user/followed-sports', {
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          Database.saveFollowedSports(result.followedSports);
          return result;
        }
      }
      return {
        success: false,
        followedSports: []
      };
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
      const response = await fetch('/api/sports');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return result;
        }
      }
      return {
        success: false,
        sports: []
      };
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
      } else {
        this.showMessage(result.message, 'error');
      }
    } catch (error) {
      this.showMessage('Login failed. Please try again.', 'error');
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
      } else {
        this.showMessage(result.message, 'error');
      }
    } catch (error) {
      this.showMessage('Registration failed. Please try again.', 'error');
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
            following: [],
            page: 1,
            hasMore: true,
            isLoading: false,
            searchQuery: '',
            userPreferences: {
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
        
        // Don't initialize hero follow button here - let SportPageManager handle it
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('login.html')) return 'login';
        if (path.includes('scores.html')) return 'scores';
        if (path.includes('watch.html')) return 'watch';
        if (path.includes('teams.html')) return 'teams';
        if (path.includes('fixtures.html')) return 'fixtures';
        if (path.includes('.html') && !path.includes('index.html')) {
            // Check if it's a sport page
            const sportPages = ['football', 'cricket', 'basketball', 'tennis', 'baseball', 
                              'hockey', 'golf', 'rugby', 'formula1', 'boxing', 'mma', 'olympics'];
            const pageName = path.split('/').pop().replace('.html', '');
            if (sportPages.includes(pageName)) {
                return 'sport';
            }
        }
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
            case 'sport':
                // Sport pages are handled by SportPageManager
                break;
        }
    }

    initLoginPage() {
        new LoginPageHandler();
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
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
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

        // Also update hero follow button if it exists
        const heroFollowBtn = document.getElementById('heroFollowBtn');
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

    updateHeroFollowButton(button, isFollowed) {
        const followText = button.querySelector('.follow-text');
        const followIcon = button.querySelector('.follow-icon-hero');
        
        if (!followText || !followIcon) {
            console.warn('Hero follow button elements not found');
            return;
        }

        // Use requestAnimationFrame for smoother transitions
        requestAnimationFrame(() => {
            if (isFollowed) {
                button.classList.add('following');
                followText.textContent = 'Followed';
                followIcon.textContent = '❤️';
                followIcon.style.transform = 'scale(1.2)';
                
                // Reset transform after animation
                setTimeout(() => {
                    followIcon.style.transform = 'scale(1)';
                }, 300);
            } else {
                button.classList.remove('following');
                followText.textContent = 'Follow';
                followIcon.textContent = '🤍';
                followIcon.style.transform = 'scale(1.2)';
                
                // Reset transform after animation
                setTimeout(() => {
                    followIcon.style.transform = 'scale(1)';
                }, 300);
            }
            
            // Force reflow for smooth transition
            button.offsetHeight;
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
            // Use setTimeout to break the call stack and prevent recursion
            setTimeout(() => {
                this.createSportsFollowWidget();
            }, 0);
        }
    }

    createSportsFollowWidget() {
        // Prevent infinite recursion
        if (isCreatingSportsWidget) {
            return;
        }
        
        isCreatingSportsWidget = true;

        const rightColumn = document.querySelector('.right-column');
        if (!rightColumn) {
            console.warn('Right column not found for sports follow widget');
            isCreatingSportsWidget = false;
            return;
        }

        // Check if widget already exists
        if (document.getElementById('followedSportsWidget')) {
            isCreatingSportsWidget = false;
            return;
        }

        try {
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
        } catch (error) {
            console.error('Error creating sports widget:', error);
        } finally {
            // Reset the flag
            setTimeout(() => {
                isCreatingSportsWidget = false;
            }, 100);
        }
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

    async showSearchResults(query) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        if (!query || query.trim().length === 0) {
            this.hideSearchResults();
            return;
        }

        try {
            // Search via API
            const response = await fetch(`/api/videos/search?q=${encodeURIComponent(query)}&limit=8`);
            const result = await response.json();

            if (result.success && result.videos.length > 0) {
                searchResults.innerHTML = result.videos.map(item => {
                    const searchTerms = query.toLowerCase().trim().split(/\s+/);
                    let highlightedTitle = item.title;
                    searchTerms.forEach(term => {
                        const regex = new RegExp(`(${term})`, 'gi');
                        highlightedTitle = highlightedTitle.replace(regex, '<mark>$1</mark>');
                    });

                    return `
                    <div class="search-result-item" data-type="${item.type || 'video'}" data-id="${item.videoId || item.youtubeId}">
                        <div class="search-result-content">
                            <div class="search-result-title">${highlightedTitle}</div>
                            <div class="search-result-meta">
                                <span class="search-result-type">${item.type || 'video'}</span>
                                <span class="search-result-sport">${item.sport}</span>
                                ${item.league ? `<span class="search-result-league">${item.league}</span>` : ''}
                                ${item.status ? `<span class="search-result-status ${item.status.toLowerCase()}">${item.status}</span>` : ''}
                            </div>
                            ${item.description ? `<div class="search-result-excerpt">${this.highlightTerms(item.description, searchTerms)}</div>` : ''}
                        </div>
                    </div>
                    `;
                }).join('');

                searchResults.querySelectorAll('.search-result-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const type = item.dataset.type;
                        const id = item.dataset.id;
                        
                        switch(type) {
                            case 'fixture':
                                window.location.href = `fixtures.html#${id}`;
                                break;
                            case 'video':
                            case 'live':
                                window.location.href = `watch.html#${id}`;
                                break;
                            case 'news':
                                this.openNewsArticle(id);
                                break;
                            default:
                                // Default to watch page for videos
                                window.location.href = `watch.html#${id}`;
                        }
                        
                        this.hideSearchResults();
                        
                        const searchInput = document.getElementById('searchInput');
                        const mobileSearchInput = document.getElementById('mobileSearchInput');
                        if (searchInput) searchInput.value = '';
                        if (mobileSearchInput) mobileSearchInput.value = '';
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
        } catch (error) {
            console.error('Error searching:', error);
            searchResults.innerHTML = `
                <div class="search-result-item no-results">
                    <div class="search-result-content">
                        <div class="search-result-title">Search temporarily unavailable</div>
                        <div class="search-result-meta">Please try again later</div>
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

    async openNewsArticle(articleId) {
        try {
            // For now, we'll create a simple modal since we don't have a news API
            const response = await fetch(`/api/videos/${articleId}`);
            const result = await response.json();
            
            if (result.success) {
                this.openArticleModal(result.video);
            }
        } catch (error) {
            console.error('Error fetching news article:', error);
            this.showToast('Error loading article', 'error');
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
        // This will be handled by the live score updates from API
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
        const marqueeInner = document.getElementById('marqueeInner');
        if (marqueeInner) {
            // Load live scores for ticker from API
            this.updateTicker();
            setInterval(() => this.updateTicker(), 30000); // Update every 30 seconds
        }
    }

    async updateTicker() {
        try {
            // Get live streams from API for ticker
            const response = await fetch('/api/videos/live?limit=6');
            const result = await response.json();
            
            const tickerTime = document.getElementById('tickerTime');
            const marqueeInner = document.getElementById('marqueeInner');
            
            if (tickerTime) {
                const now = new Date();
                tickerTime.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }
            
            if (marqueeInner && result.success && result.liveStreams.length > 0) {
                const tickerItems = result.liveStreams.map(stream => {
                    const sportIcon = this.getSportIcon(stream.sport);
                    // Extract teams from title
                    const teams = stream.title.split(' vs ');
                    const homeTeam = teams[0] || 'Team A';
                    const awayTeam = teams[1] || 'Team B';
                    return `${sportIcon} ${homeTeam} vs ${awayTeam} - LIVE (${stream.viewers})`;
                });
                
                // Duplicate for seamless scrolling
                const repeatedItems = [...tickerItems, ...tickerItems];
                marqueeInner.innerHTML = repeatedItems.map(item => 
                    `<span class="ticker-item">${item}</span>`
                ).join(' • ');
            } else if (marqueeInner) {
                // Fallback ticker content
                const fallbackContent = [
                    "⚽ Follow your favorite sports and teams",
                    "🏀 Get live scores and updates", 
                    "🎾 Watch highlights and full matches",
                    "🏆 Stay updated with latest news"
                ];
                const repeatedContent = [...fallbackContent, ...fallbackContent];
                marqueeInner.innerHTML = repeatedContent.map(item => 
                    `<span class="ticker-item">${item}</span>`
                ).join(' • ');
            }
        } catch (error) {
            console.error('Error updating ticker:', error);
        }
    }

    getSportIcon(sport) {
        const icons = {
            'football': '⚽',
            'cricket': '🏏',
            'basketball': '🏀',
            'baseball': '⚾',
            'tennis': '🎾',
            'hockey': '🏒',
            'golf': '⛳',
            'rugby': '🏉',
            'formula1': '🏎️',
            'boxing': '🥊',
            'mma': '🥋',
            'olympics': '🏅'
        };
        return icons[sport.toLowerCase()] || '🏆';
    }

    initUserPreferences() {
        if (this.state.user) {
            // Load user preferences from server
            this.loadUserPreferences();
        }
    }

    async loadUserPreferences() {
        try {
            const response = await fetch('/api/user/preferences', {
                credentials: 'include'
            });
            const result = await response.json();
            
            if (result.success) {
                this.state.userPreferences = {
                    ...this.state.userPreferences,
                    ...result
                };
                
                // Apply theme if available
                if (this.state.userPreferences.theme) {
                    document.documentElement.setAttribute('data-theme', this.state.userPreferences.theme);
                }
            }
        } catch (error) {
            console.error('Error loading user preferences:', error);
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
            const result = await AuthManager.logout();
            
            if (result.success) {
                AllSportsApp.showToast(result.message, 'success');
                
                const app = new AllSportsApp();
                app.state.user = null;
                app.updateLoginUI();
                
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1000);
            } else {
                AllSportsApp.showToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Logout error:', error);
            AllSportsApp.showToast('Error during logout', 'error');
        }
    }

    async openArticleModal(article) {
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
                            <span class="league-tag">${article.league || 'Highlight'}</span>
                        </div>
                        <div class="article-meta">
                            By <strong>${article.author || 'Sports Desk'}</strong> • ${this.formatDate(article.publishedAt)}
                        </div>
                    </div>
                    <div class="article-content">
                        <p>${article.description || 'Watch this exciting sports content.'}</p>
                        
                        <div class="video-preview">
                            <img src="${article.thumbnail}" alt="${article.title}" style="width: 100%; border-radius: 8px; margin: 10px 0;">
                            <div class="video-info">
                                <div class="video-duration">Duration: ${article.duration || 'N/A'}</div>
                                <a href="https://youtu.be/${article.youtubeId}" target="_blank" class="btn btn-primary" style="margin-top: 10px;">
                                    Watch on YouTube
                                </a>
                            </div>
                        </div>
                        
                        <h4>Content Details</h4>
                        <p>This video features exciting moments from ${article.sport}. In a real application, this would include:</p>
                        <ul>
                            <li>Key moments and highlights</li>
                            <li>Player performances and statistics</li>
                            <li>Expert commentary and insights</li>
                            <li>Post-match interviews and reactions</li>
                        </ul>
                        <p>Don't miss this incredible ${article.sport} content featuring top athletes and exciting gameplay.</p>
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

    async loadInitialData() {
        try {
            // Load initial data from API
            const [newsResponse, videosResponse, fixturesResponse] = await Promise.all([
                fetch('/api/news?limit=10'),
                fetch('/api/videos?limit=12'),
                fetch('/api/fixtures/today?limit=10')
            ]);

            const newsResult = await newsResponse.json();
            const videosResult = await videosResponse.json();
            const fixturesResult = await fixturesResponse.json();

            if (newsResult.success) this.state.news = newsResult.news;
            if (videosResult.success) this.state.videos = videosResult.videos;
            if (fixturesResult.success) this.state.fixtures = fixturesResult.fixtures;

        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    startLiveUpdates() {
        // Set up live updates from API
        setInterval(() => {
            this.updateLiveScores();
            this.updateTicker();
        }, 30000); // Update every 30 seconds
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
        // Scores page specific initialization
    }

    initWatchPage() {
        console.log('Initializing watch page');
        // Watch page specific initialization
    }

    initTeamsPage() {
        console.log('Initializing teams page');
        // Teams page specific initialization
    }

    initFixturesPage() {
        console.log('Initializing fixtures page');
        // Fixtures page specific initialization
    }

    showToast(message, type = 'success') {
        AllSportsApp.showToast(message, type);
    }

    // Method to create sports follow widget (used by SportPageManager)
    createSportsFollowWidget() {
        this.addSportsFollowSection();
    }
}

// Global variables
let currentUser = null;
let followedSports = [];
let sportPageManager;

// Global initialization - UPDATED with better timing and no recursion
document.addEventListener('DOMContentLoaded', function() {
    console.log("AllSports site loaded");

    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (isLoginPage) {
        new LoginPageHandler();
    } else {
        // Initialize AllSportsApp first
        const app = new AllSportsApp();
        window.AllSportsApp = app;
        
        // Check if we're on a sport-specific page
        const sportPages = ['football', 'cricket', 'basketball', 'tennis', 'baseball', 
                          'hockey', 'golf', 'rugby', 'formula1', 'boxing', 'mma', 'olympics'];
        
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop().replace('.html', '');
        const isSportPage = sportPages.includes(currentPage);
        
        // Initialize SportPageManager for sport-specific pages with proper delay
        if (isSportPage) {
            setTimeout(() => {
                try {
                    sportPageManager = new SportPageManager();
                    window.sportPageManager = sportPageManager;
                    console.log(`SportPageManager initialized for ${currentPage} page`);
                } catch (error) {
                    console.error('Error initializing SportPageManager:', error);
                }
            }, 500);
        }
        
        // Initialize the main app with a small delay to ensure DOM is ready
        setTimeout(() => {
            app.init();
        }, 100);
    }
});

// Make methods available globally
window.AllSportsApp = AllSportsApp;
window.closeMobileMenu = AllSportsApp.closeMobileMenu;
window.toggleMobileDropdown = AllSportsApp.toggleMobileDropdown;