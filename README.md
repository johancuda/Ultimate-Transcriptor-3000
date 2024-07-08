# Ultimate Transcriptor 3000
 A small tool to help with transcribing interviews.

## Description

This simple web app helps you with correcting text transcription created by [WhisperAI](https://github.com/openai/whisper). 

The goal of this app is to provide you with a simple interface to listen to an audio recording whilst correcting the transcription, with a few basic functionalities like a play/pause button and the possibility to rewind 5 seconds of your audio. The text input supports `.txt` and `.vtt` files. Text and audio files are stored using [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) so that you don't lost your progress if you refresh the page.

## Shortcuts

- <kbd>Tab</kbd> : Play/pause
- <kbd>Shift</kbd> + <kbd>Tab</kbd> : Rewind 5 seconds

## TODO

- Clear DB upon closing the tab

# Credits

Developped for the [CH Ludens Poject](https://chludens.ch/) by Johan Cuda, student assistant.