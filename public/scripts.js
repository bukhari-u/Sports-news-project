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
        this.init();
    }

    async init() {
        console.log('AllSports App Initializing...');
        await this.checkAuthStatus();
        this.setupEventListeners();
        await this.loadInitialData();
        this.startLiveUpdates();
        this.updateTicker();
        this.initializeLeagueFilters();
        this.applyUserPreferences();
        this.enhanceCards();
        this.setupBackToTop();
        this.updateLoginUI();
        this.setupFollowFunctionality();
        this.setupYouTubeVideoHandlers();
        
        // Setup article modal interactions
        this.setupArticleModal();
        
        // Setup stats button handlers - ENHANCED
        this.setupStatsButtonHandlers();

        // Initialize horizontal scrolling
        this.setupHorizontalScrolling();
    }

    setupHorizontalScrolling() {
        // Enable horizontal scrolling for video and live carousels
        const videoTrack = document.getElementById('videoTrack');
        const liveTrack = document.getElementById('liveTrack');
        
        if (videoTrack) {
            videoTrack.style.overflowX = 'auto';
            videoTrack.style.overflowY = 'hidden';
            videoTrack.style.scrollBehavior = 'smooth';
            videoTrack.style.paddingBottom = '12px';
            videoTrack.style.scrollbarWidth = 'thin';
        }
        
        if (liveTrack) {
            liveTrack.style.overflowX = 'auto';
            liveTrack.style.overflowY = 'hidden';
            liveTrack.style.scrollBehavior = 'smooth';
            liveTrack.style.paddingBottom = '12px';
            liveTrack.style.scrollbarWidth = 'thin';
        }

        // Add custom scrollbar styles
        this.addScrollbarStyles();
    }

    addScrollbarStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Custom scrollbar for horizontal tracks */
            #videoTrack::-webkit-scrollbar,
            #liveTrack::-webkit-scrollbar {
                height: 8px;
            }

            #videoTrack::-webkit-scrollbar-track,
            #liveTrack::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
            }

            #videoTrack::-webkit-scrollbar-thumb,
            #liveTrack::-webkit-scrollbar-thumb {
                background: var(--accent);
                border-radius: 10px;
            }

            #videoTrack::-webkit-scrollbar-thumb:hover,
            #liveTrack::-webkit-scrollbar-thumb:hover {
                background: var(--accent-hover);
            }

            /* Ensure tracks stay in single row */
            #videoTrack,
            #liveTrack {
                flex-wrap: nowrap !important;
            }

            /* Firefox scrollbar */
            #videoTrack,
            #liveTrack {
                scrollbar-width: thin;
                scrollbar-color: var(--accent) rgba(255, 255, 255, 0.1);
            }
        `;
        document.head.appendChild(style);
    }

    setupStatsButtonHandlers() {
        // Enhanced stats button click handlers with better event delegation
        document.addEventListener('click', (e) => {
            const statsBtn = e.target.closest('.stats-btn');
            if (statsBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                const liveCard = statsBtn.closest('.live-card');
                if (liveCard) {
                    const eventId = liveCard.dataset.eventId;
                    const sport = liveCard.dataset.sport;
                    console.log('Stats button clicked for:', eventId, sport);
                    this.showMatchStats(eventId, sport);
                }
            }
        });

        // Additional event listener for dynamically created content
        document.getElementById('liveTrack')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('stats-btn') || e.target.closest('.stats-btn')) {
                const statsBtn = e.target.classList.contains('stats-btn') ? e.target : e.target.closest('.stats-btn');
                const liveCard = statsBtn.closest('.live-card');
                if (liveCard) {
                    const eventId = liveCard.dataset.eventId;
                    const sport = liveCard.dataset.sport;
                    console.log('Stats button clicked (delegated):', eventId, sport);
                    this.showMatchStats(eventId, sport);
                }
            }
        });
    }

    showMatchStats(eventId, sport) {
        console.log('Opening stats for:', eventId, sport);
        
        // Find the event in live events
        const event = this.state.liveEvents.find(e => e.id === eventId);
        if (!event) {
            console.error('Event not found:', eventId);
            this.showToast('Match statistics not available', 'error');
            return;
        }

        const modal = document.getElementById('statsModal');
        const modalTitle = document.getElementById('statsModalTitle');
        const container = document.getElementById('statsModalContainer');
        
        if (!modal || !modalTitle || !container) {
            console.error('Stats modal elements not found');
            this.showToast('Error loading statistics', 'error');
            return;
        }

        // Set modal title with match info
        modalTitle.textContent = `${event.teams.home} vs ${event.teams.away} - Live Statistics`;
        
        // Generate stats content based on sport
        let statsContent = '';
        switch(sport) {
            case 'Football':
                statsContent = this.generateFootballStats(event);
                break;
            case 'Basketball':
                statsContent = this.generateBasketballStats(event);
                break;
            case 'Cricket':
                statsContent = this.generateCricketStats(event);
                break;
            default:
                statsContent = this.generateDefaultStats(event);
        }

        container.innerHTML = statsContent;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        console.log('Stats modal opened successfully for:', eventId, sport);
    }

    generateFootballStats(event) {
        const homeStats = this.generateMockFootballStats();
        const awayStats = this.generateMockFootballStats();
        
        return `
            <div class="stats-team-header">
                <div class="stats-team home">
                    <div class="stats-team-logo">${this.getTeamAbbreviation(event.teams.home)}</div>
                    <div class="stats-team-name">${event.teams.home}</div>
                </div>
                
                <div class="stats-live-indicator">
                    <div class="stats-live-dot"></div>
                    <span class="stats-live-text">LIVE</span>
                    <div class="stats-timer">${event.minute}</div>
                </div>
                
                <div class="stats-team away">
                    <div class="stats-team-name">${event.teams.away}</div>
                    <div class="stats-team-logo">${this.getTeamAbbreviation(event.teams.away)}</div>
                </div>
            </div>
            
            <div class="stats-match-info">
                <div class="stats-league">
                    <span class="league-logo"></span>
                    ${event.league}
                </div>
                <div class="stats-venue">${event.venue}</div>
                <div class="stats-team-score">${event.score}</div>
            </div>

            <div class="stats-section">
                <h4>📊 Match Statistics</h4>
                
                <div class="stats-grid-detailed">
                    <!-- Possession -->
                    <div class="stat-row">
                        <div class="stat-team home">${homeStats.possession}%</div>
                        <div class="stat-name">Possession</div>
                        <div class="stat-team away">${awayStats.possession}%</div>
                        <div class="stat-bar-container">
                            <div class="stat-bar home" style="width: ${homeStats.possession}%"></div>
                            <div class="stat-bar away" style="width: ${awayStats.possession}%"></div>
                        </div>
                    </div>
                    
                    <!-- Shots -->
                    <div class="stat-row">
                        <div class="stat-value">${homeStats.shots.total}</div>
                        <div class="stat-name">Total Shots</div>
                        <div class="stat-value">${awayStats.shots.total}</div>
                        <div class="stat-bar-container">
                            <div class="stat-bar home" style="width: ${(homeStats.shots.total / (homeStats.shots.total + awayStats.shots.total)) * 100}%"></div>
                            <div class="stat-bar away" style="width: ${(awayStats.shots.total / (homeStats.shots.total + awayStats.shots.total)) * 100}%"></div>
                        </div>
                    </div>
                    
                    <!-- Shots on Target -->
                    <div class="stat-row">
                        <div class="stat-value">${homeStats.shots.onTarget}</div>
                        <div class="stat-name">Shots on Target</div>
                        <div class="stat-value">${awayStats.shots.onTarget}</div>
                        <div class="stat-bar-container">
                            <div class="stat-bar home" style="width: ${(homeStats.shots.onTarget / (homeStats.shots.onTarget + awayStats.shots.onTarget)) * 100}%"></div>
                            <div class="stat-bar away" style="width: ${(awayStats.shots.onTarget / (homeStats.shots.onTarget + awayStats.shots.onTarget)) * 100}%"></div>
                        </div>
                    </div>
                    
                    <!-- Pass Accuracy -->
                    <div class="stat-row">
                        <div class="stat-value">${homeStats.passAccuracy}%</div>
                        <div class="stat-name">Pass Accuracy</div>
                        <div class="stat-value">${awayStats.passAccuracy}%</div>
                        <div class="stat-bar-container">
                            <div class="stat-bar home" style="width: ${homeStats.passAccuracy}%"></div>
                            <div class="stat-bar away" style="width: ${awayStats.passAccuracy}%"></div>
                        </div>
                    </div>
                    
                    <!-- Corners -->
                    <div class="stat-row">
                        <div class="stat-value">${homeStats.corners}</div>
                        <div class="stat-name">Corners</div>
                        <div class="stat-value">${awayStats.corners}</div>
                        <div class="stat-bar-container">
                            <div class="stat-bar home" style="width: ${(homeStats.corners / (homeStats.corners + awayStats.corners)) * 100}%"></div>
                            <div class="stat-bar away" style="width: ${(awayStats.corners / (homeStats.corners + awayStats.corners)) * 100}%"></div>
                        </div>
                    </div>
                    
                    <!-- Fouls -->
                    <div class="stat-row">
                        <div class="stat-value">${homeStats.fouls}</div>
                        <div class="stat-name">Fouls</div>
                        <div class="stat-value">${awayStats.fouls}</div>
                        <div class="stat-bar-container">
                            <div class="stat-bar home" style="width: ${(homeStats.fouls / (homeStats.fouls + awayStats.fouls)) * 100}%"></div>
                            <div class="stat-bar away" style="width: ${(awayStats.fouls / (homeStats.fouls + awayStats.fouls)) * 100}%"></div>
                        </div>
                    </div>
                    
                    <!-- Offsides -->
                    <div class="stat-row">
                        <div class="stat-value">${homeStats.offsides}</div>
                        <div class="stat-name">Offsides</div>
                        <div class="stat-value">${awayStats.offsides}</div>
                        <div class="stat-bar-container">
                            <div class="stat-bar home" style="width: ${(homeStats.offsides / (homeStats.offsides + awayStats.offsides)) * 100}%"></div>
                            <div class="stat-bar away" style="width: ${(awayStats.offsides / (homeStats.offsides + awayStats.offsides)) * 100}%"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Advanced Stats -->
            <div class="stats-section">
                <h4>⚽ Advanced Football Stats</h4>
                <div class="stats-grid-detailed">
                    <div class="stat-row">
                        <div class="stat-value">${homeStats.expectedGoals}</div>
                        <div class="stat-name">Expected Goals (xG)</div>
                        <div class="stat-value">${awayStats.expectedGoals}</div>
                        <div class="stat-bar-container">
                            <div class="stat-bar home" style="width: ${(homeStats.expectedGoals / (homeStats.expectedGoals + awayStats.expectedGoals)) * 100}%"></div>
                            <div class="stat-bar away" style="width: ${(awayStats.expectedGoals / (homeStats.expectedGoals + awayStats.expectedGoals)) * 100}%"></div>
                        </div>
                    </div>
                    
                    <div class="stat-row">
                        <div class="stat-value">${homeStats.successfulDribbles}</div>
                        <div class="stat-name">Successful Dribbles</div>
                        <div class="stat-value">${awayStats.successfulDribbles}</div>
                        <div class="stat-bar-container">
                            <div class="stat-bar home" style="width: ${(homeStats.successfulDribbles / (homeStats.successfulDribbles + awayStats.successfulDribbles)) * 100}%"></div>
                            <div class="stat-bar away" style="width: ${(awayStats.successfulDribbles / (homeStats.successfulDribbles + awayStats.successfulDribbles)) * 100}%"></div>
                        </div>
                    </div>
                    
                    <div class="stat-row">
                        <div class="stat-value">${homeStats.tacklesWon}</div>
                        <div class="stat-name">Tackles Won</div>
                        <div class="stat-value">${awayStats.tacklesWon}</div>
                        <div class="stat-bar-container">
                            <div class="stat-bar home" style="width: ${(homeStats.tacklesWon / (homeStats.tacklesWon + awayStats.tacklesWon)) * 100}%"></div>
                            <div class="stat-bar away" style="width: ${(awayStats.tacklesWon / (homeStats.tacklesWon + awayStats.tacklesWon)) * 100}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateBasketballStats(event) {
        const homeStats = this.generateMockBasketballStats();
        const awayStats = this.generateMockBasketballStats();
        
        return `
            <div class="stats-team-header">
                <div class="stats-team home">
                    <div class="stats-team-logo">${this.getTeamAbbreviation(event.teams.home)}</div>
                    <div class="stats-team-name">${event.teams.home}</div>
                </div>
                
                <div class="stats-live-indicator">
                    <div class="stats-live-dot"></div>
                    <span class="stats-live-text">LIVE</span>
                    <div class="stats-timer">${event.minute}</div>
                </div>
                
                <div class="stats-team away">
                    <div class="stats-team-name">${event.teams.away}</div>
                    <div class="stats-team-logo">${this.getTeamAbbreviation(event.teams.away)}</div>
                </div>
            </div>
            
            <div class="stats-match-info">
                <div class="stats-league">
                    <span class="league-logo"></span>
                    ${event.league}
                </div>
                <div class="stats-venue">${event.venue}</div>
                <div class="stats-team-score">${event.score}</div>
            </div>

            <div class="stats-section">
                <h4>🏀 Basketball Statistics</h4>
                
                <!-- Shooting Stats -->
                <div class="basketball-stats-section">
                    <div class="shooting-stats">
                        <div class="shooting-stat">
                            <div class="shooting-stat-value">${homeStats.fieldGoals.made}/${homeStats.fieldGoals.attempted}</div>
                            <div class="shooting-stat-label">Field Goals</div>
                            <div class="shooting-stat-percentage">${homeStats.fieldGoals.percentage}%</div>
                        </div>
                        <div class="shooting-stat">
                            <div class="shooting-stat-value">${homeStats.threePointers.made}/${homeStats.threePointers.attempted}</div>
                            <div class="shooting-stat-label">3-Pointers</div>
                            <div class="shooting-stat-percentage">${homeStats.threePointers.percentage}%</div>
                        </div>
                        <div class="shooting-stat">
                            <div class="shooting-stat-value">${homeStats.freeThrows.made}/${homeStats.freeThrows.attempted}</div>
                            <div class="shooting-stat-label">Free Throws</div>
                            <div class="shooting-stat-percentage">${homeStats.freeThrows.percentage}%</div>
                        </div>
                    </div>
                    
                    <div class="stats-grid-detailed">
                        <div class="stat-row">
                            <div class="stat-value">${homeStats.points}</div>
                            <div class="stat-name">Points</div>
                            <div class="stat-value">${awayStats.points}</div>
                            <div class="stat-bar-container">
                                <div class="stat-bar home" style="width: ${(homeStats.points / (homeStats.points + awayStats.points)) * 100}%"></div>
                                <div class="stat-bar away" style="width: ${(awayStats.points / (homeStats.points + awayStats.points)) * 100}%"></div>
                            </div>
                        </div>
                        
                        <div class="stat-row">
                            <div class="stat-value">${homeStats.rebounds.total}</div>
                            <div class="stat-name">Rebounds</div>
                            <div class="stat-value">${awayStats.rebounds.total}</div>
                            <div class="stat-bar-container">
                                <div class="stat-bar home" style="width: ${(homeStats.rebounds.total / (homeStats.rebounds.total + awayStats.rebounds.total)) * 100}%"></div>
                                <div class="stat-bar away" style="width: ${(awayStats.rebounds.total / (homeStats.rebounds.total + awayStats.rebounds.total)) * 100}%"></div>
                            </div>
                        </div>
                        
                        <div class="stat-row">
                            <div class="stat-value">${homeStats.assists}</div>
                            <div class="stat-name">Assists</div>
                            <div class="stat-value">${awayStats.assists}</div>
                            <div class="stat-bar-container">
                                <div class="stat-bar home" style="width: ${(homeStats.assists / (homeStats.assists + awayStats.assists)) * 100}%"></div>
                                <div class="stat-bar away" style="width: ${(awayStats.assists / (homeStats.assists + awayStats.assists)) * 100}%"></div>
                            </div>
                        </div>
                        
                        <div class="stat-row">
                            <div class="stat-value">${homeStats.steals}</div>
                            <div class="stat-name">Steals</div>
                            <div class="stat-value">${awayStats.steals}</div>
                            <div class="stat-bar-container">
                                <div class="stat-bar home" style="width: ${(homeStats.steals / (homeStats.steals + awayStats.steals)) * 100}%"></div>
                                <div class="stat-bar away" style="width: ${(awayStats.steals / (homeStats.steals + awayStats.steals)) * 100}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateCricketStats(event) {
        const homeStats = this.generateMockCricketStats();
        const awayStats = this.generateMockCricketStats();
        
        return `
            <div class="stats-team-header">
                <div class="stats-team home">
                    <div class="stats-team-logo">${this.getTeamAbbreviation(event.teams.home)}</div>
                    <div class="stats-team-name">${event.teams.home}</div>
                </div>
                
                <div class="stats-live-indicator">
                    <div class="stats-live-dot"></div>
                    <span class="stats-live-text">LIVE</span>
                    <div class="stats-timer">${event.minute}</div>
                </div>
                
                <div class="stats-team away">
                    <div class="stats-team-name">${event.teams.away}</div>
                    <div class="stats-team-logo">${this.getTeamAbbreviation(event.teams.away)}</div>
                </div>
            </div>
            
            <div class="stats-match-info">
                <div class="stats-league">
                    <span class="league-logo"></span>
                    ${event.league}
                </div>
                <div class="stats-venue">${event.venue}</div>
                <div class="stats-team-score">${event.score}</div>
            </div>

            <div class="stats-section">
                <h4>🏏 Cricket Statistics</h4>
                
                <!-- Team Stats -->
                <div class="cricket-stats-grid">
                    <div class="cricket-stat-card">
                        <div class="cricket-stat-value">${homeStats.totalRuns}</div>
                        <div class="cricket-stat-label">Total Runs</div>
                    </div>
                    <div class="cricket-stat-card">
                        <div class="cricket-stat-value">${homeStats.wickets}</div>
                        <div class="cricket-stat-label">Wickets</div>
                    </div>
                    <div class="cricket-stat-card">
                        <div class="cricket-stat-value">${homeStats.runRate}</div>
                        <div class="cricket-stat-label">Run Rate</div>
                    </div>
                    <div class="cricket-stat-card">
                        <div class="cricket-stat-value">${homeStats.fours}</div>
                        <div class="cricket-stat-label">4s</div>
                    </div>
                </div>
                
                <!-- Batting Stats -->
                <div class="stats-section">
                    <h4>🎯 Batting Statistics</h4>
                    <div class="stats-grid-detailed">
                        <div class="stat-row">
                            <div class="stat-value">${homeStats.partnershipRuns}</div>
                            <div class="stat-name">Partnership Runs</div>
                            <div class="stat-value">${awayStats.partnershipRuns}</div>
                            <div class="stat-bar-container">
                                <div class="stat-bar home" style="width: ${(homeStats.partnershipRuns / (homeStats.partnershipRuns + awayStats.partnershipRuns)) * 100}%"></div>
                                <div class="stat-bar away" style="width: ${(awayStats.partnershipRuns / (homeStats.partnershipRuns + awayStats.partnershipRuns)) * 100}%"></div>
                            </div>
                        </div>
                        
                        <div class="stat-row">
                            <div class="stat-value">${homeStats.boundaries}</div>
                            <div class="stat-name">Boundaries</div>
                            <div class="stat-value">${awayStats.boundaries}</div>
                            <div class="stat-bar-container">
                                <div class="stat-bar home" style="width: ${(homeStats.boundaries / (homeStats.boundaries + awayStats.boundaries)) * 100}%"></div>
                                <div class="stat-bar away" style="width: ${(awayStats.boundaries / (homeStats.boundaries + awayStats.boundaries)) * 100}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateDefaultStats(event) {
        return `
            <div class="stats-team-header">
                <div class="stats-team home">
                    <div class="stats-team-logo">${this.getTeamAbbreviation(event.teams.home)}</div>
                    <div class="stats-team-name">${event.teams.home}</div>
                </div>
                
                <div class="stats-live-indicator">
                    <div class="stats-live-dot"></div>
                    <span class="stats-live-text">LIVE</span>
                    <div class="stats-timer">${event.minute}</div>
                </div>
                
                <div class="stats-team away">
                    <div class="stats-team-name">${event.teams.away}</div>
                    <div class="stats-team-logo">${this.getTeamAbbreviation(event.teams.away)}</div>
                </div>
            </div>
            
            <div class="stats-match-info">
                <div class="stats-league">
                    <span class="league-logo"></span>
                    ${event.league}
                </div>
                <div class="stats-venue">${event.venue}</div>
                <div class="stats-team-score">${event.score}</div>
            </div>

            <div class="stats-section">
                <h4>📊 Match Statistics</h4>
                <p>Detailed statistics for this match will be available soon.</p>
                <div class="stats-grid-detailed">
                    <div class="stat-row">
                        <div class="stat-value">${this.extractHomeScore(event.score)}</div>
                        <div class="stat-name">Current Score</div>
                        <div class="stat-value">${this.extractAwayScore(event.score)}</div>
                        <div class="stat-bar-container">
                            <div class="stat-bar home" style="width: 50%"></div>
                            <div class="stat-bar away" style="width: 50%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Mock data generators for stats
    generateMockFootballStats() {
        return {
            possession: Math.floor(Math.random() * 30) + 35,
            shots: {
                total: Math.floor(Math.random() * 15) + 5,
                onTarget: Math.floor(Math.random() * 8) + 2
            },
            passAccuracy: Math.floor(Math.random() * 20) + 70,
            corners: Math.floor(Math.random() * 8) + 1,
            fouls: Math.floor(Math.random() * 15) + 5,
            offsides: Math.floor(Math.random() * 5),
            yellowCards: Math.floor(Math.random() * 4),
            expectedGoals: (Math.random() * 3).toFixed(1),
            successfulDribbles: Math.floor(Math.random() * 15) + 5,
            tacklesWon: Math.floor(Math.random() * 20) + 10,
            interceptions: Math.floor(Math.random() * 15) + 5
        };
    }

    generateMockBasketballStats() {
        const fgMade = Math.floor(Math.random() * 15) + 25;
        const fgAttempted = fgMade + Math.floor(Math.random() * 20) + 10;
        const threeMade = Math.floor(Math.random() * 8) + 5;
        const threeAttempted = threeMade + Math.floor(Math.random() * 10) + 5;
        const ftMade = Math.floor(Math.random() * 10) + 8;
        const ftAttempted = ftMade + Math.floor(Math.random() * 5) + 2;
        
        return {
            points: Math.floor(Math.random() * 30) + 85,
            fieldGoals: {
                made: fgMade,
                attempted: fgAttempted,
                percentage: ((fgMade / fgAttempted) * 100).toFixed(1)
            },
            threePointers: {
                made: threeMade,
                attempted: threeAttempted,
                percentage: ((threeMade / threeAttempted) * 100).toFixed(1)
            },
            freeThrows: {
                made: ftMade,
                attempted: ftAttempted,
                percentage: ((ftMade / ftAttempted) * 100).toFixed(1)
            },
            rebounds: {
                total: Math.floor(Math.random() * 15) + 35,
                offensive: Math.floor(Math.random() * 8) + 5,
                defensive: Math.floor(Math.random() * 12) + 20
            },
            assists: Math.floor(Math.random() * 15) + 15,
            steals: Math.floor(Math.random() * 8) + 2,
            blocks: Math.floor(Math.random() * 6) + 1,
            turnovers: Math.floor(Math.random() * 8) + 5
        };
    }

    generateMockCricketStats() {
        return {
            totalRuns: Math.floor(Math.random() * 100) + 200,
            wickets: Math.floor(Math.random() * 8) + 2,
            runRate: (Math.random() * 2 + 5).toFixed(2),
            fours: Math.floor(Math.random() * 15) + 10,
            sixes: Math.floor(Math.random() * 8) + 3,
            extras: Math.floor(Math.random() * 15) + 5,
            partnershipRuns: Math.floor(Math.random() * 80) + 30,
            boundaries: Math.floor(Math.random() * 20) + 10,
            dotBallsPercentage: Math.floor(Math.random() * 30) + 40
        };
    }

    // Helper methods
    getTeamAbbreviation(teamName) {
        if (!teamName) return 'TBD';
        const words = teamName.split(' ');
        if (words.length === 1) return teamName.substring(0, 3).toUpperCase();
        return words.map(word => word[0]).join('').toUpperCase().substring(0, 3);
    }

    extractHomeScore(score) {
        if (!score) return '0';
        const parts = score.split('-');
        return parts[0]?.trim() || '0';
    }

    extractAwayScore(score) {
        if (!score) return '0';
        const parts = score.split('-');
        return parts[1]?.trim() || '0';
    }

    setupArticleModal() {
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            if (card) {
                const articleId = card.dataset.articleId;
                if (articleId) {
                    this.openArticle(articleId);
                }
            }

            const readStoryBtn = e.target.closest('#readStoryBtn');
            if (readStoryBtn) {
                this.openArticle('featured');
            }
        });
    }

    setupYouTubeVideoHandlers() {
        document.addEventListener('click', (e) => {
            const videoCard = e.target.closest('.video-card');
            if (videoCard) {
                const youtubeId = videoCard.dataset.youtubeId;
                if (youtubeId) {
                    this.playYouTubeVideo(youtubeId, videoCard.querySelector('h4').textContent);
                }
            }

            const watchLiveBtn = e.target.closest('.watch-live-btn');
            if (watchLiveBtn) {
                const liveCard = watchLiveBtn.closest('.live-card');
                if (liveCard) {
                    const youtubeId = liveCard.dataset.youtubeId;
                    const eventTitle = liveCard.querySelector('.team-name').textContent + ' vs ' + 
                                     liveCard.querySelectorAll('.team-name')[1].textContent;
                    if (youtubeId) {
                        this.playYouTubeVideo(youtubeId, eventTitle + ' - Live');
                    }
                }
            }
        });

        const heroPlayBtn = document.getElementById('playHeroBtn');
        if (heroPlayBtn) {
            heroPlayBtn.addEventListener('click', () => {
                const youtubeId = heroPlayBtn.dataset.youtubeId;
                if (youtubeId) {
                    this.playYouTubeVideo(youtubeId, document.getElementById('heroTitle').textContent);
                }
            });
        }
    }

    playYouTubeVideo(youtubeId, title) {
        const modal = document.getElementById('videoModal');
        const modalTitle = document.getElementById('videoModalTitle');
        const container = document.getElementById('videoContainer');
        
        if (!modal || !modalTitle || !container) {
            console.error('Video modal elements not found');
            return;
        }

        modalTitle.textContent = title || 'Sports Highlights';
        
        container.innerHTML = `
            <div class="video-player">
                <iframe 
                    src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    id="youtubePlayer">
                </iframe>
            </div>
            <div style="margin-top: 16px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: var(--radius);">
                <h4 style="margin-bottom: 8px;">${title || 'Sports Highlights'}</h4>
                <p style="color: var(--text-secondary); font-size: 14px; margin: 0;">
                    Watch the latest sports highlights and live action.
                </p>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        this.currentVideoId = youtubeId;
        
        console.log('YouTube video opened:', youtubeId, title);
    }

    closeModal() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
        
        const videoContainer = document.getElementById('videoContainer');
        if (videoContainer) {
            videoContainer.innerHTML = '';
        }
        
        console.log('Modal closed and video stopped');
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/user');
            const data = await response.json();
            
            if (data.success && data.user) {
                this.state.user = data.user;
                console.log('User is logged in:', data.user);
            } else {
                this.state.user = null;
                console.log('User is not logged in');
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            this.state.user = null;
        }
    }

    updateLoginUI() {
        const loginText = document.getElementById('loginText');
        const mobileLoginText = document.getElementById('mobileLoginText');
        const loginBtn = document.getElementById('loginBtn');
        const mobileLoginBtn = document.getElementById('mobileLoginBtn');
        const userDropdown = document.getElementById('userDropdown');
        const mobileUserDropdown = document.getElementById('mobileUserDropdown');

        if (this.state.user) {
            if (loginText) loginText.textContent = this.state.user.username;
            if (mobileLoginText) mobileLoginText.textContent = this.state.user.username;
            if (loginBtn) loginBtn.classList.add('logged-in');
            if (mobileLoginBtn) mobileLoginBtn.classList.add('logged-in');
            if (userDropdown) userDropdown.style.display = 'block';
            if (mobileUserDropdown) mobileUserDropdown.style.display = 'block';
        } else {
            if (loginText) loginText.textContent = 'Login';
            if (mobileLoginText) mobileLoginText.textContent = 'Login';
            if (loginBtn) loginBtn.classList.remove('logged-in');
            if (mobileLoginBtn) mobileLoginBtn.classList.remove('logged-in');
            if (userDropdown) userDropdown.style.display = 'none';
            if (mobileUserDropdown) mobileUserDropdown.style.display = 'none';
        }
    }

    setupEventListeners() {
        // Header scroll effect
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });

        // Setup dropdown interactions for click
        document.querySelectorAll('.has-dropdown').forEach(dropdown => {
            const button = dropdown.querySelector('.nav-button');
            if (button) {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isExpanded = button.getAttribute('aria-expanded') === 'true';
                    this.closeAllDropdowns();
                    button.setAttribute('aria-expanded', !isExpanded);
                    const dropdownMenu = dropdown.querySelector('.dropdown');
                    if (dropdownMenu) {
                        dropdownMenu.setAttribute('aria-hidden', isExpanded);
                        dropdownMenu.style.opacity = isExpanded ? '0' : '1';
                        dropdownMenu.style.visibility = isExpanded ? 'hidden' : 'visible';
                        dropdownMenu.style.transform = isExpanded ? 'translateY(-10px)' : 'translateY(0)';
                    }
                });
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.has-dropdown')) {
                this.closeAllDropdowns();
            }
            
            // Close search results when clicking outside
            if (!e.target.closest('.search')) {
                this.hideSearchResults();
            }
        });

        // Mobile menu
        const mobileToggle = document.getElementById('mobileToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileToggle && mobileMenu) {
            mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
            
            const mobileClose = document.querySelector('.mobile-close');
            if (mobileClose) {
                mobileClose.addEventListener('click', () => this.closeMobileMenu());
            }
        }

        // Mobile dropdowns
        document.querySelectorAll('.mobile-nav-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.toggleMobileDropdown(e.currentTarget);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const mobileSearchInput = document.getElementById('mobileSearchInput');
        
        if (searchInput) {
            searchInput.addEventListener('focus', () => {
                searchInput.parentElement.classList.add('focused');
                if (this.state.searchQuery.trim().length > 0) {
                    this.showSearchResults(this.state.searchQuery);
                }
            });
            
            searchInput.addEventListener('blur', () => {
                setTimeout(() => {
                    searchInput.parentElement.classList.remove('focused');
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
                    this.closeMobileMenu();
                    mobileSearchInput.blur();
                    const mainSearchInput = document.getElementById('searchInput');
                    if (mainSearchInput) {
                        mainSearchInput.focus();
                    }
                }
            });
        }

        // Clear filters button
        const clearFiltersBtn = document.getElementById('resetFiltersBtn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMore();
            });
        }

        // Carousel buttons
        document.getElementById('videoPrevBtn')?.addEventListener('click', () => this.carouselPrev('video'));
        document.getElementById('videoNextBtn')?.addEventListener('click', () => this.carouselNext('video'));
        document.getElementById('livePrevBtn')?.addEventListener('click', () => this.carouselPrev('live'));
        document.getElementById('liveNextBtn')?.addEventListener('click', () => this.carouselNext('live'));

        // Action buttons
        document.getElementById('readStoryBtn')?.addEventListener('click', () => this.openArticle('featured'));
        document.getElementById('followSportBtn')?.addEventListener('click', () => this.followSport('featured'));
        document.getElementById('subscribeBtn')?.addEventListener('click', () => this.subscribe());
        document.getElementById('loginBtn')?.addEventListener('click', () => this.handleLoginClick());
        document.getElementById('mobileLoginBtn')?.addEventListener('click', () => this.handleLoginClick());

        // Logout buttons
        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        document.getElementById('mobileLogoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Modal close buttons - ENHANCED WITH STATS MODAL
        document.getElementById('articleModalClose')?.addEventListener('click', () => this.closeModal());
        document.getElementById('articleModalBackdrop')?.addEventListener('click', () => this.closeModal());
        document.getElementById('videoModalClose')?.addEventListener('click', () => this.closeModal());
        document.getElementById('videoModalBackdrop')?.addEventListener('click', () => this.closeModal());
        document.getElementById('statsModalClose')?.addEventListener('click', () => this.closeModal());
        document.getElementById('statsModalBackdrop')?.addEventListener('click', () => this.closeModal());

        // Filter dropdowns
        document.getElementById('sportFilter')?.addEventListener('change', (e) => {
            this.filterBySport(e.target.value);
        });
        
        document.getElementById('leagueFilter')?.addEventListener('change', (e) => {
            this.filterByLeague(e.target.value);
        });
        
        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            this.filterByStatus(e.target.value);
        });

        // View toggle buttons
        document.getElementById('gridViewBtn')?.addEventListener('click', () => this.toggleView('grid'));
        document.getElementById('listViewBtn')?.addEventListener('click', () => this.toggleView('list'));

        // Favorite buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-btn')) {
                const btn = e.target.closest('.favorite-btn');
                const articleId = btn.dataset.articleId;
                this.toggleFavorite(articleId, btn);
            }
        });

        // Share buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.share-btn')) {
                const btn = e.target.closest('.share-btn');
                const articleId = btn.dataset.articleId;
                this.shareArticle(articleId);
            }
        });

        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeAllDropdowns();
                this.closeMobileMenu();
                this.hideSearchResults();
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        });

        // Infinite scroll
        window.addEventListener('scroll', () => {
            this.handleInfiniteScroll();
        });

        // Fix for dropdown item clicks
        document.addEventListener('click', (e) => {
            const dropdownItem = e.target.closest('.dropdown-item');
            if (dropdownItem && dropdownItem.href) {
                this.closeAllDropdowns();
            }
        });

        // Fix for mobile dropdown item clicks
        document.addEventListener('click', (e) => {
            const mobileDropdownItem = e.target.closest('.mobile-dropdown-item');
            if (mobileDropdownItem && mobileDropdownItem.href) {
                this.closeMobileMenu();
            }
        });

        // Setup follow buttons with proper event delegation
        this.setupFollowButtons();
    }

    // Enhanced Search Functionality
    handleSearchInput(query) {
        this.state.searchQuery = query;
        
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
        console.log('Search terms:', searchTerms);

        if (searchTerms.length === 0) {
            this.hideSearchResults();
            return;
        }

        // Filter news based on advanced search algorithm
        const allNews = this.getMockNewsData();
        const scoredResults = allNews.map(item => {
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

            // Calculate relevance score for each search term
            searchTerms.forEach(term => {
                // Exact matches get highest score
                if (fields.title === term) score += 10;
                if (fields.sport === term) score += 8;
                if (fields.league === term) score += 7;
                if (fields.homeTeam === term || fields.awayTeam === term) score += 9;
                
                // Word boundary matches (starts with or whole words)
                const wordBoundaryRegex = new RegExp(`\\b${term}\\b`, 'i');
                
                if (wordBoundaryRegex.test(item.title)) score += 6;
                if (wordBoundaryRegex.test(item.sport)) score += 5;
                if (wordBoundaryRegex.test(item.league)) score += 4;
                if (wordBoundaryRegex.test(item.teams?.home || '')) score += 5;
                if (wordBoundaryRegex.test(item.teams?.away || '')) score += 5;
                if (wordBoundaryRegex.test(item.excerpt)) score += 3;
                if (wordBoundaryRegex.test(item.venue || '')) score += 2;
                
                // Partial matches (substring)
                if (fields.title.includes(term)) score += 2;
                if (fields.sport.includes(term)) score += 1;
                if (fields.league.includes(term)) score += 1;
                if (fields.homeTeam.includes(term) || fields.awayTeam.includes(term)) score += 2;
                if (fields.excerpt.includes(term)) score += 1;
            });

            // Boost score for live matches
            if (item.status === 'Live') score += 3;
            
            // Boost score for recent matches
            const articleDate = new Date(item.date);
            const now = new Date();
            const daysAgo = (now - articleDate) / (1000 * 60 * 60 * 24);
            if (daysAgo < 1) score += 2; // Today
            else if (daysAgo < 7) score += 1; // This week

            return { ...item, score };
        })
        .filter(item => item.score > 0) // Only include items that match at least one term
        .sort((a, b) => b.score - a.score) // Sort by relevance score
        .slice(0, 8); // Show top 8 results

        console.log('Scored results:', scoredResults);

        if (scoredResults.length > 0) {
            searchResults.innerHTML = scoredResults.map(item => {
                // Highlight matching terms in the title
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
                                ${item.score ? `<span class="search-result-score">${item.score}</span>` : ''}
                                ${item.status ? `<span class="search-result-status ${item.status.toLowerCase()}">${item.status}</span>` : ''}
                            </div>
                            <div class="search-result-excerpt">${this.highlightTerms(item.excerpt, searchTerms)}</div>
                            <div class="search-result-relevance">Relevance: ${Math.round(item.score)}%</div>
                        </div>
                    </div>
                `;
            }).join('');

            // Add click event listeners
            searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const articleId = item.dataset.articleId;
                    console.log('Search result clicked, opening article:', articleId);
                    
                    const article = allNews.find(a => a._id === articleId);
                    if (article) {
                        this.openArticle(articleId);
                        this.hideSearchResults();
                        
                        // Clear search input
                        const searchInput = document.getElementById('searchInput');
                        const mobileSearchInput = document.getElementById('mobileSearchInput');
                        if (searchInput) searchInput.value = '';
                        if (mobileSearchInput) mobileSearchInput.value = '';
                        this.state.searchQuery = '';
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
                        <div class="search-result-suggestions">
                            <strong>Suggestions:</strong>
                            <ul>
                                <li>Use specific team names (e.g., "Manchester United")</li>
                                <li>Try sport names (e.g., "Football", "Cricket")</li>
                                <li>Use league names (e.g., "Premier League", "NBA")</li>
                                <li>Check your spelling</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
            searchResults.classList.add('active');
        }
    }

    // Helper function to highlight search terms in text
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
            this.state.searchQuery = query;
            this.state.page = 1;
            this.applyFilters();
            this.hideSearchResults();
            
            // Update search input in mobile if needed
            const mobileSearchInput = document.getElementById('mobileSearchInput');
            if (mobileSearchInput && mobileSearchInput.value !== query) {
                mobileSearchInput.value = query;
            }
            
            // Scroll to results if on mobile
            if (window.innerWidth < 768) {
                const newsGrid = document.getElementById('newsGrid');
                if (newsGrid) {
                    newsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }
    }

    // Enhanced Follow Functionality
    setupFollowFunctionality() {
        // Create toast element if it doesn't exist
        if (!document.getElementById('toast')) {
            const toast = document.createElement('div');
            toast.id = 'toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--accent);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
                font-weight: 500;
                pointer-events: none;
            `;
            document.body.appendChild(toast);
        }
    }

    setupFollowButtons() {
        // Use event delegation for follow buttons to handle dynamic content
        document.addEventListener('click', (e) => {
            const followBtn = e.target.closest('.follow-btn');
            if (followBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                const sport = followBtn.getAttribute('data-sport') || 
                            followBtn.textContent.replace('Follow', '').replace('Following', '').trim() ||
                            'this sport';
                
                const isFollowing = followBtn.classList.contains('following');
                
                if (isFollowing) {
                    // Unfollow
                    followBtn.classList.remove('following');
                    followBtn.textContent = followBtn.textContent.replace('Following', 'Follow');
                    this.showToast(`Unfollowed ${sport}`);
                    
                    // Remove from user preferences
                    this.state.userPreferences.favoriteSports = 
                        this.state.userPreferences.favoriteSports.filter(s => s !== sport);
                } else {
                    // Follow
                    followBtn.classList.add('following');
                    followBtn.textContent = followBtn.textContent.replace('Follow', 'Following');
                    this.showToast(`Now following ${sport}`);
                    
                    // Add to user preferences
                    if (!this.state.userPreferences.favoriteSports.includes(sport)) {
                        this.state.userPreferences.favoriteSports.push(sport);
                    }
                }
                
                this.saveUserPreferences();
            }
        });

        // Also set up individual follow buttons for better reliability
        const followButtons = document.querySelectorAll('.follow-btn:not([data-sport])');
        followButtons.forEach(button => {
            if (!button.hasAttribute('data-listener-added')) {
                button.setAttribute('data-listener-added', 'true');
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const sport = button.getAttribute('data-sport') || 
                                button.textContent.replace('Follow', '').replace('Following', '').trim() ||
                                'this sport';
                    
                    const isFollowing = button.classList.contains('following');
                    
                    if (isFollowing) {
                        button.classList.remove('following');
                        button.textContent = 'Follow';
                        this.showToast(`Unfollowed ${sport}`);
                        
                        // Remove from user preferences
                        this.state.userPreferences.favoriteSports = 
                            this.state.userPreferences.favoriteSports.filter(s => s !== sport);
                    } else {
                        button.classList.add('following');
                        button.textContent = 'Following';
                        this.showToast(`Now following ${sport}`);
                        
                        // Add to user preferences
                        if (!this.state.userPreferences.favoriteSports.includes(sport)) {
                            this.state.userPreferences.favoriteSports.push(sport);
                        }
                    }
                    
                    this.saveUserPreferences();
                });
            }
        });
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.style.opacity = '1';
            
            setTimeout(() => {
                toast.style.opacity = '0';
            }, 3000);
        } else {
            // Fallback alert
            alert(message);
        }
    }

    handleLoginClick() {
        if (this.state.user) {
            // User is logged in, do nothing (dropdown will handle logout)
            return;
        } else {
            // User is not logged in, redirect to login page
            window.location.href = 'login.html';
        }
    }

    async logout() {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.state.user = null;
                this.updateLoginUI();
                console.log('User logged out successfully');
                
                // Show success message
                this.showAlert('Logged out successfully', 'success');
                
                // Refresh the page to update UI
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } catch (error) {
            console.error('Logout error:', error);
            this.showAlert('Error logging out', 'error');
        }
    }

    closeAllDropdowns() {
        document.querySelectorAll('.has-dropdown').forEach(dropdown => {
            const button = dropdown.querySelector('.nav-button');
            const menu = dropdown.querySelector('.dropdown');
            if (button) button.setAttribute('aria-expanded', 'false');
            if (menu) {
                menu.setAttribute('aria-hidden', 'true');
                menu.style.opacity = '0';
                menu.style.visibility = 'hidden';
                menu.style.transform = 'translateY(-10px)';
            }
        });
    }

    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileToggle = document.getElementById('mobileToggle');
        const isHidden = mobileMenu.getAttribute('aria-hidden') === 'true';
        
        mobileMenu.setAttribute('aria-hidden', !isHidden);
        mobileToggle.setAttribute('aria-expanded', isHidden);
        
        if (!isHidden) {
            document.body.style.overflow = 'hidden';
            mobileMenu.classList.add('open');
        } else {
            document.body.style.overflow = '';
            mobileMenu.classList.remove('open');
        }
    }

    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileToggle = document.getElementById('mobileToggle');
        
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    toggleMobileDropdown(button) {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', !isExpanded);
        const menu = button.nextElementSibling;
        if (menu) {
            menu.style.maxHeight = isExpanded ? '0' : '500px';
            menu.setAttribute('aria-hidden', isExpanded);
        }
    }

    handleScroll() {
        const header = document.getElementById('siteHeader');
        const scrollTop = window.scrollY;
        
        // Debounce scroll events
        clearTimeout(this.scrollTimer);
        this.scrollTimer = setTimeout(() => {
            if (scrollTop > 100) {
                header.classList.add('header--compact');
            } else {
                header.classList.remove('header--compact');
            }
        }, 10);

        // Show/hide back to top button
        const backToTop = document.getElementById('backToTop');
        if (backToTop) {
            if (scrollTop > 500) {
                backToTop.style.opacity = '1';
                backToTop.style.visibility = 'visible';
            } else {
                backToTop.style.opacity = '0';
                backToTop.style.visibility = 'hidden';
            }
        }
    }

    handleInfiniteScroll() {
        if (this.state.isLoading || !this.state.hasMore) return;
        
        const scrollPosition = window.innerHeight + window.scrollY;
        const pageHeight = document.documentElement.scrollHeight - 500;
        
        if (scrollPosition >= pageHeight) {
            this.loadMore();
        }
    }

    async loadInitialData() {
        try {
            console.log('Loading initial data...');
            this.showLoading();
            
            const [newsData, liveData, videoData, fixtureData] = await Promise.all([
                this.fetchNews(),
                this.fetchLiveEvents(),
                this.fetchVideos(),
                this.fetchFixtures()
            ]);

            this.state.news = newsData.news || [];
            this.state.liveEvents = liveData || [];
            this.state.videos = videoData || [];
            this.state.fixtures = fixtureData || [];

            console.log('Data loaded:', {
                news: this.state.news.length,
                liveEvents: this.state.liveEvents.length,
                videos: this.state.videos.length,
                fixtures: this.state.fixtures.length
            });

            this.buildDynamicFilters();
            this.renderAll();
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load sports data. Please refresh the page.');
        }
    }

    buildDynamicFilters() {
        const sports = ['All', ...Object.keys(sportLeagues)];
        this.state.filters.sports = sports;
        this.state.filters.leagues = sportLeagues;
    }

    initializeLeagueFilters() {
        this.renderSportFilter();
        this.renderLeagueFilter();
        this.renderStatusFilter();
    }

    updateLeagueFilter(selectedSport) {
        const leagueFilter = document.getElementById('leagueFilter');
        const currentFilterInfo = document.getElementById('currentFilter');
        
        if (leagueFilter) {
            leagueFilter.innerHTML = '<option value="All">All Leagues</option>';
            
            if (currentFilterInfo) {
                currentFilterInfo.textContent = selectedSport === 'All' ? 'All Sports' : selectedSport;
            }
            
            if (selectedSport !== 'All' && sportLeagues[selectedSport]) {
                sportLeagues[selectedSport].forEach(league => {
                    const option = document.createElement('option');
                    option.value = league;
                    option.textContent = league;
                    leagueFilter.appendChild(option);
                });
            }
        }
    }

    async filterBySport(sport) {
        this.state.currentSport = sport;
        this.state.currentLeague = 'All';
        this.state.page = 1;
        
        this.updateLeagueFilter(sport);
        await this.applyFilters();
    }

    async filterByLeague(league) {
        this.state.currentLeague = league;
        this.state.page = 1;
        await this.applyFilters();
    }

    async filterByStatus(status) {
        this.state.currentStatus = status;
        this.state.page = 1;
        await this.applyFilters();
    }

    async applyFilters() {
        if (this.state.isLoading) return;
        
        this.state.isLoading = true;
        this.showLoading();
        
        try {
            const data = await this.fetchNews();
            if (this.state.page === 1) {
                this.state.news = data.news || [];
            } else {
                this.state.news = [...this.state.news, ...(data.news || [])];
            }
            this.state.hasMore = data.hasMore || false;
            
            this.renderNewsGrid();
            this.renderFilterChips();
            this.updateFilterDisplay();
            
        } catch (error) {
            console.error('Error applying filters:', error);
            this.showError('Failed to apply filters');
        } finally {
            this.state.isLoading = false;
            this.hideLoading();
        }
    }

    updateFilterDisplay() {
        const filterInfo = document.getElementById('filterInfo');
        if (!filterInfo) return;

        const sportText = this.state.currentSport === 'All' ? 'All Sports' : this.state.currentSport;
        const leagueText = this.state.currentLeague === 'All' ? 'All Leagues' : this.state.currentLeague;
        const statusText = this.state.currentStatus === 'All' ? 'All Status' : this.state.currentStatus;

        filterInfo.innerHTML = `
            Showing: <span id="currentFilter">${sportText}</span>
            ${leagueText !== 'All Leagues' ? `<span class="filter-badge">${leagueText}</span>` : ''}
            ${statusText !== 'All Status' ? `<span class="filter-badge">${statusText}</span>` : ''}
            <span class="filter-count">${this.state.news.length} matches</span>
        `;
    }

    async fetchNews(params = {}) {
        // Simulate API call with realistic delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const allNews = this.getMockNewsData();
        const filteredNews = allNews.filter(item => {
            const sportMatch = this.state.currentSport === 'All' || item.sport === this.state.currentSport;
            const leagueMatch = this.state.currentLeague === 'All' || item.league === this.state.currentLeague;
            const statusMatch = this.state.currentStatus === 'All' || item.status === this.state.currentStatus;
            const searchMatch = !this.state.searchQuery || 
                item.title.toLowerCase().includes(this.state.searchQuery.toLowerCase()) ||
                (item.teams?.home && item.teams.home.toLowerCase().includes(this.state.searchQuery.toLowerCase())) ||
                (item.teams?.away && item.teams.away.toLowerCase().includes(this.state.searchQuery.toLowerCase()));

            return sportMatch && leagueMatch && statusMatch && searchMatch;
        });

        // Simple pagination
        const pageSize = 6;
        const startIndex = (this.state.page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedNews = filteredNews.slice(startIndex, endIndex);

        return {
            news: paginatedNews,
            hasMore: endIndex < filteredNews.length
        };
    }

    getMockNewsData() {
        // Extended mock data with more items for pagination
        const baseNews = [
            {
                _id: '1',
                sport: 'Football',
                league: 'Laliga',
                teams: { home: 'Real Madrid', away: 'Barcelons' },
                title: 'Los Blancos Shine as Barça Falters',
                excerpt: 'Real Madrid conquered El Clásico in thrilling fashion, blending flair, precision, and unyielding dominance to outshine Barcelona..',
                score: '3-0',
                status: 'Finished',
                venue: 'Santiago Bernabeu',
                date: new Date().toISOString(),
                author: 'Alex Morgan',
                img: 'https://i.pinimg.com/736x/bd/f8/7f/bdf87f851419e4f63f82126a5eceae47.jpg',
                isFavorite: false
            },
            {
                _id: '2',
                sport: 'Basketball',
                league: 'NBA',
                teams: { home: 'Warriors', away: 'Heat' },
                title: 'Warriors Extend Winning Streak to 8 Games',
                excerpt: 'Curry scores 42 points in spectacular shooting display against Miami.',
                score: '113-108',
                status: 'Finished',
                venue: 'Chase Center',
                date: new Date(Date.now() - 86400000).toISOString(),
                author: 'Mike Johnson',
                img: 'https://i.pinimg.com/1200x/c6/df/f0/c6dff00ab0da5e5bb9a43ed03b76f864.jpg',
                isFavorite: false
            },
            {
                _id: '3',
                sport: 'Cricket',
                league: 'ICC World Cup',
                teams: { home: 'India', away: 'Australia' },
                title: 'India Set Massive Target Against Australia',
                excerpt: 'Kohli and Rohit partnership puts India in commanding position.',
                score: '325/4 - 280/6',
                status: 'Live',
                venue: 'MCG',
                date: new Date().toISOString(),
                author: 'Sarah Patel',
                img: 'https://i.pinimg.com/1200x/fb/25/30/fb2530174d79977ed0142d9d6af02f60.jpg',
                isFavorite: false
            }
        ];

        // Duplicate and modify to create more data for pagination
        const moreNews = [...Array(12)].map((_, index) => ({
            ...baseNews[index % baseNews.length],
            _id: (index + 4).toString(),
            title: baseNews[index % baseNews.length].title + ' - Match ' + (index + 2),
            date: new Date(Date.now() + (index * 86400000)).toISOString(),
            isFavorite: false
        }));

        return [...baseNews, ...moreNews];
    }

    async fetchLiveEvents() {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return [
            {
                id: 'live-1',
                sport: 'Football',
                teams: { home: 'Manchester City', away: 'Liverpool' },
                score: '3-0',
                status: 'Live',
                minute: '75',
                league: 'Premier League',
                venue: 'Etihad Stadium',
                youtubeId: 'qsyFbyX5PuY'
            },
            {
                id: 'live-2', 
                sport: 'Basketball',
                teams: { home: 'Lakers', away: 'Celtics' },
                score: '98-95',
                status: 'Live',
                minute: 'Q4',
                league: 'NBA',
                venue: 'TD Garden',
                youtubeId: '7EO9eFrId-Q'
            },
            {
                id: 'live-3',
                sport: 'Cricket',
                teams: { home: 'India', away: 'Australia' },
                score: '245/3 - 280/6',
                status: 'Live',
                minute: '45th Over',
                league: 'ICC World Cup',
                venue: 'MCG',
                youtubeId: 'e_XV_47IRkI'
            }
        ];
    }

    async fetchVideos() {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [
            {
                id: 'video-1',
                title: 'Incredible Last-Minute Winner!',
                sport: 'Football',
                duration: '2:15',
                thumbnail: 'https://i.pinimg.com/1200x/b8/00/41/b8004132d0cd253c11f68a145617a4de.jpg',
                views: '125K',
                youtubeId: 'MaKmc1ZxX4Y'
            },
            {
                id: 'video-2',
                title: 'Best Goals of the Month',
                sport: 'Football', 
                duration: '3:45',
                thumbnail: 'https://i.pinimg.com/1200x/7d/b5/28/7db528ce9a2a2876ea48612c761f1cf4.jpg',
                views: '89K',
                youtubeId: '3oa7fCKvpT0'
            },
            {
                id: 'video-3',
                title: 'Amazing Sixes Compilation',
                sport: 'Cricket',
                duration: '4:20',
                thumbnail: 'https://i.pinimg.com/736x/f2/0e/28/f20e2819e97afc81da9ce3a85cea9244.jpg',
                views: '67K',
                youtubeId: 'fBIqzpkaIy8'
            }
        ];
    }

    async fetchFixtures() {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [
            {
                id: 'fix-1',
                teams: { home: 'Chelsea', away: 'Arsenal' },
                time: '15:00',
                league: 'Premier League',
                date: 'Today'
            },
            {
                id: 'fix-2',
                teams: { home: 'Yankees', away: 'Red Sox' },
                time: '19:30', 
                league: 'MLB',
                date: 'Today'
            },
            {
                id: 'fix-3',
                teams: { home: 'Lakers', away: 'Warriors' },
                time: '21:00',
                league: 'NBA',
                date: 'Today'
            }
        ];
    }

    renderAll() {
        console.log('Rendering all components...');
        this.renderHero();
        this.renderVideoCarousel();
        this.renderLiveCarousel();
        this.renderFilterChips();
        this.renderNewsGrid();
        this.renderSidebar();
        this.updateTicker();
        this.updateFilterDisplay();
        this.renderUserPreferences();
        this.initCarousel();
        
        // Re-setup follow buttons after rendering
        this.setupFollowButtons();
        
        // Ensure horizontal scrolling is properly set up
        this.setupHorizontalScrolling();
    }

    renderHero() {
        const featured = this.state.news[0] || this.getDefaultHero();
        
        const heroTag = document.getElementById('heroTag');
        const heroTitle = document.getElementById('heroTitle');
        const heroAuthor = document.getElementById('heroAuthor');
        const heroDate = document.getElementById('heroDate');
        const heroExcerpt = document.getElementById('heroExcerpt');
        const heroImg = document.getElementById('heroImg');
        const heroMatchInfo = document.getElementById('heroMatchInfo');
        
        if (heroTag) heroTag.textContent = featured.sport || 'SPORTS';
        if (heroTitle) heroTitle.textContent = featured.title || 'Latest Sports Updates';
        if (heroAuthor) heroAuthor.textContent = featured.author || 'Sports Desk';
        if (heroDate) heroDate.textContent = this.formatDate(featured.date);
        if (heroExcerpt) heroExcerpt.textContent = featured.excerpt || 'Stay tuned for live updates and expert analysis.';
        
        if (featured.img && heroImg) {
            heroImg.style.backgroundImage = `url('${featured.img}')`;
        }

        if (heroMatchInfo) {
            heroMatchInfo.innerHTML = `
                ${featured.score ? `<div class="hero-score">${featured.score}</div>` : ''}
                ${featured.status ? `<div class="hero-status">${featured.status}</div>` : ''}
                ${featured.venue ? `<div class="hero-venue">${featured.venue}</div>` : ''}
            `;
        }
    }

    getDefaultHero() {
        return {
            sport: 'SPORTS',
            title: 'Welcome to AllSports',
            author: 'Sports Desk',
            date: new Date().toISOString(),
            excerpt: 'Your premier destination for the latest sports news, live scores, and video highlights from around the world.',
            img: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800'
        };
    }

    renderVideoCarousel() {
        const track = document.getElementById('videoTrack');
        if (!track || this.state.videos.length === 0) {
            if (track) {
                track.innerHTML = '<div class="loading">Loading videos...</div>';
            }
            return;
        }

        track.innerHTML = this.state.videos.map(video => `
            <div class="video-card" data-youtube-id="${video.youtubeId}">
                <div class="video-thumb" style="background-image: url('${video.thumbnail}')">
                    <div class="video-play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
                <div class="c-body">
                    <h4>${video.title}</h4>
                    <div class="meta">${video.sport} • ${video.duration} • ${video.views} views</div>
                </div>
            </div>
        `).join('');
        
        // Ensure horizontal scrolling is applied
        this.setupHorizontalScrolling();
    }

    // UPDATED: Redesigned Live Now Carousel with Horizontal Scroll
    renderLiveCarousel() {
        const track = document.getElementById('liveTrack');
        if (!track || this.state.liveEvents.length === 0) {
            if (track) {
                track.innerHTML = '<div class="loading">No live events at the moment</div>';
            }
            return;
        }

        track.innerHTML = this.state.liveEvents.map(event => `
            <div class="live-card" data-event-id="${event.id}" data-youtube-id="${event.youtubeId}" data-sport="${event.sport}">
                <div class="live-card-header">
                    <div class="match-status">
                        <div class="live-indicator"></div>
                        <span class="live-text">LIVE</span>
                    </div>
                    <div class="match-timer">${event.minute || ''}</div>
                </div>
                <div class="live-card-body">
                    <div class="teams">
                        <div class="team home-team">
                            <div class="team-info">
                                <div class="team-logo">${this.getTeamAbbreviation(event.teams.home)}</div>
                                <div class="team-name">${event.teams.home}</div>
                            </div>
                            <div class="team-score">${this.extractHomeScore(event.score)}</div>
                        </div>
                        <div class="team away-team">
                            <div class="team-info">
                                <div class="team-logo">${this.getTeamAbbreviation(event.teams.away)}</div>
                                <div class="team-name">${event.teams.away}</div>
                            </div>
                            <div class="team-score">${this.extractAwayScore(event.score)}</div>
                        </div>
                    </div>
                    <div class="match-info">
                        <div class="match-league">
                            <div class="league-logo"></div>
                            ${event.league}
                        </div>
                        <div class="match-venue">${event.venue || ''}</div>
                    </div>
                </div>
                <div class="live-card-actions">
                    <button class="btn btn-small watch-live-btn">Watch Live</button>
                    <button class="btn btn-small ghost stats-btn">Stats</button>
                </div>
            </div>
        `).join('');
        
        // Ensure horizontal scrolling is applied
        this.setupHorizontalScrolling();
    }

    renderFilterChips() {
        const container = document.getElementById('categoryFilters');
        if (!container) return;

        const sports = this.state.filters.sports.filter(sport => sport !== 'All');
        container.innerHTML = sports.map(sport => `
            <button class="filter-chip ${sport === this.state.currentSport ? 'active' : ''}" 
                    data-sport="${sport}">
                ${sport}
            </button>
        `).join('');

        // Add event listeners to filter chips
        container.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const sport = chip.dataset.sport;
                this.filterBySport(sport);
            });
        });
    }

    renderNewsGrid() {
        const grid = document.getElementById('newsGrid');
        if (!grid) return;

        if (this.state.news.length === 0) {
            grid.innerHTML = `
                <div class="error-state">
                    <h3>No matches found</h3>
                    <p>Try adjusting your filters or check back later for updates.</p>
                    <button class="btn" id="resetGridFilters">Reset Filters</button>
                </div>
            `;
            
            // Add event listener to reset button
            const resetBtn = document.getElementById('resetGridFilters');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => this.resetFilters());
            }
            return;
        }

        const viewClass = this.state.currentView === 'list' ? 'card--list' : '';
        
        grid.innerHTML = this.state.news.map(item => `
            <div class="card ${viewClass}" data-article-id="${item._id}" tabindex="0" role="button" aria-label="Read more about ${item.title}">
                <div class="thumb" style="background-image: url('${item.img || this.getDefaultImage(item.sport)}')">
                    ${item.score ? `<div class="score-badge">${item.score}</div>` : ''}
                    ${item.status ? `<div class="status-badge ${item.status.toLowerCase()}">${item.status}</div>` : ''}
                    <div class="card-actions">
                        <button class="favorite-btn ${item.isFavorite ? 'favorited' : ''}" data-article-id="${item._id}" aria-label="${item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="${item.isFavorite ? 'currentColor' : 'none'}" stroke="currentColor">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        </button>
                        <button class="share-btn" data-article-id="${item._id}" aria-label="Share this article">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="c-body">
                    <div class="sport-league">
                        <span class="tag">${item.sport}</span>
                        <span class="league-tag">${item.league}</span>
                    </div>
                    <h3>${item.title}</h3>
                    <p>${item.excerpt || 'Match details and updates...'}</p>
                    <div class="match-info">
                        ${item.venue ? `<span class="venue">🏟️ ${item.venue}</span>` : ''}
                        ${item.date ? `<span class="time">⏰ ${this.formatTime(item.date)}</span>` : ''}
                    </div>
                    <div class="c-meta">
                        <span>${this.formatDate(item.date)}</span>
                        <span>•</span>
                        <span>${item.author || 'Sports Reporter'}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to news cards
        grid.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.card-actions')) {
                    const articleId = card.dataset.articleId;
                    console.log('Card clicked:', articleId);
                    this.openArticle(articleId);
                }
            });
            
            // Add keyboard support
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const articleId = card.dataset.articleId;
                    this.openArticle(articleId);
                }
            });
        });

        // Update load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = this.state.hasMore ? 'block' : 'none';
            loadMoreBtn.textContent = this.state.hasMore ? 'Load more stories' : 'No more stories';
            loadMoreBtn.disabled = !this.state.hasMore;
        }
    }

    getDefaultImage(sport) {
        const defaultImages = {
            'Football': 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=400',
            'Basketball': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
            'Cricket': 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400',
            'Tennis': 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=400',
            'Baseball': 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400',
            'Hockey': 'https://images.unsplash.com/photo-1550675894-95b70ec8d936?w=400'
        };
        return defaultImages[sport] || 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=400';
    }

    renderSidebar() {
        this.renderFixtures();
        this.renderTopTeams();
        this.renderQuickLinks();
    }

    renderFixtures() {
        const container = document.getElementById('fixturesList');
        if (!container) return;

        if (this.state.fixtures.length === 0) {
            container.innerHTML = '<div class="muted">No fixtures today</div>';
            return;
        }

        container.innerHTML = this.state.fixtures.map(fixture => `
            <div class="fixture-item">
                <div class="fixture-teams">
                    <strong>${fixture.teams.home} vs ${fixture.teams.away}</strong>
                    <div class="fixture-meta">${fixture.league}</div>
                </div>
                <div class="fixture-time">${fixture.time}</div>
            </div>
        `).join('');
    }

    renderTopTeams() {
        const container = document.getElementById('topTeams');
        if (!container) return;

        const topTeams = [
            { name: 'Manchester City', sport: 'Football' },
            { name: 'Los Angeles Lakers', sport: 'Basketball' },
            { name: 'India Cricket', sport: 'Cricket' },
            { name: 'Golden State Warriors', sport: 'Basketball' },
            { name: 'Real Madrid', sport: 'Football' }
        ];

        container.innerHTML = topTeams.map(team => `
            <div class="small-item">
                <div>
                    <strong>${team.name}</strong>
                    <div class="muted">${team.sport}</div>
                </div>
            </div>
        `).join('');
    }

    renderQuickLinks() {
        const container = document.getElementById('quickLinks');
        if (!container) return;

        const quickLinks = [
            { name: 'Live Scores', icon: '⚽', href: '#' },
            { name: 'Standings', icon: '📊', href: '#' },
            { name: 'Players', icon: '👤', href: '#' },
            { name: 'Teams', icon: '🏆', href: '#' },
            { name: 'Schedule', icon: '📅', href: '#' }
        ];

        container.innerHTML = quickLinks.map(link => `
            <a href="${link.href}" class="quick-link">
                <span class="quick-link-icon">${link.icon}</span>
                <span>${link.name}</span>
            </a>
        `).join('');
    }

    renderSportFilter() {
        const sportFilter = document.getElementById('sportFilter');
        if (!sportFilter) return;

        sportFilter.innerHTML = this.state.filters.sports.map(sport => 
            `<option value="${sport}">${sport}</option>`
        ).join('');
        
        sportFilter.value = this.state.currentSport;
    }

    renderLeagueFilter() {
        const leagueFilter = document.getElementById('leagueFilter');
        if (!leagueFilter) return;

        const currentSport = this.state.currentSport;
        const leagues = this.state.filters.leagues[currentSport] || ['All'];

        leagueFilter.innerHTML = leagues.map(league => 
            `<option value="${league}">${league}</option>`
        ).join('');
        
        leagueFilter.value = this.state.currentLeague;
    }

    renderStatusFilter() {
        const statusFilter = document.getElementById('statusFilter');
        if (!statusFilter) return;

        statusFilter.innerHTML = this.state.filters.statuses.map(status => 
            `<option value="${status}">${status}</option>`
        ).join('');
        
        statusFilter.value = this.state.currentStatus;
    }

    updateTicker() {
        const marquee = document.getElementById('marqueeInner');
        const time = document.getElementById('tickerTime');
        
        if (marquee && this.state.liveEvents.length > 0) {
            const tickerItems = this.state.liveEvents.map(event => 
                `${event.sport}: ${event.teams.home} ${event.score} ${event.teams.away}`
            );
            marquee.innerHTML = tickerItems.map(item => 
                `<span class="ticker-item">${item}</span>`
            ).join(' • ');
        } else if (marquee) {
            marquee.innerHTML = '<span class="ticker-item">No live events at the moment</span>';
        }
        
        if (time) {
            time.textContent = new Date().toLocaleTimeString();
        }
    }

    startLiveUpdates() {
        // Update ticker every 30 seconds
        setInterval(() => {
            this.updateTicker();
        }, 30000);

        // Simulate live data updates every 60 seconds
        setInterval(async () => {
            try {
                const liveData = await this.fetchLiveEvents();
                this.state.liveEvents = liveData;
                this.renderLiveCarousel();
                this.updateTicker();
                this.updateLiveScores();
            } catch (error) {
                console.error('Error updating live data:', error);
            }
        }, 60000);
    }

    resetFilters() {
        this.state.currentSport = 'All';
        this.state.currentLeague = 'All';
        this.state.currentStatus = 'All';
        this.state.searchQuery = '';
        this.state.page = 1;
        
        // Reset search input
        const searchInput = document.getElementById('searchInput');
        const mobileSearchInput = document.getElementById('mobileSearchInput');
        if (searchInput) searchInput.value = '';
        if (mobileSearchInput) mobileSearchInput.value = '';
        
        // Reset filter dropdowns
        this.renderSportFilter();
        this.renderLeagueFilter();
        this.renderStatusFilter();
        
        // Reapply filters to show all data
        this.applyFilters();
    }

    async loadMore() {
        if (this.state.isLoading || !this.state.hasMore) return;
        
        this.state.page++;
        await this.applyFilters();
    }

    openArticle(articleId) {
        console.log('Opening article:', articleId);
        
        if (articleId === 'featured') {
            const featured = this.state.news[0];
            if (featured) {
                this.showArticleModal(featured);
            }
            return;
        }

        // First try to find in current state news
        let article = this.state.news.find(item => item._id === articleId);
        
        // If not found in current state, try the full mock data
        if (!article) {
            const allNews = this.getMockNewsData();
            article = allNews.find(item => item._id === articleId);
        }
        
        if (article) {
            this.showArticleModal(article);
        } else {
            console.error('Article not found with ID:', articleId);
            this.showAlert('Article not found. Please try again.', 'error');
        }
    }

    showArticleModal(article) {
        const modal = document.getElementById('articleModal');
        const content = document.getElementById('modalContent');
        const title = document.getElementById('modalTitle');
        
        if (!modal || !content || !title) {
            console.error('Modal elements not found');
            return;
        }

        // Set modal content
        title.textContent = article.title || 'Match Details';
        
        // Generate detailed content based on article ID
        const detailedContent = this.generateArticleContent(article);
        
        content.innerHTML = `
            <div class="article-header">
                <div class="sport-league">
                    <span class="tag">${article.sport || 'SPORTS'}</span>
                    <span class="league-tag">${article.league || 'League'}</span>
                </div>
                <div class="article-meta">
                    By <strong>${article.author || 'Sports Desk'}</strong> • ${this.formatDate(article.date)}
                </div>
                <div class="article-actions">
                    <button class="favorite-btn ${article.isFavorite ? 'favorited' : ''}" data-article-id="${article._id}" aria-label="${article.isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="${article.isFavorite ? 'currentColor' : 'none'}" stroke="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    </button>
                    <button class="share-btn" data-article-id="${article._id}" aria-label="Share this article">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="article-content">
                <p>${article.excerpt || 'Detailed match analysis and commentary.'}</p>
                
                <div class="match-details">
                    <h4>Match Information</h4>
                    <div class="detail-grid">
                        ${article.teams ? `
                            <div class="detail-item">
                                <span class="detail-label">Teams:</span>
                                <span class="detail-value">${article.teams.home || 'Team A'} vs ${article.teams.away || 'Team B'}</span>
                            </div>
                        ` : ''}
                        
                        ${article.score ? `
                            <div class="detail-item">
                                <span class="detail-label">Score:</span>
                                <span class="detail-value" style="color: var(--accent);">${article.score}</span>
                            </div>
                        ` : ''}
                        
                        ${article.status ? `
                            <div class="detail-item">
                                <span class="detail-label">Status:</span>
                                <span class="detail-value status ${article.status.toLowerCase()}">${article.status}</span>
                            </div>
                        ` : ''}
                        
                        ${article.venue ? `
                            <div class="detail-item">
                                <span class="detail-label">Venue:</span>
                                <span class="detail-value">${article.venue}</span>
                            </div>
                        ` : ''}
                        
                        ${article.date ? `
                            <div class="detail-item">
                                <span class="detail-label">Date & Time:</span>
                                <span class="detail-value">${new Date(article.date).toLocaleString()}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                ${detailedContent}
            </div>
        `;

        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        console.log('Article modal opened:', article.title);
    }

    // Generate detailed article content based on article ID
    generateArticleContent(article) {
        const articleId = article._id;
        
        // Different content for different articles
        switch(articleId) {
            case '1': // Arsenal vs Chelsea
                return `
                   <div class="analysis-section">
                  <h4>📊 Match Analysis</h4>
                  <p>Real Madrid delivered a commanding performance to secure a 3-0 victory over Barcelona in El Clásico. Los Blancos dominated from start to finish, showcasing tactical brilliance and individual flair.</p>
                  
                  <div class="key-moments">
                      <h5>Key Moments</h5>
                      <div class="moment-item">
                          <div class="moment-time">23'</div>
                          <div class="moment-description">Ronaldo opened the scoring with a powerful strike from the edge of the box</div>
                      </div>
                      <div class="moment-item">
                          <div class="moment-time">56'</div>
                          <div class="moment-description">Ronaldo doubled the lead with a brilliant header from a Benzema cross</div>
                      </div>
                      <div class="moment-item">
                          <div class="moment-time">78'</div>
                          <div class="moment-description">Ronaldo completed his hat-trick with a clinical finish after a swift counter-attack</div>
                      </div>
                      <div class="moment-item">
                          <div class="moment-time">85'</div>
                          <div class="moment-description">Courtois made a crucial save to keep Barcelona at bay and maintain the clean sheet</div>
                      </div>
                  </div>
              </div>

                `;
                
            case '2': // Warriors vs Heat
                return `
                    <div class="analysis-section">
                        <h4>📊 Game Analysis</h4>
                        <p>The Golden State Warriors extended their winning streak to eight games with a hard-fought 113-108 victory over the Miami Heat. Stephen Curry led the way with a spectacular 42-point performance.</p>
                        
                        <div class="key-moments">
                            <h5>Key Moments</h5>
                            <div class="moment-item">
                                <div class="moment-time">Q1</div>
                                <div class="moment-description">Warriors started strong with Curry hitting three 3-pointers in the opening minutes</div>
                            </div>
                            <div class="moment-item">
                                <div class="moment-time">Q2</div>
                                <div class="moment-description">Heat fought back with Butler leading a 12-0 run to take the lead</div>
                            </div>
                            <div class="moment-item">
                                <div class="moment-time">Q3</div>
                                <div class="moment-description">Warriors' defense tightened, holding Heat to just 18 points in the quarter</div>
                            </div>
                            <div class="moment-item">
                                <div class="moment-time">Q4</div>
                                <div class="moment-description">Curry scored 15 points in the final quarter to seal the victory</div>
                            </div>
                        </div>
                    </div>
                `;
                
            case '3': // India vs Australia
                return `
                    <div class="analysis-section">
                        <h4>📊 Match Analysis</h4>
                        <p>India has set a massive target of 325/4 against Australia in the ICC World Cup clash at MCG. A magnificent partnership between Kohli and Rohit has put India in a commanding position.</p>
                        
                        <div class="key-moments">
                            <h5>Key Moments</h5>
                            <div class="moment-item">
                                <div class="moment-time">10th Over</div>
                                <div class="moment-description">Early breakthrough as Australia dismisses Rahul for 28</div>
                            </div>
                            <div class="moment-item">
                                <div class="moment-time">15th-35th Over</div>
                                <div class="moment-description">Kohli-Rohit partnership of 189 runs puts India in control</div>
                            </div>
                            <div class="moment-item">
                                <div class="moment-time">40th Over</div>
                                <div class="moment-description">Rohit Sharma reaches his century with a magnificent six</div>
                            </div>
                            <div class="moment-item">
                                <div class="moment-time">45th Over</div>
                                <div class="moment-description">Hardik Pandya's quickfire 35 runs boost India's total</div>
                            </div>
                        </div>
                    </div>
                `;
                
            default:
                // Generic content for other articles
                return `
                    <div class="analysis-section">
                        <h4>📊 Match Analysis</h4>
                        <p>This was an exciting contest between two competitive teams. The match featured several key moments that ultimately decided the outcome.</p>
                        
                        <div class="key-moments">
                            <h5>Key Moments</h5>
                            <div class="moment-item">
                                <div class="moment-time">First Half</div>
                                <div class="moment-description">Both teams started strongly, creating several scoring opportunities</div>
                            </div>
                            <div class="moment-item">
                                <div class="moment-time">Second Half</div>
                                <div class="moment-description">The game opened up with both teams pushing for the winning goal</div>
                            </div>
                            <div class="moment-item">
                                <div class="moment-time">Final Minutes</div>
                                <div class="moment-description">A late goal decided the outcome of this thrilling encounter</div>
                            </div>
                        </div>
                    </div>
                `;
        }
    }

    carouselPrev(carouselId) {
        const track = document.getElementById(`${carouselId}Track`);
        if (track) {
            track.scrollBy({ left: -300, behavior: 'smooth' });
        }
    }

    carouselNext(carouselId) {
        const track = document.getElementById(`${carouselId}Track`);
        if (track) {
            track.scrollBy({ left: 300, behavior: 'smooth' });
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

        // Initialize custom carousels
        this.initCustomCarousel('videoCarousel', 'videoPrevBtn', 'videoNextBtn');
        this.initCustomCarousel('liveCarousel', 'livePrevBtn', 'liveNextBtn');
    }

    initCustomCarousel(carouselId, prevBtnId, nextBtnId) {
        const carousel = document.getElementById(carouselId);
        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);
        
        if (carousel && prevBtn && nextBtn) {
            const track = carousel.querySelector('.carousel-track');
            
            prevBtn.addEventListener('click', () => {
                track.scrollBy({ left: -300, behavior: 'smooth' });
            });
            
            nextBtn.addEventListener('click', () => {
                track.scrollBy({ left: 300, behavior: 'smooth' });
            });
        }
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
    }

    enhanceCards() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
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

        // Animate cards in on load
        setTimeout(() => {
            cards.forEach((el, index) => {
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, 500);
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
        }
    }

    toggleView(view) {
        this.state.currentView = view;
        this.renderNewsGrid();
        
        // Update active view button
        document.querySelectorAll('.view-toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${view}ViewBtn`)?.classList.add('active');
    }

    toggleFavorite(articleId, button) {
        const article = this.state.news.find(item => item._id === articleId);
        if (article) {
            article.isFavorite = !article.isFavorite;
            
            // Update UI
            if (button) {
                button.classList.toggle('favorited');
                const svg = button.querySelector('svg');
                if (svg) {
                    svg.setAttribute('fill', article.isFavorite ? 'currentColor' : 'none');
                }
                button.setAttribute('aria-label', article.isFavorite ? 'Remove from favorites' : 'Add to favorites');
            }
            
            // Update in modal if open
            const modalFavoriteBtn = document.querySelector(`.article-actions .favorite-btn[data-article-id="${articleId}"]`);
            if (modalFavoriteBtn) {
                modalFavoriteBtn.classList.toggle('favorited');
                const modalSvg = modalFavoriteBtn.querySelector('svg');
                if (modalSvg) {
                    modalSvg.setAttribute('fill', article.isFavorite ? 'currentColor' : 'none');
                }
            }
            
            // Save to user preferences
            this.updateUserFavorites(articleId, article.isFavorite);
        }
    }

    updateUserFavorites(articleId, isFavorite) {
        if (isFavorite) {
            if (!this.state.userPreferences.favoriteArticles) {
                this.state.userPreferences.favoriteArticles = [];
            }
            this.state.userPreferences.favoriteArticles.push(articleId);
        } else {
            this.state.userPreferences.favoriteArticles = this.state.userPreferences.favoriteArticles?.filter(id => id !== articleId) || [];
        }
        this.saveUserPreferences();
    }

    shareArticle(articleId) {
        const article = this.state.news.find(item => item._id === articleId);
        if (article && navigator.share) {
            navigator.share({
                title: article.title,
                text: article.excerpt,
                url: window.location.href + `?article=${articleId}`
            }).catch(err => {
                console.log('Error sharing:', err);
                this.showShareFallback(article);
            });
        } else {
            this.showShareFallback(article);
        }
    }

    showShareFallback(article) {
        const url = window.location.href;
        const text = `Check out this sports news: ${article.title}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(`${text} ${url}`).then(() => {
            alert('Link copied to clipboard!');
        }).catch(() => {
            prompt('Copy this link:', url);
        });
    }

    followSport(sportId) {
        const sport = sportId === 'featured' ? this.state.news[0]?.sport : sportId;
        if (sport) {
            if (!this.state.userPreferences.favoriteSports.includes(sport)) {
                this.state.userPreferences.favoriteSports.push(sport);
                this.saveUserPreferences();
                this.showToast(`Now following ${sport}`);
            } else {
                this.state.userPreferences.favoriteSports = this.state.userPreferences.favoriteSports.filter(s => s !== sport);
                this.saveUserPreferences();
                this.showToast(`Unfollowed ${sport}`);
            }
            this.renderUserPreferences();
        }
    }

    subscribe() {
        const emailInput = document.getElementById('nlEmail');
        if (emailInput) {
            const email = emailInput.value;
            if (email && this.validateEmail(email)) {
                this.showToast(`Thank you for subscribing with ${email}! You'll receive our weekly sports newsletter.`);
                emailInput.value = '';
                
                // Add to user preferences
                this.state.userPreferences.subscribed = true;
                this.state.userPreferences.subscriptionEmail = email;
                this.saveUserPreferences();
            } else {
                this.showToast('Please enter a valid email address');
            }
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    toggleTheme() {
        const currentTheme = this.state.userPreferences.theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        this.state.userPreferences.theme = newTheme;
        this.saveUserPreferences();
        this.applyUserPreferences();
        
        // Update theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
            themeToggle.setAttribute('aria-label', `Switch to ${newTheme === 'dark' ? 'light' : 'dark'} theme`);
        }
    }

    applyUserPreferences() {
        // Apply theme
        document.documentElement.setAttribute('data-theme', this.state.userPreferences.theme);
        
        // Update UI based on preferences
        this.renderUserPreferences();
    }

    renderUserPreferences() {
        // Update favorite sports in UI if needed
        const favoriteSports = this.state.userPreferences.favoriteSports || [];
        console.log('User preferences applied:', this.state.userPreferences);
    }

    saveUserPreferences() {
        localStorage.setItem('userPreferences', JSON.stringify(this.state.userPreferences));
    }

    setupBackToTop() {
        const backToTop = document.createElement('button');
        backToTop.id = 'backToTop';
        backToTop.innerHTML = '↑';
        backToTop.setAttribute('aria-label', 'Back to top');
        backToTop.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 20px;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        document.body.appendChild(backToTop);
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

    formatTime(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showLoading() {
        const loading = document.getElementById('loadingIndicator');
        if (loading) {
            loading.style.display = 'block';
        }
    }

    hideLoading() {
        const loading = document.getElementById('loadingIndicator');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    showAlert(message, type = 'info') {
        console.log(`${type}:`, message);
        
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 10000;
            max-width: 300px;
            background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#2ecc71' : '#3498db'};
            color: white;
            font-weight: 500;
        `;
        alertDiv.textContent = message;
        
        document.body.appendChild(alertDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
        }, 5000);
    }

    showError(message) {
        this.showAlert(message, 'error');
    }
}

// League data for each sport
const sportLeagues = {
    'Football': [
        'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 
        'Champions League', 'Europa League', 'FA Cup', 'EFL Cup', 'MLS',
        'Copa Libertadores', 'AFC Champions League', 'World Cup', 'Euro Cup'
    ],
    'Cricket': [
        'IPL', 'Big Bash League', 'The Hundred', 'PSL', 'CPL',
        'County Championship', 'T20 Blast', 'Sheffield Shield', 'Ranji Trophy',
        'World Cup', 'T20 World Cup', 'Ashes', 'Test Championship'
    ],
    'Basketball': [
        'NBA', 'EuroLeague', 'WNBA', 'CBA', 'ACB',
        'BBL', 'NBL', 'FIBA World Cup', 'Olympics', 'NCAA'
    ],
    'Tennis': [
        'ATP Tour', 'WTA Tour', 'Grand Slam', 'Davis Cup', 'Fed Cup',
        'ATP Finals', 'WTA Finals', 'Masters 1000', 'WTA 1000', 'Olympics'
    ],
    'Baseball': [
        'MLB', 'NPB', 'KBO', 'CPBL', 'LMB',
        'World Baseball Classic', 'Caribbean Series', 'Minor League Baseball'
    ],
    'Hockey': [
        'NHL', 'KHL', 'SHL', 'Liiga', 'DEL',
        'World Championship', 'Stanley Cup', 'Champions Hockey League'
    ],
    'Golf': [
        'PGA Tour', 'European Tour', 'LPGA Tour', 'Champions Tour',
        'Masters', 'US Open', 'The Open', 'PGA Championship', 'Ryder Cup'
    ],
    'Rugby': [
        'Premiership', 'Super Rugby', 'Top 14', 'United Rugby Championship',
        'Six Nations', 'Rugby Championship', 'World Cup', 'Champions Cup'
    ],
    'Formula1': [
        'Formula 1 World Championship', 'Formula 2', 'Formula 3',
        'Formula E', 'IndyCar Series', 'W Series'
    ],
    'Boxing': [
        'WBC', 'WBA', 'IBF', 'WBO', 'The Ring',
        'Heavyweight', 'Middleweight', 'Welterweight', 'Lightweight'
    ],
    'MMA': [
        'UFC', 'Bellator', 'ONE Championship', 'PFL',
        'Pound-for-Pound', 'Heavyweight', 'Lightweight', 'Welterweight'
    ],
    'Olympics': [
        'Summer Olympics', 'Winter Olympics', 'Youth Olympics',
        'Paralympics', 'Asian Games', 'Commonwealth Games'
    ]
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("AllSports site loaded");
    window.app = new AllSportsApp();
    
    // Add loaded class to body for animations
    document.body.classList.add('loaded');
});

// Global SportsApp object for backward compatibility
window.SportsApp = {
    openLogin: () => window.app?.handleLoginClick(),
    closeMobileMenu: () => window.app?.closeMobileMenu(),
    toggleMobileDropdown: (button) => window.app?.toggleMobileDropdown(button),
    performSearch: (query) => window.app?.performSearch(query),
    closeAllDropdowns: () => window.app?.closeAllDropdowns()
};

// Enhanced standalone follow functionality for better reliability
document.addEventListener('DOMContentLoaded', function() {
    // Enhanced follow buttons functionality with multiple approaches
    function setupFollowButtons() {
        // Approach 1: Event delegation for dynamic content
        document.addEventListener('click', function(e) {
            const followBtn = e.target.closest('.follow-btn');
            if (followBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                handleFollowClick(followBtn);
            }
        });

        // Approach 2: Direct event listeners for existing buttons
        const followButtons = document.querySelectorAll('.follow-btn');
        followButtons.forEach(button => {
            if (!button.hasAttribute('data-follow-listener')) {
                button.setAttribute('data-follow-listener', 'true');
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFollowClick(this);
                });
            }
        });

        // Approach 3: Periodic check for new buttons (fallback)
        setInterval(() => {
            const newFollowButtons = document.querySelectorAll('.follow-btn:not([data-follow-listener])');
            newFollowButtons.forEach(button => {
                button.setAttribute('data-follow-listener', 'true');
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFollowClick(this);
                });
            });
        }, 1000);
    }

    function handleFollowClick(button) {
        const sport = button.getAttribute('data-sport') || 
                     button.textContent.replace('Follow', '').replace('Following', '').trim() ||
                     'this sport';
        
        const isFollowing = button.classList.contains('following');
        
        if (isFollowing) {
            // Unfollow
            button.classList.remove('following');
            button.textContent = 'Follow';
            showToast(`Unfollowed ${sport}`);
        } else {
            // Follow
            button.classList.add('following');
            button.textContent = 'Following';
            showToast(`Now following ${sport}`);
        }
    }

    function showToast(message) {
        // Use app's toast if available
        if (window.app && window.app.showToast) {
            window.app.showToast(message);
            return;
        }
        
        // Fallback toast implementation
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--accent);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
                font-weight: 500;
                pointer-events: none;
            `;
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.opacity = '1';
        
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 3000);
    }

    // Initialize follow buttons
    setupFollowButtons();

    // Enhanced mobile menu functionality
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileClose = document.querySelector('.mobile-close');
    
    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', function() {
            mobileMenu.classList.add('open');
            this.setAttribute('aria-expanded', 'true');
        });
        
        if (mobileClose) {
            mobileClose.addEventListener('click', function() {
                mobileMenu.classList.remove('open');
                mobileToggle.setAttribute('aria-expanded', 'false');
            });
        }
    }
    
    // Enhanced mobile dropdown functionality
    const mobileDropdownButtons = document.querySelectorAll('.mobile-nav-button');
    
    mobileDropdownButtons.forEach(button => {
        button.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            
            const dropdownMenu = this.nextElementSibling;
            if (dropdownMenu) {
                dropdownMenu.setAttribute('aria-hidden', isExpanded);
                dropdownMenu.style.maxHeight = isExpanded ? '0' : '500px';
            }
        });
    });
    
    // Enhanced filter functionality
    const filterChips = document.querySelectorAll('.filter-chip');
    
    filterChips.forEach(chip => {
        chip.addEventListener('click', function() {
            // Remove active class from all chips
            filterChips.forEach(c => c.classList.remove('active'));
            // Add active class to clicked chip
            this.classList.add('active');
            
            // Update filter info
            const filterInfo = document.getElementById('currentFilter');
            if (filterInfo && this.textContent !== 'All') {
                filterInfo.textContent = this.textContent;
            } else if (filterInfo) {
                filterInfo.textContent = 'All Sports';
            }
        });
    });
    
    // Enhanced load more functionality
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // Use app's loadMore method if available
            if (window.app && window.app.loadMore) {
                window.app.loadMore();
            } else {
                // Fallback implementation
                this.textContent = 'Loading...';
                this.disabled = true;
                
                setTimeout(() => {
                    this.textContent = 'Load more stories';
                    this.disabled = false;
                }, 1500);
            }
        });
    }
    
    // Enhanced newsletter subscription
    const subscribeBtn = document.getElementById('subscribeBtn');
    
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', function() {
            const emailInput = document.getElementById('nlEmail');
            const email = emailInput.value;
            
            if (email && isValidEmail(email)) {
                showToast('Thanks for subscribing to our newsletter!');
                emailInput.value = '';
            } else {
                showToast('Please enter a valid email address');
            }
        });
    }
    
    // Email validation helper
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Enhanced header scroll effect
    const siteHeader = document.getElementById('siteHeader');
    
    if (siteHeader) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                siteHeader.classList.add('header--compact');
            } else {
                siteHeader.classList.remove('header--compact');
            }
        });
    }
});