export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-md">
        IO
      </div>
      <p className="text-sm text-muted-foreground">Carregando...</p>
    </div>
  );
}
