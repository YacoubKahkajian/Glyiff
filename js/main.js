/**
 * Main application file for Glyiff
 */
import {
  toggleButtonState,
  createFreshCanvas,
  calculateImageDimensions,
} from "./utils.js";
import { breakTextIntoLines, drawTextLines } from "./textHandler.js";
import {
  loadGif,
  drawGifFrame,
  downloadGif,
  initializeCanvas,
} from "./gifHandler.js";

// DOM Elements
export const elements = {
  fileInput: document.getElementById("input"),
  captionInput: document.getElementById("caption"),
  fontDropdown: document.getElementById("fontDropdown"),
  boldCheckbox: document.getElementById("boldText"),
  boldButton: document.getElementById("boldTextButton"),
  squeezeCheckbox: document.getElementById("squeezeText"),
  squeezeButton: document.getElementById("squeezeTextButton"),
  downloadButton: document.getElementById("download"),
  downloadLabel: document.getElementById("downloadButton"),
  colorPicker: document.getElementById("textColor"),
  canvas: document.getElementById("view"),
};

// Application State
const state = {
  originalWidth: 0,
  originalHeight: 0,
  textLines: [],
  lineCount: 1,
  animator: null,
  canvasContext: elements.canvas.getContext("2d"),
};

// Initialize the application
function init() {
  // Set up event listeners
  elements.fileInput.addEventListener("change", () => handleGifUpload(false));
  elements.captionInput.addEventListener("input", updateCaptionText);
  elements.fontDropdown.addEventListener("input", updateCaptionText);
  elements.colorPicker.addEventListener("input", updateCaptionText);
  elements.canvas.addEventListener("click", loadSampleGif);
  elements.downloadButton.addEventListener("click", handleDownload);

  // Set up toggle buttons
  elements.boldCheckbox.addEventListener("click", () => {
    toggleButtonState(elements.boldButton, "Bold!", "Bold?");
    updateCaptionText();
  });

  elements.squeezeCheckbox.addEventListener("click", () => {
    toggleButtonState(elements.squeezeButton, "Squeeze!", "Squeeze?");
    updateCaptionText();
  });

  // Initialize canvas with sample text prompt
  initializeCanvas(elements.canvas);
}

/**
 * Handle GIF file upload or sample loading
 * @param {boolean} useSample - Whether to use the sample GIF
 */
async function handleGifUpload(useSample) {
  // Reset state and UI
  resetApplication();

  // Create image object for the GIF
  const img = new Image();
  img.src = useSample
    ? "resources/sample.gif"
    : URL.createObjectURL(elements.fileInput.files[0]);

  img.onload = async function () {
    // Calculate dimensions based on max height
    const dimensions = calculateImageDimensions(img.width, img.height);
    elements.canvas.width = dimensions.width;
    elements.canvas.height = dimensions.height;

    // Store original dimensions for later use
    state.originalWidth = dimensions.width;
    state.originalHeight = dimensions.height;

    // Load and animate the GIF
    state.animator = await loadGif(img.src, elements.canvas, onFrameDraw);
  };

  // Remove sample click handler once a GIF is loaded
  if (useSample) {
    elements.canvas.removeEventListener("click", loadSampleGif);
  }
}

/**
 * Handle frame drawing for GIF animation
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} frame - Frame data from gifler
 */
function onFrameDraw(ctx, frame) {
  drawGifFrame(
    ctx,
    frame,
    state.originalWidth,
    state.originalHeight,
    state.lineCount,
    updateCaptionText,
  );
}

/**
 * Update caption text on the canvas
 */
function updateCaptionText() {
  const ctx = state.canvasContext;
  const text = elements.captionInput.value;

  // Break text into lines
  const result = breakTextIntoLines(text, ctx, elements.canvas.width);
  state.textLines = result.lines;

  // If line count changed, resize canvas
  if (result.lineCount !== state.lineCount) {
    state.lineCount = result.lineCount;
    elements.canvas.height = state.originalHeight + state.lineCount * 60;
  }

  // Draw text lines on the canvas
  drawTextLines(ctx, state.textLines, elements.canvas.width, {
    fontFamily: elements.fontDropdown.value,
    isBold: elements.boldCheckbox.checked,
    isCondensed: elements.squeezeCheckbox.checked,
    color: elements.colorPicker.value,
    fontSize: 30,
  });
}

/**
 * Reset the application state
 */
function resetApplication() {
  // Create a fresh canvas to avoid gif rendering issues
  elements.canvas = createFreshCanvas("view", "canvasLocation");
  state.canvasContext = elements.canvas.getContext("2d");

  // Reset state variables
  elements.captionInput.value = "";
  state.textLines = [];
  state.lineCount = 1;
  state.originalWidth = 0;
  state.originalHeight = 0;
}

/**
 * Load sample GIF when canvas is clicked
 */
function loadSampleGif() {
  handleGifUpload(true);
}

/**
 * Handle download button click
 */
function handleDownload() {
  // TODO: move this part down after testing
  console.log("download button clicked");

  if (!state.animator) return;

  downloadGif(
    state.animator,
    elements.canvas,
    onFrameDraw,
    "glyiff-caption.gif",
  );
}

// Initialize the application when DOM is ready
document.addEventListener("DOMContentLoaded", init);
