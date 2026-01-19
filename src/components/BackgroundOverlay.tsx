import { motion, AnimatePresence } from 'framer-motion';

interface BackgroundOverlayProps {
  imageUrl: string;
  isLoaded: boolean;
}

export function BackgroundOverlay({ imageUrl, isLoaded }: BackgroundOverlayProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={imageUrl}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="background-overlay"
        style={{
          backgroundImage: `url(${imageUrl})`,
        }}
      />
    </AnimatePresence>
  );
}
