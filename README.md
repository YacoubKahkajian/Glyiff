# Glyiff
A light web app for adding captions to GIFs.

Using [Gifler](https://themadcreator.github.io/gifler/) by Bill Dwyer and [gif.js](https://jnordberg.github.io/gif.js/) by Johan Nordberg to draw an animated GIF to an HTML canvas, Glyiff provides an intuitive user interface to customize uploaded GIFs in various ways, such as by...

- Adding a custom caption (with automatic word-wrapping!) at the top.
- Providing options for font styles and weights.
- Allowing the user to pick a text color for their caption.
- Updating the GIF in real time, as text is edited in the text box.

Glyiff runs completely locally on the user's machine! It also uses 100% vanilla JavaScript because me from four years ago was too stubborn to use anything else.

## BIG JUNE 2025 UPDATE
I felt the strange urge this summer to work on this again in my free time. This was one of my very first web projects and boy does it show. Though credit where credit is due, past me was really good when it came to documenting his code. Thank you, past me.

I'm in the middle of restructuring some of the code and adding a swath of new features. Thanks to the [gif.js](https://jnordberg.github.io/gif.js/) library, you can actually **download the GIFs you create now!** We truly live in an age of wonders.

Everything new I have been implementing needs more testing on more devices and more browsers so I'm labelling this update as a beta. There's also still a lot more bugs I want to squash like some weird text rendering quirks (i.e. text doesn't appear on the GIF until you type two characters) and better handling of vertical GIFs.
