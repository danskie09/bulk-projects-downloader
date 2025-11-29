(function() {
  let selectedImages = new Set();
  let folderName = 'proj1';
  let isSelectionMode = false;
  let floatingBar = null;

  /**
   * Scans for images and returns the IMG elements.
   */
  function getImages() {
    // 1. Try to find the Lightbox container (Dialog)
    const lightbox = document.querySelector('[role="dialog"]');
    const searchContext = lightbox || document;
    
    // Get all images
    const images = Array.from(searchContext.querySelectorAll('img'));
    const minSize = 400;

    return images.filter(img => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      return width >= minSize && height >= minSize && img.src && !img.src.startsWith('data:');
    });
  }

  function toggleSelection(imgSrc, element) {
    if (selectedImages.has(imgSrc)) {
      selectedImages.delete(imgSrc);
      element.classList.remove('fb-downloader-selected');
    } else {
      selectedImages.add(imgSrc);
      element.classList.add('fb-downloader-selected');
    }
    updateBar();
  }

  function updateBar() {
    if (!floatingBar) return;
    const count = selectedImages.size;
    const downloadBtn = floatingBar.querySelector('#fb-download-btn');
    downloadBtn.textContent = `Download (${count})`;
    downloadBtn.disabled = count === 0;
  }

  function createOverlay(img) {
    // Check if already has overlay
    if (img.parentNode.classList.contains('fb-downloader-overlay-container')) {
      return;
    }

    const container = document.createElement('div');
    container.className = 'fb-downloader-overlay-container';
    
    // Insert container before img
    img.parentNode.insertBefore(container, img);
    // Move img into container
    container.appendChild(img);

    const overlay = document.createElement('div');
    overlay.className = 'fb-downloader-overlay';
    
    const checkmark = document.createElement('div');
    checkmark.className = 'fb-downloader-checkmark';
    checkmark.textContent = '✓';
    
    overlay.appendChild(checkmark);
    container.appendChild(overlay);

    // Click handler
    container.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSelection(img.src, container);
    });
  }

  function createFloatingBar() {
    if (document.getElementById('fb-downloader-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'fb-downloader-bar';
    bar.className = 'fb-downloader-bar';
    
    bar.innerHTML = `
      <button id="fb-select-all" class="fb-downloader-btn secondary">Select All</button>
      <button id="fb-download-btn" class="fb-downloader-btn">Download (0)</button>
      <button id="fb-close" class="fb-downloader-close">✕</button>
    `;

    document.body.appendChild(bar);
    floatingBar = bar;

    // Event Listeners
    bar.querySelector('#fb-select-all').addEventListener('click', () => {
      const images = getImages();
      let allSelected = true;
      
      // Check if all currently visible are selected
      for (let img of images) {
        if (!selectedImages.has(img.src)) {
          allSelected = false;
          break;
        }
      }

      if (allSelected) {
        // Deselect all
        selectedImages.clear();
        document.querySelectorAll('.fb-downloader-overlay-container').forEach(el => {
          el.classList.remove('fb-downloader-selected');
        });
      } else {
        // Select all
        images.forEach(img => {
          selectedImages.add(img.src);
          // Find container
          const container = img.closest('.fb-downloader-overlay-container');
          if (container) container.classList.add('fb-downloader-selected');
        });
      }
      updateBar();
    });

    bar.querySelector('#fb-download-btn').addEventListener('click', () => {
      if (selectedImages.size === 0) return;
      
      browser.runtime.sendMessage({
        action: 'DOWNLOAD',
        urls: Array.from(selectedImages),
        folderName: folderName
      });
      
      // Optional: Close after download
      cleanup();
    });

    bar.querySelector('#fb-close').addEventListener('click', cleanup);
  }

  let observer = null;

  function scanAndOverlay() {
    if (!isSelectionMode) return;
    const images = getImages();
    images.forEach(createOverlay);
    
    // Re-apply selection state if needed (though usually URL stays same, element changes)
    // If the element is new, it won't have the class.
    // We check if the URL is in our selected set.
    images.forEach(img => {
      if (selectedImages.has(img.src)) {
        const container = img.closest('.fb-downloader-overlay-container');
        if (container && !container.classList.contains('fb-downloader-selected')) {
          container.classList.add('fb-downloader-selected');
        }
      }
    });
  }

  function enterSelectionMode(reqFolderName) {
    if (isSelectionMode) return;
    isSelectionMode = true;
    folderName = reqFolderName;

    scanAndOverlay();
    createFloatingBar();

    // Observe DOM changes to handle navigation (Next/Prev buttons)
    if (!observer) {
      observer = new MutationObserver((mutations) => {
        // Debounce or just run? Facebook updates can be frequent.
        // Let's run it. getImages filters efficiently.
        scanAndOverlay();
      });
      
      // Observe the body or the lightbox container if possible
      // Observing body is safest for when Lightbox is created/destroyed
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  function cleanup() {
    isSelectionMode = false;
    selectedImages.clear();
    
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    
    // Remove bar
    if (floatingBar) {
      floatingBar.remove();
      floatingBar = null;
    }

    // Remove overlays (unwrap images)
    document.querySelectorAll('.fb-downloader-overlay-container').forEach(container => {
      const img = container.querySelector('img');
      const overlay = container.querySelector('.fb-downloader-overlay');
      if (overlay) overlay.remove();
      
      // Move img back to parent
      if (img) {
          container.parentNode.insertBefore(img, container);
      }
      container.remove();
    });
  }

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'ENTER_SELECTION_MODE') {
      enterSelectionMode(message.folderName);
    }
  });

})();
