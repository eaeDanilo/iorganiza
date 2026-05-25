export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-base font-bold text-white shadow-md">
        IO
      </div>
      <p className="text-sm text-muted-foreground">Carregando...</p>
    </div>
  );
}
