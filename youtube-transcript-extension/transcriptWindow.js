// transcriptWindow.js
let currentUUID = new URLSearchParams(window.location.search).get('uuid');
let originalText = ''; // Store the original text
let originalXMLData = ''; // Store the original XML data

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "displayTranscript" && message.uuid === currentUUID) {
        originalXMLData = message.data; // Store the original XML data
        const textToDisplay = extractTextContent(originalXMLData, true);
        document.getElementById('transcriptContainer').innerText = textToDisplay;
        window.focus();
    }
});

document.getElementById('copyButton').addEventListener('click', function () {
    const transcriptText = document.getElementById('transcriptContainer').innerText;
    navigator.clipboard.writeText(transcriptText)
        .then(() => console.log('Transcript copied to clipboard'))
        .catch(err => console.error('Error in copying text: ', err));
});

document.getElementById('decodeToggle').addEventListener('change', function (event) {
    const shouldDecode = event.target.checked;
    const textToDisplay = extractTextContent(originalXMLData, shouldDecode);
    document.getElementById('transcriptContainer').innerText = shouldDecode ? textToDisplay : originalXMLData;
});

function extractTextContent(xmlData, decodeEntities) {
    const parser = new DOMParser();
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