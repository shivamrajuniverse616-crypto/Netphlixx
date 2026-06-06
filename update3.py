import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Navbar PWA Prompt
navbar_sig = "function Navbar({ onSearch, activeTab, setActiveTab, toggleMobileSearch, mobileSearchOpen }) {"
navbar_pwa_state = """  const [deferredPrompt, setDeferredPrompt] = useState(null);
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };
"""
content = content.replace(navbar_sig, navbar_sig + "\n" + navbar_pwa_state)

settings_injection = """             </div>
             
             <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end">"""

settings_pwa_ui = """             </div>

             <div className="mt-6 pt-6 border-t border-gray-800">
               {deferredPrompt ? (
                 <button onClick={handleInstall} className="w-full flex items-center justify-center bg-white text-black font-bold py-3 rounded hover:bg-gray-200 transition">
                   <Download className="w-5 h-5 mr-2" /> Install Netphlix App
                 </button>
               ) : (
                 <p className="text-sm text-gray-500 text-center">App is installed or not installable on this browser.</p>
               )}
             </div>
             
             <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end">"""
content = content.replace(settings_injection, settings_pwa_ui)

# 2. RowCard Keyboard Navigation
rowcard_sig = "const RowCard = React.memo(function RowCard({ movie, isLargeRow, isTop10, onNavigate, onRemove }) {"
rowcard_keydown = """
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onNavigate(movie, 'info');
    }
  };
"""
content = content.replace(rowcard_sig, rowcard_sig + rowcard_keydown)

rowcard_div = """    <div 
      ref={cardRef}
      className={`relative flex-none cursor-pointer rounded-md bg-transparent ${"""
rowcard_div_new = """    <div 
      ref={cardRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative flex-none cursor-pointer rounded-md bg-transparent focus:ring-4 focus:ring-white outline-none ${"""
content = content.replace(rowcard_div, rowcard_div_new)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Applied PWA Prompt and Keyboard Navigation successfully')
