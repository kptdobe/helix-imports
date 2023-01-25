const ICONS_MAPPING = {
  // adobe icons
  'desktop_illustrator.svg': 'adobe-illustrator',
  'illustrator.svg': 'adobe-illustrator',
  'Draw_EOL_Page_icon-Ps.svg': 'adobe-photoshop',
  'photoshop.svg': 'adobe-photoshop',
  'indesign.svg': 'adobe-indesign',
  'mnemonic-Fresco-32x32.svg': 'adobe-fresco',
  'dimension.svg': 'adobe-dimension',
  'adobe-fonts.svg': 'adobe-fonts',
  'stock.svg': 'adobe-stock',
  'incopy.svg': 'adobe-incopy',
  'acrobat_reader_appicon_noshadow_256.svg': 'adobe-acrobat-reader',

  'Adobe_Express-01.svg': 'adobe-express',
  'cc_express_appicon_256.svg': 'adobe-express',

  'logo_cc.svg': 'adobe-creative-cloud',
  'creative-cloud.svg': 'adobe-creative-cloud',

  // device icons  
  'S_DeviceDesktop_22_N.svg': 'device-desktop',
  'S_DeviceTablet_22_N.svg': 'device-tablet',
  'S_TabletMobile_22_N.svg': 'device-table-mobile',
  'S_DevicePhone_22_N.svg': 'device-phone',
  'icon-mobile-tablet-desktop.svg': 'device-mobile-table-desktop',
}

export default function replaceImgsByIcons(main, document) {
  main.querySelectorAll('img.dexter-LazyImage').forEach((img) => {
    if (img.src) {
      const name = img.src.substring(img.src.lastIndexOf('/') + 1); 
      if (ICONS_MAPPING[name]) {
        const span = document.createElement('span');
        span.innerHTML = `:${ICONS_MAPPING[name]}:`;
        img.replaceWith(span);
      } else {
        console.error(`No mapping found for icon ${img.src}`);
      }
    } else {
      img.remove();
    }
  });  
}
