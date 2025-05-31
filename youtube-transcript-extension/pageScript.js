// pageScript.js
window.addEventListener("message", (event) => {
    if (event.source != window || !event.data.type) {
        return;
    }
    if (event.data.type === "FETCH_TRANSCRIPT" && event.data.uuid) {
        try {
            const captionUrl = ytplayer.config.args.raw_player_response.captions.playerCaptionsTracklistRenderer.captionTracks[0].baseUrl;
            fetch(captionUrl)
                .then(response => response.text())
                .then(data => {
                    window.postMessage({ type: "TRANSCRIPT_RESULT", text: data, uuid: event.data.uuid }, "*");
                })
                .catch(error => console.error("Error fetching captions: ", error));
        } catch (error) {
            console.error("Error: ytplayer is not defined or other issue", error);
        }
    }
});
