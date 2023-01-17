/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */


const createMetadata = (main, document) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }

  const desc = document.querySelector('[property="og:description"]');
  if (desc) {
    meta.Description = desc.content;
  }

  const img = document.querySelector('[property="og:image"]');
  if (img && img.content) {
    const el = document.createElement('img');
    el.src = img.content;
    meta.Image = el;
  }

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
};

const reorganiseHero = (main, document) => {
  let h1 = main.querySelector('h1');
  if (!h1) {
    // promote first h2 to h1
    const h2 = main.querySelector('h2');
    if (h2) {
      const h = document.createElement('h1');
      h.innerHTML = h2.innerHTML;
      h2.replaceWith(h);
      h1 = h;
    }
  }
  if (h1) {
    const container = h1.closest('.container');
    if (container) {
      const img = container.querySelector('picture');
      if (img) {
        h1.after(img);
      }
    }
    container.append(document.createElement('hr'));
  }
};

const handleXFs = (main) => {
  // TODO: handle XF in the main element
  const xfs = [];
  [...main.querySelectorAll('.xf, .dxf')].forEach((xf) => {
    const id = xf.getAttribute('id') || xf.getAttribute('data-personalization');
    xfs.push(id);
    xf.remove();
  });
  return xfs;
};

const handleForms = (main) => {
  // TODO: handle forms in the main element
  const forms = [];
  [...main.querySelectorAll('form')].forEach((f) => {
    const id = f.getAttribute('id');
    forms.push(id);
    const container = f.closest('.container');
    if (container) {
      container.remove();
    } else {
      f.remove();
    }
  });
  return forms;
};

const tabsToBlocks = (main, document) => {
  [...main.querySelectorAll('con-tablist')].forEach((tablist) => {
    const cells = [['Tabs']];
    const container = tablist.closest('.dexter-FlexContainer-Items');
    const tabs = [...container.children].slice(1);
    tablist.querySelectorAll('[role="tab"]').forEach((header, index) => {
      const row = [];
      row.push(header.textContent);
      row.push(tabs[index].innerHTML);
      cells.push(row);
    });
    const table = WebImporter.DOMUtils.createTable(cells, document);
    container.replaceWith(table);
  });
};

const handleVideos = (main, document, origin) => {
  [...main.querySelectorAll('video')].forEach((video) => {
    if (video.classList.contains('video-desktop')) {
      const source = video.querySelector('source');
      if (source) {
        const a = document.createElement('a');
        const src = `${origin}${source.src}`;
        a.href = src;
        a.textContent = src;
        video.replaceWith(a);
      }
    } else {
      video.remove();
    }
  });
};

const guessColumnsBlocks = (main, document) => {
  const containers = [...document.body.querySelectorAll('.dexter-FlexContainer-Items')].filter((c) => {
    if (c.childElementCount < 2) return false; // ignore empty containers and single element containers
    let ancestor = c, keep;
    do {
        ancestor = ancestor.parentElement.closest('.dexter-FlexContainer-Items');
        keep = !ancestor || (ancestor.childElementCount < 2)
    } while (ancestor && keep);
    if (keep) c.style.backgroundColor = 'red';
    else c.style.backgroundColor = '';
    return keep;
  });
  
  containers.forEach((container) => {
    if (container.closest('table') || container.querySelector('h1')) return; // exclude existing blocks or hero
    let columns = [...container.children];
    if (columns.length === 0) return;
    if (columns.length > 0 && columns[0].classList.contains('title')) {
      container.before(columns[0]);
      columns = columns.slice(1);
    }
    if (columns.length === 0) return;
    if (columns.length > 1) {
      const cells = [['Columns']];
      columns.forEach((col) => {
        const row = [];
        row.push(col.innerHTML);
        cells.push(row);
      });
      const table = WebImporter.DOMUtils.createTable(cells, document);
      container.replaceWith(table);
    } else {
      const tc = columns[0].textContent.trim();
      if (tc !== '') {
        container.append(document.createElement('hr'));
      }
    }
  });
};

export default {
  /**
   * Apply DOM operations to the provided document and return an array of
   * objects ({ element: HTMLElement, path: string }) to be transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @returns {Array} The { element, path } pairs to be transformed
   */
  transform: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    const origin = new URL(params.originalURL).origin;
    // define the main element: the one that will be transformed to Markdown
    const main = document.body;

    // use helper method to remove header, footer, etc.
    WebImporter.DOMUtils.remove(main, [
      'header',
      '.globalnavheader',
      '.globalNavHeader',
      '.globalnavfooter',
      '.globalNavFooter',
      '.modalContainer',
      '.drawerContainer',
      'style',
    ]);

    reorganiseHero(main, document);
    handleVideos(main, document, origin);

    tabsToBlocks(main, document);

    const xfs = handleXFs(main);
    const forms = handleForms(main);

    guessColumnsBlocks(main, document);

    // create the metadata block and append it to the main element
    createMetadata(main, document);

    return [{
      element: main,
      path: new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, ''),
      report: {
        'Experience Fragments': xfs,
        'Forms': forms,
      }
    }];
  },
};