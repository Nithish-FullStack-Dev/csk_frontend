import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const AboutPageSkeleton = () => {
  return (
    <div className="container mx-auto px-6 lg:px-8 py-10">
      {/* Top Section (Text + Image) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
        {/* Left Content (Text Blocks) */}
        <div>
          <Skeleton height={40} width="70%" className="mb-4" />
          <Skeleton count={3} className="mb-3" />
          <Skeleton count={2} className="mb-3" />

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mt-6">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton circle width={40} height={40} />
                  <div>
                    <Skeleton width={80} height={16} />
                    <Skeleton width={50} height={14} />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Right Image Skeleton */}
        <div>
          <Skeleton height={400} className="rounded-xl" />
        </div>
      </div>

      {/* Video Section */}
      <div className="mt-20 md:mt-24 text-center">
        <Skeleton height={36} width="50%" className="mx-auto mb-6" />
        <Skeleton height={450} className="rounded-xl" />
      </div>

      {/* Values Section */}
      <section className="py-16 mt-16 border-t border-gray-100">
        <div className="text-center mb-16">
          <Skeleton height={36} width="40%" className="mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="text-center p-6 border rounded-xl shadow-sm"
              >
                <Skeleton
                  circle
                  width={80}
                  height={80}
                  className="mx-auto mb-4"
                />
                <Skeleton height={20} width="60%" className="mx-auto mb-2" />
                <Skeleton count={2} width="80%" className="mx-auto" />
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPageSkeleton;
