
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");


module.exports = function(config) {

  // A useful way to reference the context we are runing eleventy in
  let env = process.env.ELEVENTY_ENV;

  // Layout aliases can make templates more portable
  config.addLayoutAlias('default', 'layouts/base.njk');

  // Add some utility filters
  config.addFilter("squash", require("./src/utils/filters/squash.js") );
  config.addFilter("dateDisplay", require("./src/utils/filters/date.js") );  
  config.addShortcode("year", () => `${new Date().getFullYear()}`);


  // Case studies, ordered by the `order` value in each file's front matter.
  // Anything with `draft: true` is left out of the homepage list and the
  // next-case-study link. Pair it with `permalink: false` to stop the page
  // being built at all.
  config.addCollection("caseStudies", function(collection) {
    return collection.getFilteredByTag("case-study")
      .filter(item => !item.data.draft)
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  });


  // add support for syntax highlighting
  config.addPlugin(syntaxHighlight);

  // minify the html output
  config.addTransform("htmlmin", require("./src/utils/minify-html.js"));

  // compress and combine js files
  config.addFilter("jsmin", function(code) {
    const UglifyJS = require("uglify-js");
    let minified = UglifyJS.minify(code);
      if( minified.error ) {
          console.log("UglifyJS error: ", minified.error);
          return code;
      }
      return minified.code;
  });


  // pass some assets right through
  config.addPassthroughCopy("./src/site/images");

  // make the seed target act like prod
  env = (env=="seed") ? "prod" : env;
  return {
    dir: {
      input: "src/site",
      output: "dist",
      data: `_data/${env}`
    },
    templateFormats : ["njk", "md", "html", "11ty.js"],
    htmlTemplateEngine : "njk",
    markdownTemplateEngine : "njk",
    passthroughFileCopy: true
  };

};
