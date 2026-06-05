export default function Footer() {
  return (
    <footer className="w-full py-8 mt-12 border-t border-gray-800 bg-black/50 backdrop-blur-md relative z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center justify-center space-y-4">
        <div className="flex items-center space-x-2 text-gray-400">
          <span className="text-xl font-bold text-red-600 tracking-wider">NETPHLIX</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
        
        <p className="text-gray-500 text-sm text-center max-w-md">
          This is for personal use only. Made by <span className="text-white font-semibold hover:text-red-500 transition-colors cursor-default">Shivam Raj</span>.
        </p>
        
        <div className="text-xs text-gray-600 text-center">
          Data provided by TMDB. Not affiliated with Netflix.
        </div>
      </div>
    </footer>
  );
}
