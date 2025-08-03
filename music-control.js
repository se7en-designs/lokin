class MusicController {
    constructor() {
        this.currentVideoId = 'amfWIRasxtI'; // Default video
        this.player = null;
        this.isModalOpen = false;
        this.currentMusicType = 'radio';
        this.isMuted = true;
        this.lastVolume = 50;
        
        this.musicVideos = {
            radio: 'eeIlobuJ9WA',
            lofi: 'jfKfPfyJRdk', 
            drums: 'amfWIRasxtI', 
            acoustic: 'amfWIRasxtI', 
            instrumental: '0w80F8FffQ4' 
        };
        
        this.initializeElements();
        this.bindEvents();
        this.initializeVolumeIcon();
    }
    
    initializeElements() {
        this.toggleBtn = document.getElementById('music-toggle-btn');
        this.modal = document.getElementById('music-modal');
        this.musicOptions = document.querySelectorAll('.music-option');
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeIcon = document.getElementById('volume-icon');
    }
    
    bindEvents() {
        this.toggleBtn.addEventListener('click', () => {
            this.toggleModal();
        });
        
        this.musicOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectMusicType(e.target.dataset.type);
            });
        });
        
        // Volume control
        this.volumeSlider.addEventListener('input', (e) => {
            this.setVolume(e.target.value);
        });
        
        // Mute/unmute button
        this.volumeIcon.addEventListener('click', () => {
            this.toggleMute();
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
    }
    
    closeModal() {
        this.modal.style.display = 'none';
        this.isModalOpen = false;
    }
    
    selectMusicType(type) {
        // Update active button
        this.musicOptions.forEach(option => {
            option.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Update current music type
        this.currentMusicType = type;
        
        // Change video if player exists
        if (window.player && this.musicVideos[type]) {
            this.loadVideo(this.musicVideos[type]);
        }
        
        // Close modal after selection
        setTimeout(() => {
            this.closeModal();
        }, 500);
    }
    
    loadVideo(videoId) {
        if (window.player) {
            window.player.loadVideoById({
                videoId: videoId,
                suggestedQuality: 'medium'
            });
            // Unmute and play
            window.player.unMute();
            window.player.playVideo();
        }
    }
    
    setVolume(value) {
        if (window.player) {
            const volume = parseInt(value);
            this.lastVolume = volume;
            window.player.setVolume(volume);
            
            // Update volume icon based on volume level
            this.updateVolumeIcon(volume);
            
            // Update mute state based on volume
            this.isMuted = (volume === 0);
        }
    }
    
    toggleMute() {
        if (window.player) {
            if (this.isMuted) {
                // Unmute
                window.player.unMute();
                window.player.setVolume(this.lastVolume);
                this.volumeSlider.value = this.lastVolume;
                this.isMuted = false;
                this.updateVolumeIcon(this.lastVolume);
            } else {
                // Mute
                window.player.mute();
                this.volumeSlider.value = 0;
                this.isMuted = true;
                this.updateVolumeIcon(0);
            }
        }
    }
    
    // Method to initialize volume icon on load
    initializeVolumeIcon() {
        this.updateVolumeIcon(0); // Start with muted icon
    }
    
    // Method to force unmute (for timer integration)
    forceUnmute() {
        if (window.player) {
            window.player.unMute();
            this.lastVolume = 100;
            window.player.setVolume(100);
            this.volumeSlider.value = 100;
            this.isMuted = false;
            this.updateVolumeIcon(100);
        }
    }
    
    updateVolumeIcon(volume) {
        console.log('Updating volume icon, volume:', volume); // Debug log
        console.log('Volume icon element:', this.volumeIcon); // Debug log
        
        if (!this.volumeIcon) {
            console.error('Volume icon element not found!');
            return;
        }
        
        if (volume === 0) {
            // Muted icon
            this.volumeIcon.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="#FCFCFC" stroke-width="1.5" fill="none"/>
                    <line x1="23" y1="9" x2="17" y2="15" stroke="#FCFCFC" stroke-width="1.5"/>
                    <line x1="17" y1="9" x2="23" y2="15" stroke="#FCFCFC" stroke-width="1.5"/>
                </svg>
            `;
        } else {
            // Unmuted icon (speaker with waves)
            this.volumeIcon.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="#FCFCFC" stroke-width="1.5" fill="none"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#FCFCFC" stroke-width="1.5" fill="none"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#FCFCFC" stroke-width="1.5" fill="none"/>
                </svg>
            `;
        }
        
        console.log('Icon updated, innerHTML length:', this.volumeIcon.innerHTML.length); // Debug log
    }
    
    // Method to start music when timer starts
    startMusic() {
        if (window.player && this.musicVideos[this.currentMusicType]) {
            this.loadVideo(this.musicVideos[this.currentMusicType]);
            // Force unmute and set volume to 100
            this.forceUnmute();
        }
    }
    
    // Method to update video IDs (call this after you provide the YouTube links)
    updateVideoIds(videoIds) {
        this.musicVideos = { ...this.musicVideos, ...videoIds };
    }
}

// Initialize music controller when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.musicController = new MusicController();
    
    // Check if player is already ready
    if (window.player) {
        window.musicController.player = window.player;
    }
}); 