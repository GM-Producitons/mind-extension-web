export const provider = (scrollContainerRef: any) => {
  const container = scrollContainerRef.current;
  if (!container) return;

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    container.scrollLeft += event.deltaY;
  };

  container.addEventListener("wheel", handleWheel, { passive: false });
  return () => container.removeEventListener("wheel", handleWheel);
};
