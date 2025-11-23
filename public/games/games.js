/**
 * AllSports - Complete Sports Website JavaScript
 * Enhanced with comprehensive sports follow functionality including unfollow
 * ALL EXISTING FEATURES PRESERVED
 */

// Global variables
let currentUser = null;
let searchDebounceTimer = null;
let mockNewsData = [];
let mockUsers = [];
let scrollTimer = null;
let followedSports = [];

// Mock database functions
const Database = {
  // Initialize mock database
  init: function() {
    // Check if users exist in localStorage
    const storedUsers = localStorage.getItem('allsports_users');
    if (!storedUsers) {
      // Create initial mock users
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

    // Check if current session exists
    const currentSession = localStorage.getItem('allsports_current_user');
    if (currentSession) {
      currentUser = JSON.parse(currentSession);
    }

    // Load followed sports from localStorage for demo
    const storedFollowedSports = localStorage.getItem('allsports_followed_sports');
    if (storedFollowedSports) {
      followedSports = JSON.parse(storedFollowedSports);
    }
  },

  // Get all users
  getUsers: function() {
    return JSON.parse(localStorage.getItem('allsports_users') || '[]');
  },

  // Save users
  saveUsers: function(users) {
    localStorage.setItem('allsports_users', JSON.stringify(users));
  },

  // Find user by credentials
  findUserByCredentials: function(email, password) {
    const users = this.getUsers();
    return users.find(user => user.email === email && user.password === password);
  },

  // Find user by email
  findUserByEmail: function(email) {
    const users = this.getUsers();
    return users.find(user => user.email === email);
  },

  // Create new user
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

  // Update user
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

  // Set current user session
  setCurrentUser: function(user) {
    currentUser = user;
    if (user) {
      localStorage.setItem('allsports_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('allsports_current_user');
    }
  },

  // Get current user
  getCurrentUser: function() {
    const storedUser = localStorage.getItem('allsports_current_user');
    return storedUser ? JSON.parse(storedUser) : null;
  },

  // Clear current user session
  clearCurrentUser: function() {
    currentUser = null;
    localStorage.removeItem('allsports_current_user');
  },

  // Save followed sports to localStorage for demo
  saveFollowedSports: function(sports) {
    followedSports = sports;
    localStorage.setItem('allsports_followed_sports', JSON.stringify(sports));
  },

  // Get followed sports from localStorage for demo
  getFollowedSports: function() {
    return followedSports;
  }
};

// Authentication Manager
const AuthManager = {
  // Login function
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
      }, 1000); // Simulate API delay
    });
  },

  // Register function
  register: function(userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if user already exists
        const existingUser = Database.findUserByEmail(userData.email);
        if (existingUser) {
          reject({
            success: false,
            message: 'User with this email already exists'
          });
          return;
        }

        // Create new user
        const newUser = Database.createUser(userData);
        Database.setCurrentUser(newUser);
        currentUser = newUser;
        
        resolve({
          success: true,
          user: newUser,
          message: 'Registration successful!'
        });
      }, 1000); // Simulate API delay
    });
  },

  // Logout function
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

  // Check if user is authenticated
  isAuthenticated: function() {
    return currentUser !== null;
  },

  // Get current user
  getCurrentUser: function() {
    return currentUser;
  },

  // Update user profile
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

// Sports Manager with Database Integration
const SportsManager = {
  // Follow a sport with database integration
  followSport: async function(sportId, sportName, icon = '🏆', category = 'General') {
    try {
      // First try to use the actual API endpoint
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
              // Update local state
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

      // Fallback to localStorage if API fails or no user
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

  // Unfollow a sport with database integration
  unfollowSport: async function(sportId) {
    try {
      // First try to use the actual API endpoint
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
              // Update local state
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

      // Fallback to localStorage if API fails or no user
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

  // Get followed sports with database integration
  getFollowedSports: async function() {
    try {
      // First try to use the actual API endpoint
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

      // Fallback to localStorage if API fails or no user
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

  // Get all available sports
  getAllSports: async function() {
    try {
      // Try to use the actual API endpoint
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

      // Fallback to mock data
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

  // Check if sport is followed
  isSportFollowed: function(sportId) {
    return followedSports.some(sport => sport.sportId === sportId);
  },

  // Update followed sports cache
  updateFollowedSportsCache: function(sports) {
    followedSports = sports || [];
    Database.saveFollowedSports(sports);
  }
};

// Login Page Handler
class LoginPageHandler {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkExistingSession();
  }

  setupEventListeners() {
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Registration form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }

    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Password visibility toggle
    const toggleButtons = document.querySelectorAll('.password-toggle');
    toggleButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.togglePasswordVisibility(e.target);
      });
    });

    // Enter key support
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
      // User is already logged in, redirect to home page
      this.redirectToHome();
    }
  }

  async handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe') ? document.getElementById('rememberMe').checked : false;

    // Basic validation
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
        
        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem('allsports_remember_me', 'true');
        } else {
          localStorage.removeItem('allsports_remember_me');
        }

        // Redirect to home page after successful login
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

    // Validation
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
        
        // Redirect to home page after successful registration
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
    // Update active tab button
    document.querySelectorAll('.tab-button').forEach(button => {
      button.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update active form
    document.querySelectorAll('.auth-form').forEach(form => {
      form.classList.remove('active');
    });
    document.getElementById(`${tabName}Form`).classList.add('active');

    // Reset forms
    this.resetForms();
  }

  resetForms() {
    // Clear all form fields
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(form => {
      form.reset();
    });

    // Hide any messages
    this.hideMessage();
  }

  togglePasswordVisibility(button) {
    const input = button.previousElementSibling;
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    
    // Update button text
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
    // Remove existing message
    this.hideMessage();

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message auth-message-${type}`;
    messageDiv.innerHTML = `
      <span class="auth-message-text">${message}</span>
      <button class="auth-message-close" onclick="this.parentElement.remove()">×</button>
    `;

    // Add to page
    const authContainer = document.querySelector('.auth-container');
    if (authContainer) {
      authContainer.insertBefore(messageDiv, authContainer.firstChild);

      // Auto-remove after 5 seconds
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

// Main AllSportsApp Class
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
        
        // Initialize page-specific functionality
        this.initPageSpecific();
        
        // Load and initialize sports follow functionality
        await this.initSportsFollowFunctionality();
        
        // Initialize hero follow button
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
        // Initialize login page handler
        new LoginPageHandler();
    }

    // NEW: Initialize hero follow button
    initHeroFollowButton() {
        const heroFollowBtn = document.getElementById('footballFollowBtn');
        if (heroFollowBtn) {
            const sportId = heroFollowBtn.getAttribute('data-sport-id');
            const isFollowed = this.isSportFollowed(sportId);
            
            // Set initial state
            this.updateHeroFollowButton(heroFollowBtn, isFollowed);
            
            // Add click event
            heroFollowBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleHeroFollowClick(heroFollowBtn);
            });
        }
    }

    // NEW: Handle hero follow button click
    async handleHeroFollowClick(button) {
        if (!this.state.user) {
            this.showToast('Please log in to follow sports', 'error');
            // Optionally redirect to login page
            // window.location.href = 'login.html';
            return;
        }

        const sportId = button.getAttribute('data-sport-id');
        const sportName = button.getAttribute('data-sport-name');
        const sportIcon = button.getAttribute('data-sport-icon');
        const isCurrentlyFollowed = this.isSportFollowed(sportId);

        // Add loading state
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
                
                // Add animation
                button.classList.add('animating');
                setTimeout(() => button.classList.remove('animating'), 500);
                
                // Update button state
                this.updateHeroFollowButton(button, !isCurrentlyFollowed);
                
                // Reload followed sports to get updated list
                await this.loadFollowedSports();
                
                // Update all sport follow buttons
                this.updateSportFollowButtons();
                
                // Update sports widget if it exists
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

    // NEW: Update hero follow button appearance
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
                // Fallback to localStorage
                const user = Database.getCurrentUser();
                if (user) {
                    this.state.user = user;
                    console.log('User authenticated from localStorage:', user.username);
                }
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            // Fallback to localStorage
            const user = Database.getCurrentUser();
            if (user) {
                this.state.user = user;
            }
        }
    }

    setupEventListeners() {
        // Initialize all core functionality
        this.initDropdowns();
        this.initMobileMenu();
        this.initScrollEffects();
        this.initSearchFunctionality();
        this.initCarousel();
        this.initUserPreferences();
        
        // Enhanced card interactions
        this.enhanceCards();
        
        // Live scores updates
        this.updateLiveScores();
        
        // News ticker
        this.initTicker();
    }

    // Initialize sports follow functionality
    async initSportsFollowFunctionality() {
        // Load followed sports
        await this.loadFollowedSports();
        
        // Add follow buttons to sports dropdown
        this.addFollowButtonsToSports();
        
        // Add sports follow section to user profile/dashboard
        this.addSportsFollowSection();
    }

    // Load followed sports
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

    // Add follow buttons to sports dropdown
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

    // Add follow button to desktop sport item
    addFollowButtonToSportItem(sportItem) {
        const sportLink = sportItem.querySelector('a');
        if (!sportLink) return;
        
        const sportName = sportLink.textContent.trim();
        const sportIcon = sportLink.querySelector('.sport-icon')?.textContent || '🏆';
        const sportHref = sportLink.getAttribute('href');
        const sportId = sportHref ? sportHref.replace('.html', '') : sportName.toLowerCase();
        
        // Create follow button
        const followButton = document.createElement('button');
        followButton.className = 'sport-follow-btn';
        followButton.setAttribute('data-sport-id', sportId);
        followButton.setAttribute('data-sport-name', sportName);
        followButton.setAttribute('data-sport-icon', sportIcon);
        
        const isFollowed = this.isSportFollowed(sportId);
        this.updateFollowButtonAppearance(followButton, isFollowed);
        
        // Add click event
        followButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleSportFollowClick(followButton);
        });
        
        // Add to sport item
        sportItem.appendChild(followButton);
    }

    // Add follow button to mobile sport item
    addFollowButtonToMobileSportItem(sportItem) {
        const sportLink = sportItem.querySelector('a');
        if (!sportLink) return;
        
        const sportName = sportLink.textContent.trim();
        const sportIcon = sportLink.querySelector('.sport-icon')?.textContent || sportLink.textContent.charAt(0);
        const sportHref = sportLink.getAttribute('href');
        const sportId = sportHref ? sportHref.replace('.html', '') : sportName.toLowerCase();
        
        // Create follow button
        const followButton = document.createElement('button');
        followButton.className = 'sport-follow-btn mobile';
        followButton.setAttribute('data-sport-id', sportId);
        followButton.setAttribute('data-sport-name', sportName);
        followButton.setAttribute('data-sport-icon', sportIcon);
        
        const isFollowed = this.isSportFollowed(sportId);
        this.updateFollowButtonAppearance(followButton, isFollowed);
        
        // Add click event
        followButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleSportFollowClick(followButton);
        });
        
        // Add to sport item
        sportItem.appendChild(followButton);
    }

    // Handle sport follow button click
    async handleSportFollowClick(button) {
        if (!this.state.user) {
            this.showToast('Please log in to follow sports', 'error');
            return;
        }

        const sportId = button.getAttribute('data-sport-id');
        const sportName = button.getAttribute('data-sport-name');
        const sportIcon = button.getAttribute('data-sport-icon');
        const isCurrentlyFollowed = this.isSportFollowed(sportId);

        // Add loading state
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
                // Reload followed sports to get updated list
                await this.loadFollowedSports();
                // Update all sport follow buttons
                this.updateSportFollowButtons();
                // Update sports widget if it exists
                this.updateSportsWidget();
            } else {
                this.showToast(result.message, 'error');
                // Revert button appearance on error
                this.updateFollowButtonAppearance(button, isCurrentlyFollowed);
            }
        } catch (error) {
            console.error('Error handling sport follow:', error);
            this.showToast('Error updating sport follow status', 'error');
            // Revert button appearance on error
            this.updateFollowButtonAppearance(button, isCurrentlyFollowed);
        } finally {
            button.classList.remove('loading');
        }
    }

    // Check if sport is followed
    isSportFollowed(sportId) {
        return followedSports.some(sport => sport.sportId === sportId);
    }

    // Update follow button appearance
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

    // Update all sport follow buttons
    updateSportFollowButtons() {
        // Update dropdown buttons
        const followButtons = document.querySelectorAll('.sport-follow-btn');
        followButtons.forEach(button => {
            const sportId = button.getAttribute('data-sport-id');
            const isFollowed = this.isSportFollowed(sportId);
            this.updateFollowButtonAppearance(button, isFollowed);
        });

        // Update hero button
        const heroFollowBtn = document.getElementById('footballFollowBtn');
        if (heroFollowBtn) {
            const sportId = heroFollowBtn.getAttribute('data-sport-id');
            const isFollowed = this.isSportFollowed(sportId);
            this.updateHeroFollowButton(heroFollowBtn, isFollowed);
        }

        // Also update management modal buttons if open
        const toggleButtons = document.querySelectorAll('.follow-toggle-btn');
        toggleButtons.forEach(button => {
            const sportId = button.getAttribute('data-sport-id');
            const isFollowed = this.isSportFollowed(sportId);
            this.updateToggleButtonAppearance(button, isFollowed);
        });
    }

    // Update toggle button appearance in management modal
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

    // Add sports follow section to user profile
    addSportsFollowSection() {
        // This would be added to a user profile or dashboard page
        // For now, we'll add it to the main page if user is logged in
        if (this.state.user && this.currentPage === 'home') {
            this.createSportsFollowWidget();
        }
    }

    // Create sports follow widget
    createSportsFollowWidget() {
        const rightColumn = document.querySelector('.right-column');
        if (!rightColumn) return;

        // Check if widget already exists
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

        // Insert after the first widget
        const firstWidget = rightColumn.querySelector('.widget');
        if (firstWidget) {
            rightColumn.insertBefore(sportsWidget, firstWidget.nextSibling);
        } else {
            rightColumn.prepend(sportsWidget);
        }

        // Add event listeners
        this.setupSportsWidgetEvents();
    }

    // Setup sports widget events
    setupSportsWidgetEvents() {
        // Unfollow buttons
        const unfollowButtons = document.querySelectorAll('.unfollow-btn');
        unfollowButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                const sportId = button.getAttribute('data-sport-id');
                const sportName = button.getAttribute('data-sport-name');
                await this.handleSportUnfollow(sportId, sportName);
            });
        });

        // Manage sports button
        const manageSportsBtn = document.getElementById('manageSportsBtn');
        if (manageSportsBtn) {
            manageSportsBtn.addEventListener('click', () => {
                this.showSportsManagementModal();
            });
        }
    }

    // Handle sport unfollow from widget
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

    // Update sports widget
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

                // Reattach event listeners
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

    // Show sports management modal
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

        // Add event listeners
        this.setupSportsManagementEvents();
    }

    // Setup sports management modal events
    setupSportsManagementEvents() {
        // Follow toggle buttons
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

        // Search functionality
        const sportsSearch = document.getElementById('sportsSearch');
        if (sportsSearch) {
            sportsSearch.addEventListener('input', (e) => {
                this.filterSportsManagement(e.target.value);
            });
        }
    }

    // Filter sports in management modal
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

    // Update sports management modal
    updateSportsManagementModal() {
        const sportItems = document.querySelectorAll('.sport-management-item');
        sportItems.forEach(item => {
            const sportId = item.getAttribute('data-sport-id');
            const isFollowed = this.isSportFollowed(sportId);
            const button = item.querySelector('.follow-toggle-btn');

            item.classList.toggle('followed', isFollowed);
            this.updateToggleButtonAppearance(button, isFollowed);
        });

        // Update stats
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

    // Dropdown functionality
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
        
        // Close user dropdown
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.classList.remove('active');
        }
    }

    // Mobile menu functionality
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

    // Scroll effects
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

    // Search functionality
    initSearchFunctionality() {
        const searchInput = document.getElementById('searchInput');
        const mobileSearchInput = document.getElementById('mobileSearchInput');
        
        // Create search results container if it doesn't exist
        if (!document.getElementById('searchResults')) {
            const searchContainer = document.querySelector('.search');
            if (searchContainer) {
                const searchResults = document.createElement('div');
                searchResults.id = 'searchResults';
                searchResults.className = 'search-results';
                searchContainer.appendChild(searchResults);
            }
        }
        
        // Main search input
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
        
        // Mobile search input
        if (mobileSearchInput) {
            mobileSearchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            mobileSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                    AllSportsApp.closeMobileMenu();
                    mobileSearchInput.blur();
                    // Transfer focus to main search input
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

        // Initialize mock data if not already done
        if (mockNewsData.length === 0) {
            mockNewsData = this.getMockNewsData();
        }

        // Filter news based on advanced search algorithm
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

            // Calculate relevance score for each search term
            searchTerms.forEach(term => {
                // Exact matches get highest score
                if (fields.title === term) score += 10;
                if (fields.sport === term) score += 8;
                if (fields.league === term) score += 7;
                if (fields.homeTeam === term || fields.awayTeam === term) score += 9;
                
                // Word boundary matches
                const wordBoundaryRegex = new RegExp(`\\b${term}\\b`, 'gi');
                
                if (wordBoundaryRegex.test(item.title)) score += 6;
                if (wordBoundaryRegex.test(item.sport)) score += 5;
                if (wordBoundaryRegex.test(item.league)) score += 4;
                if (wordBoundaryRegex.test(item.teams?.home || '')) score += 5;
                if (wordBoundaryRegex.test(item.teams?.away || '')) score += 5;
                if (wordBoundaryRegex.test(item.excerpt)) score += 3;
                if (wordBoundaryRegex.test(item.venue || '')) score += 2;
                
                // Partial matches
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
            if (daysAgo < 1) score += 2;
            else if (daysAgo < 7) score += 1;

            return { ...item, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);

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
                            ${item.status ? `<span class="search-result-status ${item.status.toLowerCase()}">${item.status}</span>` : ''}
                        </div>
                        <div class="search-result-excerpt">${this.highlightTerms(item.excerpt, searchTerms)}</div>
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
                    const article = mockNewsData.find(a => a._id === articleId);
                    if (article) {
                        this.openArticleModal(article);
                        this.hideSearchResults();
                        
                        // Clear search input
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
            
            // Show search results page or filter content
            this.showToast(`Searching for: ${query}`);
            
            // Update search input in mobile if needed
            const mobileSearchInput = document.getElementById('mobileSearchInput');
            if (mobileSearchInput && mobileSearchInput.value !== query) {
                mobileSearchInput.value = query;
            }
        }
    }

    // Carousel functionality
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

    // Live scores functionality
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

    // Card enhancement
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

    // Ticker functionality
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

    // User preferences
    initUserPreferences() {
        if (this.state.user) {
            const preferences = this.state.user.preferences || {
                favoriteSports: [],
                favoriteTeams: [],
                notifications: true,
                theme: 'dark'
            };
            
            // Apply theme
            document.documentElement.setAttribute('data-theme', preferences.theme);
        }
    }

    // Authentication and user management
    updateLoginUI() {
        const loginBtn = document.getElementById('loginBtn');
        const mobileLoginBtn = document.getElementById('mobileLoginBtn');
        
        if (this.state.user) {
            // Update desktop header - show username with hover dropdown
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
            
            // Update mobile header
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
            // Not logged in - show login button with hover redirect
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
                // Show on hover
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
                
                // Update UI
                const app = new AllSportsApp();
                app.state.user = null;
                app.updateLoginUI();
                
                // Redirect to home page after a short delay
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1000);
            }
        } catch (error) {
            console.error('Logout error:', error);
            AllSportsApp.showToast('Error during logout', 'error');
        }
    }

    // Modal functionality
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

    // Toast notification
    static showToast(message, type = 'success') {
        // Create toast element if it doesn't exist
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

    // Format date utility
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

    // Mock data
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

    // Additional methods for page-specific functionality
    async loadInitialData() {
        // Simulate API call
        return new Promise(resolve => {
            setTimeout(() => {
                mockNewsData = this.getMockNewsData();
                this.state.news = mockNewsData;
                resolve();
            }, 1000);
        });
    }

    startLiveUpdates() {
        // Start live updates for scores and news
        setInterval(() => {
            this.updateLiveScores();
        }, 15000);
    }

    initializeLeagueFilters() {
        // Initialize league filter options
        console.log('League filters initialized');
    }

    applyUserPreferences() {
        // Apply user preferences to the UI
        if (this.state.userPreferences.theme) {
            document.documentElement.setAttribute('data-theme', this.state.userPreferences.theme);
        }
    }

    setupBackToTop() {
        // Setup back to top button functionality
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
        // Setup follow/unfollow functionality for teams and players
        console.log('Follow functionality initialized');
    }

    // Page-specific initialization methods
    initScoresPage() {
        console.log('Initializing scores page');
        // Scores page specific functionality
    }

    initWatchPage() {
        console.log('Initializing watch page');
        // Watch page specific functionality
    }

    initTeamsPage() {
        console.log('Initializing teams page');
        // Teams page specific functionality
    }

    initFixturesPage() {
        console.log('Initializing fixtures page');
        // Fixtures page specific functionality
    }

    // Helper method to show toast
    showToast(message, type = 'success') {
        AllSportsApp.showToast(message, type);
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log("AllSports site loaded");

    // Check if we're on login page
    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (isLoginPage) {
        // Initialize login page handler
        new LoginPageHandler();
    } else {
        // Initialize the main app
        const app = new AllSportsApp();
        app.init();
    }
});

// Make methods available globally for HTML onclick handlers
window.AllSportsApp = AllSportsApp;
window.closeMobileMenu = AllSportsApp.closeMobileMenu;
window.toggleMobileDropdown = AllSportsApp.toggleMobileDropdown;