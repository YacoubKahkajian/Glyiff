/**
 * Text handling functions for Glyiff
 */

/**
 * Break caption text into multiple lines based on canvas width
 * @param {string} text - The text to break into lines
 * @param {CanvasRenderingContext2D} ctx - Canvas context for text measurement
 * @param {number} canvasWidth - Width of the canvas
 * @returns {Object} - Object containing array of text lines and line count
 */
export function breakTextIntoLines(text, ctx, canvasWidth) {
  const lines = [];
  let currentLine = "";
  let i = 0;
  
  // If text is empty, return empty array
  if (!text) return { lines: [], lineCount: 0 };
  
  // Calculate approximate character limit based on canvas width
  const charLimit = Math.floor(canvasWidth / ctx.measureText("a").width);
  
  while (i < text.length) {
    // Add characters until we reach the limit or end of text
    currentLine = text.substring(0, ++i);
    
    // Check if we've reached character limit for this line
    if (i > charLimit) {
      // Find last space to break at word boundary
      let breakIndex = currentLine.lastIndexOf(" ");
      
      // If no space found, break at character level
      if (breakIndex < 0) {
        breakIndex = i - 1;
      }
      
      // Add line to array
      lines.push(text.substring(0, breakIndex));
      
      // Continue with remaining text
      text = text.substring(breakIndex + 1);
      i = 0;
      currentLine = "";
    } 
    // Add final line when we reach end of text
    else if (i === text.length) {
      lines.push(currentLine);
    }
  }
  
  return { lines: lines, lineCount: lines.length };
}

/**
 * Apply font settings to the canvas context
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} options - Font options
 * @param {string} options.fontFamily - Font family
 * @param {boolean} options.isBold - Whether text should be bold
 * @param {boolean} options.isCondensed - Whether text should be condensed
 * @param {string} options.color - Text color
 * @param {number} options.fontSize - Font size in pixels
 */
export function applyFontSettings(ctx, options) {
  const { fontFamily, isBold, isCondensed, color, fontSize = 30 } = options;
  
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  
  let fontString = `${fontSize}px ${fontFamily}`;
  
  if (isBold) {
    fontString = `bold ${fontString}`;
  }
  
  if (isCondensed) {
    fontString = `condensed ${fontString}`;
  }
  
  ctx.font = fontString;
}

/**
 * Draw text on the canvas with the given settings
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string[]} lines - Array of text lines
 * @param {number} canvasWidth - Width of the canvas
 * @param {Object} options - Font options
 * @param {number} lineHeight - Height between lines
 */
export function drawTextLines(ctx, lines, canvasWidth, options, lineHeight = 50) {
  applyFontSettings(ctx, options);
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    ctx.fillText(line, canvasWidth / 2, lineNumber * lineHeight);
  });
}