# YouTube Transcript Project

This project provides a powerful way to extract, view, and manage YouTube video transcripts. It consists of two main components:

1.  **`youtube-transcript-extension`**: A Chrome browser extension that captures transcripts from YouTube videos.
2.  **`electron_transcript_viewer`**: A desktop application built with Electron that receives transcripts from the extension, displays them, and offers features like summarization.

These components are designed to work together seamlessly, providing a rich user experience for anyone needing to work with YouTube transcripts for research, study, or accessibility.

## Features

*   **Easy Transcript Extraction**: Right-click on any YouTube video link or page to initiate transcript fetching.
*   **Dedicated Transcript Viewer**: Transcripts are displayed in a clean, user-friendly desktop application.
*   **Persistent Transcripts**: View and manage multiple transcripts within the Electron app.
*   **AI-Powered Summarization**: (Requires OpenAI API Key) Summarize long transcripts into key bullet points using GPT-3.5-turbo.
*   **Copy to Clipboard**: Easily copy full transcripts or summaries.
*   **Restore Original**: Revert summarized transcripts back to their original state.
*   **Organized UI**: Transcripts are displayed in individual cards for easy management.
*   **Real-time Communication**: The extension and Electron app communicate in real-time via WebSockets.

## How it Works

1.  **Initiation (Chrome Extension)**:
    *   The user right-clicks on a YouTube video link (or on a YouTube page).
    *   The context menu option "Copy YouTube Transcript" (provided by the `youtube-transcript-extension`) is selected.
2.  **Transcript Fetching (Chrome Extension)**:
    *   The extension opens the YouTube video in a hidden background tab.
    *   It injects `content.js` and then `pageScript.js` into the YouTube page.
    *   `pageScript.js` accesses the `ytplayer.config` object on the YouTube page to find the URL for the raw transcript data (usually in VTT or XML format).
    *   The raw transcript data is fetched.
3.  **Data Transmission (Extension to Electron App)**:
    *   The `background.js` of the extension establishes a WebSocket connection to `ws://localhost:8080`.
    *   The fetched transcript data is sent over this WebSocket to the `electron_transcript_viewer` application.
4.  **Processing and Display (Electron App)**:
    *   The `main.js` process of the Electron app runs a WebSocket server on port `8080`, listening for incoming connections.
    *   Upon receiving transcript data, `main.js` parses the XML-like transcript format to extract the text content.
    *   The cleaned transcript text is then sent to the `renderer.js` process (the front-end of the Electron app).
5.  **User Interaction (Electron App)**:
    *   `renderer.js` dynamically creates a new "transcript card" in the `index.html` UI.
    *   The user can then view the transcript, copy it, delete the card, or use the "Summarize" feature (which calls the OpenAI API).

## Directory Structure

```
Youtube Transcript/
├── electron_transcript_viewer/ # Electron desktop application
│   ├── node_modules/
│   ├── chrome-extension/       # (Potentially a copy or older version, primary is separate)
│   ├── main.js                 # Electron main process
│   ├── renderer.js             # Electron renderer process (UI logic)
│   ├── index.html              # Electron app UI
│   ├── package.json
│   └── ...
└── youtube-transcript-extension/ # Chrome browser extension
    ├── icons/
    ├── background.js           # Service worker, handles WebSocket & context menu
    ├── content.js              # Injected into YouTube pages to load pageScript.js
    ├── pageScript.js           # Injected into YouTube page context to extract transcript
    ├── transcriptWindow.html   # HTML for the small popup that shows transcript status (optional display)
    ├── transcriptWindow.js     # JS for the transcriptWindow.html
    ├── popup.html              # Extension popup (if any, main interaction is context menu)
    ├── popup.js                # JS for popup.html
    ├── manifest.json           # Extension manifest
    └── ...
```

## Prerequisites

*   **Node.js and npm**: Required for the `electron_transcript_viewer`. Download from [nodejs.org](https://nodejs.org/).
*   **Google Chrome**: Required to install and use the `youtube-transcript-extension`.
*   **(Optional) OpenAI API Key**: For the summarization feature in the Electron app. You need to set this as an environment variable `OPENAI_API_KEY`.

## Installation and Setup

### 1. `electron_transcript_viewer` (Desktop App)

```bash
# Navigate to the Electron app directory
cd "Youtube Transcript/electron_transcript_viewer"

# Install dependencies
npm install

# (Optional but Recommended) Set your OpenAI API Key
# For Windows (PowerShell):
# $env:OPENAI_API_KEY="your_api_key_here"
# For macOS/Linux (bash/zsh):
# export OPENAI_API_KEY="your_api_key_here"
# Note: You might want to add this to your shell's profile file (e.g., .bashrc, .zshrc, or PowerShell profile)
# for persistence across sessions.

# Start the application
npm start
```
The Electron app will launch, and its WebSocket server will start listening on `ws://localhost:8080`.

### 2. `youtube-transcript-extension` (Chrome Extension)

1.  Open Google Chrome.
2.  Navigate to `chrome://extensions`.
3.  Enable **"Developer mode"** using the toggle switch (usually in the top right corner).
4.  Click on **"Load unpacked"**.
5.  In the file dialog, select the `Youtube Transcript/youtube-transcript-extension` folder.
6.  The extension "YouTube Transcript Getter" should now appear in your list of extensions and be active.

## Usage

1.  **Ensure the `electron_transcript_viewer` application is running.**
2.  Open Google Chrome and navigate to YouTube.
3.  Find a video for which you want the transcript.
4.  **Right-click** on the video link (e.g., on the YouTube homepage or search results) or anywhere on the video's watch page.
5.  Select **"Copy YouTube Transcript"** from the context menu.
6.  A new, temporary tab might briefly open and close in Chrome.
7.  Switch to the `electron_transcript_viewer` application. A new card containing the fetched transcript should appear.
8.  You can now:
    *   Read the transcript.
    *   Click **"Copy"** to copy the full transcript.
    *   Click **"Summarize"** to get an AI-generated summary (if OpenAI API key is set).
    *   Click **"Restore Original"** if you've summarized and want to see the full text again.
    *   Click **"Delete"** to remove the transcript card.

## Troubleshooting / Known Issues

*   **No Transcript Appears**:
    *   Ensure the Electron app is running *before* trying to fetch a transcript.
    *   Check the Electron app's console (View > Toggle Developer Tools) and the extension's background script console (go to `chrome://extensions`, find the extension, click "service worker") for errors.
    *   The YouTube page structure might have changed, breaking the `pageScript.js` extraction logic. This is common as YouTube updates its site.
*   **Summarization Error**:
    *   Ensure your `OPENAI_API_KEY` environment variable is correctly set and that the key is valid and has quota.
    *   Check for network issues that might prevent connection to the OpenAI API.
*   **WebSocket Connection Issues**:
    *   Ensure no other application is using port `8080` on your machine.
    *   Firewall or security software might be blocking local WebSocket connections.

## Contributing

Contributions are welcome! If you'd like to improve the project, please feel free to fork the repository, make your changes, and submit a pull request.

Areas for improvement:
*   More robust error handling in both the extension and Electron app.
*   Updating transcript extraction logic to be less brittle against YouTube UI changes.
*   Allowing users to configure the WebSocket port.
*   Adding more formatting options for the displayed transcript.
*   Support for multiple languages/subtitle tracks.

## License

This project is likely licensed under the MIT License (confirm by adding a `LICENSE` file). 