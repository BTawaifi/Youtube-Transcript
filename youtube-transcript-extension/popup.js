// popup.js
let messageListenerAdded = false;

function displayTranscriptText(xmlData) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, "text/xml");
    const texts = xmlDoc.getElementsByTagName('text');
    let transcriptText = '';

    for (const element of texts) {
        transcriptText += element.textContent + ' ';
    }

    return transcriptText;
}

document.addEventListener('DOMContentLoaded', function () {
    // Ensure the listener is added only once
    if (!window.messageListenerAdded) {
        chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            if (message.action === "displayTranscript") {
                const text = displayTranscriptText(message.data);
                document.getElementById('transcriptContainer').innerText = text.trim();

            }
        });
        window.messageListenerAdded = true;
    }

    document.getElementById('copyButton').addEventListener('click', function () {
        const transcriptText = document.getElementById('transcriptContainer').innerText;
        navigator.clipboard.writeText(transcriptText)
            .then(() => console.log('Transcript copied to clipboard'))
            .catch(err => console.error('Error in copying text: ', err));
    });
});
