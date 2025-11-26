// auth.js - UPDATED
class AuthApp {
    constructor() {
        this.currentPage = window.location.pathname.split('/').pop();
        this.init();
    }

    init() {
        if (this.currentPage === 'login.html') {
            this.setupLogin();
        } else if (this.currentPage === 'signup.html') {
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
                // User is logged in, redirect to home page
                window.location.href = 'index.html';
            }
            // If not logged in, stay on login/signup page
        } catch (error) {
            console.error('Error checking auth status:', error);
        }
    }

    setupLogin() {
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    setupSignup() {
        const signupForm = document.getElementById('signupForm');
        signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        
        // Real-time password confirmation validation
        const confirmPassword = document.getElementById('confirmPassword');
        confirmPassword.addEventListener('input', () => {
            this.validatePasswordMatch();
        });
    }

    validatePasswordMatch() {
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        const signupBtn = document.getElementById('signupBtn');
        
        if (confirmPassword.value && password.value !== confirmPassword.value) {
            confirmPassword.style.borderColor = 'var(--accent)';
            signupBtn.disabled = true;
            return false;
        } else {
            confirmPassword.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            signupBtn.disabled = false;
            return true;
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');

        if (!email || !password) {
            this.showAlert('Please fill in all fields', 'error');
            return;
        }

        this.setLoading(loginBtn, true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.showAlert('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                this.showAlert(data.message || 'Login failed', 'error');
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
        const confirmPassword = document.getElementById('confirmPassword').value;
        const signupBtn = document.getElementById('signupBtn');

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            this.showAlert('Please fill in all fields', 'error');
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

        if (!this.validatePasswordMatch()) {
            this.showAlert('Passwords do not match', 'error');
            return;
        }

        this.setLoading(signupBtn, true);

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.showAlert('Account created successfully! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
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
        
        // Remove existing alerts
        const existingAlert = alertContainer.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        alertContainer.appendChild(alert);
        
        // Auto-remove success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                alert.remove();
            }, 3000);
        }
    }

    setLoading(button, isLoading) {
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
    new AuthApp();
});