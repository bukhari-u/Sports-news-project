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
        console.log('AllSports Games App Initializing...');
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
        
        // Setup stats button handlers
        this.setupStatsButtonHandlers();

        // Setup responsive layout
        this.setupResponsiveLayout();
        
        // Debug data
        this.debugData();
    }

    setupResponsiveLayout() {
        const updateLayout = () => {
            const screenWidth = window.innerWidth;
            
            // Adjust layout for 15.6 inch screens (typically 1366x768)
            if (screenWidth <= 1366) {
                document.body.classList.add('screen-1366');
                
                // Further compact the header on very small screens
                if (screenWidth < 1280) {
                    document.body.classList.add('screen-1280');
                }
            } else {
                document.body.classList.remove('screen-1366', 'screen-1280');
            }
        };

        // Initial call
        updateLayout();
        
        // Update on resize with debounce
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(updateLayout, 250);
        });
    }

    debugData() {
        console.log('Current State Data:', {
            newsCount: this.state.news.length,
            liveEventsCount: this.state.liveEvents.length,
            videosCount: this.state.videos.length,
            fixturesCount: this.state.fixtures.length,
            news: this.state.news,
            liveEvents: this.state.liveEvents,
            videos: this.state.videos,
            fixtures: this.state.fixtures
        });
    }

    // FIXED: Enhanced stats button event delegation with proper debugging
    setupStatsButtonHandlers() {
        console.log('Setting up stats button handlers...');
        
        // Use event delegation on the document to catch all stats button clicks
        document.addEventListener('click', (e) => {
            // Check if the clicked element is a stats button or inside one
            const statsBtn = e.target.closest('.stats-btn');
            if (statsBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                const liveCard = statsBtn.closest('.live-card, .live-grid-card');
                if (liveCard) {
                    const eventId = liveCard.dataset.eventId;
                    const sport = liveCard.dataset.sport;
                    
                    console.log('Stats button clicked - Event Data:', {
                        eventId,
                        sport,
                        liveCard: liveCard,
                        dataset: liveCard.dataset,
                        allAttributes: liveCard.attributes
                    });
                    
                    if (eventId && sport) {
                        this.showMatchStats(eventId, sport);
                    } else {
                        console.error('Missing event ID or sport data:', {
                            eventId, 
                            sport,
                            dataset: liveCard.dataset
                        });
                        
                        // Fallback: try to find event by team names
                        const homeTeam = liveCard.querySelector('.home-team .team-name')?.textContent;
                        const awayTeam = liveCard.querySelector('.away-team .team-name')?.textContent;
                        
                        if (homeTeam && awayTeam) {
                            const foundEvent = this.findEventByTeams(homeTeam, awayTeam);
                            if (foundEvent) {
                                console.log('Found event by team names:', foundEvent);
                                this.showMatchStats(foundEvent._id, foundEvent.sport);
                                return;
                            }
                        }
                        
                        this.showToast('Match statistics not available', 'error');
                    }
                } else {
                    console.error('No live card found for stats button');
                }
            }
        });

        console.log('Stats button handlers setup complete');
    }

    // NEW: Fallback method to find event by team names
    findEventByTeams(homeTeam, awayTeam) {
        const event = this.state.liveEvents.find(e => 
            e.teams.home === homeTeam && 
            e.teams.away === awayTeam
        );
        
        if (event) {
            console.log('Found event by team names:', event);
            return event;
        }
        
        console.log('No event found for teams:', homeTeam, awayTeam);
        return null;
    }

    showMatchStats(eventId, sport) {
        console.log('Opening stats for:', eventId, sport);
        
        // Find the event in live events using _id
        let event = this.state.liveEvents.find(e => e._id === eventId);
        
        // If event not found by ID, try to find it by other means
        if (!event) {
            console.warn('Event not found by ID, trying alternative lookup...');
            
            // You might need to get team names from the clicked card
            const statsBtn = document.querySelector('.stats-btn:focus');
            if (statsBtn) {
                const liveCard = statsBtn.closest('.live-card, .live-grid-card');
                if (liveCard) {
                    const homeTeam = liveCard.querySelector('.home-team .team-name')?.textContent;
                    const awayTeam = liveCard.querySelector('.away-team .team-name')?.textContent;
                    
                    if (homeTeam && awayTeam) {
                        event = this.findEventByTeams(homeTeam, awayTeam);
                    }
                }
            }
        }
        
        if (!event) {
            console.error('Event not found after all attempts:', eventId, sport);
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
        
        console.log('Stats modal opened successfully for:', event._id, sport);
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
            // Handle video grid cards
            const videoGridCard = e.target.closest('.video-grid-card');
            if (videoGridCard) {
                const youtubeId = videoGridCard.dataset.youtubeId;
                if (youtubeId) {
                    this.playYouTubeVideo(youtubeId, videoGridCard.querySelector('h4').textContent);
                }
            }

            // Handle old video cards (if any)
            const videoCard = e.target.closest('.video-card');
            if (videoCard) {
                const youtubeId = videoCard.dataset.youtubeId;
                if (youtubeId) {
                    this.playYouTubeVideo(youtubeId, videoCard.querySelector('h4').textContent);
                }
            }

            const watchLiveBtn = e.target.closest('.watch-live-btn');
            if (watchLiveBtn) {
                const liveCard = watchLiveBtn.closest('.live-card, .live-grid-card');
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
        
        // Also clear stats modal content
        const statsContainer = document.getElementById('statsModalContainer');
        if (statsContainer) {
            statsContainer.innerHTML = '';
        }
        
        console.log('Modal closed and video stopped');
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/user');
            if (!response.ok) throw new Error('Network response was not ok');
            
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

        // Modal close buttons - INCLUDING STATS MODAL
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
        const allNews = this.state.news; // Use actual data from state
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

            if (!response.ok) throw new Error('Logout failed');

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
            console.log('Loading initial data from database...');
            this.showLoading();
            
            const [newsData, liveData, videoData, fixtureData] = await Promise.all([
                this.fetchNews(),
                this.fetchLiveEvents(),
                this.fetchVideos(),
                this.fetchFixtures() // UPDATED: This now calls the fixed method
            ]);

            // Use the actual API response structure
            this.state.news = newsData.news || [];
            this.state.liveEvents = liveData.liveEvents || [];
            this.state.videos = videoData.videos || [];
            this.state.fixtures = fixtureData.fixtures || []; // This should now contain today's fixtures

            console.log('Database data loaded:', {
                news: this.state.news.length,
                liveEvents: this.state.liveEvents.length,
                videos: this.state.videos.length,
                fixtures: this.state.fixtures.length,
                fixturesData: this.state.fixtures // Debug log
            });

            this.buildDynamicFilters();
            this.renderAll();
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load sports data from database. Please refresh the page.');
            
            // Set empty arrays instead of mock data
            this.state.news = [];
            this.state.liveEvents = [];
            this.state.videos = [];
            this.state.fixtures = [];
            
            this.buildDynamicFilters();
            this.renderAll();
            this.hideLoading();
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
            this.showError('Failed to apply filters from server');
            // Set empty state on error
            this.state.news = [];
            this.state.hasMore = false;
            this.renderNewsGrid();
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
        try {
            const queryParams = new URLSearchParams({
                page: this.state.page,
                limit: 12,
                ...(this.state.currentSport !== 'All' && { sport: this.state.currentSport }),
                ...(this.state.currentLeague !== 'All' && { league: this.state.currentLeague }),
                ...(this.state.currentStatus !== 'All' && { status: this.state.currentStatus }),
                ...(this.state.searchQuery && { search: this.state.searchQuery })
            });

            const response = await fetch(`/api/news?${queryParams}`);
            if (!response.ok) throw new Error('Failed to fetch news');
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching news:', error);
            throw new Error('Failed to load news from server');
        }
    }

    async fetchLiveEvents() {
        try {
            const response = await fetch('/api/live-events');
            if (!response.ok) throw new Error('Failed to fetch live events');
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching live events:', error);
            throw new Error('Failed to load live events from server');
        }
    }

    async fetchVideos() {
        try {
            const response = await fetch('/api/videos');
            if (!response.ok) throw new Error('Failed to fetch videos');
            
            const data = await response.json();
            console.log('Videos data from database:', data);
            return data;
        } catch (error) {
            console.error('Error fetching videos:', error);
            // Return empty array instead of throwing to prevent app break
            return { videos: [] };
        }
    }

    // UPDATED: Fetch today's fixtures specifically
    async fetchFixtures() {
        try {
            const response = await fetch('/api/fixtures/today');
            if (!response.ok) throw new Error('Failed to fetch fixtures');
            
            const data = await response.json();
            console.log('Fixtures data from API:', data);
            return data;
        } catch (error) {
            console.error('Error fetching fixtures:', error);
            // Return empty array instead of throwing to prevent app break
            return { fixtures: [] };
        }
    }

    renderAll() {
        console.log('Rendering all components...');
        this.renderHero();
        this.renderVideoGrid();
        this.renderLiveCarousel();
        this.renderFilterChips();
        this.renderNewsGrid();
        this.renderSidebar();
        this.updateTicker();
        this.updateFilterDisplay();
        this.renderUserPreferences();
        
        // Re-setup follow buttons after rendering
        this.setupFollowButtons();
    }

    renderHero() {
        // Handle case when no news data is available
        if (this.state.news.length === 0) {
            this.renderDefaultHero();
            return;
        }
        
        const featured = this.state.news[0];
        
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

    // Add this new method for default hero
    renderDefaultHero() {
        const heroTag = document.getElementById('heroTag');
        const heroTitle = document.getElementById('heroTitle');
        const heroAuthor = document.getElementById('heroAuthor');
        const heroDate = document.getElementById('heroDate');
        const heroExcerpt = document.getElementById('heroExcerpt');
        const heroImg = document.getElementById('heroImg');
        const heroMatchInfo = document.getElementById('heroMatchInfo');
        
        if (heroTag) heroTag.textContent = 'SPORTS';
        if (heroTitle) heroTitle.textContent = 'Welcome to AllSports';
        if (heroAuthor) heroAuthor.textContent = 'Sports Desk';
        if (heroDate) heroDate.textContent = this.formatDate(new Date());
        if (heroExcerpt) heroExcerpt.textContent = 'Your premier destination for the latest sports news, live scores, and video highlights from around the world.';
        
        if (heroImg) {
            heroImg.style.backgroundImage = `url('https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800')`;
        }

        if (heroMatchInfo) {
            heroMatchInfo.innerHTML = `
                <div class="hero-status">Loading...</div>
            `;
        }
    }

    // UPDATED: Render videos in a grid layout (3 cards per row) FROM DATABASE
    renderVideoGrid() {
        const videoSection = document.getElementById('videoHighlights');
        if (!videoSection) return;

        console.log('Rendering video grid with data:', this.state.videos);

        if (this.state.videos.length === 0) {
            videoSection.innerHTML = `
                <div class="video-section-header">
                    <div>
                        <h2 class="video-section-title">Video Highlights</h2>
                        <p class="video-section-subtitle">Latest sports highlights and action</p>
                    </div>
                </div>
                <div class="loading">No videos available at the moment</div>
            `;
            return;
        }

        // Use all videos or limit as needed
        const displayVideos = this.state.videos.slice(0, 6); // Show 6 videos in grid
        
        console.log('Rendering videos in grid layout from database:', displayVideos.length);
        
        videoSection.innerHTML = `
            <div class="video-section-header">
                <div>
                    <h2 class="video-section-title">Video Highlights</h2>
                    <p class="video-section-subtitle">Latest sports highlights and action</p>
                </div>
            </div>
            <div class="video-grid" id="videoGrid">
                ${displayVideos.map(video => `
                    <div class="video-grid-card" data-youtube-id="${video.videoId}">
                        <div class="video-grid-thumb" style="background-image: url('${video.thumbnail}')">
                            <div class="video-grid-play">▶</div>
                        </div>
                        <div class="video-grid-content">
                            <h4>${video.title}</h4>
                            <div class="video-grid-meta">
                                <span class="video-grid-sport">${video.sport}</span>
                                <span class="video-grid-duration">${video.duration}</span>
                                ${video.views ? `<span class="video-grid-views">${video.views} views</span>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        console.log('Video grid rendered with', displayVideos.length, 'videos from database');
    }

    // UPDATED: Render live events in a 2-card grid layout from database
    renderLiveCarousel() {
        const liveSection = document.getElementById('liveCarousel');
        if (!liveSection) return;

        if (this.state.liveEvents.length === 0) {
            liveSection.innerHTML = `
                <div class="section-header">
                    <h3 class="section-title">Live Now</h3>
                </div>
                <div class="loading">No live events at the moment</div>
            `;
            return;
        }

        console.log('Rendering live events in grid layout from database:', this.state.liveEvents);

        // Create grid layout with 2 cards per row
        liveSection.innerHTML = `
            <div class="section-header">
                <h3 class="section-title">Live Now</h3>
            </div>
            <div class="live-grid" id="liveGrid">
                ${this.state.liveEvents.map(event => `
                    <div class="live-grid-card" data-event-id="${event._id}" data-youtube-id="${event.youtubeId}" data-sport="${event.sport}">
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
                `).join('')}
            </div>
        `;
        
        console.log('Live grid rendered with', this.state.liveEvents.length, 'events from database');
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

    // UPDATED: Render ALL news items from database
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

        console.log('Rendering news items from database:', this.state.news.length);

        grid.innerHTML = this.state.news.map(item => `
            <div class="card compact-card" data-article-id="${item._id}">
                <div class="thumb" style="background-image: url('${item.img || this.getDefaultImage(item.sport)}')">
                    <div class="score-badge">${item.score || 'VS'}</div>
                    <div class="status-badge ${(item.status || 'finished').toLowerCase()}">${item.status || 'Finished'}</div>
                </div>
                <div class="c-body">
                    <div class="sport-league">
                        <div class="league-tag">${item.league || item.sport}</div>
                    </div>
                    <h3>${item.title}</h3>
                    <p>${item.excerpt || 'Match details and updates...'}</p>
                    <div class="match-info">
                        <div class="status ${(item.status || 'finished').toLowerCase()}">${item.status || 'Finished'}</div>
                        <div class="venue">${item.venue || 'TBD'}</div>
                        <div class="time">${this.formatTime(item.date)}</div>
                    </div>
                    <div class="c-meta">
                        <span>By ${item.author || 'Sports Reporter'}</span>
                        <span>•</span>
                        <span>${this.formatDate(item.date)}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click event listeners to ALL news cards
        grid.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', (e) => {
                const articleId = card.dataset.articleId;
                console.log('Card clicked:', articleId);
                this.openArticle(articleId);
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

    // FIXED: Render fixtures from database with proper team name handling
    renderFixtures() {
        const container = document.getElementById('fixturesList');
        if (!container) return;

        let fixturesToRender = this.state.fixtures;

        // If no fixtures from API, use sample data
        if (fixturesToRender.length === 0) {
            console.log('No fixtures from API, using sample data');
            fixturesToRender = this.getSampleFixtures();
        }

        if (fixturesToRender.length === 0) {
            container.innerHTML = '<div class="muted">No fixtures today</div>';
            return;
        }

        // Limit to 6 fixtures
        const displayFixtures = fixturesToRender.slice(0, 6);

        console.log('Rendering fixtures from database:', displayFixtures);

        container.innerHTML = displayFixtures.map(fixture => {
            // Safely extract team names with multiple fallback options
            const homeTeamName = fixture.homeTeam?.name || 
                                fixture.teams?.home?.name || 
                                fixture.teams?.home || 
                                'TBD';
            
            const awayTeamName = fixture.awayTeam?.name || 
                                fixture.teams?.away?.name || 
                                fixture.teams?.away || 
                                'TBD';
            
            const league = fixture.league || 'Unknown League';
            const time = fixture.time || this.formatTime(fixture.date) || 'TBD';
            const venue = fixture.venue || 'TBD';

            return `
                <div class="fixture-item">
                    <div class="fixture-teams">
                        <strong>${homeTeamName} vs ${awayTeamName}</strong>
                        <div class="fixture-meta">${league} • ${venue}</div>
                    </div>
                    <div class="fixture-time">${time}</div>
                </div>
            `;
        }).join('');
    }

    // NEW: Get sample fixtures for fallback
    getSampleFixtures() {
        const today = new Date();
        return [
            {
                homeTeam: { name: 'Manchester United' },
                awayTeam: { name: 'Liverpool' },
                league: 'Premier League',
                time: '15:00',
                venue: 'Old Trafford'
            },
            {
                homeTeam: { name: 'Barcelona' },
                awayTeam: { name: 'Real Madrid' },
                league: 'La Liga', 
                time: '20:00',
                venue: 'Camp Nou'
            },
            {
                homeTeam: { name: 'Golden State Warriors' },
                awayTeam: { name: 'LA Lakers' },
                league: 'NBA',
                time: '02:30',
                venue: 'Chase Center'
            }
        ];
    }

    // UPDATED: Render top teams with proper team name handling
    renderTopTeams() {
        const container = document.getElementById('topTeams');
        if (!container) return;

        // Extract unique teams from fixtures and news with proper fallbacks
        const teams = new Set();
        
        // Add teams from fixtures
        this.state.fixtures.forEach(fixture => {
            const homeTeam = fixture.homeTeam?.name || fixture.teams?.home?.name || fixture.teams?.home;
            const awayTeam = fixture.awayTeam?.name || fixture.teams?.away?.name || fixture.teams?.away;
            
            if (homeTeam) teams.add(homeTeam);
            if (awayTeam) teams.add(awayTeam);
        });

        // Add teams from news
        this.state.news.forEach(item => {
            if (item.teams && item.teams.home) {
                teams.add(item.teams.home);
            }
            if (item.teams && item.teams.away) {
                teams.add(item.teams.away);
            }
        });

        const topTeams = Array.from(teams).slice(0, 5).map(team => ({
            name: team,
            sport: 'Various'
        }));

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
                this.state.liveEvents = liveData.liveEvents || [];
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

        // Find article in current state using MongoDB _id
        let article = this.state.news.find(item => item._id === articleId);
        
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
        // Since we're using database data, we'll use the actual content field
        if (article.content) {
            return `
                <div class="analysis-section">
                    <h4>📊 Match Analysis</h4>
                    <p>${article.content}</p>
                    
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
        
        // Fallback content if no specific content is available
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
            width: 45px;
            height: 45px;
            font-size: 18px;
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

// League data for each sport (unchanged)
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
    console.log("AllSports Games page loaded");
    window.app = new AllSportsApp();
    
    // Add loaded class to body for animations
    document.body.classList.add('loaded');
});

window.SportsApp = {
    openLogin: () => window.app?.handleLoginClick(),
    closeMobileMenu: () => window.app?.closeMobileMenu(),
    openArticle: (articleId) => window.app?.openArticle(articleId),
    playVideo: (youtubeId, title) => window.app?.playYouTubeVideo(youtubeId, title),
    showStats: (eventId, sport) => window.app?.showMatchStats(eventId, sport),
    search: (query) => window.app?.performSearch(query),
    resetFilters: () => window.app?.resetFilters(),
    toggleTheme: () => window.app?.toggleTheme()
};

// Utility functions
function debounce(func, wait) {
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

// Add dynamic styles for grid layouts
const dynamicStyles = `
    /* Video Grid Styles */
    .video-section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .video-section-title {
        font-size: 24px;
        font-weight: 700;
        color: var(--text-primary);
    }

    .video-section-subtitle {
        font-size: 14px;
        color: var(--text-secondary);
        margin-top: 4px;
    }

    .video-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin: 20px 0;
    }

    .video-grid-card {
        background: var(--card-bg);
        border-radius: var(--radius);
        overflow: hidden;
        transition: all 0.3s ease;
        border: 1px solid rgba(255,255,255,0.1);
        cursor: pointer;
    }

    .video-grid-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        border-color: var(--accent);
    }

    .video-grid-thumb {
        position: relative;
        height: 220px;
        background-size: cover;
        background-position: center;
    }

    .video-grid-play {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 60px;
        height: 60px;
        background: rgba(0,0,0,0.7);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 24px;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
    }

    .video-grid-card:hover .video-grid-play {
        background: var(--accent);
        transform: translate(-50%, -50%) scale(1.1);
    }

    .video-grid-content {
        padding: 16px;
    }

    .video-grid-content h4 {
        margin: 0 0 8px 0;
        font-size: 16px;
        line-height: 1.4;
        color: var(--text-primary);
    }

    .video-grid-meta {
        font-size: 12px;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .video-grid-sport {
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
        padding: 2px 8px;
        border-radius: 12px;
        font-weight: 500;
    }

    .video-grid-duration {
        background: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
        padding: 2px 8px;
        border-radius: 12px;
        font-weight: 500;
    }

    .video-grid-views {
        font-size: 11px;
        color: var(--text-secondary);
    }

    /* Live Events Grid Styles */
    .live-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: 20px;
        margin: 20px 0;
    }

    .live-grid-card {
        background: var(--card-bg);
        border-radius: var(--radius);
        overflow: hidden;
        transition: all 0.3s ease;
        border: 1px solid rgba(255,255,255,0.1);
        position: relative;
    }

    .live-grid-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, #dc2626, #ef4444, #dc2626);
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }

    .live-grid-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        border-color: var(--accent);
    }

    /* Responsive adjustments */
    @media (max-width: 1024px) {
        .video-grid {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .live-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 768px) {
        .video-grid {
            grid-template-columns: 1fr;
        }
        
        .live-grid {
            grid-template-columns: 1fr;
        }
        
        .video-section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
        }
    }

    /* Loading states */
    .loading {
        text-align: center;
        padding: 40px;
        color: var(--text-secondary);
        font-style: italic;
    }

    /* Remove old carousel styles for these sections */
    #videoCarousel,
    #liveCarousel {
        display: block !important;
    }

    .carousel-track {
        display: contents !important;
    }

    /* Stats Modal Styles */
    .stats-team-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        padding: 16px;
        background: rgba(255,255,255,0.05);
        border-radius: var(--radius);
    }

    .stats-team {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
    }

    .stats-team.away {
        justify-content: flex-end;
        text-align: right;
    }

    .stats-team-logo {
        width: 40px;
        height: 40px;
        background: var(--accent);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 12px;
    }

    .stats-team-name {
        font-weight: 600;
    }

    .stats-live-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: rgba(220, 38, 38, 0.1);
        border: 1px solid rgba(220, 38, 38, 0.3);
        border-radius: 20px;
    }

    .stats-live-dot {
        width: 8px;
        height: 8px;
        background: #dc2626;
        border-radius: 50%;
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }

    .stats-live-text {
        color: #dc2626;
        font-weight: 600;
        font-size: 12px;
    }

    .stats-timer {
        font-weight: bold;
        font-size: 14px;
    }

    .stats-match-info {
        text-align: center;
        margin-bottom: 24px;
    }

    .stats-league {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 8px;
        color: var(--text-secondary);
    }

    .stats-venue {
        font-size: 14px;
        color: var(--text-secondary);
        margin-bottom: 8px;
    }

    .stats-team-score {
        font-size: 32px;
        font-weight: bold;
        color: var(--accent);
    }

    .stats-section {
        margin-bottom: 24px;
    }

    .stats-section h4 {
        margin-bottom: 16px;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .stats-grid-detailed {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .stat-row {
        display: grid;
        grid-template-columns: 1fr 2fr 1fr;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
    }

    .stat-value {
        font-weight: 600;
        text-align: center;
        font-size: 14px;
    }

    .stat-team {
        font-weight: 600;
        text-align: center;
        font-size: 14px;
    }

    .stat-name {
        color: var(--text-secondary);
        font-size: 14px;
        text-align: center;
    }

    .stat-bar-container {
        grid-column: 1 / -1;
        height: 6px;
        background: rgba(255,255,255,0.1);
        border-radius: 3px;
        position: relative;
        margin-top: 4px;
    }

    .stat-bar {
        position: absolute;
        height: 100%;
        border-radius: 3px;
        transition: width 0.3s ease;
    }

    .stat-bar.home {
        background: var(--accent);
        left: 0;
    }

    .stat-bar.away {
        background: #3b82f6;
        right: 0;
    }

    /* Basketball specific styles */
    .basketball-stats-section {
        margin-top: 16px;
    }

    .shooting-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 20px;
    }

    .shooting-stat {
        text-align: center;
        padding: 12px;
        background: rgba(255,255,255,0.05);
        border-radius: var(--radius);
    }

    .shooting-stat-value {
        font-weight: bold;
        font-size: 18px;
        margin-bottom: 4px;
    }

    .shooting-stat-label {
        font-size: 12px;
        color: var(--text-secondary);
        margin-bottom: 4px;
    }

    .shooting-stat-percentage {
        font-size: 14px;
        color: var(--accent);
        font-weight: 600;
    }

    /* Cricket specific styles */
    .cricket-stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 20px;
    }

    .cricket-stat-card {
        text-align: center;
        padding: 16px;
        background: rgba(255,255,255,0.05);
        border-radius: var(--radius);
    }

    .cricket-stat-value {
        font-weight: bold;
        font-size: 20px;
        margin-bottom: 4px;
    }

    .cricket-stat-label {
        font-size: 12px;
        color: var(--text-secondary);
    }

    /* Enhanced search results */
    .search-result-item {
        padding: 12px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .search-result-item:hover {
        background: rgba(255,255,255,0.05);
    }

    .search-result-item:last-child {
        border-bottom: none;
    }

    .search-result-title {
        font-weight: 600;
        margin-bottom: 4px;
        font-size: 14px;
    }

    .search-result-title mark {
        background: var(--accent);
        color: white;
        padding: 2px 4px;
        border-radius: 2px;
    }

    .search-result-meta {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 4px;
        font-size: 12px;
        color: var(--text-secondary);
    }

    .search-result-sport {
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
        padding: 2px 6px;
        border-radius: 4px;
    }

    .search-result-league {
        background: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
        padding: 2px 6px;
        border-radius: 4px;
    }

    .search-result-score {
        background: rgba(234, 179, 8, 0.2);
        color: #eab308;
        padding: 2px 6px;
        border-radius: 4px;
    }

    .search-result-status {
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
    }

    .search-result-status.live {
        background: rgba(220, 38, 38, 0.2);
        color: #dc2626;
    }

    .search-result-status.finished {
        background: rgba(107, 114, 128, 0.2);
        color: #6b7280;
    }

    .search-result-excerpt {
        font-size: 12px;
        color: var(--text-secondary);
        margin-bottom: 4px;
    }

    .search-result-excerpt mark {
        background: var(--accent);
        color: white;
        padding: 1px 2px;
        border-radius: 2px;
    }

    .search-result-relevance {
        font-size: 11px;
        color: var(--text-secondary);
        text-align: right;
    }

    .search-result-item.no-results {
        cursor: default;
    }

    .search-result-item.no-results:hover {
        background: transparent;
    }

    .search-result-suggestions {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255,255,255,0.1);
    }

    .search-result-suggestions ul {
        margin: 8px 0 0 0;
        padding-left: 16px;
        color: var(--text-secondary);
    }

    .search-result-suggestions li {
        margin-bottom: 4px;
        font-size: 12px;
    }

    /* Responsive styles for 15.6-inch screens */
    .screen-1366 .header-inner {
        padding: 0 16px;
    }

    .screen-1366 .main-nav .nav-list {
        gap: 12px;
    }

    .screen-1366 .nav-link {
        font-size: 14px;
        padding: 8px 12px;
    }

    .screen-1366 .header-actions {
        gap: 12px;
    }

    .screen-1366 .search input {
        width: 200px;
    }

    .screen-1280 .nav-link {
        font-size: 13px;
        padding: 6px 10px;
    }

    .screen-1280 .search input {
        width: 180px;
    }

    .screen-1280 .brand-text h1 {
        font-size: 18px;
    }

    /* Enhanced modal styles */
    .stats-modal-content {
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
    }

    .modal-content.stats-modal-content .modal-body {
        padding: 0;
    }

    /* Loading states */
    .loading {
        text-align: center;
        padding: 40px;
        color: var(--text-secondary);
    }

    .error-state {
        text-align: center;
        padding: 40px;
        color: var(--text-secondary);
    }

    .error-state h3 {
        margin-bottom: 12px;
        color: var(--text-primary);
    }

    /* Filter badges */
    .filter-badge {
        background: rgba(255,255,255,0.1);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        margin-left: 8px;
    }

    .filter-count {
        margin-left: 12px;
        color: var(--accent);
        font-weight: 600;
    }

    /* Toast improvements */
    .toast {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: var(--accent);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        opacity: 0;
        transition: all 0.3s ease;
        font-weight: 500;
        pointer-events: none;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    }

    .toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }

    /* Follow button states */
    .follow-btn.following {
        background: var(--accent);
        color: white;
    }

    /* Enhanced card animations */
    .card {
        transition: all 0.3s ease;
    }

    .card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }

    /* Live card enhancements */
    .live-card {
        position: relative;
        overflow: hidden;
    }

    .live-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, #dc2626, #ef4444, #dc2626);
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
    }
`;

// Add dynamic styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);