const { ipcRenderer } = require('electron');
const axios = require('axios');

function createTranscriptCard(transcript) {
    // Create card elements with Bootstrap classes
    const card = document.createElement('div');
    card.className = 'card m-3';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const content = document.createElement('textarea');
    content.className = 'form-control mb-3';
    content.style.height = '200px';
    content.textContent = transcript;

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'btn-group';

    const summarizeButton = document.createElement('button');
    summarizeButton.className = 'btn btn-primary';
    summarizeButton.textContent = 'Summarize';
    summarizeButton.onclick = () => summarizeWithOpenAI(content);

    const copyButton = document.createElement('button');
    copyButton.className = 'btn btn-secondary';
    copyButton.textContent = 'Copy';
    copyButton.onclick = () => navigator.clipboard.writeText(content.textContent);

    const restoreButton = document.createElement('button');
    restoreButton.className = 'btn btn-secondary';
    restoreButton.textContent = 'Restore Original';
    restoreButton.onclick = () => content.textContent = transcript;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger';
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => card.remove();

    // Append elements to the card
    card.appendChild(cardBody);
    cardBody.appendChild(content);
    cardBody.appendChild(buttonGroup);
    buttonGroup.appendChild(copyButton);
    buttonGroup.appendChild(restoreButton);
    buttonGroup.appendChild(summarizeButton);
    buttonGroup.appendChild(deleteButton);

    return card;
}

ipcRenderer.on('transcriptData', (event, data) => {
    const transcriptContainer = document.getElementById('transcript-container');
    const card = createTranscriptCard(data);
    transcriptContainer.appendChild(card);
});


async function summarizeWithOpenAI(target) {
    text = target.textContent;
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                {
                    role: "user", content: `
                """
                ${text}
                """

                Print all the important ideas, lesson and takeaways from the text delimited by triple quotation marks, in a bullet list
                
                ` }
            ],
            model: "gpt-4o",
            max_tokens: 256
        }, {
            headers: {
                'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
            }
        });


        target.textContent = response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error in summarization:', error);
        return 'Error in summarization.';
    }
}