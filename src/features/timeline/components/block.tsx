export default function Block({
  blockWidth,
  blockHeight,
}: {
  blockWidth: number;
  blockHeight: number;
}) {
  return (
    <div
      className="w-fit flex flex-col items-start"
      style={{ maxWidth: `${blockWidth}px`, maxHeight: `${blockHeight}px` }}
    >
      <span className="border-2 border-red-500 h-10 w-px"></span>
      <span className="border-2 border-gray-500 h-px w-16" />
    </div>
  );
}
