import { ReactNode, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionWrapperProps {
  children: ReactNode;
  id: string;
  className?: string;
  isCard?: boolean;
}

export const SectionWrapper = forwardRef<HTMLElement, SectionWrapperProps>(
  ({ children, id, className, isCard = true }, ref) => {
    return (
      <section ref={ref} id={id} className={cn("pt-8", className)}>
        <motion.div
          initial={{ 
            opacity: 0, 
            rotateX: -15,
            translateY: 60,
            scale: 0.95 
          }}
          whileInView={{ 
            opacity: 1, 
            rotateX: 0,
            translateY: 0,
            scale: 1 
          }}
          transition={{ 
            duration: 0.7, 
            ease: [0.25, 0.46, 0.45, 0.94],
            opacity: { duration: 0.5 },
            scale: { duration: 0.5 }
          }}
          viewport={{ once: false, amount: 0.2, margin: "-50px" }}
          className={cn(
            "transform-gpu preserve-3d",
            isCard && "section-card"
          )}
          style={{
            transformStyle: 'preserve-3d',
            perspective: '1000px'
          }}
        >
          <motion.div
            initial={{ opacity: 0.5 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            viewport={{ once: false, amount: 0.3 }}
          >
            {children}
          </motion.div>
        </motion.div>
      </section>
    );
  }
);

SectionWrapper.displayName = 'SectionWrapper';
