export default function createTabs(main, document) {
  [...main.querySelectorAll('con-tablist')].forEach((tablist) => {
    const tabCells = [['Tabs']];
    const list = document.createElement('ol');
    tabCells.push([list]);

    const container = tablist.closest('.dexter-FlexContainer-Items');
    const tabs = [...container.children].slice(1);
    const allTabs = document.createElement('div');
    tablist.querySelectorAll('[role="tab"]').forEach((header, index) => {
      const li = document.createElement('li');
      li.innerHTML = header.textContent;
      list.append(li);
      
      const sectionMetadataCells = [['Section Metadata']];
      sectionMetadataCells.push(['tab', header.textContent]);

      const div = document.createElement('div');
      div.append(document.createElement('hr'));
      div.append(tabs[index]);
      div.append(WebImporter.DOMUtils.createTable(sectionMetadataCells, document));

      allTabs.append(div);
    });
    container.after(allTabs);
    container.replaceWith(WebImporter.DOMUtils.createTable(tabCells, document));
  });
};
