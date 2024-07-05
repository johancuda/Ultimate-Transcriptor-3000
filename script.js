document.addEventListener("DOMContentLoaded", function() {
    const audioUpload = document.getElementById('audioUpload');
    const audioPlayer = document.getElementById('audioPlayer');
    const rewindButton = document.getElementById('rewindButton');
    const textUpload = document.getElementById('textUpload');
    const textArea = document.getElementById('textArea');
    const saveTextButton = document.getElementById('saveTextButton');

    // Load saved audio and text from localStorage
    const savedAudioSrc = localStorage.getItem('audioSrc');
    const savedText = localStorage.getItem('textContent');

    if (savedAudioSrc) {
        audioPlayer.src = savedAudioSrc;
        audioPlayer.load();
    }

    if (savedText) {
        textArea.value = savedText;
    }

    // Handle audio file upload
    audioUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            audioPlayer.src = url;
            audioPlayer.load();
            localStorage.setItem('audioSrc', url);
        }
    });

    // Handle rewind button click
    rewindButton.addEventListener('click', function() {
        if (audioPlayer.currentTime > 5) {
            audioPlayer.currentTime -= 5;
        } else {
            audioPlayer.currentTime = 0;
        }
    });

    // Handle text file upload
    textUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                textArea.value = e.target.result;
                localStorage.setItem('textContent', e.target.result);
            };
            reader.readAsText(file);
        }
    });

    // Save text to localStorage on input
    textArea.addEventListener('input', function() {
        localStorage.setItem('textContent', textArea.value);
    });

    // Handle save text button click
    saveTextButton.addEventListener('click', function() {
        const text = textArea.value;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // a.download = `${textUpload.files[0].name}_${new Date().toJSON().slice(0,19)}.vtt`;
        a.download = `transcription_${new Date().toJSON().slice(0,19)}.vtt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    // Handle keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Check for Shift + Tab
        if (event.shiftKey && event.key === 'Tab') {
            event.preventDefault(); // Prevent default tab behavior
            // Rewind 5 seconds
            if (audioPlayer.currentTime > 5) {
                audioPlayer.currentTime -= 5;
            } else {
                audioPlayer.currentTime = 0;
            }
        } else if (event.key === 'Tab') {
            event.preventDefault(); // Prevent default tab behavior
            // Play/Pause audio
            if (audioPlayer.paused) {
                audioPlayer.play();
            } else {
                audioPlayer.pause();
            }
        }
    });

    // Save text to localStorage before page unload
    window.addEventListener('beforeunload', function() {
        localStorage.setItem('textContent', textArea.value);
    });

});