import { motion } from 'motion/react';

export default function Overlay() {
  return (
    <div id="ui-overlay" className="relative z-10 flex h-screen w-full flex-col items-center justify-center pointer-events-none">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="text-center"
      >
        <h1 className="font-display text-5xl font-extralight tracking-[0.2em] text-white/90 uppercase md:text-7xl">
          Welcome <span className="font-medium text-white">Traveler</span>
        </h1>
        <div className="mt-4 h-[1px] w-48 mx-auto bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 2 }}
        className="mt-12 pointer-events-auto"
      >
        <button 
          id="enter-button"
          className="group relative px-10 py-3 font-sans text-xs font-bold tracking-widest text-white uppercase transition-all duration-500 overflow-hidden"
        >
          {/* Button Background & Border */}
          <span className="absolute inset-0 border border-white/20 transition-all duration-300 group-hover:border-white/50" />
          <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <span className="relative z-10">Enter World</span>
          
          {/* Animated Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/0 via-yellow-500/10 to-yellow-500/0 opacity-0 group-hover:opacity-100 blur transition-opacity duration-700" />
        </button>
      </motion.div>

      {/* Footer Branding */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 2, duration: 2 }}
        className="absolute bottom-10 font-mono text-[10px] tracking-[0.4em] uppercase text-white"
      >
        Version Alpha.01 // Cinematic Experience
      </motion.div>
    </div>
  );
}
