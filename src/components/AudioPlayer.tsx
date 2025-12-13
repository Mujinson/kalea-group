import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

const AUDIO_STATE_KEY = "kalea-audio-enabled";

const AudioPlayer = () => {
  // Always start muted - user must explicitly enable
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // On mount, check localStorage but DO NOT autoplay
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      // Ensure audio is paused on load - NO AUTOPLAY EVER
      audioRef.current.pause();
    }
  }, []);

  // Handle explicit user toggle - ONLY way to start audio
  const toggleAudio = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!audioRef.current) return;

    if (isPlaying) {
      // User wants to stop audio
      audioRef.current.pause();
      setIsPlaying(false);
      localStorage.setItem(AUDIO_STATE_KEY, "false");
    } else {
      // User explicitly wants to play audio
      audioRef.current.volume = 0.3;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          localStorage.setItem(AUDIO_STATE_KEY, "true");
        })
        .catch((error) => {
          console.log("Audio play failed:", error);
          setIsPlaying(false);
        });
    }
  }, [isPlaying]);

  // Restore audio state on navigation (only if user previously enabled it)
  useEffect(() => {
    const savedState = localStorage.getItem(AUDIO_STATE_KEY);
    
    // Only restore if user had explicitly enabled audio before
    if (savedState === "true" && audioRef.current) {
      // Wait for user gesture requirement - try to play
      // If blocked by browser, it will fail silently
      const tryRestore = async () => {
        try {
          audioRef.current!.volume = 0.3;
          await audioRef.current!.play();
          setIsPlaying(true);
        } catch {
          // Browser blocked - user needs to click again
          // Reset saved state since we couldn't restore
          setIsPlaying(false);
        }
      };
      
      // Small delay to ensure DOM is ready
      const timer = setTimeout(tryRestore, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/kalea-intro.mp3"
        loop
        preload="auto"
        muted={false}
      />
      <motion.button
        onClick={toggleAudio}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-foreground/90 text-background flex items-center justify-center shadow-lg backdrop-blur-sm hover:bg-foreground transition-colors duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        aria-label={isPlaying ? "Sound ON" : "Sound OFF"}
        title={isPlaying ? "Sound ON" : "Sound OFF"}
      >
        {isPlaying ? (
          <Volume2 className="w-5 h-5" />
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </motion.button>
    </>
  );
};

export default AudioPlayer;
