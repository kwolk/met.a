## **WHAT DOES THIS SCRIPT DO?**  
This script works as a desktop plug-in that allows a single mouse click (while holding the Command key on macOS) to download a visible image from a webpage.
It pairs the downloaded image with an exported XMP file, populating the following IPTC fields with relevant image data pulled from the website:

| IPTC | data 
|----------|----------|
| SubjectCode  | URL  | 
| Headline  | Title of webpage  |
| Description  | any selected text |


## **REQUIREMENTS**
- **Opera One** (version: 120.0.5543.61) (x86_64)  
- **Chromium** version: 135.0.7049.115  
- **macOS** (anything that will run the above browser version)

## 

This is a lightweight, streamlined version of the cross-platform extension I originally built for Firefox (back in version 3).

I realised that much of what the old extension handled could be achieved with far less complexity (although some features were removed in the process). Even so, this script still performs roughly 80–90% of the original functionality.

This script will work with Opera One (version 120.0.5543.61) but not with later versions, so you will need to disable auto-updates:

https://blogs.opera.com/desktop/2025/07/opera-120-0-5543-61-stable-update/

1. Locate the Opera helper or updater executable, typically at:  
   ```bash
   /Applications/Opera.app/Contents/MacOS/opera_autoupdate

2. Rename or move it:
   ```bash
   mv opera_autoupdate opera_autoupdate.bak

3. Alternatively, remove its execution permission:
   ```bash
   chmod -x opera_autoupdate


Originally, ExifTool was bundled with the extension to write metadata directly into JPEG files, allowing downloaded images to be searchable at the OS level (Windows/macOS/Linux). Since I now use image-management software, I can live without that former key feature, as the image file and its sidecar XMP metadata file are paired upon import.
