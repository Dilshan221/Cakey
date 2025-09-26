// postcss.public.config.js
const prefixer = require("postcss-prefix-selector");

module.exports = {
  plugins: [
    prefixer({
      prefix: ".public-container",
      transform: (prefix, selector, prefixedSelector) => {
        // Skip keyframes, :root, etc.
        if (
          selector.match(/^(@|to$|from$)/) ||
          selector.includes("keyframes") ||
          selector === ":root"
        ) {
          return selector;
        }

        // html/body should still be scoped
        if (selector === "html" || selector === "body") {
          return `${prefix} ${selector}`;
        }

        // Avoid double prefixing
        if (selector.startsWith(prefix)) return selector;

        return prefixedSelector;
      },
    }),
  ],
};
