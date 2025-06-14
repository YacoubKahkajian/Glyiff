/**
 * GIF handling functions for Glyiff
 */

import { elements } from "./main.js";

/**
 * Handle loading and processing of GIF files
 * @param {string} url - URL of the GIF
 * @param {HTMLCanvasElement} canvas - Canvas element for rendering
 * @param {Function} onFrameDrawn - Callback function for when a frame is drawn
 * @returns {Promise<Object>} - Promise resolving to animator object
 */
export function loadGif(url, canvas, onFrameDrawn) {
  return new Promise((resolve) => {
    gifler(url).get(function (animator) {
      animator.onDrawFrame = onFrameDrawn;
      animator.animateInCanvas(canvas);
      resolve(animator);
    });
  });
}

/**
 * Draw a single frame of the GIF animation
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} frame - Frame object from gifler
 * @param {number} canvasWidth - Width of the canvas
 * @param {number} originalHeight - Original height of the image
 * @param {number} lineCount - Number of text lines
 * @param {Function} textCallback - Callback function to redraw text
 */
export function drawGifFrame(
  ctx,
  frame,
  canvasWidth,
  originalHeight,
  lineCount,
  textCallback,
) {
  // Calculate the additional space needed for text
  const textAreaHeight = lineCount * 60;

  // Fill the text area with white
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvasWidth, frame.y + textAreaHeight);

  // Draw the GIF frame below the text area
  ctx.drawImage(
    frame.buffer,
    frame.x,
    frame.y + textAreaHeight,
    canvasWidth,
    originalHeight,
  );

  // Redraw text on top of the frame
  if (textCallback && typeof textCallback === "function") {
    textCallback();
  }
}

/**
 * Create and download a modified GIF with caption text
 * @param {Object} animator - Gifler animator object
 * @param {HTMLCanvasElement} canvas - Canvas element with the modified GIF
 * @param {Function} onDrawFrame - Custom frame drawing function
 * @param {string} filename - Name for the downloaded file
 */
export function downloadGif(
  animator,
  canvas,
  onDrawFrame,
  filename = "modified-animation.gif",
) {
  // Reset animation to start from the beginning
  animator.reset();

  // Get total number of frames in the GIF
  const totalFrames = animator._reader.numFrames();
  let capturedFrames = 0;

  // Create a new GIF encoder
  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: canvas.width,
    height: canvas.height,
  });

  // Store the original onDrawFrame function to restore later
  const originalOnDrawFrame = animator.onDrawFrame;

  // Set a new draw frame handler to capture each frame
  animator.onDrawFrame = function (ctx, frame) {
    // Draw the frame using the provided function
    onDrawFrame(ctx, frame);

    if (capturedFrames < totalFrames) {
      // Create a copy of the canvas for this frame
      const frameCanvas = document.createElement("canvas");
      frameCanvas.width = canvas.width;
      frameCanvas.height = canvas.height;
      const frameCtx = frameCanvas.getContext("2d");
      frameCtx.drawImage(canvas, 0, 0);

      // Add the frame to the GIF with the original delay
      gif.addFrame(frameCanvas, { delay: frame.delay || 100 });
      capturedFrames++;

      // Update the loading bar
      let percentCaputured = (capturedFrames / totalFrames) * 100;
      elements.downloadLabel.innerHTML = "<span>RECORDING...</span>";
      elements.downloadLabel.style.color = "gray";
      elements.downloadLabel.style.background = `linear-gradient(to right, black ${percentCaputured}%, white ${percentCaputured}%, white 100%)`;

      // When all frames are captured, stop animation and render the GIF
      if (capturedFrames >= totalFrames) {
        animator.stop();

        // Add a small delay to ensure all frames are processed
        setTimeout(() => {
          gif.render();
        }, 100);
      }
    }
  };

  // Handle the finished GIF
  gif.on("finished", function (blob) {
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    link.click();

    // Clean up
    URL.revokeObjectURL(url);

    // Restore original draw function
    animator.onDrawFrame = originalOnDrawFrame;

    elements.downloadLabel.innerHTML = "<span>ALL DONE!</span>";
    elements.downloadLabel.style.color = "white";
    elements.downloadLabel.style.backgroundColor = "black";
    elements.downloadLabel.classList.add("animate");
  });

  // Start the animation to trigger frame capture
  animator.start();
}

/**
 * Initialize canvas with sample text
 * @param {HTMLCanvasElement} canvas - Canvas element
 */
export function initializeCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f1f1f1";
  ctx.fillRect(0, 0, 400, 400);
  ctx.fillStyle = "gray";
  ctx.font = "20px sans-serif";
  ctx.fillText("Click here to try a sample GIF.", 70, 200);
}
