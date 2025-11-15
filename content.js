document.addEventListener('click', (event) => {
  const isCmdHeld = event.metaKey || event.ctrlKey;
  const target = event.target;

  if (isCmdHeld && target.tagName.toLowerCase() === 'img') {
    event.preventDefault();

    // Function to get the largest direct image URL
    function getFullSizeUrl(url) {
      const urlObj = new URL(url, window.location.href);
      let baseUrl = urlObj.href;
      urlObj.searchParams.delete('w');
      urlObj.searchParams.delete('h');
      urlObj.searchParams.delete('width');
      urlObj.searchParams.delete('height');
      urlObj.searchParams.delete('size');
      urlObj.searchParams.delete('imwidth');
      baseUrl = urlObj.href;
      baseUrl = baseUrl.replace(/(_\d+x\d*|_small|_medium|_large|_thumbnail)/gi, '');
      baseUrl = baseUrl.replace(/\/s\d+(-h)?\//gi, '/s0/');
      return baseUrl;
    }

    // Function to sanitize filename
    function sanitizeFilename(name) {
      return name
        .replace(/[^a-z0-9_\-\s]/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 100);
    }

    // Function to check if URL looks like an image
    function isImageUrl(url) {
      return /\.(jpg|jpeg|png|gif|webp|bmp|svg|tiff|ico)$/i.test(url);
    }

    let imageUrl = target.src;
    let usedSource = 'src';

    if (target.parentElement && target.parentElement.tagName.toLowerCase() === 'a') {
      const linkUrl = target.parentElement.href;
      if (linkUrl && isImageUrl(linkUrl)) {
        imageUrl = linkUrl.replace(/\/s\d+(-h)?\//gi, '/s0/');
        usedSource = 'href (adjusted)';
      }
    } else if (target.srcset) {
      const srcsetEntries = target.srcset.split(',').map(entry => entry.trim().split(' '));
      const largest = srcsetEntries.reduce((max, [url, size]) => {
        const width = parseInt(size) || 0;
        return width > (max.width || 0) ? { url, width } : max;
      }, { url: imageUrl, width: 0 });
      if (isImageUrl(largest.url)) {
        imageUrl = largest.url;
        usedSource = 'srcset';
      }
    } else if (target.dataset.src && isImageUrl(target.dataset.src)) {
      imageUrl = target.dataset.src;
      usedSource = 'data-src';
    } else if (target.dataset.full && isImageUrl(target.dataset.full)) {
      imageUrl = target.dataset.full;
      usedSource = 'data-full';
    }

    const absoluteUrl = getFullSizeUrl(imageUrl);
    console.log(`Resolved image URL (from ${usedSource}):`, absoluteUrl);

    let extension = '.jpg';
    const extMatch = absoluteUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|tiff|ico)$/i);
    if (extMatch) {
      extension = extMatch[0].toLowerCase();
    } else if (absoluteUrl.includes('webp')) {
      extension = '.webp';
    }

    const pageTitle = document.title || 'image';
    let filename = sanitizeFilename(pageTitle) + extension;
    console.log("Generated filename:", filename);

    target.style.border = '5px solid red';

    const pageUrl = window.location.href;
    let selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      selectedText = selectedText.replace(/\b(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.(com|org|net|edu|gov|io|co\.[a-z]{2}))\b/gi, '[$1]');
      selectedText += ` [${pageUrl}]`;
    } else {
      selectedText = `[${pageUrl}]`;
    }

    chrome.runtime.sendMessage({
      action: 'downloadImageAndExportXML',
      imageUrl: absoluteUrl,
      filename: filename,
      pageUrl: pageUrl,
      pageTitle: pageTitle,
      selectedText: selectedText
    });
  }
});
