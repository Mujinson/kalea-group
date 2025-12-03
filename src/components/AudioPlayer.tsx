import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Try to autoplay when component mounts
    const attemptAutoplay = async () => {
      if (audioRef.current) {
        try {
          audioRef.current.volume = 0.3;
          await audioRef.current.play();
          setIsPlaying(true);
          setHasInteracted(true);
        } catch (error) {
          // Autoplay blocked by browser, wait for user interaction
          console.log("Autoplay blocked, waiting for user interaction");
        }
      }
    };

    attemptAutoplay();
  }, []);

  // Handle first user interaction to enable audio
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted && audioRef.current) {
        audioRef.current.volume = 0.3;
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setHasInteracted(true);
          })
          .catch(console.error);
      }
      document.removeEventListener('click', handleFirstInteraction);
    };

    if (!hasInteracted) {
      document.addEventListener('click', handleFirstInteraction);
    }

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, [hasInteracted]);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      setHasInteracted(true);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/kalea-intro.mp3"
        loop
        preload="auto"
      />
      <motion.button
        onClick={toggleAudio}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-foreground/90 text-background flex items-center justify-center shadow-lg backdrop-blur-sm hover:bg-foreground transition-colors duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        aria-label={isPlaying ? "Mute audio" : "Play audio"}
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
