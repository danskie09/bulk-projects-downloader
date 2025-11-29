# Facebook Bulk Image Downloader

A Firefox extension to easily download high-resolution images from Facebook posts and albums.

## Features
- **Interactive Selection**: Click to select specific images or "Select All".
- **Bulk Download**: Download multiple images at once.
- **Smart Filtering**: Automatically ignores small icons and avatars.
- **Organized Folders**: Saves images to a custom folder (default: `proj1`) with sequential naming.
- **Lightbox Support**: Works seamlessly within Facebook's theater/lightbox mode.

## Installation

1.  Open Firefox and navigate to `about:debugging`.
2.  Click on **"This Firefox"** in the left sidebar.
3.  Click **"Load Temporary Add-on..."**.
4.  Select the `manifest.json` file located in this directory.

## Usage

1.  **Navigate**: Go to a Facebook post or album and click an image to open the Lightbox (black overlay view).
2.  **Activate**: Click the extension icon in the browser toolbar.
3.  **Configure**: Enter a folder name (optional, defaults to `proj1`) and click **"Select Images"**.
4.  **Select**:
    - A floating bar will appear at the bottom.
    - Click on images to select them (green checkmark appears).
    - Or click **"Select All"** in the floating bar.
    - *Note: You can navigate to the next/previous image, and the extension will detect new images automatically.*
5.  **Download**: Click **"Download"** on the floating bar.
6.  **Done**: Images will be saved to your default Downloads folder under the specified subfolder.

## Permissions
- `downloads`: To save files to your computer.
- `activeTab`: To interact with the current Facebook page.
- `scripting`: To inject the selection UI.
