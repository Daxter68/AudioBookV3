document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const audioFiles = document.getElementById('audioFiles');
    const audioPlayer = document.getElementById('audio-player');
    const audioElement = document.getElementById('audio-element');
    const backgroundImage = document.getElementById('background-image');
    const playPauseButton = document.getElementById('play-pause');
    const rewindButton = document.getElementById('rewind');
    const forwardButton = document.getElementById('forward');
    const seekSlider = document.getElementById('seek-slider');
    const currentTimeSpan = document.getElementById('current-time');
    const durationSpan = document.getElementById('duration');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeIcon = document.getElementById('volume-icon');
    const playlistContainer = document.getElementById('playlist-container');
    const playlist = document.getElementById('playlist');

    let selectedAudioFiles = []; const audioFilesElement = document.getElementById('audioFiles');
        
    audioFilesElement.addEventListener('change', (event) => {
        const files = Array.from(event.target.files);
        selectedAudioFiles = files;
        updatePlaylist();
        if (selectedAudioFiles.length > 0) {
            loadTrack(0);
            audioPlayer.style.display = 'block';
        }
    
    selectedAudioFiles.addEventListener('change', (event) => {
        const files = Array.from(event.target.files);
        selectedAudioFiles = files;
        updatePlaylist();
        if (selectedAudioFiles.length > 0) {
            loadTrack(0);
            audioPlayer.style.display = 'block';
        }
    let currentTrackIndex = 0;

    audioFiles.addEventListener('change', (event) => {
        const files = Array.from(event.target.files);
        audioFiles = files;
        updatePlaylist();
        if (audioFiles.length > 0) {
            loadTrack(0);
            audioPlayer.style.display = 'block';
        }
    });
    function updatePlaylist() {
        playlist.innerHTML = '';
        audioFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.textContent = file.name;
            li.addEventListener('click', () => loadTrack(index));
            playlist.appendChild(li);
        });
    }

    function loadTrack(index) {
        currentTrackIndex = index;
        const file = audioFiles[index];
        const fileURL = URL.createObjectURL(file);
        audioElement.src = fileURL;
        audioElement.load();
        updatePlaylistSelection();
        playAudio();
    }

    function updatePlaylistSelection() {
        const items = playlist.getElementsByTagName('li');
        for (let i = 0; i < items.length; i++) {
            items[i].classList.remove('active');
        }
        items[currentTrackIndex].classList.add('active');
    }

    function playAudio() {
        audioElement.play();
        updatePlayPauseButton();
    }

    audioElement.addEventListener('error', (e) => {
        console.error('Error loading audio:', e);
        alert('Error loading audio file. Please try another file.');
    });

    playPauseButton.addEventListener('click', togglePlayPause);
    rewindButton.addEventListener('click', () => seek(-10));
    forwardButton.addEventListener('click', () => seek(10));

    function togglePlayPause() {
        if (audioElement.paused) {
            audioElement.play();
        } else {
            audioElement.pause();
        }
        updatePlayPauseButton();
    }

    function updatePlayPauseButton() {
        playPauseButton.textContent = audioElement.paused ? '▶️' : '⏸️';
    }

    function seek(seconds) {
        audioElement.currentTime = Math.max(0, Math.min(audioElement.duration, audioElement.currentTime + seconds));
    }

    audioElement.addEventListener('timeupdate', () => {
        seekSlider.value = audioElement.currentTime;
        currentTimeSpan.textContent = formatTime(audioElement.currentTime);
    });

    audioElement.addEventListener('loadedmetadata', () => {
        seekSlider.max = audioElement.duration;
        durationSpan.textContent = formatTime(audioElement.duration);
    });

    audioElement.addEventListener('ended', () => {
        currentTrackIndex++;
        if (currentTrackIndex < audioFiles.length) {
            loadTrack(currentTrackIndex);
        } else {
            currentTrackIndex = 0;
            updatePlayPauseButton();
        }
    });

    seekSlider.addEventListener('input', () => {
        audioElement.currentTime = seekSlider.value;
    });

    volumeSlider.addEventListener('input', () => {
        audioElement.volume = volumeSlider.value;
        updateVolumeIcon();
    });

    volumeIcon.addEventListener('click', () => {
        audioElement.volume = audioElement.volume === 0 ? 1 : 0;
        volumeSlider.value = audioElement.volume;
        updateVolumeIcon();
    });

    function updateVolumeIcon() {
        volumeIcon.textContent = audioElement.volume === 0 ? '🔇' : audioElement.volume < 0.5 ? '🔉' : '🔊';
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    backgroundImage.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                app.style.backgroundImage = `url(${e.target.result})`;
                app.style.backgroundSize = 'cover';
                app.style.backgroundPosition = 'center';
            };
            reader.readAsDataURL(file);
        }
    });

    // Audio visualizer
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
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    const barHeight = (dataArray[i] / 255) * canvas.height;

                    const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, 0);
                    gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
                    gradient.addColorStop(1, 'rgba(255, 0, 255, 0.8)');

                    canvasCtx.fillStyle = gradient;
                    canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                    x += barWidth + 1;
                }
            }
            draw();
        }
    });
})();

