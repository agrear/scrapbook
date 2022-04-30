// From: https://github.com/rster2002/svelte-outside-click

export default function clickOutside(
  node: Element,
  onClick: (event: MouseEvent) => void
) {
  const handleClick = (event: MouseEvent) => {
    const path = event.composedPath();

    if (!path.includes(node)) {
      onClick(event);
    }
  };

  document.addEventListener('click', handleClick);

  return {
    destroy() {
      document.removeEventListener('click', handleClick);
    }
  };
}
