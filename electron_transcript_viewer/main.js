
const { app, BrowserWindow } = require('electron');
const WebSocket = require('ws');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.setAlwaysOnTop(true);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        // Assuming 'message' is a byte array
        const stringMessage = Buffer.from(message).toString('utf-8');

        if (mainWindow) {
            mainWindow.webContents.send('transcriptData', extractTextContent(stringMessage, true));
        }
    });
});


const jsdom = require("jsdom");
const { JSDOM } = jsdom;


function extractTextContent(xmlData, decodeEntities) {
    const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
    const parser = new dom.window.DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, "text/xml");
    const texts = xmlDoc.getElementsByTagName('text');
    let transcriptText = Array.from(texts).map(element => element.textContent).join(' ');

    return decodeEntities ? decodeCommonHTMLEntities(transcriptText) : transcriptText;
}

function decodeCommonHTMLEntities(text) {
    const entitiesMap = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&apos;': "'",
        '&cent;': '¢',
        '&pound;': '£',
        '&yen;': '¥',
        '&euro;': '€',
        '&copy;': '©',
        '&reg;': '®',
        '&sect;': '§',
        '&uml;': '¨',
        '&acute;': '´',
        '&micro;': 'µ',
        '&para;': '¶',
        '&middot;': '·',
        '&cedil;': '¸',
        '&ordf;': 'ª',
        '&ordm;': 'º',
        '&laquo;': '«',
        '&raquo;': '»',
        '&ndash;': '–',
        '&mdash;': '—',
        '&lsquo;': '‘',
        '&rsquo;': '’',
        '&sbquo;': '‚',
        '&ldquo;': '“',
        '&rdquo;': '”',
        '&bdquo;': '„',
        '&dagger;': '†',
        '&Dagger;': '‡',
        '&permil;': '‰',
        '&lsaquo;': '‹',
        '&rsaquo;': '›',
        '&hellip;': '…',
        '&bull;': '•',
        '&prime;': '′',
        '&Prime;': '″',
        '&oline;': '‾',
        '&frasl;': '⁄',
        '&image;': 'ℑ',
        '&weierp;': '℘',
        '&real;': 'ℜ',
        '&trade;': '™',
        '&alefsym;': 'ℵ',
        '&larr;': '←',
        '&uarr;': '↑',
        '&rarr;': '→',
        '&darr;': '↓',
        '&harr;': '↔',
        '&crarr;': '↵',
        '&lArr;': '⇐',
        '&uArr;': '⇑',
        '&rArr;': '⇒',
        '&dArr;': '⇓',
        '&hArr;': '⇔',
        // Add more entities as needed
    };

    return text.replace(/&[a-zA-Z0-9#]+;/g, match => entitiesMap[match] || match);
} 