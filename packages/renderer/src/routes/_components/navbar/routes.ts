import bookIcon from '@iconify/icons-mdi/book';
import cogIcon from '@iconify/icons-mdi/cog';
import folderMultipleImageIcon from '@iconify/icons-mdi/folder-multiple-image';
import paletteIcon from '@iconify/icons-mdi/palette';
import tagIcon from '@iconify/icons-mdi/tag';

export default [
  { path: '/book/index', name: 'Books', icon: bookIcon },
  { path: '/author/index', name: 'Authors', icon: paletteIcon },
  { path: '/series/index', name: 'Series', icon: folderMultipleImageIcon },
  { path: '/tag/index', name: 'Tags', icon: tagIcon },
  { path: '/settings/index', name: 'Settings', icon: cogIcon }
];
