import { motion } from "motion/react";

type TapProps = {
  children: React.ReactNode;
  
}& React.ComponentPropsWithoutRef<typeof motion.div>;

const Tap: React.FC<TapProps> = ({ children, ...props }) => {
  return (
    <motion.div {...props} whileTap={{ scale: 0.9, opacity: 0.5 }}>
      {children}
    </motion.div>
  );
};

export default Tap;

