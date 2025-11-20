/*
  Copyright 2022. Jefferson "jscher2000" Scher. License: MPL-2.0.
  v0.7 - new menu; option to also not accept AVIF
  v0.8 - ability to exempt a site and embedded/linked media
  20th November 2025 : ChatGPT combined the ability to download
  with a single click and export XMP sidecar file
*/



let prefs = { active: true, blockWebP: true, blockAVIF: false };

chrome.runtime.onInstalled.addListener(updateRules);
chrome.storage.onChanged.addListener(updateRules);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.getPrefs) { sendResponse(prefs); return; }
    if (msg.setPrefs) {
        prefs = msg.setPrefs;
        chrome.storage.local.set(prefs);
        updateRules();
        sendResponse({ ok: true });
        return;
    }

    if (msg.downloadImage) {
        const { url, filename, pageUrl, pageTitle, selectedText } = msg.downloadImage;

        const isWebP = /\.(webp|avif)($|\?|&)|image\/(webp|avif)/i.test(url);

        chrome.downloads.download({
            url: url,
            filename: filename,
            conflictAction: "uniquify"
        });

        generateAndDownloadXMP(filename, pageUrl, pageTitle, selectedText);

        sendResponse({ isWebP });
        return true;
    }
});

function escapeXml(unsafe) {
    return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                 .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function generateAndDownloadXMP(imageFilename, pageUrl, pageTitle, selectedText) {
    const xmpContent = `<?xpacket begin='' id=''?>
<x:xmpmeta xmlns:x='adobe:ns:meta/'>
  <rdf:RDF xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#'>
    <rdf:Description rdf:about='' xmlns:Iptc4xmpCore='http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/'>
      <Iptc4xmpCore:SubjectCode><rdf:Bag><rdf:li>${escapeXml(pageUrl)}</rdf:li></rdf:Bag></Iptc4xmpCore:SubjectCode>
    </rdf:Description>
    <rdf:Description rdf:about='' xmlns:photoshop='http://ns.adobe.com/photoshop/1.0/'>
      <photoshop:Headline>${escapeXml(pageTitle)}</photoshop:Headline>
    </rdf:Description>
    <rdf:Description rdf:about='' xmlns:dc='http://purl.org/dc/elements/1.1/'>
      <dc:description><rdf:Alt><rdf:li xml:lang='x-default'>${escapeXml(selectedText)}</rdf:li></rdf:Alt></dc:description>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end='w'?>`;

    const xmpUri = 'data:text/xmp;charset=utf-8,' + encodeURIComponent(xmpContent);
    const xmpFilename = imageFilename.replace(/\.(jpe?g|png|gif|webp|avif|tiff|bmp|svg)$/i, '.xmp');

    chrome.downloads.download({ url: xmpUri, filename: xmpFilename, saveAs: false });
}

// === REAL WEBP/AVIF BLOCKING VIA declarativeNetRequest ===
async function updateRules() {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [1, 2] });

    if (!prefs.active || (!prefs.blockWebP && !prefs.blockAVIF)) return;

    const remove = [];
    const add = [];

    if (prefs.blockWebP) {
        remove.push("image/webp");
        add.push({ priority: 1, action: { type: "block" }, condition: { resourceTypes: ["image"], responseHeaders: [{ header: "content-type", operation: "equals", value: "image/webp" }] } });
    }
    if (prefs.blockAVIF) {
        remove.push("image/avif");
        add.push({ priority: 1, action: { type: "block" }, condition: { resourceTypes: ["image"], responseHeaders: [{ header: "content-type", operation: "equals", value: "image/avif" }] } });
    }

    // Remove WebP/AVIF from Accept header (still useful for some requests)
    if (remove.length) {
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [100],
            addRules: [{
                id: 100,
                priority: 1,
                action: { type: "modifyHeaders", requestHeaders: [{ header: "accept", operation: "set", value: "image/png,image/jpg,image/jpeg,image/gif" }] },
                condition: { resourceTypes: ["main_frame", "sub_frame", "xmlhttprequest", "image"] }
            }]
        });
    }

    if (add.length) {
        const ids = prefs.blockWebP && prefs.blockAVIF ? [1, 2] : [1];
        chrome.declarativeNetRequest.updateDynamicRules({
            addRules: add.map((rule, i) => ({ ...rule, id: ids[i] }))
        });
    }
}

// Initial rule setup
updateRules();
