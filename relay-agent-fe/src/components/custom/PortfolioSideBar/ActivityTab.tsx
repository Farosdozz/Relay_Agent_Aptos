import * as motion from 'motion/react-client';

export const ActivityTab = () => {
  return (
    <motion.div
      key="activity"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full"
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-text-gray">Recent transactions</p>
        {/* Activity content would go here */}
        <div className="rounded-lg bg-background-box p-3">
          <p className="text-sm text-white">No recent transactions</p>
        </div>
      </div>
    </motion.div>
  );
};
