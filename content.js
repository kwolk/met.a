"use strict";

document.addEventListener("click", e => {
    if (!e.metaKey && !e.ctrlKey) return;
    if (e.target.tagName !== "IMG") return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const img = e.target;
    let url = img.currentSrc || img.src || "";
    if (!url || url.startsWith("data:")) return;

    // === Highest resolution detection (your battle-tested hacks) ===
    if (img.srcset) {
        const candidates = img.srcset.split(",").map(s => s.trim().split(/\s+/)[0]).filter(Boolean);
        url = candidates[candidates.length - 1] || url;
    }

    // Site-specific original URL fixes
    if (url.includes("pbs.twimg.com") || url.includes("twitter.com")) {
        url = url.replace(/:(\w+)(\?|$)/, ":orig$2");
    } else if (url.includes("preview.redd.it")) {
        url = url.replace(/preview\.redd\.it\/[^\/]+\/([^\/?]+)/, "i.redd.it/$1");
    } else if (url.includes("scontent") && url.includes("instagram")) {
        url = url.replace(/\/s\d+x\d+\//, "/") + (url.includes("?") ? "&" : "?") + "size=l";
    } else if (url.includes("tumblr.com")) {
        url = url.replace(/_(?:best|raw|\d+)\./, ".");
    } else if (url.includes("pinterest")) {
        url = url.replace(/\/\d+x(\d+)?\//g, "/originals/");
    }

    // Fallbacks
    const dataUrl = img.dataset.src || img.dataset.original || img.dataset.full || img.dataset.highres;
    if (dataUrl) url = dataUrl;
    const link = img.closest("a")?.href;
    if (link && !url.includes(link)) url = link;

    // === Collect metadata for XMP ===
    const absoluteUrl = new URL(url, location.href).href;
    const filename = decodeURIComponent(absoluteUrl.split("/").pop().split("?")[0]) || "image.jpg";
    const pageUrl = location.href;
    const pageTitle = document.title;

    let selectedText = window.getSelection().toString().trim();
    if (selectedText) {
        selectedText = selectedText.replace(/\b(https?:\/\/[^\s]+)/g, "[$1]");
        selectedText += ` [${pageUrl}]`;
    } else {
        selectedText = `[${pageUrl}]`;
    }

    // Visual feedback
    img.style.outline = "10px solid yellow";
    img.style.outlineOffset = "-3px";

    chrome.runtime.sendMessage({
        downloadImage: {
            url: absoluteUrl,
            filename: filename,
            pageUrl: pageUrl,
            pageTitle: pageTitle,
            selectedText: selectedText
        }
    }, response => {
        clearTimeout(window.fallbackTimer);
        const isBad = response?.isWebP || /\.(webp|avif)/i.test(absoluteUrl);
        img.style.transition = "outline 0.4s ease";
        img.style.outline = isBad ? "10px solid red" : "10px solid lime";
        setTimeout(() => img.style.outline = "", 2500);
    });

    // Fallback green if no response
    window.fallbackTimer = setTimeout(() => {
        img.style.outline = "10px solid lime";
        setTimeout(() => img.style.outline = "", 2500);
    }, 1000);
}, true);
