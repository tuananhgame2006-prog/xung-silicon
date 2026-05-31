/* Copyright (c) 2026 Tuấn Anh (tuananhgame2006). Tác phẩm được bảo hộ bản quyền. Nghiêm cấm sao chép dưới mọi hình thức. */
import { motion } from 'framer-motion';

export const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Lưới công nghệ mờ (Tech Grid) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* Cầu sáng nổi (Floating Glow Orbs) */}
      <motion.div
        animate={{
          y: [0, -50, 0],
          x: [0, 30, 0],
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-cyan-400 rounded-full blur-[80px]"
      />
      <motion.div
        animate={{
          y: [0, 80, 0],
          x: [0, -40, 0],
          scale: [1, 1.5, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[40%] right-[15%] w-[500px] h-[500px] bg-blue-400 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          y: [0, -60, 0],
          x: [0, 50, 0],
          scale: [1, 1.3, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-10%] left-[30%] w-[600px] h-[600px] bg-fuchsia-400 rounded-full blur-[100px]"
      />
    </div>
  );
};
