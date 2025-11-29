browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'DOWNLOAD') {
    const { urls, folderName } = message;
    
    if (!urls || !Array.isArray(urls)) return;

    // Clean folder name to be safe for filesystem
    const safeFolderName = folderName.replace(/[^a-z0-9_\-]/gi, '_');

    urls.forEach((url, index) => {
      // Determine extension (default to .jpg if unknown)
      // Facebook URLs usually have .jpg or .png, but often have long query params.
      // We'll try to extract it or default to jpg.
      let ext = 'jpg';
      if (url.includes('.png')) ext = 'png';
      else if (url.includes('.gif')) ext = 'gif';
      
      const filename = `${safeFolderName}/${index + 1}.${ext}`;

      browser.downloads.download({
        url: url,
        filename: filename,
        conflictAction: 'uniquify'
      });
    });
  }
});
