document.addEventListener("DOMContentLoaded", function() {
    const audioUpload = document.getElementById('audioUpload');
    const audioPlayer = document.getElementById('audioPlayer');
    const rewindButton = document.getElementById('rewindButton');
    const textUpload = document.getElementById('textUpload');
    const textArea = document.getElementById('textArea');
    const saveTextButton = document.getElementById('saveTextButton');

    // Handle audio file upload
    audioUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            audioPlayer.src = url;
            audioPlayer.load();
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
            };
            reader.readAsText(file);
        }
    });

    // Handle save text button click
    saveTextButton.addEventListener('click', function() {
        const text = textArea.value;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${textUpload.files[0].name}_${new Date().toJSON().slice(0,19)}.vtt`;
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
});