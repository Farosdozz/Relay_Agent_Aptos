import Skeleton from 'react-loading-skeleton';

interface SkeletonProps {
  count: number;
  className?: string;
}

export const CustomSkeleton = ({ count, className }: SkeletonProps) => {
  return (
    <Skeleton
      count={count}
      className={ `${ className } h-6 w-full rounded-lg` }
      baseColor="#1F3843"
      highlightColor="#122D38"
    />
  );
};
