const NoPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0e0e] text-white px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-gray-400 mb-6">
          Sorry, the page you are looking for does not exist.
        </p>
        <a
          href="/"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded transition-all"
        >
          Go Home
        </a>
      </div>
    </div>
  );
};

export default NoPage;
