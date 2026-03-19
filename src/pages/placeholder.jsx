import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

export default function Placeholder({ title }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
    >
      <Construction className="w-16 h-16 text-muted-foreground" />
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground">قيد التطوير...</p>
    </motion.div>
  );
}