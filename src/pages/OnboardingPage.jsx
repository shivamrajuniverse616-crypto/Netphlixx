import React from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Tv, Smartphone, ArrowRight, ShieldCheck, Bookmark, Crown, ChevronDown } from 'lucide-react';

const col1 = ["/oIQmtByV1LtEQSwM4EpdLTyoSlM.jpg","/bRwnj8WEKBCvmfeUNOukJPwB43K.jpg","/zm0KAbOjlt9eR5y7vDiL2dEOwMl.jpg","/gV0J0Fqw2mYMtQbzb0ruxv9MAeZ.jpg"];
const col2 = ["/hwRdDFIhaEmpRgoki805YvyyjZf.jpg","/a6H2U7pjibMia41TwyFVd1PVQw3.jpg","/ArIS4vwUxdhm3j7tsTHmffdfU8W.jpg","/7wIBfBl2gejt6xHxNSK0reVIm7E.jpg"];
const col3 = ["/alf3JOPP7EYP0iO24gwe5YfRnqo.jpg","/nLxu237EJAisFCYKK48hN9Plobx.jpg","/5Vi8dSauVwH1HOsiZceDMbRr1Ca.jpg","/rMgG7cWuq9O6zhhLs2CbqIKVA8V.jpg"];
const col4 = ["/4KZXlZ5tTT6ghbW77gS4hSLkCd7.jpg","/eJGWx219ZcEMVQJhAgMiqo8tYY.jpg","/3o5YPjDGDTcTDL5ftDA9NwN9dLd.jpg","/kjcuS7xaRyqRjVaVcH4t0qHshuX.jpg"];

const MovingPosterColumn = ({ images, speed = 20, reverse = false }) => {
  return (
    <div className="flex flex-col gap-4 overflow-hidden w-full relative">
      <motion.div
        animate={{ y: reverse ? [0, -1000] : [-1000, 0] }}
        transition={{ ease: "linear", duration: speed, repeat: Infinity }}
        className="flex flex-col gap-4 w-full"
      >
        {/* Double the images to create seamless loop */}
        {[...images, ...images, ...images].map((src, i) => (
          <img 
            key={i} 
            src={`https://image.tmdb.org/t/p/w500${src}`} 
            alt="poster" 
            className="w-full aspect-[2/3] object-cover rounded-xl shadow-2xl opacity-70 filter contrast-125"
            loading="lazy"
          />
        ))}
      </motion.div>
    </div>
  );
};

const FadeIn = ({ children, delay = 0, direction = 'up', className = "" }) => {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
    none: { x: 0, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div className="border-b border-white/10 last:border-0 py-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className="text-xl md:text-2xl font-bold text-gray-300 group-hover:text-white transition-colors">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "backOut" }}
          className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors"
        >
          <ChevronDown className="w-6 h-6 text-white" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-8 text-gray-400 text-lg md:text-xl leading-relaxed max-w-4xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-red-600 selection:text-white overflow-x-hidden">
      {/* Dynamic Cinematic Poster Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#050505]">
        <motion.div 
          style={{ scale: useTransform(scrollYProgress, [0, 1], [1, 1.05]) }}
          className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 w-[120vw] -ml-[10vw] -mt-[10vh] opacity-80"
        >
          <MovingPosterColumn images={col1} speed={40} />
          <MovingPosterColumn images={col2} speed={30} reverse />
          <MovingPosterColumn images={col3} speed={45} />
          <MovingPosterColumn images={col4} speed={35} reverse />
          <MovingPosterColumn images={col1} speed={50} />
          <MovingPosterColumn images={col2} speed={25} reverse />
          <MovingPosterColumn images={col3} speed={38} />
          <MovingPosterColumn images={col4} speed={42} reverse />
          <MovingPosterColumn images={col1} speed={48} />
          <MovingPosterColumn images={col2} speed={33} reverse />
        </motion.div>

        {/* Soft edge gradients instead of heavily obscuring ones */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#050505] via-[#050505]/30 to-transparent" />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#050505] via-transparent to-transparent" />
        
        {/* Deep colored glows */}
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-red-600/20 rounded-full blur-[100px] z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[100px] z-10" />
      </div>

      {/* Hero Section */}
      <section className="h-screen relative z-10 flex flex-col items-center justify-center px-4 md:px-12 text-center">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="max-w-6xl mx-auto flex flex-col items-center">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.2, 1, 0.2, 1] }}
          >
            <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] mb-8">
              <span className="text-white drop-shadow-2xl">Cinematic.</span><br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-300 to-gray-600 drop-shadow-lg">Unlimited.</span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-xl md:text-3xl text-gray-400 font-medium tracking-tight max-w-3xl mb-12"
          >
            Stream thousands of exclusive movies and TV shows in stunning quality. Cancel anytime.
          </motion.p>

          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            onClick={() => navigate('/login')}
            className="group relative px-10 py-5 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold text-xl md:text-2xl rounded-full overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_80px_rgba(255,255,255,0.2)] flex items-center justify-center space-x-4"
          >
            <div className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="relative z-10 tracking-wide text-white">Enter the Portal</span>
            <ArrowRight aria-hidden="true" className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform duration-500" />
          </motion.button>

        </motion.div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-32 px-4 md:px-8 relative z-20 bg-[#050505]">
        <div className="max-w-[1600px] mx-auto">
          <FadeIn>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-center text-white">Experience Premium</h2>
            <p className="text-xl text-gray-500 text-center mb-20 max-w-2xl mx-auto font-medium">Engineered for the ultimate viewing experience across all your screens.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[350px]">
            
            {/* Feature 1: Premium Content (Span 8) */}
            <FadeIn direction="up" delay={0.1} className="md:col-span-8 relative rounded-3xl overflow-hidden group border border-white/10 bg-[#0a0a0c] hover:border-white/30 transition-all duration-500 shadow-2xl flex flex-col justify-end">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl" />
              <div className="absolute inset-0 bg-[url('https://image.tmdb.org/t/p/original/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg')] bg-cover bg-center opacity-30 group-hover:opacity-50 group-hover:scale-105 transition-all duration-[2s] ease-out mix-blend-screen" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-black/50 to-transparent" />
              <div className="relative z-10 p-10 w-full md:w-2/3">
                <Crown className="w-14 h-14 text-white mb-6 drop-shadow-2xl" strokeWidth={1.5} />
                <h3 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-white">Exclusive Originals</h3>
                <p className="text-xl text-gray-400 font-medium">Access critically acclaimed movies and series available nowhere else. In stunning 4K HDR.</p>
              </div>
            </FadeIn>

            {/* Feature 2: Offline / Watchlist (Span 4) */}
            <FadeIn direction="left" delay={0.2} className="md:col-span-4 relative rounded-3xl overflow-hidden group border border-white/10 bg-[#0a0a0c] hover:border-white/30 transition-all duration-500 p-10 flex flex-col justify-end shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-600/30 transition-colors duration-700" />
              <div className="relative z-10">
                <Bookmark className="w-14 h-14 text-white mb-6" strokeWidth={1.5} />
                <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-4 text-white">Your List. Everywhere.</h3>
                <p className="text-gray-400 text-lg font-medium">Save favorites to the cloud and resume exactly where you left off on any device.</p>
              </div>
            </FadeIn>

            {/* Feature 3: Ad-Free (Span 4) */}
            <FadeIn direction="right" delay={0.3} className="md:col-span-4 relative rounded-3xl overflow-hidden group border border-white/10 bg-[#0a0a0c] hover:border-white/30 transition-all duration-500 p-10 flex flex-col justify-end shadow-2xl">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-600/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-green-600/30 transition-colors duration-700" />
              <div className="relative z-10">
                <ShieldCheck className="w-14 h-14 text-white mb-6" strokeWidth={1.5} />
                <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-4 text-white">Zero Interruptions</h3>
                <p className="text-gray-400 text-lg font-medium">100% ad-free streaming. Pure, unadulterated storytelling as the director intended.</p>
              </div>
            </FadeIn>

            {/* Feature 4: Any Device (Span 8) */}
            <FadeIn direction="up" delay={0.4} className="md:col-span-8 relative rounded-3xl group border border-white/10 bg-[#0a0a0c] hover:border-white/30 transition-all duration-500 p-10 flex items-center shadow-2xl">
              {/* Overflow hidden wrapper for background gradients only */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[120%] h-[150%] opacity-10 group-hover:opacity-30 transition-opacity duration-1000">
                   <div className="w-full h-full border-[1px] border-white/20 rounded-[100%] blur-xl scale-150" />
                 </div>
              </div>
              
              <div className="relative z-10 w-full md:w-5/12">
                <div className="flex space-x-6 mb-8">
                  <Tv className="w-12 h-12 text-gray-500 group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
                  <Smartphone className="w-12 h-12 text-gray-500 group-hover:text-white transition-colors duration-500 delay-75" strokeWidth={1.5} />
                </div>
                <h3 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-white">Any Screen. Anywhere.</h3>
                <p className="text-xl text-gray-400 font-medium">From the big screen in your living room to the phone in your pocket.</p>
              </div>
              
              {/* Devices Container */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full pointer-events-none flex items-center justify-center">
                {/* Realistic Macbook Mockup */}
                <motion.div 
                  initial={{ rotateY: -15, rotateX: 10, z: -100, x: 50, opacity: 0 }}
                  whileInView={{ rotateY: -10, rotateX: 5, z: 0, x: 0, opacity: 1 }}
                  transition={{ duration: 1.5, type: "spring", bounce: 0.3 }}
                  className="absolute right-[5%] top-[25%] w-[80%] aspect-[16/10] bg-[#111] rounded-t-xl rounded-b-sm shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex flex-col items-center pt-2 px-2 pb-6 ring-1 ring-white/10 group-hover:rotateY-[-5deg] transition-transform duration-700"
                >
                  {/* Camera Notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-black rounded-full border border-[#222]" />
                  
                  {/* Laptop Screen Content */}
                  <div className="relative w-full h-full bg-gray-900 overflow-hidden border-[2px] border-black rounded-sm">
                    <img src="https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg" className="w-full h-full object-cover opacity-90" alt="mockup" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-4 right-4 flex items-end justify-between">
                       <div>
                         <div className="w-24 h-3 bg-white/20 rounded mb-1" />
                         <div className="w-16 h-2 bg-red-600 rounded" />
                       </div>
                       <div className="flex space-x-1">
                          <div className="w-4 h-4 rounded-full bg-white/20" />
                          <div className="w-4 h-4 rounded-full bg-white/20" />
                       </div>
                    </div>
                  </div>

                  {/* Laptop Base */}
                  <div className="absolute -bottom-2 left-[-5%] w-[110%] h-3 bg-gradient-to-b from-[#2a2a2a] to-[#111] rounded-b-xl shadow-2xl flex justify-center">
                     <div className="w-1/4 h-1 bg-[#1a1a1a] rounded-b-md" /> {/* Trackpad indent */}
                  </div>
                </motion.div>

                {/* Realistic iPhone Mockup */}
                <motion.div 
                  initial={{ rotateY: 15, rotateX: -5, z: 50, x: -50, y: 50, opacity: 0 }}
                  whileInView={{ rotateY: 10, rotateX: 0, z: 100, x: -20, y: 30, opacity: 1 }}
                  transition={{ duration: 1.5, type: "spring", bounce: 0.4, delay: 0.2 }}
                  className="absolute left-[5%] top-[15%] w-[25%] aspect-[9/19] bg-black border-[4px] border-[#333] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden group-hover:translate-y-[-10px] group-hover:rotateY-[5deg] ring-1 ring-white/5 transition-transform duration-700"
                >
                  <img src="https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg" className="w-full h-full object-cover opacity-90" alt="mobile mockup" />
                  
                  {/* Dynamic Island */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[35%] h-4 bg-black rounded-full z-20 shadow-sm" /> 
                  
                  {/* Home indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[40%] h-1 bg-white/40 rounded-full z-20" /> 
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10" />
                  
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 z-20">
                     <Play className="w-3 h-3 text-white ml-0.5" />
                  </div>
                  
                  {/* Progress bar */}
                  <div className="absolute bottom-5 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden z-20">
                     <div className="w-1/3 h-full bg-red-600 rounded-full" />
                  </div>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-40 px-6 md:px-12 bg-[#050505] relative z-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-20 text-center">Questions? Answers.</h2>
          </FadeIn>
          
          <FadeIn delay={0.2} className="space-y-4">
            <FAQItem 
              question="What exactly is Netphlixx Premium?" 
              answer="Netphlixx Premium is our top-tier subscription that completely unlocks the platform. Free users are limited to browsing the catalog and maintaining watchlists, but Premium members get unrestricted access to watch all actual movie and TV show streams in full HD/4K without any advertisements."
            />
            <FAQItem 
              question="How do I upgrade my account?" 
              answer="Whenever you attempt to watch a movie or TV show, you will be greeted by the Premium Lock Screen. Clicking 'Upgrade to Premium' will redirect you to directly contact our admin @Marvelousshivam on Telegram to instantly activate your Premium status."
            />
            <FAQItem 
              question="Is my Watchlist synced across devices?" 
              answer="Absolutely. Your Cloud Watchlist is securely tied to your account. You can save a movie on your phone during your commute, and it will be waiting for you on your Smart TV when you get home."
            />
            <FAQItem 
              question="Are there any hidden fees or contracts?" 
              answer="No. Netphlixx is flexible. There are no pesky contracts and no commitments. You can easily cancel your account online at any time. There are no cancellation fees – start or stop your account anytime."
            />
          </FadeIn>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="min-h-[70vh] px-6 md:px-12 relative flex items-center justify-center text-center z-20 bg-[#050505] overflow-hidden">
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-[url('https://image.tmdb.org/t/p/original/t5zCBSB5xMDKcDqe91qahCOUYVV.jpg')] bg-cover bg-center opacity-10 filter blur-lg scale-110" />
           <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-white drop-shadow-2xl">
              Your next story awaits.
            </h2>
            <p className="text-2xl text-gray-400 mb-16 font-medium">
              Join thousands of cinephiles. Cancel anytime.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="px-14 py-6 bg-white text-black font-black text-2xl md:text-3xl rounded-full transition-all duration-300 shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:shadow-[0_0_80px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 flex items-center justify-center mx-auto space-x-4"
            >
              <span>Get Started</span>
              <ArrowRight aria-hidden="true" className="w-8 h-8 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
          </FadeIn>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
};

export default OnboardingPage;
