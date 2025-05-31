// content.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "fetchTranscript" && request.uuid) {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('pageScript.js');
        document.head.appendChild(script);
        script.onload = function () {
            window.postMessage({ type: "FETCH_TRANSCRIPT", uuid: request.uuid }, "*");
            script.remove();
        };
    }
});

window.addEventListener("message", (event) => {
    if (event.source != window || !event.data.type) {
        return;
    }

    if (event.data.type === "TRANSCRIPT_RESULT" && event.data.uuid) {
        chrome.runtime.sendMessage({
            action: "displayTranscript",
            data: event.data.text,
            uuid: event.data.uuid
        });
    }
}, false);
