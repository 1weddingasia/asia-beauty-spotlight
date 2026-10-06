export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative flex items-center justify-center">
        {/* Vòng xoay ngoài */}
        <div className="w-12 h-12 border-[3px] border-gold/20 rounded-full border-t-gold animate-spin"></div>
      </div>
    </div>
  );
}
