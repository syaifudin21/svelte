export function clickOutside(node: HTMLElement, onEvent: () => void) {
  const handleClick = (event: MouseEvent) => {
    if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
      onEvent();
    }
  };

  document.addEventListener("click", handleClick, true);

  return {
    update(onEvent: () => void) {
      onEvent = onEvent;
    },
    destroy() {
      document.removeEventListener("click", handleClick, true);
    },
  };
}
