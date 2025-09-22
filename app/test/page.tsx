export default function TestPage() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">GL VietSub</h1>
        <p className="text-gray-400 mb-8">Website đang hoạt động!</p>
        <div className="space-y-4">
          <a
            href="/api/test"
            className="block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Test API
          </a>
          <a
            href="/api/movies"
            className="block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Movies API
          </a>
        </div>
      </div>
    </div>
  );
}
