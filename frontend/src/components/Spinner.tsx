export default function Spinner() {
  return (
    <div className="flex justify-center items-center">
      <div
        className="w-8 h-8 border-4 border-blue-500 border-solid rounded-full animate-spin border-t-transparent"
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
