chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'downloadImageAndExportXML') {
    // Download the image with error handling
    chrome.downloads.download({
      url: message.imageUrl,
      filename: message.filename,
      saveAs: false
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error("Image download failed:", chrome.runtime.lastError.message, "URL:", message.imageUrl);
      } else {
        console.log("Image download started, ID:", downloadId);
      }
    });

    // Escape XML characters
    function escapeXml(unsafe) {
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    }

    const safePageUrl = escapeXml(message.pageUrl);
    const safePageTitle = escapeXml(message.pageTitle);
    const safeSelectedText = escapeXml(message.selectedText);

    let xmpContent = `<?xpacket begin='' id=''?>
<x:xmpmeta xmlns:x='adobe:ns:meta/' x:xmptk='XMP toolkit 2.9-9, framework 1.6'>
  <rdf:RDF xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns:iX='http://ns.adobe.com/iX/1.0/'>
    <rdf:Description rdf:about='' xmlns:Iptc4xmpCore='http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/'>
      <Iptc4xmpCore:SubjectCode>
        <rdf:Bag>
          <rdf:li>${safePageUrl}</rdf:li>
        </rdf:Bag>
      </Iptc4xmpCore:SubjectCode>
    </rdf:Description>
    <rdf:Description rdf:about='' xmlns:photoshop='http://ns.adobe.com/photoshop/1.0/'>
      <photoshop:Headline>${safePageTitle}</photoshop:Headline>
    </rdf:Description>
    <rdf:Description rdf:about='' xmlns:dc='http://purl.org/dc/elements/1.1/'>
      <dc:description>
        <rdf:Alt>
          <rdf:li xml:lang='x-default'>${safeSelectedText}</rdf:li>
        </rdf:Alt>
      </dc:description>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end='w'?>`;

    const xmpDataUri = 'data:text/xmp;charset=utf-8,' + encodeURIComponent(xmpContent);
    const xmpFilename = message.filename.replace(/\.(jpg|jpeg|png|gif|webp|bmp|svg|tiff|ico)$/i, '.xmp');
    chrome.downloads.download({
      url: xmpDataUri,
      filename: xmpFilename,
      saveAs: false
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error("XMP download failed:", chrome.runtime.lastError.message);
      } else {
        console.log("XMP download started, ID:", downloadId);
      }
    });
  }
});