import fs from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';
import prettier from 'prettier';
import postcss from 'postcss';

function isInsideMedia(node) {
  let parent = node.parent;
  while (parent) {
    if (parent.type === 'atrule' && parent.name === 'media') {
      return true;
    }
    parent = parent.parent;
  }
  return false;
}

// Function to convert a wildcard pattern to a regex
function wildcardToRegex(pattern) {
  // Escape regex special characters except asterisk
  const escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  // Replace asterisks with regex wildcard pattern
  return new RegExp('^' + escapedPattern.replace(/\*/g, '.*') + '$');
}

async function transform() {
  const configPath = path.join(process.cwd(), 'site', 'transform.json');
  const configDir = path.dirname(configPath);

  try {
    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    const timestamp = Date.now();

    for (const [filePath, transformations] of Object.entries(config)) {
      const fullPath = path.join(configDir, filePath);
      const ext = path.extname(fullPath);

      if (ext === '.html') {
        let html = await fs.readFile(fullPath, 'utf-8');
        const $ = cheerio.load(html, { decodeEntities: false });

        if (transformations.replace) {
          for (const replace of transformations.replace) {
            // const newAttrValue = `${replace.replace}?v=${timestamp}`;
            const newAttrValue = `${replace.replace}`;
            
            // Handle patterns with wildcards
            if (replace.search.includes('*')) {
              const regex = wildcardToRegex(replace.search);
              
              // Find elements with the specified tag and attribute, then check if the attribute value matches the regex
              $(replace.tag).each((i, elem) => {
                const attrValue = $(elem).attr(replace.attr);
                if (attrValue && regex.test(attrValue)) {
                  $(elem).attr(replace.attr, newAttrValue);
                }
              });
            } else {
              // Existing code for exact matches
              $(`${replace.tag}[${replace.attr}="${replace.search}"]`).attr(replace.attr, newAttrValue);
            }
          }
        }

        if (transformations.inject) {
          for (const [selector, injectPath] of Object.entries(transformations.inject)) {
            const injectContent = await fs.readFile(path.join(configDir, injectPath), 'utf-8');
            $(selector).html(injectContent);
          }
        }

        // Pretty print the HTML
        const prettyHtml = await prettier.format($.html(), {
          parser: 'html',
          printWidth: 120,
          tabWidth: 2,
          useTabs: false,
          singleQuote: false,
          bracketSameLine: true,
        });

        await fs.writeFile(fullPath, prettyHtml);
        console.log(`Transformed and prettified: ${fullPath}`);
      } else if (ext === '.css') {
        // New CSS processing logic
        let css = await fs.readFile(fullPath, 'utf-8');
        const root = postcss.parse(css);

        if (transformations.cssTransforms) {
          for (const transform of transformations.cssTransforms) {
            const matchedRules = [];
            root.walkRules(rule => {
              if (!isInsideMedia(rule) && rule.selector === transform.selector) {
                matchedRules.push(rule);
              }
            });

            if (matchedRules.length === 0) {
              console.warn(`Selector "${transform.selector}" not found in ${filePath}`);
              continue;
            }

            const lastRule = matchedRules[matchedRules.length - 1];

            // Replace existing properties
            if (transform.replace) {
              Object.entries(transform.replace).forEach(([prop, value]) => {
                const decl = lastRule.nodes.find(n => n.prop === prop);
                if (decl) decl.value = value;
              });
            }

            // Add new properties (overwrite if exists)
            if (transform.add) {
              Object.entries(transform.add).forEach(([prop, value]) => {
                const decl = lastRule.nodes.find(n => n.prop === prop);
                if (decl) {
                  decl.value = value;
                } else {
                  lastRule.append({ prop, value });
                }
              });
            }
          }
        }

        const processedCss = root.toString();
        // Intentionally not prettifying the CSS because it
        // creates a lot of whitespace changes.
        await fs.writeFile(fullPath, processedCss);
        console.log(`Transformed and prettified CSS: ${fullPath}`);
      }
    }

    const currentTime = new Date().toLocaleString();
    console.log(`\nTransformation completed at ${currentTime}\n`);
  } catch (error) {
    console.error(`Error processing transform task:`, error.message);
    process.exit(1);
  }
}

transform().catch(console.error);
