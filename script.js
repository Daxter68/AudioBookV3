document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const audioFile = document.getElementById('audio-file');
    const audioPlayer = document.getElementById('audio-player');
    const audioElement = document.getElementById('audio-element');
    const backgroundImage = document.getElementById('background-image');
    const playPauseButton = document.getElementById('play-pause');
    const seekSlider = document.getElementById('seek-slider');
    const currentTimeSpan = document.getElementById('current-time');
    const durationSpan = document.getElementById('duration');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeIcon = document.getElementById('volume-icon');
    const rewindButton = document.getElementById('rewind');
    const forwardButton = document.getElementById('forward');

    audioFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const audioUrl = URL.createObjectURL(file);
            audioElement.src = audioUrl;
            audioPlayer.style.display = 'block';
            
            // Add a futuristic loading effect
            audioElement.style.opacity = '0';
            setTimeout(() => {
                audioElement.style.transition = 'opacity 0.5s ease-in-out';
                audioElement.style.opacity = '1';
            }, 100);
        }
    });

    backgroundImage.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            
            // Add a smooth transition for background change
            const tempImage = new Image();
            tempImage.onload = () => {
                app.style.backgroundImage = `url(${imageUrl})`;
                app.style.animation = 'fadeIn 1s ease-in-out';
            };
            tempImage.src = imageUrl;
        }
    });

    // Audio player controls
    playPauseButton.addEventListener('click', () => {
        if (audioElement.paused) {
            audioElement.play();
            playPauseButton.textContent = 'Pause';
        } else {
            audioElement.pause();
            playPauseButton.textContent = 'Play';
        }
    });

    audioElement.addEventListener('loadedmetadata', () => {
        seekSlider.max = Math.floor(audioElement.duration);
        durationSpan.textContent = formatTime(audioElement.duration);
    });

    audioElement.addEventListener('timeupdate', () => {
        seekSlider.value = Math.floor(audioElement.currentTime);
        currentTimeSpan.textContent = formatTime(audioElement.currentTime);
    });

    seekSlider.addEventListener('input', () => {
        currentTimeSpan.textContent = formatTime(seekSlider.value);
    });

    seekSlider.addEventListener('change', () => {
        audioElement.currentTime = seekSlider.value;
    });

    // Volume control
    volumeSlider.addEventListener('input', () => {
        audioElement.volume = volumeSlider.value;
        updateVolumeIcon();
    });

    volumeIcon.addEventListener('click', () => {
        if (audioElement.volume > 0) {
            audioElement.volume = 0;
            volumeSlider.value = 0;
        } else {
            audioElement.volume = 1;
            volumeSlider.value = 1;
        }
        updateVolumeIcon();
    });

    function updateVolumeIcon() {
        if (audioElement.volume === 0) {
            volumeIcon.textContent = '🔇';
        } else if (audioElement.volume < 0.5) {
            volumeIcon.textContent = '🔉';
        } else {
            volumeIcon.textContent = '🔊';
        }
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Add custom audio visualizer (centered)
    const canvas = document.getElementById('visualizer');
    const canvasCtx = canvas.getContext('2d');

    let audioContext, analyser, source;

    audioElement.addEventListener('play', () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            source = audioContext.createMediaElementSource(audioElement);
            source.connect(analyser);
            analyser.connect(audioContext.destination);

            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            function draw() {
                requestAnimationFrame(draw);
                analyser.getByteFrequencyData(dataArray);

                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;

                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

                const barWidth = (canvas.width / bufferLength) * 2.5;
                let x = canvas.width / 2 - (barWidth * bufferLength) / 2;

                for (let i = 0; i < bufferLength; i++) {
                    const barHeight = (dataArray[i] / 255) * canvas.height;

                    const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, 0);
                    gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
                    gradient.addColorStop(1, 'rgba(255, 0, 255, 0.8)');

                    canvasCtx.fillStyle = gradient;
                    canvasCtx.fillRect(x, (canvas.height - barHeight) / 2, barWidth, barHeight);

                    x += barWidth + 1;
                }
            }
            draw();
        }
    });

    // Add event listeners for rewind and forward buttons
    rewindButton.addEventListener('click', () => {
        audioElement.currentTime = Math.max(audioElement.currentTime - 10, 0);
    });

    forwardButton.addEventListener('click', () => {
        audioElement.currentTime = Math.min(audioElement.currentTime + 10, audioElement.duration);
    });
});

app.style.animation = 'fadeIn 1s ease-in-out';
