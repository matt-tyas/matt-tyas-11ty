const htmlmin = require("html-minifier");

module.exports = function(content, outputPath) {
  // outputPath is false for pages with `permalink: false`, so guard before using it
  if( outputPath && outputPath.endsWith(".html") ) {
    let minified = htmlmin.minify(content, {
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true
    });
    return minified;
  }
  return content;
}
