class ActivityLog {
    constructor() {
        this.isModalOpen = false;
        this.sessions = [];
        
        this.initializeElements();
        this.bindEvents();
        this.loadSessions();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.toggleBtn = document.getElementById('log-toggle-btn');
        this.modal = document.getElementById('activity-log-modal');
        this.todayTotal = document.getElementById('today-total');
        this.currentSession = document.getElementById('current-session');
        this.sessionHistory = document.getElementById('session-history');
        this.clearHistoryBtn = document.getElementById('clear-history-btn');
    }
    
    bindEvents() {
        // Toggle modal
        this.toggleBtn.addEventListener('click', () => {
            this.toggleModal();
        });
        
        // Clear history
        this.clearHistoryBtn.addEventListener('click', () => {
            this.clearHistory();
        });
        
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.modal.contains(e.target) && !this.toggleBtn.contains(e.target)) {
                this.closeModal();
            }
        });
    }
    
    toggleModal() {
        if (this.isModalOpen) {
            this.closeModal();
        } else {
            this.openModal();
        }
    }
    
    openModal() {
        this.modal.style.display = 'block';
        this.isModalOpen = true;
        this.updateDisplay();
    }
    
    closeModal() {
        this.modal.style.display = 'none';
        this.isModalOpen = false;
    }
    
    addSession(duration, startTime) {
        const session = {
            id: Date.now(),
            duration: duration,
            startTime: startTime,
            endTime: new Date().toISOString(),
            date: new Date().toDateString()
        };
        
        this.sessions.unshift(session); // Add to beginning
        this.saveSessions();
        this.updateDisplay();
    }
    
    updateDisplay() {
        // Update today's total
        const today = new Date().toDateString();
        const todaySessions = this.sessions.filter(session => session.date === today);
        const todayTotal = todaySessions.reduce((total, session) => total + session.duration, 0);
        
        this.todayTotal.textContent = this.formatTime(todayTotal);
        
        // Update current session (if timer is running)
        if (window.productivityTimer && window.productivityTimer.isRunning) {
            const currentSessionTime = window.productivityTimer.currentSessionTime;
            this.currentSession.textContent = this.formatTime(currentSessionTime);
        } else {
            this.currentSession.textContent = '00:00:00';
        }
        
        // Update session history
        this.updateSessionHistory();
    }
    
    updateSessionHistory() {
        this.sessionHistory.innerHTML = '';
        
        // Show last 10 sessions
        const recentSessions = this.sessions.slice(0, 10);
        
        recentSessions.forEach(session => {
            const sessionItem = document.createElement('div');
            sessionItem.className = 'session-item';
            
            const startTime = new Date(session.startTime);
            const timeString = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            sessionItem.innerHTML = `
                <span class="session-time">${timeString}</span>
                <span class="session-duration">${this.formatTime(session.duration)}</span>
            `;
            
            this.sessionHistory.appendChild(sessionItem);
        });
        
        if (recentSessions.length === 0) {
            this.sessionHistory.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">No sessions yet</div>';
        }
    }
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }
    
    saveSessions() {
        localStorage.setItem('activitySessions', JSON.stringify(this.sessions));
    }
    
    loadSessions() {
        const savedSessions = localStorage.getItem('activitySessions');
        if (savedSessions) {
            this.sessions = JSON.parse(savedSessions);
        }
    }
    
    clearHistory() {
        if (confirm('Are you sure you want to clear all session history?')) {
            this.sessions = [];
            this.saveSessions();
            this.updateDisplay();
        }
    }
    
    // Method to be called when timer stops
    onTimerStop(duration, startTime) {
        this.addSession(duration, startTime);
    }
}

// Initialize activity log when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.activityLog = new ActivityLog();
}); 