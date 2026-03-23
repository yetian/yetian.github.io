// Tomato Clock - JavaScript
(function() {
    'use strict';

    // State
    let state = {
        totalSeconds: 25 * 60,
        remainingSeconds: 25 * 60,
        isRunning: false,
        isPaused: false,
        interval: null,
        selectedMinutes: 25
    };

    // DOM Elements
    const timeDisplay = document.getElementById('timeDisplay');
    const statusLabel = document.getElementById('statusLabel');
    const timeOptions = document.getElementById('timeOptions');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const customBtn = document.getElementById('customBtn');
    const customInput = document.getElementById('customInput');
    const customMinutes = document.getElementById('customMinutes');
    const confirmCustom = document.getElementById('confirmCustom');
    const progressRingFill = document.querySelector('.progress-ring-fill');
    const timerCard = document.querySelector('.timer-card');
    const notification = document.getElementById('notification');
    const sessionsCount = document.getElementById('sessionsCount');
    const totalMinutes = document.getElementById('totalMinutes');

    // Stats from localStorage
    let stats = JSON.parse(localStorage.getItem('tomatoStats')) || {
        sessions: 0,
        totalMinutes: 0,
        lastDate: new Date().toDateString()
    };

    // Check if it's a new day
    if (stats.lastDate !== new Date().toDateString()) {
        stats.sessions = 0;
        stats.totalMinutes = 0;
        stats.lastDate = new Date().toDateString();
        saveStats();
    }

    updateStatsDisplay();

    // Initialize
    function init() {
        updateDisplay();
        updateProgressRing();
    }

    // Format time
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Update display
    function updateDisplay() {
        timeDisplay.textContent = formatTime(state.remainingSeconds);

        if (state.isRunning && !state.isPaused) {
            statusLabel.textContent = '专注中...';
            timerCard.classList.add('running');
            timerCard.classList.remove('paused');
        } else if (state.isPaused) {
            statusLabel.textContent = '已暂停';
            timerCard.classList.add('paused');
            timerCard.classList.remove('running');
        } else {
            statusLabel.textContent = '准备开始';
            timerCard.classList.remove('running', 'paused');
        }
    }

    // Update progress ring
    function updateProgressRing() {
        const circumference = 2 * Math.PI * 90;
        const progress = state.totalSeconds > 0 ?
            (state.totalSeconds - state.remainingSeconds) / state.totalSeconds : 0;
        const offset = circumference * progress;
        progressRingFill.style.strokeDashoffset = offset;
    }

    // Start timer
    function start() {
        if (state.remainingSeconds <= 0) return;

        state.isRunning = true;
        state.isPaused = false;

        startBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');

        // Clear any existing timer
        if (state.interval) clearInterval(state.interval);

        state.interval = setInterval(() => {
            if (state.remainingSeconds > 0) {
                state.remainingSeconds--;
                updateDisplay();
                updateProgressRing();
            } else {
                complete();
            }
        }, 1000);

        updateDisplay();
    }

    // Pause timer
    function pause() {
        if (!state.isRunning) return;

        state.isPaused = !state.isPaused;

        if (state.isPaused) {
            clearInterval(state.interval);
            pauseBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                继续
            `;
        } else {
            state.interval = setInterval(() => {
                if (state.remainingSeconds > 0) {
                    state.remainingSeconds--;
                    updateDisplay();
                    updateProgressRing();
                } else {
                    complete();
                }
            }, 1000);
            pauseBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
                暂停
            `;
        }

        updateDisplay();
    }

    // Reset timer
    function reset() {
        clearInterval(state.interval);
        state.isRunning = false;
        state.isPaused = false;
        state.remainingSeconds = state.totalSeconds;

        startBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');

        updateDisplay();
        updateProgressRing();
    }

    // Complete timer
    function complete() {
        clearInterval(state.interval);
        state.isRunning = false;
        state.isPaused = false;

        // Play notification sound
        playNotification();

        // Show notification
        showNotification();

        // Update stats
        stats.sessions++;
        stats.totalMinutes += Math.floor(state.totalSeconds / 60);
        saveStats();
        updateStatsDisplay();

        // Reset to initial state
        state.remainingSeconds = state.totalSeconds;

        startBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');

        updateDisplay();
        updateProgressRing();
    }

    // Play notification sound
    function playNotification() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create a pleasant chime sound
            const playTone = (freq, startTime, duration) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = freq;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.3, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            };

            const now = audioContext.currentTime;
            playTone(523.25, now, 0.3);        // C5
            playTone(659.25, now + 0.15, 0.3); // E5
            playTone(783.99, now + 0.3, 0.4);  // G5
            playTone(1046.50, now + 0.45, 0.5); // C6
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    // Show notification
    function showNotification() {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Select time
    function selectTime(minutes) {
        if (state.isRunning) return;

        state.selectedMinutes = minutes;
        state.totalSeconds = minutes * 60;
        state.remainingSeconds = minutes * 60;

        // Update button states
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.closest('.time-btn')?.classList.add('active');

        updateDisplay();
        updateProgressRing();
    }

    // Toggle custom input
    function toggleCustomInput() {
        customInput.classList.toggle('hidden');
        if (!customInput.classList.contains('hidden')) {
            customMinutes.focus();
        }
    }

    // Confirm custom time
    function confirmCustomTime() {
        const minutes = parseInt(customMinutes.value);
        if (minutes > 0 && minutes <= 120) {
            selectTime.call({ event: { target: customMinutes } }, minutes);
            customInput.classList.add('hidden');
            customMinutes.value = '';
        } else {
            customMinutes.focus();
        }
    }

    // Save stats
    function saveStats() {
        localStorage.setItem('tomatoStats', JSON.stringify(stats));
    }

    // Update stats display
    function updateStatsDisplay() {
        sessionsCount.textContent = stats.sessions;
        totalMinutes.textContent = stats.totalMinutes;
    }

    // Event listeners
    startBtn.addEventListener('click', start);
    pauseBtn.addEventListener('click', pause);
    resetBtn.addEventListener('click', reset);
    customBtn.addEventListener('click', toggleCustomInput);
    confirmCustom.addEventListener('click', confirmCustomTime);

    customMinutes.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            confirmCustomTime();
        }
    });

    timeOptions.addEventListener('click', (e) => {
        const btn = e.target.closest('.time-btn');
        if (btn && !btn.classList.contains('custom-btn')) {
            const minutes = parseInt(btn.dataset.minutes);
            selectTime(minutes);
        }
    });

    // Initialize on load
    init();
})();
