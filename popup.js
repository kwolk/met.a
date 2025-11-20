document.addEventListener("DOMContentLoaded", () => {
    const active = document.getElementById("active");
    const webp = document.getElementById("webp");
    const avif = document.getElementById("avif");

    // Load current settings
    chrome.runtime.sendMessage({ getPrefs: true }, (p) => {
        active.checked = p.active;
        webp.checked = p.blockWebP;
        avif.checked = p.blockAVIF;
    });

    // Save button
    document.getElementById("save").onclick = () => {
        chrome.runtime.sendMessage({
            setPrefs: {
                active: active.checked,
                blockWebP: webp.checked,
                blockAVIF: avif.checked
            }
        }, () => window.close());
    };
});
