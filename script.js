document.addEventListener("DOMContentLoaded", function() {
    const audioUpload = document.getElementById('audioUpload');
    const audioPlayer = document.getElementById('audioPlayer');
    const rewindButton = document.getElementById('rewindButton');
    const textUpload = document.getElementById('textUpload');
    const textArea = document.getElementById('textArea');
    const saveTextButton = document.getElementById('saveTextButton');
    const htmlElement = document.documentElement;
    const switchElement = document.getElementById('darkModeSwitch');

    // Set the default theme to dark if no setting is found in local storage
    const currentTheme = localStorage.getItem('bsTheme') || 'dark';
    htmlElement.setAttribute('data-bs-theme', currentTheme);
    switchElement.checked = currentTheme === 'dark';

    switchElement.addEventListener('change', function () {
        if (this.checked) {
            htmlElement.setAttribute('data-bs-theme', 'dark');
            localStorage.setItem('bsTheme', 'dark');
        } else {
            htmlElement.setAttribute('data-bs-theme', 'light');
            localStorage.setItem('bsTheme', 'light');
        }
    });

    const DB_NAME = 'audioTextDB';
    const DB_VERSION = 1;
    const AUDIO_STORE = 'audio';
    const TEXT_STORE = 'text';

    let db;

    // Open IndexedDB
    function openDB(callback) {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = function(event) {
            db = event.target.result;
            db.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
            db.createObjectStore(TEXT_STORE, { keyPath: 'id' });
        };

        request.onsuccess = function(event) {
            db = event.target.result;
            callback();
        };

        request.onerror = function(event) {
            console.error('IndexedDB error:', event.target.errorCode);
        };
    }

    // Save audio to IndexedDB
    function saveAudio(file) {
        const transaction = db.transaction([AUDIO_STORE], 'readwrite');
        const store = transaction.objectStore(AUDIO_STORE);
        const audioRecord = {
            id: 'audioFile',
            data: file
        };
        store.put(audioRecord);
    }

    // Load audio from IndexedDB
    function loadAudio(callback) {
        const transaction = db.transaction([AUDIO_STORE]);
        const store = transaction.objectStore(AUDIO_STORE);
        const request = store.get('audioFile');

        request.onsuccess = function(event) {
            const record = event.target.result;
            if (record) {
                const url = URL.createObjectURL(record.data);
                callback(url);
            } else {
                callback(null);
            }
        };
    }

    // Save text to IndexedDB
    function saveText(text) {
        const transaction = db.transaction([TEXT_STORE], 'readwrite');
        const store = transaction.objectStore(TEXT_STORE);
        const textRecord = {
            id: 'textContent',
            data: text
        };
        store.put(textRecord);
    }

    // Load text from IndexedDB
    function loadText(callback) {
        const transaction = db.transaction([TEXT_STORE]);
        const store = transaction.objectStore(TEXT_STORE);
        const request = store.get('textContent');

        request.onsuccess = function(event) {
            const record = event.target.result;
            callback(record ? record.data : null);
        };
    }

    // Clear IndexedDB
    function clearDB() {
        const audioTransaction = db.transaction([AUDIO_STORE], 'readwrite');
        const audioStore = audioTransaction.objectStore(AUDIO_STORE);
        audioStore.clear();

        const textTransaction = db.transaction([TEXT_STORE], 'readwrite');
        const textStore = textTransaction.objectStore(TEXT_STORE);
        textStore.clear();
    }

    // Load saved audio and text from IndexedDB
    openDB(function() {
        loadAudio(function(url) {
            if (url) {
                audioPlayer.src = url;
                audioPlayer.load();
            }
        });

        loadText(function(text) {
            if (text) {
                textArea.value = text;
            }
        });
    });

    // Handle audio file upload
    audioUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            saveAudio(file);
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

    // Handle text file upload (VTT or TXT)
    textUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                textArea.value = e.target.result;
                saveText(e.target.result);
            };
            reader.readAsText(file);
        }
    });

    // Save text to IndexedDB on input
    textArea.addEventListener('input', function() {
        saveText(textArea.value);
    });

    // Handle save text button click
    saveTextButton.addEventListener('click', function() {
        const text = textArea.value;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcription_${new Date().toJSON().slice(0,19)}.vtt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    // Handle keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        if (event.shiftKey && event.key === 'Tab') {
            event.preventDefault();
            if (audioPlayer.currentTime > 5) {
                audioPlayer.currentTime -= 5;
            } else {
                audioPlayer.currentTime = 0;
            }
        } else if (event.key === 'Tab') {
            event.preventDefault();
            if (audioPlayer.paused) {
                audioPlayer.play();
            } else {
                audioPlayer.pause();
            }
        }
    });

    // Save text to IndexedDB before page unload
    window.addEventListener('beforeunload', function() {
        saveText(textArea.value);
    });

    // Clear IndexedDB when the tab is closed
    window.addEventListener('unload', function() {
        setTimeout(() => {
            clearDB();
        }, 100);
    });
});


// Variable to store the previous state of the text
let previousTextState = '';

// Search for term in the transcript
document.getElementById('searchBtn').addEventListener('click', () => {
    const searchTerm = document.getElementById('searchTerm').value;
    const transcript = document.getElementById('textArea').value;
    
    if (searchTerm) {
        const matchCount = (transcript.match(new RegExp(searchTerm, 'gi')) || []).length;
        document.getElementById('searchResult').textContent = matchCount ? `${matchCount} matches found` : 'No matches found';
    }
});

// Replace first occurence of the term in the transcript
document.getElementById('replaceBtn').addEventListener('click', () => {
    const searchTerm = document.getElementById('searchTerm').value;
    const replaceTerm = document.getElementById('replaceTerm').value;
    const transcriptElement = document.getElementById('textArea');
    const transcriptText = transcriptElement.value;

    if (searchTerm && replaceTerm) {
        saveState(transcriptText);  // Save the current state before replacing
        const regex = new RegExp(searchTerm, 'i');
        transcriptElement.value = transcriptText.replace(regex, replaceTerm);
        document.getElementById('searchResult').textContent = `First occurrence replaced.`;
    }
});

// Replace all occurences in the transcript
document.getElementById('replaceAllBtn').addEventListener('click', () => {
    const searchTerm = document.getElementById('searchTerm').value;
    const replaceTerm = document.getElementById('replaceTerm').value;
    const transcriptElement = document.getElementById('textArea');
    const transcriptText = transcriptElement.value;

    if (searchTerm && replaceTerm) {
        saveState(transcriptText);  // Save the current state before replacing
        const regex = new RegExp(searchTerm, 'gi');
        const matchCount = (transcriptText.match(regex) || []).length;
        transcriptElement.value = transcriptText.replace(regex, replaceTerm);
        document.getElementById('searchResult').textContent = `${matchCount} occurrence(s) replaced.`;
    }
});

// Return to previous text state
document.getElementById('undoBtn').addEventListener('click', () => {
    const transcriptElement = document.getElementById('textArea');
    if (previousTextState) {
        transcriptElement.value = previousTextState;  // Revert to the previous state
        document.getElementById('searchResult').textContent = `Undo successful.`;
        previousTextState = '';  // Clear the saved state after undoing
    } else {
        document.getElementById('searchResult').textContent = `Nothing to undo.`;
    }
});

// Save the current text as the previous state
function saveState(currentText) {
    previousTextState = currentText;  // Save the current text as the previous state
}