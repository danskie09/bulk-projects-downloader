document.addEventListener('DOMContentLoaded', () => {
  const selectBtn = document.getElementById('selectBtn');
  const folderInput = document.getElementById('folderName');

  selectBtn.addEventListener('click', async () => {
    const folderName = folderInput.value.trim() || 'proj1';
    
    // Save folder name to local storage or pass it to content script
    // For now, we'll pass it to the content script so it can pass it back to background later
    
    try {
      const tabs = await browser.tabs.query({active: true, currentWindow: true});
      const activeTab = tabs[0];

      if (!activeTab) {
        window.close();
        return;
      }

      // Send message to content script to enter selection mode
      await browser.tabs.sendMessage(activeTab.id, {
        action: 'ENTER_SELECTION_MODE',
        folderName: folderName
      });

      // Close popup as the interaction is now on the page
      window.close();

    } catch (error) {
      console.error('Error:', error);
      const statusDiv = document.getElementById('status');
      statusDiv.style.display = 'block';
      statusDiv.textContent = 'Error: ' + error.message;
    }
  });
});
