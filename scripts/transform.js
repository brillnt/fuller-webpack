import fs from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';
import prettier from 'prettier';

async function transform() {
  const configPath = path.join(process.cwd(), 'site', 'transform.json');
  const configDir = path.dirname(configPath);

  try {
    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));

    for (const [filePath, transformations] of Object.entries(config)) {
      const fullPath = path.join(configDir, filePath);
      let html = await fs.readFile(fullPath, 'utf-8');
      const $ = cheerio.load(html, { decodeEntities: false });

      if (transformations.replace) {
        for (const replace of transformations.replace) {
          $(`${replace.tag}[${replace.attr}="${replace.search}"]`).attr(replace.attr, replace.replace);
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
    }
  } catch (error) {
    console.error(`Error processing transform task:`, error.message);
    process.exit(1);
  }
}

transform().catch(console.error);