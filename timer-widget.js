class ProductivityTimer {
        constructor() {
        this.totalWorkTime = 0; // Total accumulated work time
        this.currentSessionTime = 0; // Current session time
        this.isRunning = false;
        this.interval = null;
        this.sessionStartTime = null;

        this.initializeElements();
        this.bindEvents();
        this.loadWorkTime();
        this.updateDisplay();
        
        setInterval(() => {
            if (this.isRunning) {
                this.saveWorkTime();
            }
        }, 30000);
    }
    
    initializeElements() {
        this.timerTime = document.getElementById('timer-time');
        this.playBtn = document.getElementById('play-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.motivationBubble = document.getElementById('motivation-bubble');
        this.motivationText = document.getElementById('motivation-text');
        this.lockinBubble = document.querySelector('.lockin-bubble');
    }
    
    bindEvents() {
        this.playBtn.addEventListener('click', () => this.toggleTimer());
        this.stopBtn.addEventListener('click', () => this.stopTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
    }
    
    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }
    
    startTimer() {
        this.isRunning = true;
        this.sessionStartTime = Date.now();
        this.updatePlayButton();
        
        // Show motivational message and hide lockin bubble when timer starts
        this.showMotivationMessage();
        this.hideLockinBubble();
        
        // Start music when timer starts
        if (window.musicController) {
            window.musicController.startMusic();
        }
        
        // Hide motivational message after 3 minutes (180 seconds)
        this.motivationTimeout = setTimeout(() => {
            this.hideMotivationMessage();
        }, 180000); // 3 minutes in milliseconds
        
        this.interval = setInterval(() => {
            this.currentSessionTime++;
            this.updateDisplay();
            
            // Check for 25-minute break reminder
            if (this.currentSessionTime === 1500) { // 25 minutes = 1500 seconds
                this.showBreakReminder();
            }
        }, 1000);
    }
    
    pauseTimer() {
        this.isRunning = false;
        this.updatePlayButton();
        clearInterval(this.interval);
        
        // Save the current session time to total
        this.totalWorkTime += this.currentSessionTime;
        this.saveWorkTime();
    }
    
    stopTimer() {
        this.isRunning = false;
        this.updatePlayButton();
        clearInterval(this.interval);
        
        // Clear the motivation timeout if it exists
        if (this.motivationTimeout) {
            clearTimeout(this.motivationTimeout);
            this.motivationTimeout = null;
        }
        
        // Hide motivational message and show lockin bubble when timer stops
        this.hideMotivationMessage();
        this.showLockinBubble();
        
        // Save current session to total before resetting
        this.totalWorkTime += this.currentSessionTime;
        
        // Log the session to activity log
        if (window.activityLog && this.currentSessionTime > 0) {
            window.activityLog.onTimerStop(this.currentSessionTime, this.sessionStartTime);
        }
        
        this.currentSessionTime = 0;
        this.saveWorkTime();
        this.updateDisplay();
    }
    
    updateDisplay() {
        const totalSeconds = this.totalWorkTime + this.currentSessionTime;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        // Always show HH:MM:SS format
        this.timerTime.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updatePlayButton() {
        if (this.isRunning) {
            // Show pause icon
            this.playBtn.classList.add('paused');
            this.playBtn.querySelector('svg').innerHTML = `
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" stroke="#FCFCFC" stroke-width="1.125" fill="none"/>
            `;
        } else {
            // Show play icon
            this.playBtn.classList.remove('paused');
            this.playBtn.querySelector('svg').innerHTML = `
                <path d="M8 5v14l11-7z" stroke="#FCFCFC" stroke-width="1.125" fill="none"/>
            `;
        }
    }
    
    saveWorkTime() {
        localStorage.setItem('totalWorkTime', this.totalWorkTime.toString());
        localStorage.setItem('currentSessionTime', this.currentSessionTime.toString());
        localStorage.setItem('isRunning', this.isRunning.toString());
        localStorage.setItem('sessionStartTime', this.sessionStartTime ? this.sessionStartTime.toString() : '');
        localStorage.setItem('lastWorkDate', new Date().toDateString());
    }
    
    loadWorkTime() {
        const savedTime = localStorage.getItem('totalWorkTime');
        const savedSessionTime = localStorage.getItem('currentSessionTime');
        const savedIsRunning = localStorage.getItem('isRunning');
        const savedSessionStartTime = localStorage.getItem('sessionStartTime');
        const lastDate = localStorage.getItem('lastWorkDate');
        const today = new Date().toDateString();
        
        if (savedTime && lastDate === today) {
            this.totalWorkTime = parseInt(savedTime);
            this.currentSessionTime = parseInt(savedSessionTime) || 0;
            this.isRunning = savedIsRunning === 'true';
            
            // If timer was running, calculate elapsed time since page refresh
            if (this.isRunning && savedSessionStartTime) {
                const startTime = parseInt(savedSessionStartTime);
                const elapsedSinceRefresh = Math.floor((Date.now() - startTime) / 1000);
                this.currentSessionTime += elapsedSinceRefresh;
                this.sessionStartTime = Date.now();
                
                // Restart the timer if it was running
                this.startTimer();
            }
        } else {
            // Reset for new day
            this.totalWorkTime = 0;
            this.currentSessionTime = 0;
            this.isRunning = false;
        }
        
        this.updateDisplay();
        this.updatePlayButton();
    }
    
    getWorkStats() {
        const totalHours = Math.floor(this.totalWorkTime / 3600);
        const totalMinutes = Math.floor((this.totalWorkTime % 3600) / 60);
        return {
            totalSeconds: this.totalWorkTime,
            totalHours: totalHours,
            totalMinutes: totalMinutes,
            currentSession: this.currentSessionTime
        };
    }
    
    showMotivationMessage() {
        if (this.motivationBubble) {
            this.motivationBubble.style.display = 'flex';
        }
    }
    
    hideMotivationMessage() {
        if (this.motivationBubble) {
            this.motivationBubble.style.display = 'none';
        }
    }
    
    showLockinBubble() {
        if (this.lockinBubble) {
            this.lockinBubble.style.display = 'flex';
        }
    }
    
    hideLockinBubble() {
        if (this.lockinBubble) {
            this.lockinBubble.style.display = 'none';
        }
    }
    
    showBreakReminder() {
        if (this.motivationBubble && this.motivationText) {
            this.motivationText.textContent = '"Great job! Time for a 5-minute break. You\'ve earned it! 🎉"';
            this.motivationBubble.style.display = 'flex';
            
            // Hide break reminder after 10 seconds
            setTimeout(() => {
                this.hideMotivationMessage();
            }, 10000); // 10 seconds
        }
    }
    
    resetTimer() {
        // Stop the timer if it's running
        if (this.isRunning) {
            this.stopTimer();
        }
        
        // Reset all values to zero
        this.totalWorkTime = 0;
        this.currentSessionTime = 0;
        this.sessionStartTime = null;
        
        // Clear any timeouts
        if (this.motivationTimeout) {
            clearTimeout(this.motivationTimeout);
            this.motivationTimeout = null;
        }
        
        // Update display and save
        this.updateDisplay();
        this.saveWorkTime();
        
        // Show lockin bubble
        this.showLockinBubble();
        this.hideMotivationMessage();
        
        // Update play button
        this.updatePlayButton();
    }
}

// Initialize timer when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ProductivityTimer();
}); 