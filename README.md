WHAT DOES THIS SCRIPT DO ?
This script works as a desktop plug-in to allow for a single mouse click (holding the Command key on macOS) to download a visible image.
It will pair it with an exported XMP file, populating the following IPTC fields with relevant image data from the website:

| IPTC | data 
|----------|----------|
| SubjectCode  | URL  | 
| Headline  | Title of webpage  |
| Description  | any selected text |


REQUIREMENTS:
Opera One(version: 120.0.5543.61) (x86_64) 
Chromium version:135.0.7049.115
macOS (anything that will run the above browser version)


This is a light weight streamlined version of the cross platform extension I used to have for FireFox (way back in version 3).

I found that much of what I had could actually be performed with a lot less complexity, although this meant some of the features were missing, but it still functioning about 80-90% of what it was.

This scrip will work with Opera One(version: 120.0.5543.61) (x86_64) and not after. So you will have to stop the auto update.

 
Originally ExifTool was bundled with the extension to write to JPEG files so that the downloaded image could be searched for. But, as I use image management software I could like without that (one time) key feature as the image file and sidecar XMP metadata file would pair the data on import anyway.
