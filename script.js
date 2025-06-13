const fileElem = document.getElementById("input");
const caption = document.getElementById("caption");
const fontDropdown = document.getElementById("fontDropdown");
const boldText = document.getElementById("boldText");
const boldButtonText = document.getElementById("boldTextButton");
const squeezeText = document.getElementById("squeezeText");
const squeezeButtonText = document.getElementById("squeezeTextButton");
const downloadButton = document.getElementById("download");
const textColor = document.getElementById("textColor");
let c = document.getElementById("view");
let originalHeight = 0;
let originalWidth = 0;
let breaks = 1;
let giflerObject;

fileElem.addEventListener(
  "change",
  function () {
    handleFiles(false);
  },
  false,
);
caption.addEventListener("input", addText);
fontDropdown.addEventListener(
  "input",
  function () {
    // document.querySelector(".disclaimer").classList.remove("hidden");
  },
  false,
);
c.addEventListener("click", sample);
downloadButton.addEventListener("click", downloadCanvas);

// Sample text on first load.
c.getContext("2d").fillStyle = "#f1f1f1";
c.getContext("2d").fillRect(0, 0, 400, 400);
c.getContext("2d").fillStyle = "gray";
c.getContext("2d").font = "20px sans-serif";
c.getContext("2d").fillText("Click here to try a sample GIF.", 70, 200);

// Adding a little personality to the button.
if (boldText.checked) {
  boldButtonText.innerHTML = "Bold!";
}

boldText.addEventListener("click", toggleBoldButton);
boldButtonText.addEventListener("keydown", toggleBoldButton);
squeezeText.addEventListener("click", toggleSqueezeButton);
squeezeButtonText.addEventListener("keydown", toggleSqueezeButton);

function toggleBoldButton() {
  if (boldButtonText.innerHTML == "Bold!") {
    boldButtonText.innerHTML = "Bold?";
  } else {
    boldButtonText.innerHTML = "Bold!";
  }
  boldButtonText.classList.toggle("animate");
}

function toggleSqueezeButton() {
  if (squeezeButtonText.innerHTML == "Squeeze!") {
    squeezeButtonText.innerHTML = "Squeeze?";
  } else {
    squeezeButtonText.innerHTML = "Squeeze!";
  }
  squeezeButtonText.classList.toggle("animate");
}

function handleFiles(sample) {
  // Reset everything when a new GIF is uploaded.
  newGif();
  caption.value = "";
  breaks = 1;

  // Replace the img element in the HTML doc with the new image object.
  let img = new Image();
  if (sample) img.src = "resources/sample.gif";
  else img.src = URL.createObjectURL(fileElem.files[0]);
  let url = img.src;
  img.onload = function () {
    gifler(url).get(function (animator) {
      animator.onDrawFrame = onDrawFrame;
      animator.animateInCanvas(c);
      giflerObject = animator;
    });
    // Resize the GIF if it's too big (over 400 pixels high) for the sake of bandwidth,
    // file size limits on other social media websites, and general user-friendliness.
    if (img.height <= 400) {
      c.height = img.height;
      c.width = img.width;
    } else {
      let aspectRatio = img.width / img.height;
      c.height = 400;
      c.width = c.height * aspectRatio;
    }
    // Save the height of the canvas after potential resizing in order to add
    // line breaks.
    originalHeight = c.height;
    originalWidth = c.width;
  };
}

// Additional arguments about how to draw the GIF, including rendering it at
// the bottom of the canvas and filling the caption area with white.
function onDrawFrame(ctx, frame) {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 9999, frame.y + breaks * 60);
  ctx.drawImage(
    frame.buffer,
    frame.x,
    frame.y + breaks * 60,
    originalWidth,
    originalHeight,
  );
  addText();
}

let brokenCaption = []; // Text is broken into elements in an array.

// Along with the self-explanatory name, this function also handles word wrapping.
function addText() {
  const prevBreaks = breaks;
  // document.querySelector(".disclaimer").classList.add("hidden");
  brokenCaption = []; // Reset whatever is currently in brokenCaption.
  let i = 0; // Last character in the line.
  const ctx = c.getContext("2d");
  let text = caption.value;
  let textCheck = ""; // Measure the width of this string.
  while (text.length != textCheck.length) {
    i++;
    textCheck = text.substring(0, i); //Add a new character to textCheck with each loop.

    // Prevent the current line from extending beyond the canvas by establishing a character
    // limit for each line. I set it to be the canvas width divided by what the width of a
    // lowercase "a" in the current font would be since that results in reasonable margins.
    // As you might guess, this would be much easier if all fonts were monospaced.
    if (i > c.width / ctx.measureText("a").width) {
      // Break the text at the last word, except if there aren't any spaces on the current
      // line, in which case break the line at the final character.
      let k = textCheck.lastIndexOf(" ");
      if (k < 0) {
        k = i;
      }

      i = 0;
      brokenCaption.push(text.substring(0, k));
      text = text.substring(k + 1, text.length);
    }

    // Add whatever is left over at the end.
    else if (i == text.length - 1) {
      brokenCaption.push(text.substring(0, i + 1));
    }
  }
  breaks = brokenCaption.length;
  if (breaks != prevBreaks) {
    c.height = originalHeight + breaks * 60;
  }
  changeFont(ctx);
}

function changeFont(ctx) {
  let lineNumber = 0;
  brokenCaption.forEach((line) => {
    lineNumber++;
    ctx.fillStyle = textColor.value;
    ctx.textAlign = "center";
    ctx.font = "30px " + fontDropdown.value;
    if (boldText.checked) {
      ctx.font = "bold " + ctx.font;
    }
    if (squeezeText.checked) {
      ctx.font = "condensed " + ctx.font;
    }
    ctx.fillText(line, c.width / 2, lineNumber * 50);
  });
}

// Gifler is weird when it comes to overwriting GIFs, as you can see distorted "ghost" frames
// from the previous GIF flicker and merge with the new GIF. Canvas methods like clearRect didn't
// solve this issue, so I instead opted to delete the current canvas element altogether and create
// a fresh new one when a new GIF is uploaded.
function newGif() {
  c.remove();
  const newCanvas = document.createElement("canvas");
  newCanvas.setAttribute("id", "view");
  newCanvas.setAttribute("width", 0);
  newCanvas.setAttribute("height", 0);
  const div = document.getElementById("canvasLocation");
  div.appendChild(newCanvas);
  c = document.getElementById("view");
}

function sample() {
  handleFiles(true);
  c.removeEventListener("click", sample);
}

// at long last i have gotten around to implementing this.
function downloadCanvas() {
  console.log("download button clicked");

  giflerObject.reset();
  const recordingLength = giflerObject["_reader"].numFrames();
  let frameCount = 0;
  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: c.width,
    height: c.height,
  });

  giflerObject.onDrawFrame = function (ctx, frame) {
    onDrawFrame(ctx, frame);
    if (frameCount < recordingLength) {
      console.log("Capturing frame:", frameCount, "delay:", frame.delay);

      // Create a copy of the canvas for this frame
      const frameCanvas = document.createElement("canvas");
      frameCanvas.width = c.width;
      frameCanvas.height = c.height;
      const frameCtx = frameCanvas.getContext("2d");
      frameCtx.drawImage(c, 0, 0);

      gif.addFrame(frameCanvas, { delay: frame.delay || 100 });
      frameCount++;

      // Stop animation and render GIF when we've captured all frames
      if (frameCount >= recordingLength) {
        giflerObject.stop();
        console.log("All frames captured, rendering GIF...");
        // Add a small delay to ensure all frames are processed
        setTimeout(() => {
          gif.render();
        }, 100);
      }
    }
  };

  gif.on("finished", function (blob) {
    console.log("GIF rendering finished");
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "modified-animation.gif";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  });

  // Start the animation to trigger frame capture
  giflerObject.start();
}
