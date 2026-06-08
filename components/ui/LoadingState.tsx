interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16" role="status" aria-live="polite">
      <div className="w-10 h-10 border-4 border-stone-200 border-t-green-600 rounded-full animate-spin mb-4" />
      <p className="text-stone-500 text-sm">{message}</p>
    </div>
  );
}
