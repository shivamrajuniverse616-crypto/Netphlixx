import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { Film, Mail, Lock, LogIn, UserPlus, User, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const POSTERS = [
  '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
  '/gEU2QlsUUHXjNpeVD02wnKIGWe.jpg',
  '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
  '/8Gxv8vPAWkFZNP2h1XMQhX1W42.jpg',
  '/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
  '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
  '/f89U3ADr1oiB1s9GfXJwGfS6D1r.jpg',
  '/t6HIqrHezINNdIEjzG7P11oy1D0.jpg',
  '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
  '/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
  '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
  '/49WJfeN0moxb9IPfGn8m13444m.jpg',
  '/rXT1hX08H4B50W4nL2t0fG0gY4H.jpg',
  '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
  '/tsRy63MuMVdMVFowE2zNtcX9n9.jpg'
];

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

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: name
        });
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans relative selection:bg-red-600 selection:text-white">
      {/* Full-screen Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#050505]">
        <motion.div 
          className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 w-[120vw] -ml-[10vw] -mt-[10vh] opacity-80"
        >
          <MovingPosterColumn images={col1} speed={45} />
          <MovingPosterColumn images={col2} speed={35} reverse />
          <MovingPosterColumn images={col3} speed={40} />
          <MovingPosterColumn images={col4} speed={50} reverse />
          <MovingPosterColumn images={col1} speed={45} />
          <MovingPosterColumn images={col2} speed={30} reverse />
          <MovingPosterColumn images={col3} speed={38} />
          <MovingPosterColumn images={col4} speed={42} reverse />
          <MovingPosterColumn images={col1} speed={48} />
          <MovingPosterColumn images={col2} speed={33} reverse />
        </motion.div>

        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
        <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#050505]/30 to-[#050505]" />
        
        {/* Deep colored glows */}
        <div className="absolute top-1/4 right-1/4 w-[30vw] h-[30vw] bg-red-600/20 rounded-full blur-[100px] z-10" />
      </div>
      
      {/* Navbar Logo */}
      <div className="absolute top-8 left-8 z-30 cursor-pointer flex items-center space-x-3" onClick={() => navigate('/')}>
        <Film className="w-10 h-10 text-red-600" />
        <span className="text-3xl font-black tracking-tighter">NETPHLIXX</span>
      </div>

      {/* Main Content Area */}
      <div className="relative w-full h-screen flex items-center justify-center p-4 sm:p-8 z-20">
        <AnimatePresence mode="wait">
        {forgotPassword ? (
          /* ====== FORGOT PASSWORD VIEW ====== */
          <motion.div 
            key="forgot"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[440px]"
          >
            <div className="bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/10 p-8 sm:p-12 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[2rem] pointer-events-none" />

              <button 
                type="button"
                onClick={() => { setForgotPassword(false); setResetSent(false); setError(''); }}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300 mb-8 group relative z-10"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-medium">Back to Sign In</span>
              </button>

              {!resetSent ? (
                <>
                  <div className="flex flex-col items-center mb-8 relative z-10">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                      <Lock className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-2 text-white">
                      Reset Password
                    </h2>
                    <p className="text-gray-400 text-center text-sm font-medium">
                      Enter your email address to receive a secure reset link.
                    </p>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium flex items-center relative z-10"
                    >
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-3 animate-pulse"></div>
                      {error.replace('Firebase: ', '')}
                    </motion.div>
                  )}

                  <form onSubmit={handleForgotPassword} className="space-y-5 relative z-10">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-white transition-colors" />
                      </div>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:bg-black/80 transition-all shadow-inner"
                        placeholder="Email Address"
                        autoFocus
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full py-4 bg-white text-black font-black text-lg rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Send Reset Link"
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-6 relative z-10"
                >
                  <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircle className="w-12 h-12 text-emerald-400" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight mb-4 text-white">Check Your Inbox</h2>
                  <p className="text-gray-400 text-center text-base font-medium mb-8">
                    We've sent a password reset link to <br/><span className="text-white font-bold">{email}</span>
                  </p>
                  <button 
                    onClick={() => { setForgotPassword(false); setResetSent(false); }}
                    className="w-full py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Return to Sign In
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          /* ====== LOGIN / SIGNUP VIEW ====== */
          <motion.div 
            key="auth"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[440px]"
          >
            <div className="bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/10 p-8 sm:p-12 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[2rem] pointer-events-none" />

              <div className="flex flex-col items-start mb-8 relative z-10">
                <h2 className="text-4xl font-black tracking-tight mb-3 text-white drop-shadow-lg">
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </h2>
                <p className="text-gray-400 text-base font-medium">
                  {isLogin 
                    ? 'Welcome back to unlimited entertainment.' 
                    : 'Join today and unlock premium features.'}
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium flex items-center relative z-10"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-3 animate-pulse"></div>
                  {error.replace('Firebase: ', '')}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                {!isLogin && (
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-gray-400 group-focus-within:text-white transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:bg-black/80 transition-all shadow-inner"
                      placeholder="Full Name"
                    />
                  </div>
                )}

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-white transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:bg-black/80 transition-all shadow-inner"
                    placeholder="Email Address"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-white transition-colors" />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:bg-black/80 transition-all shadow-inner"
                    placeholder="Password"
                  />
                </div>

                {isLogin && (
                  <div className="flex justify-end pt-1">
                    <button 
                      type="button" 
                      onClick={() => { setForgotPassword(true); setError(''); }}
                      className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 mt-2 bg-red-600 hover:bg-red-500 text-white font-black text-lg rounded-xl transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  )}
                </button>
              </form>

              <div className="mt-8 flex items-center justify-center space-x-4 relative z-10">
                <div className="h-px bg-gradient-to-r from-transparent to-white/10 flex-1" />
                <span className="text-gray-500 text-xs font-bold tracking-widest uppercase">Or continue with</span>
                <div className="h-px bg-gradient-to-l from-transparent to-white/10 flex-1" />
              </div>

              <button 
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="mt-6 relative z-10 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 active:scale-95"
              >
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                </div>
                <span>Google</span>
              </button>

              <p className="mt-8 text-center text-gray-400 font-medium relative z-10">
                {isLogin ? "New to Netphlixx? " : "Already a member? "}
                <button 
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setError(''); setName(''); }}
                  className="text-white font-black hover:underline"
                >
                  {isLogin ? 'Sign up now' : 'Sign in'}
                </button>
              </p>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthPage;
