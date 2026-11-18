// Small shared pieces for loading, errors and empty lists.

export function Loading({ text = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-3 py-20 text-stone-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      {text}
    </div>
  );
}

export function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="card py-16 text-center">
      <p className="text-lg font-semibold text-stone-700">{title}</p>
      <div className="mt-3 text-sm text-stone-500">{children}</div>
    </div>
  );
}
