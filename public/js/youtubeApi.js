// Source: https://developers.google.com/youtube/iframe_api_reference

var tag = document.createElement("script");

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    // bitstream tester demo
    playerTesterDemo = new YT.Player("playerTesterDemo", {
        class: "embed-responsive-item",
        videoId: "v5oBoQTpg_E",
    });

    $("#helpModal").on("hide.bs.modal", function (e) {
        playerTesterDemo.pauseVideo();
    });
}