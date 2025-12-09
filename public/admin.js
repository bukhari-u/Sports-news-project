class AdminDashboard {
    constructor() {
        this.state = {
            currentSection: 'dashboard',
            currentUser: null,
            users: {
                page: 1,
                limit: 20,
                total: 0,
                search: '',
                filter: ''
            },
            news: {
                page: 1,
                limit: 20,
                total: 0,
                search: '',
                filter: ''
            },
            videos: {
                page: 1,
                limit: 20,
                total: 0,
                search: '',
                filter: ''
            },
            fixtures: {
                page: 1,
                limit: 20,
                total: 0,
                search: '',
                filter: ''
            }
        };
        
        this.init();
    }

    async init() {
        try {
            console.log('🔄 Admin dashboard init started');
            
            // First check if user is logged in
            const response = await fetch('/api/user');
            const data = await response.json();
            
            console.log('🔄 Admin dashboard init - User data:', data);
            
            if (!data.success || !data.user) {
                console.log('❌ No user session, redirecting to login');
                window.location.href = 'admin-login.html';
                return;
            }

            this.state.currentUser = data.user;
            
            // Check if user is admin
            if (!data.user.isAdmin) {
                console.log('❌ User is not admin, redirecting to home');
                this.showError('Admin privileges required');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
                return;
            }
            
            console.log('✅ User is admin, loading dashboard');
            
            // Update admin info in sidebar
            const adminUserName = document.getElementById('adminUserName');
            const adminUserEmail = document.getElementById('adminUserEmail');
            const adminUserAvatar = document.getElementById('adminUserAvatar');
            
            if (adminUserName) adminUserName.textContent = data.user.username;
            if (adminUserEmail) adminUserEmail.textContent = data.user.email;
            if (adminUserAvatar && data.user.username) {
                adminUserAvatar.textContent = data.user.username.charAt(0).toUpperCase();
            }
            
            // Initialize dashboard
            this.setupEventListeners();
            this.setupNavigation();
            
        } catch (error) {
            console.error('❌ Admin dashboard init error:', error);
            window.location.href = 'admin-login.html';
        }
    }

    setupNavigation() {
        // Check URL hash for initial section
        const hash = window.location.hash.substring(1);
        if (hash && document.querySelector(`[data-section="${hash}"]`)) {
            this.switchSection(hash);
        } else {
            // Default to dashboard
            this.switchSection('dashboard');
        }
    }

    switchSection(section) {
        console.log(`🔀 Switching to section: ${section}`);
        this.state.currentSection = section;
        
        // Update active nav item
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === section) {
                item.classList.add('active');
            }
        });

        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        const sectionNames = {
            dashboard: 'Dashboard',
            analytics: 'Analytics',
            users: 'User Management',
            news: 'News Management',
            videos: 'Video Management',
            fixtures: 'Fixture Management',
            settings: 'System Settings',
            backup: 'Backup & Export',
            activity: 'Activity Log'
        };
        if (pageTitle) {
            pageTitle.textContent = sectionNames[section] || 'Dashboard';
        }

        // Load section content
        this.loadSection(section);
    }

    loadSection(section) {
        console.log(`📂 Loading section: ${section}`);
        const content = document.getElementById('adminContent');
        
        if (!content) {
            console.error('❌ adminContent element not found');
            return;
        }
        
        // Show loading
        content.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading ${section}...</p>
            </div>
        `;

        // Load section template
        const template = document.getElementById(`${section}Template`);
        if (template) {
            console.log(`✅ Found template for ${section}`);
            
            // Use setTimeout to ensure DOM is ready
            setTimeout(() => {
                content.innerHTML = template.innerHTML;
                
                // Initialize section-specific functionality
                switch(section) {
                    case 'dashboard':
                        this.loadDashboard();
                        break;
                    case 'users':
                        this.loadUsers();
                        break;
                    case 'news':
                        this.loadNews();
                        break;
                    case 'videos':
                        this.loadVideos();
                        break;
                    case 'fixtures':
                        this.loadFixtures();
                        break;
                    case 'settings':
                        this.loadSettings();
                        break;
                    case 'analytics':
                        this.loadAnalytics();
                        break;
                    case 'activity':
                        this.loadActivity();
                        break;
                    default:
                        console.log(`⚠️ No specific handler for section: ${section}`);
                }
            }, 50);
        } else {
            console.error(`❌ Template not found for section: ${section}`);
            content.innerHTML = `
                <div class="error-state">
                    <h3>Template Not Found</h3>
                    <p>The template for "${section}" section is missing.</p>
                    <p>Please add a template with id="${section}Template" to the HTML.</p>
                    <button onclick="adminDashboard.switchSection('dashboard')" class="btn">
                        Return to Dashboard
                    </button>
                </div>
            `;
        }
    }

    async loadDashboard() {
        try {
            console.log('📊 Loading dashboard data...');
            
            // Check if required elements exist
            const statUsers = document.getElementById('statUsers');
            const statNews = document.getElementById('statNews');
            const statVideos = document.getElementById('statVideos');
            const statFixtures = document.getElementById('statFixtures');
            
            if (!statUsers || !statNews || !statVideos || !statFixtures) {
                console.error('❌ Dashboard stat elements not found');
                return;
            }
            
            // Load statistics
            const statsResponse = await fetch('/api/admin/statistics');
            const statsData = await statsResponse.json();

            if (statsData.success) {
                const stats = statsData.statistics;
                console.log('📊 Dashboard stats:', stats);
                
                // Safely update stats
                if (statUsers) statUsers.textContent = stats.totalUsers.toLocaleString();
                if (statNews) statNews.textContent = stats.totalNews.toLocaleString();
                if (statVideos) statVideos.textContent = stats.totalVideos.toLocaleString();
                if (statFixtures) statFixtures.textContent = stats.totalFixtures.toLocaleString();
            }

            // Load recent activity
            const activityResponse = await fetch('/api/admin/activity');
            const activityData = await activityResponse.json();

            if (activityData.success) {
                const recentUsers = activityData.activity.filter(a => a.type === 'user_signup');
                this.renderRecentUsers(recentUsers);
            }

            // Load activity chart
            this.loadActivityChart('7d');

        } catch (error) {
            console.error('❌ Error loading dashboard:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    renderRecentUsers(users) {
        const tbody = document.getElementById('recentUsersTable');
        if (!tbody) {
            console.error('❌ recentUsersTable element not found');
            return;
        }
        
        console.log(`📋 Rendering ${users.length} recent users`);
        
        // Take only first 5 users
        const recentUsers = users.slice(0, 5);
        
        tbody.innerHTML = recentUsers.map(user => `
            <tr>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar-small">${user.user?.username?.charAt(0)?.toUpperCase() || 'U'}</div>
                        <div class="user-name">${user.user?.username || 'Unknown'}</div>
                    </div>
                </td>
                <td>${user.user?.email || 'N/A'}</td>
                <td><span class="badge user">User</span></td>
                <td>${user.timestamp ? new Date(user.timestamp).toLocaleDateString() : 'N/A'}</td>
                <td><span class="badge active">Active</span></td>
            </tr>
        `).join('');
    }

    async loadActivityChart(period) {
        try {
            const chartContainer = document.getElementById('activityChart');
            if (!chartContainer) {
                console.error('❌ activityChart element not found');
                return;
            }
            
            const response = await fetch(`/api/admin/analytics?period=${period}`);
            const data = await response.json();

            if (data.success) {
                this.renderChart(data.chartData);
            }
        } catch (error) {
            console.error('Error loading chart data:', error);
        }
    }

    renderChart(chartData) {
        const chartContainer = document.getElementById('activityChart');
        if (!chartContainer) return;

        const maxVisits = Math.max(...chartData.map(d => d.visits));
        
        chartContainer.innerHTML = `
            <div class="chart-bars">
                ${chartData.map(day => `
                    <div class="chart-bar-container">
                        <div class="chart-bar" style="height: ${(day.visits / maxVisits) * 100}%"></div>
                        <div class="chart-label">${day.date.split('-')[2]}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async loadUsers() {
        try {
            const { page, limit, search, filter } = this.state.users;
            let url = `/api/admin/users?page=${page}&limit=${limit}`;
            
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (filter) {
                if (filter === 'admin') url += '&isAdmin=true';
                else if (filter === 'active') url += '&isActive=true';
                else if (filter === 'inactive') url += '&isActive=false';
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                this.state.users.total = data.total;
                this.renderUsers(data.users);
                this.updatePagination();
            }
        } catch (error) {
            console.error('Error loading users:', error);
            this.showError('Failed to load users');
        }
    }

    renderUsers(users) {
        const tbody = document.getElementById('usersTable');
        if (!tbody) {
            console.error('❌ usersTable element not found');
            return;
        }

        console.log(`📋 Rendering ${users.length} users`);
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td><input type="checkbox" class="user-checkbox" value="${user._id}"></td>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar-small">${user.username?.charAt(0)?.toUpperCase() || 'U'}</div>
                        <div>
                            <div class="user-name">${user.username || 'Unknown'}</div>
                            <div class="user-id">ID: ${user._id?.substring(0, 8) || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td>${user.email || 'N/A'}</td>
                <td><span class="badge ${user.isAdmin ? 'admin' : 'user'}">${user.isAdmin ? 'Admin' : 'User'}</span></td>
                <td><span class="badge ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" data-id="${user._id}" title="Edit">
                            ✏️
                        </button>
                        <button class="btn-icon delete" data-id="${user._id}" title="Delete">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners to action buttons
        tbody.querySelectorAll('.btn-icon.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.currentTarget.dataset.id;
                this.openEditUserModal(userId);
            });
        });

        tbody.querySelectorAll('.btn-icon.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.currentTarget.dataset.id;
                this.confirmDeleteUser(userId);
            });
        });
    }

    async loadNews() {
        try {
            console.log('📰 Loading news data...');
            const { page, limit, search, filter } = this.state.news;
            let url = `/api/admin/news?page=${page}&limit=${limit}`;
            
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (filter && filter !== 'all') url += `&sport=${filter}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                this.state.news.total = data.total;
                this.renderNews(data.news);
            } else {
                console.error('❌ Failed to load news:', data.message);
                this.showError('Failed to load news: ' + data.message);
            }
        } catch (error) {
            console.error('❌ Error loading news:', error);
            this.showError('Failed to load news');
        }
    }

    renderNews(news) {
        const tbody = document.getElementById('newsTable');
        if (!tbody) {
            console.error('❌ newsTable element not found');
            return;
        }
        
        console.log(`📰 Rendering ${news.length} news articles`);
        
        tbody.innerHTML = news.map(item => `
            <tr>
                <td>
                    <div class="news-title">${item.title || 'Untitled'}</div>
                    <div class="news-excerpt">${(item.excerpt || '').substring(0, 100)}...</div>
                </td>
                <td><span class="badge">${item.sport || 'General'}</span></td>
                <td>${item.league || 'N/A'}</td>
                <td>${item.author || 'Sports Desk'}</td>
                <td>${item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</td>
                <td>${item.views || 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" data-id="${item._id}" title="Edit">
                            ✏️
                        </button>
                        <button class="btn-icon delete" data-id="${item._id}" title="Delete">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadVideos() {
        try {
            console.log('🎥 Loading videos data...');
            const { page, limit, search, filter } = this.state.videos;
            let url = `/api/admin/videos?page=${page}&limit=${limit}`;
            
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (filter && filter !== 'all') url += `&sport=${filter}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                this.state.videos.total = data.total;
                this.renderVideos(data.videos);
            } else {
                console.error('❌ Failed to load videos:', data.message);
                this.showError('Failed to load videos: ' + data.message);
            }
        } catch (error) {
            console.error('❌ Error loading videos:', error);
            this.showError('Failed to load videos');
        }
    }

    renderVideos(videos) {
        const tbody = document.getElementById('videosTable');
        if (!tbody) {
            console.error('❌ videosTable element not found');
            return;
        }
        
        console.log(`🎥 Rendering ${videos.length} videos`);
        
        tbody.innerHTML = videos.map(video => `
            <tr>
                <td>
                    <div class="video-title">${video.title || 'Untitled Video'}</div>
                    <div class="video-desc">${(video.description || '').substring(0, 80)}...</div>
                </td>
                <td><span class="badge">${video.sport || 'General'}</span></td>
                <td>${video.category || 'N/A'}</td>
                <td><span class="badge ${video.type === 'live' ? 'live' : 'highlight'}">
                    ${video.type || 'video'}
                </span></td>
                <td>${video.views || 0}</td>
                <td>${video.duration || 'N/A'}</td>
                <td>${video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" data-id="${video._id}" title="Edit">
                            ✏️
                        </button>
                        <button class="btn-icon delete" data-id="${video._id}" title="Delete">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadFixtures() {
        try {
            console.log('📅 Loading fixtures data...');
            const { page, limit, search, filter } = this.state.fixtures;
            let url = `/api/admin/fixtures?page=${page}&limit=${limit}`;
            
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (filter && filter !== 'all') url += `&sport=${filter}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                this.state.fixtures.total = data.total;
                this.renderFixtures(data.fixtures);
            } else {
                console.error('❌ Failed to load fixtures:', data.message);
                this.showError('Failed to load fixtures: ' + data.message);
            }
        } catch (error) {
            console.error('❌ Error loading fixtures:', error);
            this.showError('Failed to load fixtures');
        }
    }

    renderFixtures(fixtures) {
        const tbody = document.getElementById('fixturesTable');
        if (!tbody) {
            console.error('❌ fixturesTable element not found');
            return;
        }
        
        console.log(`📅 Rendering ${fixtures.length} fixtures`);
        
        tbody.innerHTML = fixtures.map(fixture => `
            <tr>
                <td>
                    <div class="fixture-match">
                        <strong>${fixture.homeTeam?.name || 'Team A'}</strong> vs 
                        <strong>${fixture.awayTeam?.name || 'Team B'}</strong>
                    </div>
                    <small>${fixture.venue || 'Unknown venue'}</small>
                </td>
                <td><span class="badge">${fixture.sport || 'Football'}</span></td>
                <td>${fixture.league || 'N/A'}</td>
                <td>
                    <div>${fixture.date ? new Date(fixture.date).toLocaleDateString() : 'N/A'}</div>
                    <small>${fixture.time || ''}</small>
                </td>
                <td><span class="badge ${fixture.status === 'live' ? 'live' : fixture.status === 'finished' ? 'finished' : 'scheduled'}">
                    ${fixture.status || 'scheduled'}
                </span></td>
                <td>${fixture.round || 'Group Stage'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" data-id="${fixture._id}" title="Edit">
                            ✏️
                        </button>
                        <button class="btn-icon delete" data-id="${fixture._id}" title="Delete">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updatePagination() {
        const { page, limit, total } = this.state.users;
        const totalPages = Math.ceil(total / limit);
        
        const pageInfo = document.getElementById('pageInfo');
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        
        if (pageInfo) pageInfo.textContent = `Page ${page} of ${totalPages}`;
        if (prevPage) prevPage.disabled = page === 1;
        if (nextPage) nextPage.disabled = page === totalPages;
    }

    setupEventListeners() {
        console.log('🔗 Setting up event listeners');
        
        // Navigation
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadCurrentSection();
            });
        }

        // Logout
        const adminLogout = document.getElementById('adminLogout');
        if (adminLogout) {
            adminLogout.addEventListener('click', () => {
                this.logout();
            });
        }

        // Modal close buttons
        const cancelEdit = document.getElementById('cancelEdit');
        if (cancelEdit) {
            cancelEdit.addEventListener('click', () => {
                this.closeModal('editUserModal');
            });
        }

        const cancelNews = document.getElementById('cancelNews');
        if (cancelNews) {
            cancelNews.addEventListener('click', () => {
                this.closeModal('createNewsModal');
            });
        }

        const cancelAction = document.getElementById('cancelAction');
        if (cancelAction) {
            cancelAction.addEventListener('click', () => {
                this.closeModal('confirmModal');
            });
        }

        // Form submissions
        const editUserForm = document.getElementById('editUserForm');
        if (editUserForm) {
            editUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateUser();
            });
        }

        const createNewsForm = document.getElementById('createNewsForm');
        if (createNewsForm) {
            createNewsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createNews();
            });
        }

        const saveSettings = document.getElementById('saveSettings');
        if (saveSettings) {
            saveSettings.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // User management
        const userSearch = document.getElementById('userSearch');
        if (userSearch) {
            userSearch.addEventListener('input', (e) => {
                this.state.users.search = e.target.value;
                this.state.users.page = 1;
                this.loadUsers();
            });
        }

        const userFilter = document.getElementById('userFilter');
        if (userFilter) {
            userFilter.addEventListener('change', (e) => {
                this.state.users.filter = e.target.value;
                this.state.users.page = 1;
                this.loadUsers();
            });
        }

        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                this.openAddUserModal();
            });
        }

        const exportUsersBtn = document.getElementById('exportUsersBtn');
        if (exportUsersBtn) {
            exportUsersBtn.addEventListener('click', () => {
                this.exportUsers();
            });
        }

        // News management
        const newsSearch = document.getElementById('newsSearch');
        if (newsSearch) {
            newsSearch.addEventListener('input', (e) => {
                this.state.news.search = e.target.value;
                this.state.news.page = 1;
                this.loadNews();
            });
        }

        const newsFilter = document.getElementById('newsFilter');
        if (newsFilter) {
            newsFilter.addEventListener('change', (e) => {
                this.state.news.filter = e.target.value;
                this.state.news.page = 1;
                this.loadNews();
            });
        }

        const addNewsBtn = document.getElementById('addNewsBtn');
        if (addNewsBtn) {
            addNewsBtn.addEventListener('click', () => {
                this.openModal('createNewsModal');
            });
        }

        // Video management
        const videoSearch = document.getElementById('videoSearch');
        if (videoSearch) {
            videoSearch.addEventListener('input', (e) => {
                this.state.videos.search = e.target.value;
                this.state.videos.page = 1;
                this.loadVideos();
            });
        }

        const videoFilter = document.getElementById('videoFilter');
        if (videoFilter) {
            videoFilter.addEventListener('change', (e) => {
                this.state.videos.filter = e.target.value;
                this.state.videos.page = 1;
                this.loadVideos();
            });
        }

        const addVideoBtn = document.getElementById('addVideoBtn');
        if (addVideoBtn) {
            addVideoBtn.addEventListener('click', () => {
                this.openModal('createVideoModal');
            });
        }

        // Fixture management
        const fixtureSearch = document.getElementById('fixtureSearch');
        if (fixtureSearch) {
            fixtureSearch.addEventListener('input', (e) => {
                this.state.fixtures.search = e.target.value;
                this.state.fixtures.page = 1;
                this.loadFixtures();
            });
        }

        const fixtureFilter = document.getElementById('fixtureFilter');
        if (fixtureFilter) {
            fixtureFilter.addEventListener('change', (e) => {
                this.state.fixtures.filter = e.target.value;
                this.state.fixtures.page = 1;
                this.loadFixtures();
            });
        }

        const addFixtureBtn = document.getElementById('addFixtureBtn');
        if (addFixtureBtn) {
            addFixtureBtn.addEventListener('click', () => {
                this.openModal('createFixtureModal');
            });
        }

        // Settings tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Activity period change
        const activityPeriod = document.getElementById('activityPeriod');
        if (activityPeriod) {
            activityPeriod.addEventListener('change', (e) => {
                this.loadActivityChart(e.target.value);
            });
        }

        // Pagination
        const prevPage = document.getElementById('prevPage');
        if (prevPage) {
            prevPage.addEventListener('click', () => {
                if (this.state.users.page > 1) {
                    this.state.users.page--;
                    this.loadUsers();
                }
            });
        }

        const nextPage = document.getElementById('nextPage');
        if (nextPage) {
            nextPage.addEventListener('click', () => {
                const totalPages = Math.ceil(this.state.users.total / this.state.users.limit);
                if (this.state.users.page < totalPages) {
                    this.state.users.page++;
                    this.loadUsers();
                }
            });
        }

        // Bulk actions
        const applyBulkAction = document.getElementById('applyBulkAction');
        if (applyBulkAction) {
            applyBulkAction.addEventListener('click', () => {
                this.applyBulkAction();
            });
        }

        // Select all checkbox
        const selectAllUsers = document.getElementById('selectAllUsers');
        if (selectAllUsers) {
            selectAllUsers.addEventListener('change', (e) => {
                this.toggleSelectAllUsers(e.target.checked);
            });
        }
    }

    loadCurrentSection() {
        this.loadSection(this.state.currentSection);
    }

    showError(message) {
        console.error(`❌ ${message}`);
        this.showToast(message, 'error');
    }

    showSuccess(message) {
        console.log(`✅ ${message}`);
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `admin-toast admin-toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 8px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Reset form if exists
            const form = document.getElementById(modalId.replace('Modal', 'Form'));
            if (form) form.reset();
        }
    }

    async logout() {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST'
            });
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Placeholder methods for other functionality
    async updateUser() {
        this.showError('Update user functionality not implemented');
    }

    async createNews() {
        this.showError('Create news functionality not implemented');
    }

    async saveSettings() {
        this.showError('Save settings functionality not implemented');
    }

    async loadSettings() {
        this.showError('Load settings functionality not implemented');
    }

    async loadAnalytics() {
        this.showError('Load analytics functionality not implemented');
    }

    async loadActivity() {
        this.showError('Load activity functionality not implemented');
    }

    async exportUsers() {
        this.showError('Export users functionality not implemented');
    }

    async applyBulkAction() {
        this.showError('Bulk action functionality not implemented');
    }

    toggleSelectAllUsers(checked) {
        const checkboxes = document.querySelectorAll('.user-checkbox');
        checkboxes.forEach(cb => cb.checked = checked);
    }

    switchTab(tab) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            }
        });

        // Show active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tab}Tab`) {
                content.classList.add('active');
            }
        });
    }

    openAddUserModal() {
        this.openModal('editUserModal');
    }

    async openEditUserModal(userId) {
        this.showError('Edit user functionality not implemented');
    }

    confirmDeleteUser(userId) {
        this.showError('Delete user functionality not implemented');
    }
}

// Initialize admin dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Admin dashboard starting...');
    window.adminDashboard = new AdminDashboard();
});

// Add CSS for animations
if (!document.getElementById('admin-animations')) {
    const style = document.createElement('style');
    style.id = 'admin-animations';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .chart-bars {
            display: flex;
            gap: 10px;
            height: 100%;
            align-items: flex-end;
        }
        
        .chart-bar-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 100%;
        }
        
        .chart-bar {
            width: 20px;
            background: linear-gradient(to top, #3b82f6, #60a5fa);
            border-radius: 4px 4px 0 0;
            transition: height 0.3s ease;
        }
        
        .chart-label {
            margin-top: 8px;
            font-size: 12px;
            color: var(--text-secondary);
        }
        
        .user-cell {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .user-avatar-small {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--admin-accent);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
        }
        
        .user-id {
            font-size: 12px;
            color: var(--text-secondary);
        }
        
        .news-title {
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .news-excerpt {
            font-size: 12px;
            color: var(--text-secondary);
            line-height: 1.4;
        }
        
        .video-title {
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .video-desc {
            font-size: 12px;
            color: var(--text-secondary);
            line-height: 1.4;
        }
        
        .fixture-match {
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: var(--text-secondary);
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255,255,255,0.1);
            border-top-color: var(--admin-accent);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        .error-state {
            padding: 40px;
            text-align: center;
            color: var(--admin-danger);
        }
        
        .error-state h3 {
            margin-bottom: 10px;
        }
        
        .error-state p {
            margin-bottom: 20px;
            color: var(--text-secondary);
        }
        
        .badge.live {
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
        }
        
        .badge.finished {
            background: rgba(16, 185, 129, 0.2);
            color: #34d399;
        }
        
        .badge.scheduled {
            background: rgba(107, 114, 128, 0.2);
            color: #9ca3af;
        }
        
        .badge.highlight {
            background: rgba(245, 158, 11, 0.2);
            color: #fbbf24;
        }
    `;
    document.head.appendChild(style);
}