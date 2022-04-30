export type Point = {
  x: number,
  y: number
};

export type Size = {
  width: number,
  height: number
};

const imageTypes = [
  'image/apng',
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/webp'
];

// Replace last entry of string list with new item and add trailing separator
export function appendEntry(value: string, newItem: string, separator = ',') {
  return [
    ...[
      value.substring(0, value.lastIndexOf(separator)),
      newItem
    ].filter(Boolean),
    ''
  ].join(`${separator} `);
}

export async function createBufferFromObjectUrl(
  objectUrl: string
): Promise<{ data: Buffer, type: string }> {
  const response = await fetch(objectUrl);

  return {
    data: Buffer.from(await response.arrayBuffer()),
    type: response.type
  };
}

export function createObjectUrlFromBuffer(buffer: ArrayBuffer, type: string) {
  const blob = new Blob([buffer], { type });
  const urlCreator = window.URL || window.webkitURL;
  return urlCreator.createObjectURL(blob);
}

export function date2String(x: Date) {
  const offset = x.getTimezoneOffset();
  const date = new Date(x.getTime() - (offset * 60 * 1000));
  return date.toISOString().split('T')[0];
}

export function filterFilesByTypeImage(files: FileInfo[]): FileInfo[] {
  return files.filter(file => (
    file.type !== null && imageTypes.includes(file.type)
  ));
}

export function findNextMissingNumber(array: number[]) {
  for (let i = 0; i < array.length; ++i) {
    if (array[i] < array.length && array[array[i]] > 0) {
      array[array[i]] = -array[array[i]];
    }
  }

  for (let i = 0; i < array.length; ++i) {
    if (array[i] > 0) {
      return i;
    }
  }

  return array.length;
}

export function fitObjectPosition(
  position: ObjectPosition,
  container: Size,
  object: Size
): Point {
  const [horizontal, vertical] = getAlignment(position);
  let x = 0, y = 0;

  switch (horizontal) {
    case 'left':
      break;
    case 'center':
      x = (container.width - object.width) / 2;
      break;
    case 'right':
      x = container.width - object.width;
      break;
  }

  switch (vertical) {
    case 'top':
      break;
    case 'center':
      y = (container.height - object.height) / 2;
      break;
    case 'bottom':
      y = container.height - object.height;
      break;
  }

  return { x, y };
}

export function fitObjectSize(
  fit: ObjectFit,
  container: Size,
  object: Size
): Size {
  let x = 1, y = 1;

  switch (fit) {
    case 'contain':
      x = y = Math.min(
        container.width / object.width, container.height / object.height
      );
      break;
    case 'cover':
      x = y = Math.max(
        container.width / object.width, container.height / object.height
      );
      break;
    case 'fill':
      x = container.width / object.width;
      y = container.height / object.height;
      break;
    case 'none':
      break;
    case 'scale-down':
      if (object.width > container.width || object.height > container.height) {
        x = y = Math.min(
          container.width / object.width, container.height / object.height
        );
      }
      break;
    default:
      throw new Error('Unknown object-fit of page layout');
  }

  return { width: object.width * x, height: object.height * y };
}

export function getAlignment(position: ObjectPosition) {
  return position.split(' ');
}

export function freeObjectUrl(objectUrl: string) {
  const urlCreator = window.URL || window.webkitURL;
  urlCreator.revokeObjectURL(objectUrl);
}

export function getHorizontalAlignment(position: ObjectPosition) {
  switch (position.split(' ')[0]) {
    case 'left':
      return 'flex-start';
    case 'center':
      return 'center';
    case 'right':
      return 'flex-end';
    default:
      throw new Error('Unknown horizontal alignment');
  }
}

export function getVerticalAlignment(position: ObjectPosition) {
  switch (position.split(' ')[1]) {
    case 'top':
      return 'flex-start';
    case 'center':
      return 'center';
    case 'bottom':
      return 'flex-end';
    default:
      throw new Error('Unknown vertical alignment');
  }
}

// https://www.tutorialspoint.com/levenshtein-distance-in-javascript
// https://github.com/gf3/Levenshtein/blob/master/lib/levenshtein.js
export function levenshtein(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (a === '') {
    return b.length;
  }

  if (b === '') {
    return a.length;
  }

  const matrix: number[][] = Array.from({ length: b.length + 1 }, () => (
    Array(a.length + 1).fill(null)
  ));

  for (let i = 0; i <= a.length; ++i) {
    matrix[0][i] = i;
  }

  for (let i = 0; i <= b.length; ++i) {
    matrix[i][0] = i;
  }

  for (let i = 1; i <= b.length; ++i) {
    for (let j = 1; j <= a.length; ++j) {
      const indicator = Number(a[j - 1] !== b[i - 1]);
      matrix[i][j] = Math.min(
        matrix[i][j - 1] + 1,  // Deletion
        matrix[i - 1][j] + 1,  // Insertion
        matrix[i - 1][j - 1] + indicator  // Substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

export function measureElement(node: Element): Size {
  const computedStyle = getComputedStyle(node);

  let width = node.clientWidth;
  let height = node.clientHeight;

  height -= parseFloat(computedStyle.paddingTop) +
    parseFloat(computedStyle.paddingBottom);
  width -= parseFloat(computedStyle.paddingLeft) +
    parseFloat(computedStyle.paddingRight);

  return { height, width };
}

export function parseString2Array(x: string, delimiter = ',') {
  return Array.from(new Set(
    x.split(delimiter).map(t => t.trim()).filter(t => t !== '')
  ));
}

export function similarity(a: string, b: string) {
  return 1 - levenshtein(a, b) / Math.max(1, a.length);
}

export function string2Date(x: string) {
  const [year, month, day] = x.split('-');
  return new Date(Number(year), Number(month), Number(day));
}
