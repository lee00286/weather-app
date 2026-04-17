export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white/80 shadow-sm backdrop-blur dark:bg-gray-900/80 p-4 ${className}`}
    >
      {children}
    </div>
  );
}
