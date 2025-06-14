/**
 * Utility functions for Glyiff
 */

/**
 * Toggle animation class and update button text
 * @param {HTMLElement} buttonText - The button text element
 * @param {string} activeText - Text to display when active
 * @param {string} inactiveText - Text to display when inactive
 */
export function toggleButtonState(buttonText, activeText, inactiveText) {
  if (buttonText.innerHTML === activeText) {
    buttonText.innerHTML = inactiveText;
  } else {
    buttonText.innerHTML = activeText;
  }
  buttonText.classList.toggle("animate");
}

/**
 * Create a new canvas element to replace the existing one
 * @param {string} canvasId - ID of the canvas element
 * @param {string} containerId - ID of the container element
 * @returns {HTMLCanvasElement} - The newly created canvas
 */
export function createFreshCanvas(canvasId, containerId) {
  const oldCanvas = document.getElementById(canvasId);
  oldCanvas.remove();
  
  const newCanvas = document.createElement("canvas");
  newCanvas.setAttribute("id", canvasId);
  newCanvas.setAttribute("width", 0);
  newCanvas.setAttribute("height", 0);
  
  const container = document.getElementById(containerId);
  container.appendChild(newCanvas);
  
  return document.getElementById(canvasId);
}

/**
 * Resize image to fit within maximum dimensions while maintaining aspect ratio
 * @param {number} originalWidth - Original width of the image
 * @param {number} originalHeight - Original height of the image
 * @param {number} maxHeight - Maximum allowed height
 * @returns {Object} - Object containing new width and height
 */
export function calculateImageDimensions(originalWidth, originalHeight, maxHeight = 400) {
  if (originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }
  
  const aspectRatio = originalWidth / originalHeight;
  const newHeight = maxHeight;
  const newWidth = newHeight * aspectRatio;
  
  return { width: newWidth, height: newHeight };
}