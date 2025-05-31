// background.js
function generateUUID() {
    return 'xxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

let tabToWindowMap = {};

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "fetchAndCopyTranscript",
        title: "Copy YouTube Transcript",
        contexts: ["link"],
        documentUrlPatterns: ["*://www.youtube.com/*"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "fetchAndCopyTranscript" && info.linkUrl) {
        const uuid = generateUUID();

        chrome.windows.create({
            url: "transcriptWindow.html?uuid=" + uuid,
            type: "popup",
            width: 350,
            height: 400
        }, (transcriptWindow) => {
            chrome.tabs.create({ url: info.linkUrl, active: false }, (newTab) => {
                tabToWindowMap[newTab.id] = transcriptWindow.id;

                chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                    if (tabId === newTab.id && changeInfo.status === 'loading') {
                        chrome.scripting.executeScript({
                            target: { tabId: newTab.id },
                            files: ['content.js']
                        }, () => {
                            // Error checking and message sending
                            if (chrome.runtime.lastError) {
                                console.error("Error injecting script:", chrome.runtime.lastError.message);
                                chrome.tabs.remove(newTab.id);
                            } else {
                                chrome.tabs.sendMessage(newTab.id, { action: "fetchTranscript", uuid: uuid });
                                setTimeout(() => {
                                    chrome.tabs.remove(newTab.id);
                                }, 5000);
                            }
                        });
                        chrome.tabs.onUpdated.removeListener(listener);
                    }
                });
            });
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "displayTranscript" && message.uuid) {
        let transcriptWindowId = tabToWindowMap[sender.tab.id];
        if (transcriptWindowId) {
            chrome.tabs.query({ windowId: transcriptWindowId }, (tabs) => {
                if (tabs.length > 0) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "displayTranscript", data: message.data, uuid: message.uuid });
                    sendData(message.data);
                }
            });
            delete tabToWindowMap[sender.tab.id];
        }
    }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    if (tabToWindowMap[tabId]) {
        delete tabToWindowMap[tabId];
    }
});

// background.js
let socket;

function initializeWebSocket() {
    socket = new WebSocket("ws://localhost:8080");

    socket.onopen = function(e) {
        console.log("Connection established");
    };

    socket.onmessage = function(event) {
        console.log("Data received: ", event.data);
    };

    socket.onclose = function(event) {
        console.log("Connection closed");
    };

    socket.onerror = function(error) {
        console.error("WebSocket error: ", error);
    };
}

function sendData(data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(data);
    }
}

// Initialize WebSocket when the background script starts
initializeWebSocket();
