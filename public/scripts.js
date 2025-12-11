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
            },
            searchIndex: null,
            embeddingModel: null,
            fixturesIsSample: false,
            userProfile: null,
            videosPage: 1,
            videosHasMore: true,
            liveEventsPage: 1,
            liveEventsHasMore: true
        };
        
        this.debounceTimer = null;
        this.scrollTimer = null;
        this.searchDebounceTimer = null;
        this.resizeTimer = null;
        this.init();
    }

    async init() {
        console.log('AllSports Games App Initializing...');
        await this.checkAuthStatus();
        this.setupEventListeners();
        await this.loadInitialData();
        await this.initializeSearchEngine();
        this.startLiveUpdates();
        this.updateTicker();
        this.initializeLeagueFilters();
        this.applyUserPreferences();
        this.enhanceCards();
        this.setupBackToTop();
        this.updateLoginUI();
        this.setupFollowFunctionality();
        this.setupYouTubeVideoHandlers();
        this.injectMobileMenuCSS();
        this.setupArticleModal();
        this.setupStatsButtonHandlers();
        this.setupResponsiveLayout();
        this.injectVideoGridCSS();
        this.debugData();
        
        this.setupProfilePage();
    }

    injectVideoGridCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .video-section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
            }

            .video-section-title {
                font-size: 1.75rem;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0;
            }

            .video-section-subtitle {
                color: var(--text-secondary);
                margin: 0.5rem 0 0 0;
                font-size: 1rem;
            }

            .video-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                gap: 1.5rem;
                margin-top: 1rem;
            }

            .video-grid-card {
                background: var(--card-bg);
                border-radius: 16px;
                overflow: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid var(--border-color);
                position: relative;
                cursor: pointer;
            }

            .video-grid-card:hover {
                transform: translateY(-8px);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                border-color: var(--accent);
            }

            .video-grid-thumb {
                position: relative;
                width: 100%;
                height: 200px;
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                overflow: hidden;
            }

            .video-grid-thumb::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(
                    to bottom,
                    transparent 0%,
                    transparent 60%,
                    rgba(0, 0, 0, 0.8) 100%
                );
                z-index: 1;
            }

            .video-grid-play {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 60px;
                height: 60px;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--accent);
                font-size: 24px;
                z-index: 2;
                transition: all 0.3s ease;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            }

            .video-grid-card:hover .video-grid-play {
                background: var(--accent);
                color: white;
                transform: translate(-50%, -50%) scale(1.1);
            }

            .video-grid-duration {
                position: absolute;
                bottom: 12px;
                right: 12px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
                z-index: 2;
            }

            .video-grid-content {
                padding: 1.25rem;
                position: relative;
                z-index: 2;
            }

            .video-grid-content h4 {
                font-size: 1.1rem;
                font-weight: 600;
                color: var(--text-primary);
                margin: 0 0 0.75rem 0;
                line-height: 1.4;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .video-grid-meta {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                flex-wrap: wrap;
                margin-bottom: 0.75rem;
            }

            .video-grid-sport {
                background: var(--accent);
                color: white;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .video-grid-views {
                color: var(--text-secondary);
                font-size: 0.875rem;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .video-grid-views::before {
                content: '👁️';
                font-size: 0.75rem;
            }

            .video-grid-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 0.75rem;
                border-top: 1px solid var(--border-color);
            }

            .video-grid-date {
                color: var(--text-secondary);
                font-size: 0.875rem;
            }

            .video-grid-actions {
                display: flex;
                gap: 0.5rem;
            }

            .video-grid-btn {
                background: transparent;
                border: 1px solid var(--border-color);
                color: var(--text-secondary);
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 0.875rem;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .video-grid-btn:hover {
                background: var(--accent);
                border-color: var(--accent);
                color: white;
            }

            .video-grid-btn.save-btn:hover::before {
                content: '💾';
            }

            .video-grid-btn.share-btn:hover::before {
                content: '📤';
            }

            @media (max-width: 768px) {
                .video-grid {
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1rem;
                }

                .video-grid-thumb {
                    height: 160px;
                }

                .video-grid-play {
                    width: 50px;
                    height: 50px;
                    font-size: 20px;
                }

                .video-section-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 1rem;
                }
            }

            @media (max-width: 480px) {
                .video-grid {
                    grid-template-columns: 1fr;
                }

                .video-grid-content {
                    padding: 1rem;
                }

                .video-grid-content h4 {
                    font-size: 1rem;
                }
            }

            .video-grid-card.loading {
                background: linear-gradient(90deg, var(--card-bg) 25%, rgba(255,255,255,0.1) 50%, var(--card-bg) 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
            }

            @keyframes loading {
                0% {
                    background-position: 200% 0;
                }
                100% {
                    background-position: -200% 0;
                }
            }

            .filter-indicator {
                font-size: 0.875rem;
                color: var(--text-secondary);
                background: var(--card-bg);
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid var(--border-color);
            }

            .no-content-message {
                text-align: center;
                padding: 3rem 1rem;
                background: var(--card-bg);
                border-radius: 12px;
                border: 1px solid var(--border-color);
            }

            .no-content-message p {
                color: var(--text-secondary);
                margin-bottom: 1rem;
            }

            .filter-badge {
                display: inline-block;
                background: var(--accent);
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.75rem;
                margin-left: 4px;
                font-weight: 500;
            }

            .filter-count {
                margin-left: 8px;
                font-weight: 600;
                color: var(--accent);
            }

            .section-subtitle {
                color: var(--text-secondary);
                font-size: 0.875rem;
                margin-top: 0.25rem;
            }
        `;
        document.head.appendChild(style);
    }

    setupProfilePage() {
        if (!document.getElementById('profileHeader')) return;
        
        console.log('Setting up profile page...');
        this.setupProfileNavigation();
        this.setupProfileTabs();
        this.loadUserProfileData();
        this.setupProfileEventListeners();
    }

    setupProfileNavigation() {
        const navButtons = document.querySelectorAll('.profile-nav-btn');
        const sections = document.querySelectorAll('.profile-section');
        
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetSection = button.dataset.section;
                
                if (targetSection === 'activity') return;
                
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                sections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === `${targetSection}Section`) {
                        section.classList.add('active');
                    }
                });
                
                this.loadSectionData(targetSection);
            });
        });
    }

    setupProfileTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${targetTab}Tab`) {
                        content.classList.add('active');
                    }
                });
                
                this.loadTabData(targetTab);
            });
        });
    }

    setupProfileEventListeners() {
        document.getElementById('editProfileBtn')?.addEventListener('click', () => {
            this.showToast('Edit profile feature coming soon!');
        });
        
        document.getElementById('pinPlayerBtn')?.addEventListener('click', () => {
            this.showPlayerSelectionModal();
        });
        
        document.getElementById('changePinnedPlayer')?.addEventListener('click', () => {
            this.showPlayerSelectionModal();
        });
        
        document.getElementById('browseTeamsBtn')?.addEventListener('click', () => {
            window.location.href = 'teams.html';
        });
        
        document.getElementById('browsePlayersBtn')?.addEventListener('click', () => {
            window.location.href = 'players.html';
        });
        
        document.getElementById('browseSportsBtn')?.addEventListener('click', () => {
            this.showToast('Sports browser coming soon!');
        });
        
        document.getElementById('browseMatchesBtn')?.addEventListener('click', () => {
            window.location.href = 'fixtures.html';
        });
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter || btn.dataset.activity;
                this.applyProfileFilter(btn.closest('.profile-section').id, filter, btn);
            });
        });
        
        document.getElementById('exportDataBtn')?.addEventListener('click', () => {
            this.exportUserData();
        });
        
        document.getElementById('deleteAccountBtn')?.addEventListener('click', () => {
            this.showDeleteAccountConfirmation();
        });
    }

    async loadUserProfileData() {
        if (!this.state.user) {
            this.showLoginPrompt();
            return;
        }
        
        try {
            this.showProfileLoading();
            
            const requests = [
                this.fetchUserProfile().catch(err => {
                    console.error('Error fetching user profile:', err);
                    return { username: 'Sports Fan', email: 'user@example.com', createdAt: new Date() };
                }),
                this.fetchFollowedPlayers().catch(err => {
                    console.error('Error fetching followed players:', err);
                    return [];
                }),
                this.fetchFollowedTeams().catch(err => {
                    console.error('Error fetching followed teams:', err);
                    return [];
                }),
                this.fetchFollowedSports().catch(err => {
                    console.error('Error fetching followed sports:', err);
                    return [];
                }),
                this.fetchMatchReminders().catch(err => {
                    console.error('Error fetching match reminders:', err);
                    return [];
                }),
                this.fetchTournamentReminders().catch(err => {
                    console.error('Error fetching tournament reminders:', err);
                    return [];
                }),
                this.fetchWatchHistory().catch(err => {
                    console.error('Error fetching watch history:', err);
                    return [];
                }),
                this.fetchPinnedPlayer().catch(err => {
                    console.error('Error fetching pinned player:', err);
                    return null;
                })
            ];
            
            const [
                userProfile,
                followedPlayers,
                followedTeams,
                followedSports,
                matchReminders,
                tournamentReminders,
                watchHistory,
                pinnedPlayer
            ] = await Promise.all(requests);
            
            console.log('Complete profile data loaded:', {
                userProfile,
                followedPlayers: followedPlayers.length,
                followedTeams: followedTeams.length,
                followedSports: followedSports.length,
                matchReminders: matchReminders.length,
                tournamentReminders: tournamentReminders.length,
                watchHistory: watchHistory.length,
                pinnedPlayer
            });
            
            this.state.userProfile = {
                userData: userProfile,
                followedPlayers,
                followedTeams, 
                followedSports,
                matchReminders,
                tournamentReminders,
                watchHistory,
                pinnedPlayer
            };
            
            this.renderProfileHeader(userProfile);
            this.renderOverviewSection({
                followedPlayers,
                followedTeams,
                matchReminders,
                tournamentReminders,
                watchHistory,
                pinnedPlayer,
                followedSports
            });
            
            this.hideProfileLoading();
            
        } catch (error) {
            console.error('Error loading profile data:', error);
            this.showError('Failed to load profile data');
            this.hideProfileLoading();
            
            this.renderOverviewSection({
                followedPlayers: [],
                followedTeams: [],
                matchReminders: [],
                tournamentReminders: [],
                watchHistory: [],
                pinnedPlayer: null,
                followedSports: []
            });
        }
    }

    async fetchUserProfile() {
        try {
            const response = await fetch('/api/user/profile');
            if (!response.ok) throw new Error('Failed to fetch user profile');
            const data = await response.json();
            
            if (data.success && data.user) {
                return data.user;
            }
            throw new Error('Invalid user data');
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return {
                username: this.state.user?.username || 'Sports Fan',
                email: this.state.user?.email || 'user@example.com',
                createdAt: new Date().toISOString()
            };
        }
    }

    async fetchFollowedPlayers() {
        try {
            const response = await fetch('/api/user/followed-players');
            if (!response.ok) throw new Error('Failed to fetch followed players');
            const data = await response.json();
            
            if (data.success) {
                return data.followedPlayers || [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching followed players:', error);
            return [];
        }
    }

    async fetchFollowedTeams() {
        try {
            const response = await fetch('/api/user/followed-teams');
            if (!response.ok) throw new Error('Failed to fetch followed teams');
            const data = await response.json();
            
            if (data.success) {
                return data.followedTeams || [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching followed teams:', error);
            return [];
        }
    }

    async fetchFollowedSports() {
        try {
            const response = await fetch('/api/user/followed-sports');
            if (!response.ok) throw new Error('Failed to fetch followed sports');
            const data = await response.json();
            
            if (data.success) {
                return data.followedSports || [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching followed sports:', error);
            return [];
        }
    }

    async fetchMatchReminders() {
        try {
            const response = await fetch('/api/user/reminded-matches');
            if (!response.ok) throw new Error('Failed to fetch match reminders');
            const data = await response.json();
            
            if (data.success) {
                return data.remindedMatches || [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching match reminders:', error);
            return [];
        }
    }

    async fetchTournamentReminders() {
        try {
            const response = await fetch('/api/user/reminded-tournaments');
            if (!response.ok) throw new Error('Failed to fetch tournament reminders');
            const data = await response.json();
            
            if (data.success) {
                return data.remindedTournaments || [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching tournament reminders:', error);
            return [];
        }
    }

    async fetchWatchHistory() {
        try {
            const response = await fetch('/api/user/watch-history');
            if (!response.ok) throw new Error('Failed to fetch watch history');
            const data = await response.json();
            
            if (data.success) {
                return data.watchHistory || [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching watch history:', error);
            return [];
        }
    }

    async fetchPinnedPlayer() {
        try {
            const response = await fetch('/api/user/pinned-player');
            if (!response.ok) throw new Error('Failed to fetch pinned player');
            const data = await response.json();
            
            if (data.success) {
                return data.pinnedPlayerId || null;
            }
            return null;
        } catch (error) {
            console.error('Error fetching pinned player:', error);
            return null;
        }
    }

    renderProfileHeader(userData) {
        const username = document.getElementById('profileUsername');
        const email = document.getElementById('profileEmail');
        const avatarInitials = document.getElementById('avatarInitials');
        
        if (username) username.textContent = userData.username || 'Sports Fan';
        if (email) email.textContent = userData.email || 'user@example.com';
        if (avatarInitials) {
            const initials = userData.username ? userData.username.charAt(0).toUpperCase() : 'U';
            avatarInitials.textContent = initials;
        }
    }

    renderOverviewSection(data) {
        const safeData = {
            followedPlayers: data.followedPlayers || [],
            followedTeams: data.followedTeams || [],
            matchReminders: data.matchReminders || [],
            tournamentReminders: data.tournamentReminders || [],
            watchHistory: data.watchHistory || [],
            pinnedPlayer: data.pinnedPlayer || null,
            followedSports: data.followedSports || []
        };

        this.updateProfileStats(safeData);
        this.renderPinnedPlayer(safeData.pinnedPlayer);
        this.renderRecentActivity(safeData);
        this.renderUpcomingReminders(safeData.matchReminders, safeData.tournamentReminders);
    }

   updateProfileStats(data) {
    const followedTeams = data.followedTeams || [];
    const followedPlayers = data.followedPlayers || [];
    const matchReminders = data.matchReminders || [];
    const tournamentReminders = data.tournamentReminders || [];
    const watchHistory = data.watchHistory || [];
    const followedSports = data.followedSports || [];

    const followedTeamsCount = document.getElementById('followedTeamsCount');
    const followedPlayersCount = document.getElementById('followedPlayersCount');
    const remindersCount = document.getElementById('remindersCount');
    const watchHistoryCount = document.getElementById('watchHistoryCount');
    
    if (followedTeamsCount) followedTeamsCount.textContent = followedTeams.length;
    if (followedPlayersCount) followedPlayersCount.textContent = followedPlayers.length;
    if (remindersCount) remindersCount.textContent = matchReminders.length + tournamentReminders.length;
    if (watchHistoryCount) watchHistoryCount.textContent = watchHistory.length;
    
    const totalMatches = document.getElementById('totalMatches');
    const totalSports = document.getElementById('totalSports');
    const activeReminders = document.getElementById('activeReminders');
    const videosWatched = document.getElementById('videosWatched');
    
    if (totalMatches) totalMatches.textContent = matchReminders.length;
    if (totalSports) totalSports.textContent = followedSports.length;
    if (activeReminders) {
        const upcomingReminders = matchReminders.filter(match => {
            const matchTime = match.time || match.date;
            if (!matchTime) return false;
            return new Date(matchTime) >= new Date();
        }).length;
        activeReminders.textContent = upcomingReminders;
    }
    if (videosWatched) videosWatched.textContent = watchHistory.length;
}

    renderPinnedPlayer(pinnedPlayerId) {
        const container = document.getElementById('pinnedPlayerContent');
        if (!container) return;
        
        if (!pinnedPlayerId) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⭐</div>
                    <h4>No pinned player</h4>
                    <p>Pin your favorite player to see their stats here</p>
                    <button class="btn" id="pinPlayerBtn">Pin a Player</button>
                </div>
            `;
            return;
        }
        
        const followedPlayers = this.state.userProfile?.followedPlayers || [];
        const pinnedPlayer = followedPlayers.find(player => player.playerId === pinnedPlayerId);
        
        if (!pinnedPlayer) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⭐</div>
                    <h4>Pinned player not found</h4>
                    <p>The pinned player may have been unfollowed</p>
                    <button class="btn" id="changePinnedPlayer">Change Pinned Player</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="pinned-player">
                <div class="pinned-player-avatar">${this.getInitials(pinnedPlayer.playerName)}</div>
                <div class="pinned-player-info">
                    <div class="pinned-player-name">${pinnedPlayer.playerName}</div>
                    <div class="pinned-player-meta">${pinnedPlayer.position || 'Unknown'} • ${pinnedPlayer.sport || 'Unknown'}</div>
                    <div class="pinned-player-details">
                        <div class="pinned-player-stat">
                            <div class="pinned-player-stat-value">${pinnedPlayer.stats?.goals || 'N/A'}</div>
                            <div class="pinned-player-stat-label">Goals</div>
                        </div>
                        <div class="pinned-player-stat">
                            <div class="pinned-player-stat-value">${pinnedPlayer.stats?.assists || 'N/A'}</div>
                            <div class="pinned-player-stat-label">Assists</div>
                        </div>
                        <div class="pinned-player-stat">
                            <div class="pinned-player-stat-value">${pinnedPlayer.stats?.matches || 'N/A'}</div>
                            <div class="pinned-player-stat-label">Matches</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 3);
    }

    renderRecentActivity(data) {
        const container = document.getElementById('recentActivityList');
        if (!container) return;
        
        const activities = [];
        
        data.followedPlayers.slice(0, 3).forEach(player => {
            activities.push({
                type: 'follow',
                text: `Started following ${player.playerName}`,
                time: player.followedAt ? this.formatTimeAgo(new Date(player.followedAt)) : 'Recently',
                icon: '👤',
                timestamp: player.followedAt ? new Date(player.followedAt) : new Date()
            });
        });
        
        data.followedTeams.slice(0, 2).forEach(team => {
            activities.push({
                type: 'follow',
                text: `Started following ${team.teamName}`,
                time: team.followedAt ? this.formatTimeAgo(new Date(team.followedAt)) : 'Recently',
                icon: '🏆',
                timestamp: team.followedAt ? new Date(team.followedAt) : new Date()
            });
        });
        
        data.matchReminders.slice(0, 2).forEach(match => {
            activities.push({
                type: 'reminder',
                text: `Set reminder for ${match.homeTeam} vs ${match.awayTeam}`,
                time: match.remindedAt ? this.formatTimeAgo(new Date(match.remindedAt)) : 'Recently',
                icon: '⏰',
                timestamp: match.remindedAt ? new Date(match.remindedAt) : new Date()
            });
        });
        
        data.watchHistory.slice(0, 2).forEach(video => {
            activities.push({
                type: 'watch',
                text: `Watched "${video.title}"`,
                time: video.watchedAt ? this.formatTimeAgo(new Date(video.watchedAt)) : 'Recently',
                icon: '📺',
                timestamp: video.watchedAt ? new Date(video.watchedAt) : new Date()
            });
        });
        
        activities.sort((a, b) => b.timestamp - a.timestamp);
        
        const recentActivities = activities.slice(0, 5);
        
        if (recentActivities.length === 0) {
            container.innerHTML = '<div class="empty-state small"><p>No recent activity</p></div>';
            return;
        }
        
        container.innerHTML = recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }

    renderUpcomingReminders(matchReminders, tournamentReminders) {
        const container = document.getElementById('upcomingRemindersList');
        if (!container) return;
        
        console.log('Match reminders data:', matchReminders);
        console.log('Tournament reminders data:', tournamentReminders);
        
        const allReminders = [...matchReminders, ...tournamentReminders];
        
        const upcomingReminders = allReminders
            .filter(reminder => {
                const reminderTime = reminder.time || reminder.startDate || reminder.date;
                if (!reminderTime) return false;
                
                const reminderDate = new Date(reminderTime);
                return reminderDate >= new Date();
            })
            .sort((a, b) => {
                const timeA = new Date(a.time || a.startDate || a.date);
                const timeB = new Date(b.time || b.startDate || b.date);
                return timeA - timeB;
            })
            .slice(0, 3);
        
        if (upcomingReminders.length === 0) {
            container.innerHTML = '<div class="empty-state small"><p>No upcoming reminders</p></div>';
            return;
        }
        
        container.innerHTML = upcomingReminders.map(reminder => {
            if (reminder.homeTeam && reminder.awayTeam) {
                const homeTeam = reminder.homeTeam;
                const awayTeam = reminder.awayTeam;
                const league = reminder.league || 'Unknown League';
                const time = reminder.time ? this.formatTime(new Date(reminder.time)) : 'TBD';
                
                return `
                    <div class="reminder-item">
                        <div class="reminder-info">
                            <div class="reminder-title">${homeTeam} vs ${awayTeam}</div>
                            <div class="reminder-meta">${league} • ${time}</div>
                        </div>
                    </div>
                `;
            } else {
                const tournamentName = reminder.tournamentName || reminder.name || 'Unknown Tournament';
                const sport = reminder.sport || 'Unknown Sport';
                const startDate = reminder.startDate ? this.formatDate(reminder.startDate) : 'TBD';
                
                return `
                    <div class="reminder-item">
                        <div class="reminder-info">
                            <div class="reminder-title">${tournamentName}</div>
                            <div class="reminder-meta">${sport} • Starts ${startDate}</div>
                        </div>
                    </div>
                `;
            }
        }).join('');
    }

    loadSectionData(section) {
        switch(section) {
            case 'following':
                this.loadFollowingData();
                break;
            case 'reminders':
                this.loadRemindersData();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
        }
    }

    loadFollowingData() {
        console.log('Loading following data...');
        this.renderFollowedTeams();
        this.renderFollowedPlayers();
        this.renderFollowedSports();
        this.renderFollowedMatches();
    }

    loadRemindersData() {
        console.log('Loading reminders data...');
        this.renderRemindersSection();
    }

    loadSettingsData() {
        console.log('Loading settings data...');
    }

    loadTabData(tab) {
        switch(tab) {
            case 'teams':
                this.renderFollowedTeams();
                break;
            case 'players':
                this.renderFollowedPlayers();
                break;
            case 'sports':
                this.renderFollowedSports();
                break;
            case 'matches':
                this.renderFollowedMatches();
                break;
        }
    }

    renderRemindersSection() {
        this.renderMatchReminders();
        this.renderTournamentReminders();
    }

    renderMatchReminders() {
        const container = document.getElementById('matchRemindersList');
        if (!container) return;
        
        const matchReminders = this.state.userProfile?.matchReminders || [];
        
        console.log('Rendering match reminders:', matchReminders);
        
        if (matchReminders.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No match reminders set</p></div>';
            return;
        }
        
        container.innerHTML = matchReminders.map(reminder => {
            const homeTeam = reminder.homeTeam || reminder.teams?.home || 'Unknown';
            const awayTeam = reminder.awayTeam || reminder.teams?.away || 'Unknown';
            const league = reminder.league || 'Unknown';
            const time = reminder.time ? this.formatTime(new Date(reminder.time)) : 'TBD';
            const status = reminder.status || 'upcoming';
            const venue = reminder.venue || 'TBD';
            const reminderId = reminder.matchId || reminder._id || 'unknown';
            
            return `
                <div class="followed-match-item">
                    <div class="match-teams">
                        <strong>${homeTeam} vs ${awayTeam}</strong>
                        <div class="match-meta">${league} • ${venue} • ${time}</div>
                    </div>
                    <div class="match-status ${status.toLowerCase()}">${status}</div>
                    <div class="match-actions">
                        <button class="btn btn-small ghost remove-reminder-btn" data-type="match" data-id="${reminderId}">
                            Remove
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        this.attachReminderEventListeners();
    }

    renderTournamentReminders() {
        const container = document.getElementById('tournamentRemindersList');
        if (!container) return;
        
        const tournamentReminders = this.state.userProfile?.tournamentReminders || [];
        
        console.log('Rendering tournament reminders:', tournamentReminders);
        
        if (tournamentReminders.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No tournament reminders set</p></div>';
            return;
        }
        
        container.innerHTML = tournamentReminders.map(reminder => {
            const tournamentName = reminder.tournamentName || reminder.name || 'Unknown Tournament';
            const sport = reminder.sport || 'Unknown';
            const startDate = reminder.startDate ? this.formatDate(reminder.startDate) : 'TBD';
            const status = 'upcoming';
            const reminderId = reminder.tournamentId || reminder._id || 'unknown';
            
            return `
                <div class="followed-match-item">
                    <div class="match-teams">
                        <strong>${tournamentName}</strong>
                        <div class="match-meta">${sport} • Starts ${startDate}</div>
                    </div>
                    <div class="match-status ${status}">Tournament</div>
                    <div class="match-actions">
                        <button class="btn btn-small ghost remove-reminder-btn" data-type="tournament" data-id="${reminderId}">
                            Remove
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        this.attachReminderEventListeners();
    }

    renderFollowedTeams() {
        const container = document.getElementById('followedTeamsGrid');
        if (!container) return;
        
        const followedTeams = this.state.userProfile?.followedTeams || [];
        
        console.log('Followed teams data for rendering:', followedTeams);
        
        if (followedTeams.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🏆</div>
                    <h4>No teams followed</h4>
                    <p>Start following your favorite teams to see them here</p>
                    <button class="btn" id="browseTeamsBtn">Browse Teams</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = followedTeams.map(team => {
            const teamName = team.teamName || team.name || 'Unknown Team';
            const teamId = team.teamId || team._id || team.id || 'unknown';
            const sport = team.sport || 'Unknown Sport';
            const league = team.league || 'Unknown League';
            const logo = team.logo || '🏆';
            
            console.log('Rendering team:', { teamName, teamId, sport, league });
            
            return `
                <div class="followed-item">
                    <div class="followed-item-icon">${logo}</div>
                    <div class="followed-item-name">${teamName}</div>
                    <div class="followed-item-meta">${sport} • ${league}</div>
                    <div class="followed-item-actions">
                        <button class="btn btn-small ghost unfollow-btn" data-type="team" data-id="${teamId}">
                            Unfollow
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        this.attachFollowedItemEventListeners();
    }

    renderFollowedPlayers() {
        const container = document.getElementById('followedPlayersGrid');
        if (!container) return;
        
        const followedPlayers = this.state.userProfile?.followedPlayers || [];
        
        if (followedPlayers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">👤</div>
                    <h4>No players followed</h4>
                    <p>Follow your favorite players to track their performance</p>
                    <button class="btn" id="browsePlayersBtn">Browse Players</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = followedPlayers.map(player => {
            const playerId = player.playerId || player._id || player.id || 'unknown';
            const playerName = player.playerName || player.name || 'Unknown Player';
            const position = player.position || 'Unknown';
            const sport = player.sport || 'Unknown';
            
            return `
                <div class="followed-item">
                    <div class="followed-item-icon">👤</div>
                    <div class="followed-item-name">${playerName}</div>
                    <div class="followed-item-meta">${position} • ${sport}</div>
                    <div class="followed-item-actions">
                        <button class="btn btn-small ghost unfollow-btn" data-type="player" data-id="${playerId}">
                            Unfollow
                        </button>
                        <button class="btn btn-small pin-btn" data-type="player" data-id="${playerId}">
                            Pin
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        this.attachFollowedItemEventListeners();
    }

    renderFollowedSports() {
        const container = document.getElementById('followedSportsGrid');
        if (!container) return;
        
        const followedSports = this.state.userProfile?.followedSports || [];
        
        if (followedSports.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚽</div>
                    <h4>No sports followed</h4>
                    <p>Follow sports to get personalized content</p>
                    <button class="btn" id="browseSportsBtn">Browse Sports</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = followedSports.map(sport => {
            const sportId = sport.sportId || sport._id || sport.id || 'unknown';
            const sportName = sport.sportName || sport.name || 'Unknown Sport';
            const category = sport.category || 'General';
            const icon = sport.icon || '🏆';
            
            return `
                <div class="followed-item">
                    <div class="followed-item-icon">${icon}</div>
                    <div class="followed-item-name">${sportName}</div>
                    <div class="followed-item-meta">${category}</div>
                    <div class="followed-item-actions">
                        <button class="btn btn-small ghost unfollow-btn" data-type="sport" data-id="${sportId}">
                            Unfollow
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        this.attachFollowedItemEventListeners();
    }

    renderFollowedMatches() {
        const container = document.getElementById('followedMatchesList');
        if (!container) return;
        
        const matchReminders = this.state.userProfile?.matchReminders || [];
        const tournamentReminders = this.state.userProfile?.tournamentReminders || [];
        
        console.log('Rendering followed matches:', {
            matchReminders: matchReminders.length,
            tournamentReminders: tournamentReminders.length
        });
        
        const allReminders = [...matchReminders, ...tournamentReminders];
        
        if (allReminders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔔</div>
                    <h4>No matches followed</h4>
                    <p>Follow matches to get live updates and reminders</p>
                    <button class="btn" id="browseMatchesBtn">Browse Matches</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = allReminders.map(reminder => {
            if (reminder.homeTeam && reminder.awayTeam) {
                const homeTeam = reminder.homeTeam;
                const awayTeam = reminder.awayTeam;
                const league = reminder.league || 'Unknown';
                const time = reminder.time ? this.formatTime(new Date(reminder.time)) : 'TBD';
                const status = reminder.status || 'upcoming';
                const venue = reminder.venue || 'TBD';
                const reminderId = reminder.matchId || reminder._id || 'unknown';
                
                return `
                    <div class="followed-match-item">
                        <div class="match-teams">
                            <strong>${homeTeam} vs ${awayTeam}</strong>
                            <div class="match-meta">${league} • ${venue} • ${time}</div>
                        </div>
                        <div class="match-status ${status.toLowerCase()}">${status}</div>
                        <div class="match-actions">
                            <button class="btn btn-small ghost remove-reminder-btn" data-type="match" data-id="${reminderId}">
                                Remove
                            </button>
                        </div>
                    </div>
                `;
            } else {
                const tournamentName = reminder.tournamentName || reminder.name || 'Unknown Tournament';
                const sport = reminder.sport || 'Unknown';
                const startDate = reminder.startDate ? this.formatDate(reminder.startDate) : 'TBD';
                const status = 'upcoming';
                const reminderId = reminder.tournamentId || reminder._id || 'unknown';
                
                return `
                    <div class="followed-match-item">
                        <div class="match-teams">
                            <strong>${tournamentName}</strong>
                            <div class="match-meta">${sport} • Starts ${startDate}</div>
                        </div>
                        <div class="match-status ${status}">Tournament</div>
                        <div class="match-actions">
                            <button class="btn btn-small ghost remove-reminder-btn" data-type="tournament" data-id="${reminderId}">
                                Remove
                            </button>
                        </div>
                    </div>
                `;
            }
        }).join('');
        
        this.attachReminderEventListeners();
    }

    attachReminderEventListeners() {
    document.querySelectorAll('.remove-reminder-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const type = btn.dataset.type;
            const id = btn.dataset.id;
            const itemElement = btn.closest('.followed-match-item');
            const itemName = itemElement.querySelector('.match-teams strong').textContent;
            
            if (confirm(`Are you sure you want to remove reminder for ${itemName}?`)) {
                try {
                    // For match reminders, get additional data from the element
                    if (type === 'match') {
                        const homeTeam = itemElement.querySelector('.match-teams strong')?.textContent?.split(' vs ')[0] || 'Unknown';
                        const awayTeam = itemElement.querySelector('.match-teams strong')?.textContent?.split(' vs ')[1] || 'Unknown';
                        
                        const response = await fetch('/api/user/set-reminder', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                matchId: id,
                                homeTeam: homeTeam,
                                awayTeam: awayTeam,
                                action: 'remove'
                            })
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                            this.showToast(`Reminder removed for ${itemName}`);
                            itemElement.remove();
                            
                            // Update local state
                            if (this.state.userProfile) {
                                this.state.userProfile.matchReminders = this.state.userProfile.matchReminders.filter(
                                    reminder => (reminder.matchId !== id && reminder._id !== id)
                                );
                            }
                            
                            // Update profile stats
                            this.updateProfileStats(this.state.userProfile || {});
                        } else {
                            this.showToast('Error removing reminder', 'error');
                        }
                    } 
                    // For tournament reminders
                    else if (type === 'tournament') {
                        const tournamentName = itemElement.querySelector('.match-teams strong')?.textContent || 'Unknown Tournament';
                        
                        const response = await fetch('/api/user/set-tournament-reminder', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                tournamentId: id,
                                tournamentName: tournamentName,
                                action: 'remove'
                            })
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                            this.showToast(`Reminder removed for ${itemName}`);
                            itemElement.remove();
                            
                            // Update local state
                            if (this.state.userProfile) {
                                this.state.userProfile.tournamentReminders = this.state.userProfile.tournamentReminders.filter(
                                    reminder => (reminder.tournamentId !== id && reminder._id !== id)
                                );
                            }
                            
                            // Update profile stats
                            this.updateProfileStats(this.state.userProfile || {});
                        } else {
                            this.showToast('Error removing reminder', 'error');
                        }
                    }
                    
                } catch (error) {
                    console.error('Error removing reminder:', error);
                    this.showToast('Error removing reminder', 'error');
                }
            }
        });
    });
}

    attachFollowedItemEventListeners() {
        document.querySelectorAll('.unfollow-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const type = btn.dataset.type;
                const id = btn.dataset.id;
                const itemElement = btn.closest('.followed-item');
                const itemName = itemElement.querySelector('.followed-item-name').textContent;
                
                if (confirm(`Are you sure you want to unfollow ${itemName}?`)) {
                    try {
                        const response = await fetch(`/api/user/follow-${type}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                [`${type}Id`]: id,
                                [`${type}Name`]: itemName,
                                action: 'unfollow'
                            })
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                            this.showToast(`Unfollowed ${itemName}`);
                            itemElement.remove();
                            
                            if (type === 'team') {
                                this.state.userProfile.followedTeams = this.state.userProfile.followedTeams.filter(
                                    item => (item.teamId !== id && item._id !== id)
                                );
                            } else if (type === 'player') {
                                this.state.userProfile.followedPlayers = this.state.userProfile.followedPlayers.filter(
                                    item => (item.playerId !== id && item._id !== id)
                                );
                            } else if (type === 'sport') {
                                this.state.userProfile.followedSports = this.state.userProfile.followedSports.filter(
                                    item => (item.sportId !== id && item._id !== id)
                                );
                            }
                            
                            this.updateProfileStats(this.state.userProfile);
                        } else {
                            this.showToast('Error unfollowing', 'error');
                        }
                    } catch (error) {
                        console.error('Error unfollowing:', error);
                        this.showToast('Error unfollowing', 'error');
                    }
                }
            });
        });
        
        document.querySelectorAll('.pin-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const playerId = btn.dataset.id;
                const itemElement = btn.closest('.followed-item');
                const playerName = itemElement.querySelector('.followed-item-name').textContent;
                
                try {
                    const response = await fetch('/api/user/pinned-player', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            playerId: playerId,
                            action: 'pin'
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        this.showToast(`Pinned ${playerName}`);
                        this.state.userProfile.pinnedPlayer = playerId;
                        this.renderPinnedPlayer(playerId);
                    } else {
                        this.showToast('Error pinning player', 'error');
                    }
                } catch (error) {
                    console.error('Error pinning player:', error);
                    this.showToast('Error pinning player', 'error');
                }
            });
        });
    }

    applyProfileFilter(section, filter, button) {
        button.closest('.reminder-filters, .activity-filters')
            .querySelectorAll('.filter-btn')
            .forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        switch(section) {
            case 'remindersSection':
                this.filterReminders(filter);
                break;
        }
    }

    filterReminders(filter) {
        console.log(`Filtering reminders by: ${filter}`);
        this.renderRemindersSection();
    }

    showPlayerSelectionModal() {
        this.showToast('Player selection modal would open here');
    }

    showProfileLoading() {
        const sections = document.querySelectorAll('.profile-section.active .empty-state');
        sections.forEach(section => {
            section.innerHTML = '<div class="loading">Loading...</div>';
        });
    }

    hideProfileLoading() {
        // Loading states would be replaced by actual content
    }

    showLoginPrompt() {
        const profileContent = document.querySelector('.profile-content');
        if (profileContent) {
            profileContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔒</div>
                    <h4>Login Required</h4>
                    <p>Please log in to view your profile</p>
                    <button class="btn" id="profileLoginBtn">Log In</button>
                </div>
            `;
            
            document.getElementById('profileLoginBtn')?.addEventListener('click', () => {
                this.handleLoginClick();
            });
        }
    }

    exportUserData() {
        this.showToast('Exporting user data... This feature is coming soon!');
    }

    showDeleteAccountConfirmation() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            this.showToast('Account deletion feature coming soon!');
        }
    }

    setupResponsiveLayout() {
        const updateLayout = () => {
            const screenWidth = window.innerWidth;
            
            if (screenWidth <= 1366) {
                document.body.classList.add('screen-1366');
                
                if (screenWidth < 1280) {
                    document.body.classList.add('screen-1280');
                }
            } else {
                document.body.classList.remove('screen-1366', 'screen-1280');
            }
        };

        updateLayout();
        
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
            fixturesIsSample: this.state.fixturesIsSample,
            news: this.state.news,
            liveEvents: this.state.liveEvents,
            videos: this.state.videos,
            fixtures: this.state.fixtures
        });
    }

    setupStatsButtonHandlers() {
        console.log('Setting up stats button handlers...');
        
        document.addEventListener('click', (e) => {
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
        
        let event = this.state.liveEvents.find(e => e._id === eventId);
        
        if (!event) {
            console.warn('Event not found by ID, trying alternative lookup...');
            
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

        modalTitle.textContent = `${event.teams.home} vs ${event.teams.away} - Live Statistics`;
        
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
                    <div class="stat-row">
                        <div class="stat-team home">${homeStats.possession}%</div>
                        <div class="stat-name">Possession</div>
                        <div class="stat-team away">${awayStats.possession}%</div>
                        <div class="stat-bar-container">
                            <div class="stat-bar home" style="width: ${homeStats.possession}%"></div>
                            <div class="stat-bar away" style="width: ${awayStats.possession}%"></div>
                        </div>
                    </div>
                    
                    <div class="stat-row">
                        <div class="stat-value">${homeStats.shots.total}</div>
                        <div class="stat-name">Total Shots</div>
                        <div class="stat-value">${awayStats.shots.total}</div>
                        <div class="stat-bar-container">
                            <div class="stat-bar home" style="width: ${(homeStats.shots.total / (homeStats.shots.total + awayStats.shots.total)) * 100}%"></div>
                            <div class="stat-bar away" style="width: ${(awayStats.shots.total / (homeStats.shots.total + awayStats.shots.total)) * 100}%"></div>
                        </div>
                    </div>
                    
                    <div class="stat-row">
                        <div class="stat-value">${homeStats.shots.onTarget}</div>
                        <div class="stat-name">Shots on Target</div>
                        <div class="stat-value">${awayStats.shots.onTarget}</div>
                        <div class="stat-bar-container">
                            <div class="stat-bar home" style="width: ${(homeStats.shots.onTarget / (homeStats.shots.onTarget + awayStats.shots.onTarget)) * 100}%"></div>
                            <div class="stat-bar away" style="width: ${(awayStats.shots.onTarget / (homeStats.shots.onTarget + awayStats.shots.onTarget)) * 100}%"></div>
                        </div>
                    </div>
                    
                    <div class="stat-row">
                        <div class="stat-value">${homeStats.passAccuracy}%</div>
                        <div class="stat-name">Pass Accuracy</div>
                        <div class="stat-value">${awayStats.passAccuracy}%</div>
                        <div class="stat-bar-container">
                            <div class="stat-bar home" style="width: ${homeStats.passAccuracy}%"></div>
                            <div class="stat-bar away" style="width: ${awayStats.passAccuracy}%"></div>
                        </div>
                    </div>
                    
                    <div class="stat-row">
                        <div class="stat-value">${homeStats.corners}</div>
                        <div class="stat-name">Corners</div>
                        <div class="stat-value">${awayStats.corners}</div>
                        <div class="stat-bar-container">
                            <div class="stat-bar home" style="width: ${(homeStats.corners / (homeStats.corners + awayStats.corners)) * 100}%"></div>
                            <div class="stat-bar away" style="width: ${(awayStats.corners / (homeStats.corners + awayStats.corners)) * 100}%"></div>
                        </div>
                    </div>
                    
                    <div class="stat-row">
                        <div class="stat-value">${homeStats.fouls}</div>
                        <div class="stat-name">Fouls</div>
                        <div class="stat-value">${awayStats.fouls}</div>
                        <div class="stat-bar-container">
                            <div class="stat-bar home" style="width: ${(homeStats.fouls / (homeStats.fouls + awayStats.fouls)) * 100}%"></div>
                            <div class="stat-bar away" style="width: ${(awayStats.fouls / (homeStats.fouls + awayStats.fouls)) * 100}%"></div>
                        </div>
                    </div>
                    
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
            const videoGridCard = e.target.closest('.video-grid-card');
            if (videoGridCard) {
                const youtubeId = videoGridCard.dataset.youtubeId;
                if (youtubeId) {
                    this.playYouTubeVideo(youtubeId, videoGridCard.querySelector('h4').textContent);
                }
            }

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
                    id="youtubePlayer"
                    onload="this.onerror=null;this.src='https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0';">
                </iframe>
                <div id="videoError" style="display: none; color: red; text-align: center; padding: 20px;">
                    <p>Video failed to load. <a href="https://www.youtube.com/watch?v=${youtubeId}" target="_blank">Click here to watch on YouTube</a></p>
                </div>
            </div>
            <div style="margin-top: 16px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: var(--radius);">
                <h4 style="margin-bottom: 8px;">${title || 'Sports Highlights'}</h4>
                <p style="color: var(--text-secondary); font-size: 14px; margin: 0;">
                    Watch the latest sports highlights and live action.
                </p>
            </div>
        `;
        
        // Add error handling for iframe
        const iframe = document.getElementById('youtubePlayer');
        const errorDiv = document.getElementById('videoError');
        
        if (iframe && errorDiv) {
            iframe.onerror = function() {
                console.error('YouTube video failed to load:', youtubeId);
                iframe.style.display = 'none';
                errorDiv.style.display = 'block';
            };
        }

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
    window.addEventListener('scroll', () => {
        this.handleScroll();
    });

    // Close all dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.has-dropdown')) {
            this.closeAllDropdowns();
        }
        
        if (!e.target.closest('.search')) {
            this.hideSearchResults();
        }
    });

    // Desktop dropdown functionality
    document.querySelectorAll('.has-dropdown').forEach(dropdown => {
        const button = dropdown.querySelector('.nav-button');
        if (button) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
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

    // ===== MOBILE MENU FIXES START =====
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileClose = document.querySelector('.mobile-close');
    
    if (mobileToggle && mobileMenu) {
        // Initialize mobile menu state
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileToggle.setAttribute('aria-expanded', 'false');
        
        // Toggle mobile menu
        mobileToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMobileMenu();
        });
        
        // Close mobile menu
        if (mobileClose) {
            mobileClose.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }
        
        // Close mobile menu when clicking on a link (except dropdown toggles)
        document.querySelectorAll('.mobile-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (!e.target.closest('.mobile-nav-button')) {
                    this.closeMobileMenu();
                }
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.mobile-menu') && 
                !e.target.closest('#mobileToggle') &&
                mobileMenu.classList.contains('open')) {
                this.closeMobileMenu();
            }
        });
        
        // Close mobile menu on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
                this.closeMobileMenu();
            }
        });
    }

    // Mobile dropdown functionality
    document.querySelectorAll('.mobile-nav-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMobileDropdown(button);
        });
    });
    // ===== MOBILE MENU FIXES END =====

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    
    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            searchInput.parentElement.classList.add('focused');
            if (this.state.searchQuery.trim().length > 0) {
                this.showHybridSearchResults(this.state.searchQuery);
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

    // Filter functionality
    const clearFiltersBtn = document.getElementById('resetFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            this.resetFilters();
        });
    }

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            this.loadMore();
        });
    }

    // Hero/Featured article buttons
    document.getElementById('readStoryBtn')?.addEventListener('click', () => this.openArticle('featured'));
    document.getElementById('followSportBtn')?.addEventListener('click', () => this.followSport('featured'));
    document.getElementById('subscribeBtn')?.addEventListener('click', () => this.subscribe());
    
    // Login/Logout functionality
    document.getElementById('loginBtn')?.addEventListener('click', () => this.handleLoginClick());
    document.getElementById('mobileLoginBtn')?.addEventListener('click', () => this.handleLoginClick());

    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
    });

    document.getElementById('mobileLogoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
    });

    // Modal close functionality
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

    // View toggle
    document.getElementById('gridViewBtn')?.addEventListener('click', () => this.toggleView('grid'));
    document.getElementById('listViewBtn')?.addEventListener('click', () => this.toggleView('list'));

    // Favorite functionality
    document.addEventListener('click', (e) => {
        if (e.target.closest('.favorite-btn')) {
            const btn = e.target.closest('.favorite-btn');
            const articleId = btn.dataset.articleId;
            this.toggleFavorite(articleId, btn);
        }
    });

    // Share functionality
    document.addEventListener('click', (e) => {
        if (e.target.closest('.share-btn')) {
            const btn = e.target.closest('.share-btn');
            const articleId = btn.dataset.articleId;
            this.shareArticle(articleId);
        }
    });

    // Theme toggle
    document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());

    // Keyboard shortcuts
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

    // Close dropdowns on navigation
    document.addEventListener('click', (e) => {
        const dropdownItem = e.target.closest('.dropdown-item');
        if (dropdownItem && dropdownItem.href) {
            this.closeAllDropdowns();
        }
    });

    // Close mobile menu on navigation
    document.addEventListener('click', (e) => {
        const mobileDropdownItem = e.target.closest('.mobile-dropdown-item');
        if (mobileDropdownItem && mobileDropdownItem.href) {
            this.closeMobileMenu();
        }
    });

    // Follow buttons
    this.setupFollowButtons();
}
    async initializeSearchEngine() {
        console.log('Initializing hybrid search engine...');
        
        try {
            this.state.searchIndex = this.createBM25Index();
            await this.loadEmbeddingModel();
            console.log('Hybrid search engine initialized successfully');
        } catch (error) {
            console.error('Error initializing search engine:', error);
            this.state.searchIndex = this.createBM25Index();
        }
    }

    createBM25Index() {
        const index = {
            documents: [],
            terms: {},
            docCount: 0,
            avgDocLength: 0,
            k1: 1.5,
            b: 0.75
        };

        this.state.news.forEach((doc, docId) => {
            const tokens = this.tokenizeDocument(doc);
            index.documents.push({
                id: docId,
                original: doc,
                length: tokens.length,
                tokens: tokens
            });
            
            tokens.forEach(token => {
                if (!index.terms[token]) {
                    index.terms[token] = {
                        docFrequency: 0,
                        postings: {}
                    };
                }
                if (!index.terms[token].postings[docId]) {
                    index.terms[token].postings[docId] = 0;
                    index.terms[token].docFrequency++;
                }
                index.terms[token].postings[docId]++;
            });
            
            index.docCount++;
        });

        if (index.docCount > 0) {
            const totalLength = index.documents.reduce((sum, doc) => sum + doc.length, 0);
            index.avgDocLength = totalLength / index.docCount;
        }

        return index;
    }

    tokenizeDocument(doc) {
        const text = [
            doc.title || '',
            doc.sport || '',
            doc.league || '',
            doc.teams?.home || '',
            doc.teams?.away || '',
            doc.excerpt || '',
            doc.venue || '',
            doc.author || '',
            doc.content || ''
        ].join(' ').toLowerCase();

        return text
            .replace(/[^\w\s@.-]/g, ' ')
            .split(/\s+/)
            .filter(token => {
                if (token.length <= 1) return false;
                if (this.isStopWord(token)) return false;
                return true;
            })
            .map(token => this.stemToken(token));
    }

    isStopWord(token) {
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
            'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
            'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their'
        ]);
        return stopWords.has(token);
    }

    stemToken(token) {
        const rules = [
            [/ies$/, 'y'],
            [/es$/, ''],
            [/s$/, ''],
            [/ing$/, ''],
            [/ed$/, ''],
            [/er$/, ''],
            [/est$/, ''],
        ];

        for (const [pattern, replacement] of rules) {
            if (pattern.test(token)) {
                return token.replace(pattern, replacement);
            }
        }
        return token;
    }

    async loadEmbeddingModel() {
        try {
            this.state.embeddingModel = {
                encode: async (text) => {
                    return this.simpleTextEmbedding(text);
                }
            };
            console.log('Embedding model initialized');
        } catch (error) {
            console.warn('Could not load embedding model, using fallback:', error);
            this.state.embeddingModel = null;
        }
    }

    simpleTextEmbedding(text) {
        const tokens = this.tokenizeDocument({ content: text });
        const vector = {};
        
        tokens.forEach(token => {
            vector[token] = (vector[token] || 0) + 1;
        });
        
        const magnitude = Math.sqrt(Object.values(vector).reduce((sum, val) => sum + val * val, 0));
        if (magnitude > 0) {
            Object.keys(vector).forEach(key => {
                vector[key] /= magnitude;
            });
        }
        
        return vector;
    }

    cosineSimilarity(vecA, vecB) {
        const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
        let dotProduct = 0;
        let magA = 0;
        let magB = 0;

        for (const key of keys) {
            const a = vecA[key] || 0;
            const b = vecB[key] || 0;
            dotProduct += a * b;
            magA += a * a;
            magB += b * b;
        }

        magA = Math.sqrt(magA);
        magB = Math.sqrt(magB);

        if (magA === 0 || magB === 0) return 0;
        return dotProduct / (magA * magB);
    }

    bm25Score(queryTerms, doc, index) {
        let score = 0;
        
        queryTerms.forEach(term => {
            if (index.terms[term] && index.terms[term].postings[doc.id]) {
                const tf = index.terms[term].postings[doc.id];
                const df = index.terms[term].docFrequency;
                const idf = Math.log(1 + (index.docCount - df + 0.5) / (df + 0.5));
                
                const numerator = tf * (index.k1 + 1);
                const denominator = tf + index.k1 * (1 - index.b + index.b * (doc.length / index.avgDocLength));
                
                score += idf * (numerator / denominator);
            }
        });
        
        return score;
    }

    async hybridSearch(query, documents, options = {}) {
        const {
            bm25Weight = 0.6,
            semanticWeight = 0.4,
            maxResults = 10
        } = options;

        const queryTerms = this.tokenizeDocument({ content: query });
        const results = [];

        const bm25Scores = new Map();
        documents.forEach((doc, docId) => {
            const score = this.bm25Score(queryTerms, doc, this.state.searchIndex);
            bm25Scores.set(docId, score);
        });

        let semanticScores = new Map();
        if (this.state.embeddingModel) {
            try {
                const queryEmbedding = await this.state.embeddingModel.encode(query);
                
                for (const [docId, doc] of documents.entries()) {
                    const docText = [
                        doc.original.title,
                        doc.original.sport,
                        doc.original.league,
                        doc.original.excerpt
                    ].join(' ');
                    
                    const docEmbedding = await this.state.embeddingModel.encode(docText);
                    const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding);
                    semanticScores.set(docId, similarity);
                }
            } catch (error) {
                console.warn('Semantic search failed, using BM25 only:', error);
                semanticScores = new Map();
            }
        }

        for (const [docId, bm25Score] of bm25Scores) {
            const semanticScore = semanticScores.get(docId) || 0;
            const hybridScore = (bm25Score * bm25Weight) + (semanticScore * semanticWeight);
            
            if (hybridScore > 0) {
                results.push({
                    document: documents[docId].original,
                    score: hybridScore,
                    bm25Score: bm25Score,
                    semanticScore: semanticScore,
                    docId: docId
                });
            }
        }

        results.sort((a, b) => b.score - a.score);
        
        results.forEach(result => {
            if (result.document.status === 'Live') {
                result.score *= 1.3;
            }
            
            const articleDate = new Date(result.document.date);
            const now = new Date();
            const daysAgo = (now - articleDate) / (1000 * 60 * 60 * 24);
            if (daysAgo < 1) result.score *= 1.2;
            else if (daysAgo < 7) result.score *= 1.1;
        });

        results.sort((a, b) => b.score - a.score);
        
        return results.slice(0, maxResults);
    }

    async performHybridSearch(query) {
        if (!query || query.trim().length === 0) {
            return [];
        }

        try {
            const allDocuments = this.state.searchIndex.documents;
            const searchResults = await this.hybridSearch(query, allDocuments, {
                bm25Weight: 0.6,
                semanticWeight: 0.4,
                maxResults: 12
            });

            console.log('Hybrid search results:', {
                query,
                totalResults: searchResults.length,
                results: searchResults.map(r => ({
                    title: r.document.title,
                    hybridScore: r.score.toFixed(3),
                    bm25Score: r.bm25Score.toFixed(3),
                    semanticScore: r.semanticScore.toFixed(3)
                }))
            });

            return searchResults;
        } catch (error) {
            console.error('Hybrid search error:', error);
            return this.fallbackTextSearch(query);
        }
    }

    fallbackTextSearch(query) {
        const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
        const results = [];

        this.state.news.forEach((item, index) => {
            let score = 0;
            const text = [
                item.title, item.sport, item.league, 
                item.teams?.home, item.teams?.away, 
                item.excerpt, item.venue, item.author
            ].join(' ').toLowerCase();

            searchTerms.forEach(term => {
                if (text.includes(term)) {
                    score += term.length;
                    
                    if (item.title?.toLowerCase().includes(term)) score += 10;
                    if (item.teams?.home?.toLowerCase().includes(term)) score += 8;
                    if (item.teams?.away?.toLowerCase().includes(term)) score += 8;
                    if (item.sport?.toLowerCase().includes(term)) score += 6;
                }
            });

            if (score > 0) {
                results.push({
                    document: item,
                    score: score,
                    bm25Score: score,
                    semanticScore: 0,
                    docId: index
                });
            }
        });

        return results.sort((a, b) => b.score - a.score).slice(0, 12);
    }

    async handleSearchInput(query) {
        this.state.searchQuery = query;
        
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(async () => {
            if (query.trim().length > 0) {
                await this.showHybridSearchResults(query);
            } else {
                this.hideSearchResults();
            }
        }, 300);
    }

    async showHybridSearchResults(query) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        if (!query || query.trim().length === 0) {
            this.hideSearchResults();
            return;
        }

        try {
            this.showSearchLoading();
            
            const searchResultsData = await this.performHybridSearch(query);
            
            if (searchResultsData.length > 0) {
                this.renderSearchResults(searchResultsData, query);
                searchResults.classList.add('active');
            } else {
                this.showNoResults(query);
                searchResults.classList.add('active');
            }
        } catch (error) {
            console.error('Error showing search results:', error);
            this.showSearchError(query);
        } finally {
            this.hideSearchLoading();
        }
    }

    showSearchLoading() {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.innerHTML = `
                <div class="search-result-item loading-results">
                    <div class="search-result-content">
                        <div class="search-loading-spinner"></div>
                        <div class="search-result-title">Searching...</div>
                        <div class="search-result-meta">Using hybrid search engine</div>
                    </div>
                </div>
            `;
            searchResults.classList.add('active');
        }
    }

    hideSearchLoading() {
        // Loading state is replaced by actual results
    }

    renderSearchResults(results, query) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);

        searchResults.innerHTML = results.map(result => {
            const item = result.document;
            const scorePercentage = Math.min(100, Math.round(result.score * 20));
            
            let matchType = 'standard';
            if (result.semanticScore > 0.3 && result.bm25Score > 2) {
                matchType = 'excellent';
            } else if (result.semanticScore > 0.2) {
                matchType = 'semantic';
            } else if (result.bm25Score > 1) {
                matchType = 'keyword';
            }

            return `
                <div class="search-result-item ${matchType}" data-article-id="${item._id}">
                    <div class="search-result-content">
                        <div class="search-result-header">
                            <div class="search-result-title">${this.highlightTerms(item.title, searchTerms)}</div>
                            <div class="search-result-score">
                                <div class="score-bar">
                                    <div class="score-fill" style="width: ${scorePercentage}%"></div>
                                </div>
                                <span class="score-text">${scorePercentage}% match</span>
                            </div>
                        </div>
                        <div class="search-result-meta">
                            <span class="search-result-sport">${item.sport}</span>
                            <span class="search-result-league">${item.league}</span>
                            ${item.score ? `<span class="search-result-match-score">${item.score}</span>` : ''}
                            ${item.status ? `<span class="search-result-status ${item.status.toLowerCase()}">${item.status}</span>` : ''}
                            <span class="search-result-type ${matchType}">${matchType} match</span>
                        </div>
                        <div class="search-result-excerpt">${this.highlightTerms(item.excerpt, searchTerms)}</div>
                        <div class="search-result-footer">
                            <div class="search-result-stats">
                                <span class="stat">BM25: ${result.bm25Score.toFixed(2)}</span>
                                ${result.semanticScore > 0 ? `<span class="stat">Semantic: ${result.semanticScore.toFixed(2)}</span>` : ''}
                            </div>
                            <div class="search-result-date">${this.formatDate(item.date)}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this.attachSearchResultEventListeners();
    }

    attachSearchResultEventListeners() {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const articleId = item.dataset.articleId;
                console.log('Search result clicked, opening article:', articleId);
                
                const article = this.state.news.find(a => a._id === articleId);
                if (article) {
                    this.openArticle(articleId);
                    this.hideSearchResults();
                    
                    const searchInput = document.getElementById('searchInput');
                    const mobileSearchInput = document.getElementById('mobileSearchInput');
                    if (searchInput) searchInput.value = '';
                    if (mobileSearchInput) mobileSearchInput.value = '';
                    this.state.searchQuery = '';
                }
            });
        });
    }

    showNoResults(query) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        const suggestions = this.generateSearchSuggestions(query);

        searchResults.innerHTML = `
            <div class="search-result-item no-results">
                <div class="search-result-content">
                    <div class="search-result-title">No results found for "${query}"</div>
                    <div class="search-result-meta">Try different keywords or check spelling</div>
                    
                    ${suggestions.relatedSports.length > 0 ? `
                        <div class="search-suggestions">
                            <strong>Related Sports:</strong>
                            <div class="suggestion-tags">
                                ${suggestions.relatedSports.map(sport => 
                                    `<button class="suggestion-tag" data-sport="${sport}">${sport}</button>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${suggestions.relatedLeagues.length > 0 ? `
                        <div class="search-suggestions">
                            <strong>Related Leagues:</strong>
                            <div class="suggestion-tags">
                                ${suggestions.relatedLeagues.map(league => 
                                    `<button class="suggestion-tag" data-league="${league}">${league}</button>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="search-result-suggestions">
                        <strong>Search Tips:</strong>
                        <ul>
                            <li>Use specific team names (e.g., "Manchester United")</li>
                            <li>Try sport names (e.g., "Football", "Cricket")</li>
                            <li>Use league names (e.g., "Premier League", "NBA")</li>
                            <li>Be more specific or use fewer keywords</li>
                            <li>Check your spelling</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        this.attachSuggestionEventListeners();
    }

    generateSearchSuggestions(query) {
        const suggestions = {
            relatedSports: [],
            relatedLeagues: [],
            similarTerms: []
        };

        const queryLower = query.toLowerCase();
        
        Object.keys(sportLeagues).forEach(sport => {
            if (sport.toLowerCase().includes(queryLower) || 
                this.calculateStringSimilarity(sport.toLowerCase(), queryLower) > 0.6) {
                suggestions.relatedSports.push(sport);
            }
        });

        Object.values(sportLeagues).flat().forEach(league => {
            if (league.toLowerCase().includes(queryLower) ||
                this.calculateStringSimilarity(league.toLowerCase(), queryLower) > 0.5) {
                suggestions.relatedLeagues.push(league);
            }
        });

        return suggestions;
    }

    calculateStringSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        return (longer.length - this.levenshteinDistance(longer, shorter)) / parseFloat(longer.length);
    }

    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + indicator
                );
            }
        }

        return matrix[str2.length][str1.length];
    }

    attachSuggestionEventListeners() {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        searchResults.querySelectorAll('.suggestion-tag[data-sport]').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const sport = tag.dataset.sport;
                this.filterBySport(sport);
                this.hideSearchResults();
            });
        });

        searchResults.querySelectorAll('.suggestion-tag[data-league]').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const league = tag.dataset.league;
                this.filterByLeague(league);
                this.hideSearchResults();
            });
        });
    }

    showSearchError(query) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        searchResults.innerHTML = `
            <div class="search-result-item error-results">
                <div class="search-result-content">
                    <div class="search-result-title">Search temporarily unavailable</div>
                    <div class="search-result-meta">Using basic search as fallback</div>
                    <div class="search-result-excerpt">
                        We're having trouble with our advanced search system. 
                        Showing basic results for "${query}".
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            this.showSearchResults(query);
        }, 100);
    }

    async performSearch(query) {
        if (query.trim()) {
            console.log('Performing hybrid search for:', query);
            this.state.searchQuery = query;
            this.state.page = 1;
            
            const searchResults = await this.performHybridSearch(query);
            this.applyFiltersWithSearch(searchResults);
            this.hideSearchResults();
            
            const mobileSearchInput = document.getElementById('mobileSearchInput');
            if (mobileSearchInput && mobileSearchInput.value !== query) {
                mobileSearchInput.value = query;
            }
            
            if (window.innerWidth < 768) {
                const newsGrid = document.getElementById('newsGrid');
                if (newsGrid) {
                    newsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }
    }

    applyFiltersWithSearch(searchResults) {
        this.state.news = searchResults.map(result => result.document);
        this.renderNewsGrid();
        this.renderFilterChips();
        this.updateFilterDisplay();
        this.renderVideoGrid();
        this.renderLiveCarousel();
    }

    async updateSearchIndex() {
        if (this.state.searchIndex) {
            this.state.searchIndex = this.createBM25Index();
            console.log('Search index updated with', this.state.news.length, 'documents');
        }
    }

    hideSearchResults() {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.classList.remove('active');
        }
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

        const allNews = this.state.news;
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

            searchTerms.forEach(term => {
                if (fields.title === term) score += 10;
                if (fields.sport === term) score += 8;
                if (fields.league === term) score += 7;
                if (fields.homeTeam === term || fields.awayTeam === term) score += 9;
                
                const wordBoundaryRegex = new RegExp(`\\b${term}\\b`, 'i');
                
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

        console.log('Scored results:', scoredResults);

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
                                ${item.score ? `<span class="search-result-score">${item.score}</span>` : ''}
                                ${item.status ? `<span class="search-result-status ${item.status.toLowerCase()}">${item.status}</span>` : ''}
                            </div>
                            <div class="search-result-excerpt">${this.highlightTerms(item.excerpt, searchTerms)}</div>
                            <div class="search-result-relevance">Relevance: ${Math.round(item.score)}%</div>
                        </div>
                    </div>
                `;
            }).join('');

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

    highlightTerms(text, terms) {
        let highlighted = text;
        terms.forEach(term => {
            const regex = new RegExp(`(${term})`, 'gi');
            highlighted = highlighted.replace(regex, '<mark>$1</mark>');
        });
        return highlighted;
    }

    setupFollowFunctionality() {
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
                    followBtn.classList.remove('following');
                    followBtn.textContent = followBtn.textContent.replace('Following', 'Follow');
                    this.showToast(`Unfollowed ${sport}`);
                    
                    this.state.userPreferences.favoriteSports = 
                        this.state.userPreferences.favoriteSports.filter(s => s !== sport);
                } else {
                    followBtn.classList.add('following');
                    followBtn.textContent = followBtn.textContent.replace('Follow', 'Following');
                    this.showToast(`Now following ${sport}`);
                    
                    if (!this.state.userPreferences.favoriteSports.includes(sport)) {
                        this.state.userPreferences.favoriteSports.push(sport);
                    }
                }
                
                this.saveUserPreferences();
            }
        });

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
                        
                        this.state.userPreferences.favoriteSports = 
                            this.state.userPreferences.favoriteSports.filter(s => s !== sport);
                    } else {
                        button.classList.add('following');
                        button.textContent = 'Following';
                        this.showToast(`Now following ${sport}`);
                        
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
            alert(message);
        }
    }

    handleLoginClick() {
        if (this.state.user) {
            return;
        } else {
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
                
                this.showAlert('Logged out successfully', 'success');
                
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
    const body = document.body;
    
    if (!mobileMenu || !mobileToggle) return;
    
    const isCurrentlyOpen = mobileMenu.classList.contains('open');
    
    if (isCurrentlyOpen) {
        // Close the menu
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileToggle.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
        body.classList.remove('mobile-menu-open');
    } else {
        // Open the menu
        mobileMenu.classList.add('open');
        mobileMenu.setAttribute('aria-hidden', 'false');
        mobileToggle.setAttribute('aria-expanded', 'true');
        body.style.overflow = 'hidden';
        body.classList.add('mobile-menu-open');
    }
    
    console.log('Mobile menu toggled:', {
        isOpen: !isCurrentlyOpen,
        ariaHidden: mobileMenu.getAttribute('aria-hidden'),
        ariaExpanded: mobileToggle.getAttribute('aria-expanded')
    });
}

closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileToggle = document.getElementById('mobileToggle');
    const body = document.body;
    
    if (!mobileMenu || !mobileToggle) return;
    
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileToggle.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
    body.classList.remove('mobile-menu-open');
    
    // Close all mobile dropdowns
    document.querySelectorAll('.mobile-nav-button[aria-expanded="true"]').forEach(button => {
        button.setAttribute('aria-expanded', 'false');
        const dropdown = button.nextElementSibling;
        if (dropdown && dropdown.classList.contains('mobile-dropdown')) {
            dropdown.style.maxHeight = '0';
        }
    });
}

toggleMobileDropdown(button) {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    const dropdown = button.nextElementSibling;
    
    // Close all other dropdowns
    document.querySelectorAll('.mobile-nav-button[aria-expanded="true"]').forEach(otherBtn => {
        if (otherBtn !== button) {
            otherBtn.setAttribute('aria-expanded', 'false');
            const otherDropdown = otherBtn.nextElementSibling;
            if (otherDropdown && otherDropdown.classList.contains('mobile-dropdown')) {
                otherDropdown.style.maxHeight = '0';
            }
        }
    });
    
    if (isExpanded) {
        // Close this dropdown
        button.setAttribute('aria-expanded', 'false');
        if (dropdown && dropdown.classList.contains('mobile-dropdown')) {
            dropdown.style.maxHeight = '0';
        }
    } else {
        // Open this dropdown
        button.setAttribute('aria-expanded', 'true');
        if (dropdown && dropdown.classList.contains('mobile-dropdown')) {
            dropdown.style.maxHeight = dropdown.scrollHeight + 'px';
        }
    }
}

closeAllDropdowns() {
    // Desktop dropdowns
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
    
    // Mobile dropdowns
    document.querySelectorAll('.mobile-nav-button[aria-expanded="true"]').forEach(button => {
        button.setAttribute('aria-expanded', 'false');
        const dropdown = button.nextElementSibling;
        if (dropdown && dropdown.classList.contains('mobile-dropdown')) {
            dropdown.style.maxHeight = '0';
        }
    });
}

injectMobileMenuCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .mobile-menu {
            position: fixed;
            top: 0;
            right: -100%;
            width: 300px;
            height:100vh;
            background: var(--card-bg);
            z-index: 1001;
            transition: right 0.3s ease;
            overflow-y: auto;
            padding: 20px;
            box-shadow: -5px 0 15px rgba(0, 0, 0, 0.3);
            border-left: 1px solid var(--border-color);
        }
        
        .mobile-menu.open {
            right: 0;
        }
        
        .mobile-toggle {
            display: none;
            background: none;
            border: none;
            color: var(--text-primary);
            cursor: pointer;
            padding: 8px;
            z-index: 1002;
        }
        
        .mobile-close {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            color: var(--text-primary);
            font-size: 24px;
            cursor: pointer;
            padding: 5px;
            z-index: 1003;
        }
        
        .mobile-dropdown {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }
        
        @media (max-width: 768px) {
            .mobile-toggle {
                display: block;
            }
        }
        
        body.mobile-menu-open {
            overflow: hidden;
        }
        
        body.mobile-menu-open::after {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
}


    handleScroll() {
        const header = document.getElementById('siteHeader');
        const scrollTop = window.scrollY;
        
        clearTimeout(this.scrollTimer);
        this.scrollTimer = setTimeout(() => {
            if (scrollTop > 100) {
                header.classList.add('header--compact');
            } else {
                header.classList.remove('header--compact');
            }
        }, 10);

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
                this.fetchFixtures()
            ]);

            this.state.news = newsData.news || [];
            this.state.liveEvents = liveData.liveEvents || [];
            this.state.videos = videoData.videos || [];
            this.state.fixtures = fixtureData.fixtures || [];
            this.state.fixturesIsSample = fixtureData.isSampleData || false;

            console.log('Database data loaded:', {
                news: this.state.news.length,
                liveEvents: this.state.liveEvents.length,
                videos: this.state.videos.length,
                fixtures: this.state.fixtures.length,
                fixturesIsSample: this.state.fixturesIsSample,
                fixturesData: this.state.fixtures
            });

            await this.updateSearchIndex();

            this.buildDynamicFilters();
            this.renderAll();
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load sports data from database. Please refresh the page.');
            
            this.state.news = [];
            this.state.liveEvents = [];
            this.state.videos = [];
            this.state.fixtures = [];
            this.state.fixturesIsSample = true;
            
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
        this.state.videosPage = 1;
        this.state.liveEventsPage = 1;
        
        this.updateLeagueFilter(sport);
        await this.applyFilters();
    }

    async filterByLeague(league) {
        this.state.currentLeague = league;
        this.state.page = 1;
        this.state.videosPage = 1;
        this.state.liveEventsPage = 1;
        await this.applyFilters();
    }

    async filterByStatus(status) {
        this.state.currentStatus = status;
        this.state.page = 1;
        this.state.videosPage = 1;
        this.state.liveEventsPage = 1;
        await this.applyFilters();
    }

    async applyFilters() {
        if (this.state.isLoading) return;
        
        this.state.isLoading = true;
        this.showLoading();
        
        try {
            // Fetch news with filters
            const data = await this.fetchNews();
            if (this.state.page === 1) {
                this.state.news = data.news || [];
            } else {
                this.state.news = [...this.state.news, ...(data.news || [])];
            }
            this.state.hasMore = data.hasMore || false;
            
            // Also fetch filtered videos and live events
            const [filteredVideos, filteredLiveEvents] = await Promise.all([
                this.fetchFilteredVideos(),
                this.fetchFilteredLiveEvents()
            ]);
            
            if (this.state.videosPage === 1) {
                this.state.videos = filteredVideos;
            } else {
                this.state.videos = [...this.state.videos, ...filteredVideos];
            }
            
            if (this.state.liveEventsPage === 1) {
                this.state.liveEvents = filteredLiveEvents;
            } else {
                this.state.liveEvents = [...this.state.liveEvents, ...filteredLiveEvents];
            }
            
            this.renderNewsGrid();
            this.renderFilterChips();
            this.updateFilterDisplay();
            this.renderVideoGrid();
            this.renderLiveCarousel();
            
        } catch (error) {
            console.error('Error applying filters:', error);
            this.showError('Failed to apply filters from server');
            this.state.news = [];
            this.state.videos = [];
            this.state.liveEvents = [];
            this.state.hasMore = false;
            this.renderNewsGrid();
            this.renderVideoGrid();
            this.renderLiveCarousel();
        } finally {
            this.state.isLoading = false;
            this.hideLoading();
        }
    }

    async fetchFilteredVideos() {
        try {
            const queryParams = new URLSearchParams({
                page: this.state.videosPage,
                limit: 6,
                ...(this.state.currentSport !== 'All' && { sport: this.state.currentSport }),
                ...(this.state.currentLeague !== 'All' && { league: this.state.currentLeague })
            });

            const response = await fetch(`/api/videos?${queryParams}`);
            if (!response.ok) throw new Error('Failed to fetch filtered videos');
            
            const data = await response.json();
            this.state.videosHasMore = data.hasMore || false;
            return data.videos || [];
        } catch (error) {
            console.error('Error fetching filtered videos:', error);
            // Fallback: filter existing videos client-side
            return this.filterVideosClientSide();
        }
    }

    async fetchFilteredLiveEvents() {
        try {
            const queryParams = new URLSearchParams({
                page: this.state.liveEventsPage,
                limit: 8,
                ...(this.state.currentSport !== 'All' && { sport: this.state.currentSport }),
                ...(this.state.currentLeague !== 'All' && { league: this.state.currentLeague }),
                ...(this.state.currentStatus !== 'All' && { status: this.state.currentStatus })
            });

            const response = await fetch(`/api/live-events?${queryParams}`);
            if (!response.ok) throw new Error('Failed to fetch filtered live events');
            
            const data = await response.json();
            this.state.liveEventsHasMore = data.hasMore || false;
            return data.liveEvents || [];
        } catch (error) {
            console.error('Error fetching filtered live events:', error);
            // Fallback: filter existing live events client-side
            return this.filterLiveEventsClientSide();
        }
    }

    filterVideosClientSide() {
        let filtered = [...this.state.videos];
        
        if (this.state.currentSport !== 'All') {
            filtered = filtered.filter(video => 
                video.sport === this.state.currentSport
            );
        }
        
        if (this.state.currentLeague !== 'All') {
            filtered = filtered.filter(video => 
                video.league === this.state.currentLeague
            );
        }
        
        return filtered;
    }

    filterLiveEventsClientSide() {
        let filtered = [...this.state.liveEvents];
        
        if (this.state.currentSport !== 'All') {
            filtered = filtered.filter(event => 
                event.sport === this.state.currentSport
            );
        }
        
        if (this.state.currentLeague !== 'All') {
            filtered = filtered.filter(event => 
                event.league === this.state.currentLeague
            );
        }
        
        if (this.state.currentStatus !== 'All') {
            filtered = filtered.filter(event => 
                event.status === this.state.currentStatus
            );
        }
        
        return filtered;
    }

    renderVideoGrid() {
        const videoSection = document.getElementById('videoHighlights');
        if (!videoSection) return;

        // Use filtered videos
        const filteredVideos = this.filterVideosClientSide();
        console.log('Rendering filtered video grid:', filteredVideos.length);

        if (filteredVideos.length === 0) {
            videoSection.innerHTML = `
                <div class="video-section-header">
                    <div>
                        <h2 class="video-section-title">Video Highlights</h2>
                        <p class="video-section-subtitle">${this.getFilterStatusText()}</p>
                    </div>
                </div>
                <div class="no-content-message">
                    <p>No video highlights found for the current filters.</p>
                    ${this.state.currentSport !== 'All' || this.state.currentLeague !== 'All' ? 
                        '<button class="btn btn-small" id="resetVideoFilters">Clear Filters</button>' : ''}
                </div>
            `;
            
            // Add event listener for reset button
            setTimeout(() => {
                const resetBtn = document.getElementById('resetVideoFilters');
                if (resetBtn) {
                    resetBtn.addEventListener('click', () => this.resetFilters());
                }
            }, 100);
            return;
        }

        const displayVideos = filteredVideos.slice(0, 6);
        
        videoSection.innerHTML = `
            <div class="video-section-header">
                <div>
                    <h2 class="video-section-title">Video Highlights</h2>
                    <p class="video-section-subtitle">${this.getFilterStatusText()}</p>
                </div>
                <div class="filter-indicator">
                    Showing ${displayVideos.length} of ${filteredVideos.length} videos
                </div>
            </div>
            <div class="video-grid" id="videoGrid">
                ${displayVideos.map(video => `
                    <div class="video-grid-card" data-youtube-id="${video.youtubeId || video.videoId}">
                        <div class="video-grid-thumb" style="background-image: url('${video.thumbnail || this.getDefaultVideoThumbnail(video.sport)}')">
                            <div class="video-grid-play">▶</div>
                            ${video.duration ? `<div class="video-grid-duration">${video.duration}</div>` : ''}
                        </div>
                        <div class="video-grid-content">
                            <h4>${video.title}</h4>
                            <div class="video-grid-meta">
                                <span class="video-grid-sport">${video.sport}</span>
                                ${video.league ? `<span class="video-grid-league">${video.league}</span>` : ''}
                                ${video.views ? `<span class="video-grid-views">${video.views} views</span>` : ''}
                            </div>
                            <div class="video-grid-footer">
                                <div class="video-grid-date">${this.formatDate(video.date)}</div>
                                <div class="video-grid-actions">
                                    <button class="video-grid-btn save-btn" title="Save video">💾</button>
                                    <button class="video-grid-btn share-btn" title="Share video">📤</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            ${filteredVideos.length > 6 ? `
                <div class="load-more-wrap">
                    <button class="btn ghost" id="loadMoreVideosBtn">
                        Load more videos
                    </button>
                </div>
            ` : ''}
        `;
        
        // Add event listener for load more videos button
        setTimeout(() => {
            const loadMoreVideosBtn = document.getElementById('loadMoreVideosBtn');
            if (loadMoreVideosBtn) {
                loadMoreVideosBtn.addEventListener('click', () => {
                    this.loadMoreVideos();
                });
            }
        }, 100);
    }

    renderLiveCarousel() {
        const liveSection = document.getElementById('liveCarousel');
        if (!liveSection) return;

        // Use filtered live events
        const filteredLiveEvents = this.filterLiveEventsClientSide();
        console.log('Rendering filtered live events:', filteredLiveEvents.length);

        if (filteredLiveEvents.length === 0) {
            liveSection.innerHTML = `
                <div class="section-header">
                    <h3 class="section-title">Live Now</h3>
                    <p class="section-subtitle">${this.getFilterStatusText()}</p>
                </div>
                <div class="no-content-message">
                    <p>No live events found for the current filters.</p>
                    ${this.state.currentSport !== 'All' || this.state.currentLeague !== 'All' || this.state.currentStatus !== 'All' ? 
                        '<button class="btn btn-small" id="resetLiveFilters">Clear Filters</button>' : ''}
                </div>
            `;
            
            // Add event listener for reset button
            setTimeout(() => {
                const resetBtn = document.getElementById('resetLiveFilters');
                if (resetBtn) {
                    resetBtn.addEventListener('click', () => this.resetFilters());
                }
            }, 100);
            return;
        }

        liveSection.innerHTML = `
            <div class="section-header">
                <h3 class="section-title">Live Now</h3>
                <div class="filter-indicator">
                    ${filteredLiveEvents.length} live event${filteredLiveEvents.length !== 1 ? 's' : ''}
                </div>
            </div>
            <div class="live-grid" id="liveGrid">
                ${filteredLiveEvents.map(event => `
                    <div class="live-grid-card" data-event-id="${event._id}" data-youtube-id="${event.youtubeId}" data-sport="${event.sport}">
                        <div class="live-card-header">
                            <div class="match-status">
                                <div class="live-indicator"></div>
                                <span class="live-text">${event.status || 'LIVE'}</span>
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
    }

    getFilterStatusText() {
        const parts = [];
        
        if (this.state.currentSport !== 'All') {
            parts.push(`Sport: ${this.state.currentSport}`);
        }
        
        if (this.state.currentLeague !== 'All') {
            parts.push(`League: ${this.state.currentLeague}`);
        }
        
        if (this.state.currentStatus !== 'All') {
            parts.push(`Status: ${this.state.currentStatus}`);
        }
        
        return parts.length > 0 ? `Filtered by ${parts.join(' • ')}` : 'Latest sports highlights and action';
    }

    resetFilters() {
        this.state.currentSport = 'All';
        this.state.currentLeague = 'All';
        this.state.currentStatus = 'All';
        this.state.searchQuery = '';
        this.state.page = 1;
        this.state.videosPage = 1;
        this.state.liveEventsPage = 1;
        
        const searchInput = document.getElementById('searchInput');
        const mobileSearchInput = document.getElementById('mobileSearchInput');
        if (searchInput) searchInput.value = '';
        if (mobileSearchInput) mobileSearchInput.value = '';
        
        this.renderSportFilter();
        this.renderLeagueFilter();
        this.renderStatusFilter();
        
        this.applyFilters();
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

    // Add load more videos functionality
    async loadMoreVideos() {
        if (this.state.isLoading || !this.state.videosHasMore) return;
        
        this.state.videosPage++;
        try {
            const filteredVideos = await this.fetchFilteredVideos();
            this.state.videos = [...this.state.videos, ...filteredVideos];
            this.renderVideoGrid();
        } catch (error) {
            console.error('Error loading more videos:', error);
            this.state.videosPage--;
        }
    }

    async loadMoreLiveEvents() {
        if (this.state.isLoading || !this.state.liveEventsHasMore) return;
        
        this.state.liveEventsPage++;
        try {
            const filteredLiveEvents = await this.fetchFilteredLiveEvents();
            this.state.liveEvents = [...this.state.liveEvents, ...filteredLiveEvents];
            this.renderLiveCarousel();
        } catch (error) {
            console.error('Error loading more live events:', error);
            this.state.liveEventsPage--;
        }
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
            return { videos: [] };
        }
    }

    async fetchFixtures() {
        try {
            const response = await fetch('/api/fixtures/today');
            if (!response.ok) throw new Error('Failed to fetch fixtures');
            
            const data = await response.json();
            console.log('Fixtures API Response:', {
                success: data.success,
                fixturesCount: data.fixtures?.length || 0,
                isSampleData: data.isSampleData || false,
                fixtures: data.fixtures || []
            });
            return data;
        } catch (error) {
            console.error('Error fetching fixtures:', error);
            return { fixtures: [], isSampleData: true };
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
        
        this.setupFollowButtons();
    }

    renderHero() {
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

    getDefaultVideoThumbnail(sport) {
        const defaultThumbnails = {
            'Football': 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=400',
            'Basketball': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
            'Cricket': 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400',
            'Tennis': 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=400',
            'Baseball': 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400',
            'Hockey': 'https://images.unsplash.com/photo-1550675894-95b70ec8d936?w=400'
        };
        return defaultThumbnails[sport] || 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=400';
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

        grid.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', (e) => {
                const articleId = card.dataset.articleId;
                console.log('Card clicked:', articleId);
                this.openArticle(articleId);
            });
        });

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

        let fixturesToRender = this.state.fixtures;
        let isSampleData = this.state.fixturesIsSample;

        console.log('Fixture rendering state:', {
            fixturesCount: fixturesToRender.length,
            isSampleData: isSampleData,
            fixtures: fixturesToRender
        });

        if (fixturesToRender.length === 0 && isSampleData) {
            console.log('No fixtures in database, using sample data');
            fixturesToRender = this.getSampleFixtures();
        } else if (fixturesToRender.length === 0) {
            console.log('No fixtures available');
            container.innerHTML = '<div class="muted">No fixtures scheduled for today</div>';
            return;
        } else {
            console.log('Using fixtures from database:', fixturesToRender.length);
        }

        const displayFixtures = fixturesToRender.slice(0, 6);

        container.innerHTML = displayFixtures.map(fixture => {
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

        if (isSampleData && this.state.fixtures.length === 0) {
            container.innerHTML += `
                <div class="sample-data-notice" style="font-size: 12px; color: #666; margin-top: 10px; text-align: center; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px;">
                    📋 Showing sample fixtures data
                </div>
            `;
        }
    }

    getSampleFixtures() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return [
            {
                _id: 'fixture1',
                homeTeam: { name: 'Manchester United' },
                awayTeam: { name: 'Liverpool' },
                teams: { home: 'Manchester United', away: 'Liverpool' },
                league: 'Premier League',
                sport: 'Football',
                time: '15:00',
                date: today,
                venue: 'Old Trafford',
                status: 'upcoming',
                isActive: true,
                isFeatured: true
            },
           
            {
                _id: 'fixture5',
                homeTeam: { name: 'Chelsea' },
                awayTeam: { name: 'Arsenal' },
                teams: { home: 'Chelsea', away: 'Arsenal' },
                league: 'Premier League',
                sport: 'Football',
                time: '17:30',
                date: today,
                venue: 'Stamford Bridge',
                status: 'upcoming',
                isActive: true,
                isFeatured: false
            }
        ];
    }

    renderTopTeams() {
        const container = document.getElementById('topTeams');
        if (!container) return;

        const teams = new Set();
        
        this.state.fixtures.forEach(fixture => {
            const homeTeam = fixture.homeTeam?.name || fixture.teams?.home?.name || fixture.teams?.home;
            const awayTeam = fixture.awayTeam?.name || fixture.teams?.away?.name || fixture.teams?.away;
            
            if (homeTeam) teams.add(homeTeam);
            if (awayTeam) teams.add(awayTeam);
        });

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
        setInterval(() => {
            this.updateTicker();
        }, 30000);

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

        title.textContent = article.title || 'Match Details';
        
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

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        console.log('Article modal opened:', article.title);
    }

    generateArticleContent(article) {
        const articleId = article._id;
        
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
        
        document.querySelectorAll('.view-toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${view}ViewBtn`)?.classList.add('active');
    }

    toggleFavorite(articleId, button) {
        const article = this.state.news.find(item => item._id === articleId);
        if (article) {
            article.isFavorite = !article.isFavorite;
            
            if (button) {
                button.classList.toggle('favorited');
                const svg = button.querySelector('svg');
                if (svg) {
                    svg.setAttribute('fill', article.isFavorite ? 'currentColor' : 'none');
                }
                button.setAttribute('aria-label', article.isFavorite ? 'Remove from favorites' : 'Add to favorites');
            }
            
            const modalFavoriteBtn = document.querySelector(`.article-actions .favorite-btn[data-article-id="${articleId}"]`);
            if (modalFavoriteBtn) {
                modalFavoriteBtn.classList.toggle('favorited');
                const modalSvg = modalFavoriteBtn.querySelector('svg');
                if (modalSvg) {
                    modalSvg.setAttribute('fill', article.isFavorite ? 'currentColor' : 'none');
                }
            }
            
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
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
            themeToggle.setAttribute('aria-label', `Switch to ${newTheme === 'dark' ? 'light' : 'dark'} theme`);
        }
    }

    applyUserPreferences() {
        document.documentElement.setAttribute('data-theme', this.state.userPreferences.theme);
        
        this.renderUserPreferences();
    }

    renderUserPreferences() {
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

document.addEventListener('DOMContentLoaded', function() {
    console.log("AllSports Games page loaded");
    window.app = new AllSportsApp();
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