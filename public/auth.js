class AuthApp {
    constructor() {
        this.currentPage = window.location.pathname.split('/').pop();
        this.isAdminPage = this.currentPage.includes('admin');
        this.init();
    }

    init() {
        if (this.currentPage === 'login.html' || this.currentPage === 'admin-login.html') {
            this.setupLogin();
        } else if (this.currentPage === 'signup.html' || this.currentPage === 'admin-signup.html') {
            this.setupSignup();
        }
        
        // Check if user is already logged in
        this.checkAuthStatus();
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/user');
            const data = await response.json();
            
            if (data.success && data.user) {
                // Check if user is trying to access admin pages
                if (this.isAdminPage) {
                    // Verify admin status
                    const adminCheck = await this.checkAdminStatus(data.user.id);
                    if (adminCheck.success && adminCheck.user?.isAdmin) {
                        // Already logged in as admin, redirect to admin dashboard
                        if (window.location.pathname.includes('admin-login.html')) {
                            window.location.href = 'admin.html';
                        }
                    } else {
                        // Not an admin, redirect to regular home
                        this.showAlert('Admin privileges required. Redirecting to home...', 'error');
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 2000);
                    }
                } else if (window.location.pathname.includes('login.html') || 
                          window.location.pathname.includes('signup.html')) {
                    // Already logged in, redirect to home
                    this.showAlert('You are already logged in. Redirecting to home...', 'info');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                }
            } else if (this.isAdminPage && !data.success) {
                // Not logged in but on admin page - show auth forms
                // Stay on page for login
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        }
    }

    async checkAdminStatus(userId) {
        try {
            const response = await fetch(`/api/admin/check-status/${userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return { success: false, isAdmin: false };
        }
    }

    setupLogin() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Setup admin toggle if exists
        const adminToggle = document.getElementById('adminLoginToggle');
        if (adminToggle) {
            adminToggle.addEventListener('change', (e) => this.toggleAdminMode(e.target.checked));
        }
    }

    setupSignup() {
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Real-time password confirmation validation
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => {
                this.validatePasswordMatch();
            });
        }

        // Setup admin toggle if exists
        const adminToggle = document.getElementById('adminSignupToggle');
        if (adminToggle) {
            adminToggle.addEventListener('change', (e) => this.toggleAdminSignupMode(e.target.checked));
        }
    }

    toggleAdminMode(isAdmin) {
        const adminCodeField = document.getElementById('adminCodeField');
        const loginTitle = document.getElementById('loginTitle');
        const loginSubtitle = document.getElementById('loginSubtitle');
        
        if (isAdmin) {
            if (adminCodeField) adminCodeField.style.display = 'block';
            if (loginTitle) loginTitle.textContent = 'Admin Login';
            if (loginSubtitle) loginSubtitle.textContent = 'Access the admin dashboard';
        } else {
            if (adminCodeField) adminCodeField.style.display = 'none';
            if (loginTitle) loginTitle.textContent = 'Welcome Back';
            if (loginSubtitle) loginSubtitle.textContent = 'Sign in to your All Sports account';
        }
    }

    toggleAdminSignupMode(isAdmin) {
        const adminCodeField = document.getElementById('adminCodeField');
        const signupTitle = document.getElementById('signupTitle');
        const signupSubtitle = document.getElementById('signupSubtitle');
        
        if (isAdmin) {
            if (adminCodeField) adminCodeField.style.display = 'block';
            if (signupTitle) signupTitle.textContent = 'Admin Registration';
            if (signupSubtitle) signupSubtitle.textContent = 'Register for admin access';
        } else {
            if (adminCodeField) adminCodeField.style.display = 'none';
            if (signupTitle) signupTitle.textContent = 'Create Account';
            if (signupSubtitle) signupSubtitle.textContent = 'Join All Sports to get personalized updates';
        }
    }

    validatePasswordMatch() {
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        const signupBtn = document.getElementById('signupBtn');
        
        if (!password || !confirmPassword) return true;
        
        if (confirmPassword.value && password.value !== confirmPassword.value) {
            confirmPassword.style.borderColor = 'var(--accent)';
            if (signupBtn) signupBtn.disabled = true;
            return false;
        } else {
            confirmPassword.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            if (signupBtn) signupBtn.disabled = false;
            return true;
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const adminCode = document.getElementById('adminCode')?.value;
        const isAdminMode = document.getElementById('adminLoginToggle')?.checked || false;
        const loginBtn = document.getElementById('loginBtn');

        if (!email || !password) {
            this.showAlert('Please fill in all fields', 'error');
            return;
        }

        // Admin login validation
        if (isAdminMode && !adminCode) {
            this.showAlert('Admin access code is required for admin login', 'error');
            return;
        }

        this.setLoading(loginBtn, true);

        try {
            let response;
            let data;

            if (isAdminMode) {
                // Use admin login endpoint
                response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password, adminCode })
                });
                
                data = await response.json();
                
                if (data.success) {
                    console.log('✅ Admin login successful:', data.user);
                    this.showAlert('Admin login successful! Redirecting to dashboard...', 'success');
                    setTimeout(() => {
                        window.location.href = 'admin.html';
                    }, 1000);
                } else {
                    this.showAlert(data.message || 'Admin login failed', 'error');
                }
            } else {
                // Use regular login endpoint
                response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });

                data = await response.json();

                if (data.success) {
                    console.log('✅ User login successful:', data.user);
                    this.showAlert('Login successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    this.showAlert(data.message || 'Login failed', 'error');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert('Network error. Please try again.', 'error');
        } finally {
            this.setLoading(loginBtn, false);
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        const adminCode = document.getElementById('adminCode')?.value;
        const isAdminMode = document.getElementById('adminSignupToggle')?.checked || false;
        const signupBtn = document.getElementById('signupBtn');

        // Validation
        if (!username || !email || !password) {
            this.showAlert('Please fill in all fields', 'error');
            return;
        }

        if (confirmPassword && !this.validatePasswordMatch()) {
            this.showAlert('Passwords do not match', 'error');
            return;
        }

        if (username.length < 3) {
            this.showAlert('Username must be at least 3 characters long', 'error');
            return;
        }

        if (password.length < 6) {
            this.showAlert('Password must be at least 6 characters long', 'error');
            return;
        }

        // Admin signup validation
        if (isAdminMode) {
            if (!adminCode) {
                this.showAlert('Admin invitation code is required', 'error');
                return;
            }
        }

        this.setLoading(signupBtn, true);

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    username, 
                    email, 
                    password,
                    adminCode: isAdminMode ? adminCode : undefined
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showAlert('Account created successfully!', 'success');
                
                // Auto-login after signup
                setTimeout(async () => {
                    const loginResponse = await fetch('/api/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email, password })
                    });

                    const loginData = await loginResponse.json();
                    
                    if (loginData.success) {
                        if (isAdminMode) {
                            this.showAlert('Admin account created! Redirecting to admin dashboard...', 'success');
                            setTimeout(() => {
                                window.location.href = 'admin.html';
                            }, 1500);
                        } else {
                            this.showAlert('Account created! Redirecting to home page...', 'success');
                            setTimeout(() => {
                                window.location.href = 'index.html';
                            }, 1500);
                        }
                    } else {
                        this.showAlert('Auto-login failed. Please login manually.', 'error');
                        setTimeout(() => {
                            if (isAdminMode) {
                                window.location.href = 'login.html';
                            } else {
                                window.location.href = 'login.html';
                            }
                        }, 1500);
                    }
                }, 1500);
                
            } else {
                this.showAlert(data.message || 'Signup failed', 'error');
            }
        } catch (error) {
            console.error('Signup error:', error);
            this.showAlert('Network error. Please try again.', 'error');
        } finally {
            this.setLoading(signupBtn, false);
        }
    }

    showAlert(message, type) {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) {
            // Create alert container if it doesn't exist
            const container = document.createElement('div');
            container.id = 'alertContainer';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
        
        const finalContainer = document.getElementById('alertContainer');
        
        // Remove existing alerts
        const existingAlert = finalContainer.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        alert.style.cssText = `
            padding: 12px 24px;
            border-radius: 8px;
            background: ${type === 'success' ? '#10b981' : 
                        type === 'error' ? '#ef4444' : 
                        type === 'info' ? '#3b82f6' : '#6b7280'};
            color: white;
            margin-bottom: 10px;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        
        finalContainer.appendChild(alert);
        
        // Auto-remove success messages after 3 seconds
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                alert.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => alert.remove(), 300);
            }, 3000);
        }

        // Add CSS for animations if not already present
        if (!document.getElementById('alert-animations')) {
            const style = document.createElement('style');
            style.id = 'alert-animations';
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
            `;
            document.head.appendChild(style);
        }
    }

    setLoading(button, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
            const originalText = button.textContent;
            button.setAttribute('data-original-text', originalText);
            button.textContent = 'Processing...';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.textContent = originalText;
            }
        }
    }
}

// Initialize the auth app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authApp = new AuthApp();
});