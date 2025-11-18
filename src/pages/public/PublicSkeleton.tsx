import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PublicSkeleton = () => {
  return (
    <div className="min-h-screen space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-28 md:py-36">
        <div className="container mx-auto px-6 text-center relative z-10">
          <Skeleton width={400} height={60} className="mx-auto mb-6" />
          <Skeleton width={600} height={30} className="mx-auto" />
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-6">
        <div className="space-y-4">
          <Skeleton height={30} width={300} />
          <Skeleton count={3} />
        </div>
      </section>

      {/* Team Section */}
      <section className="py-11 md:py-12 bg-yellow-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <Skeleton height={50} width={400} className="mx-auto mb-4" />
            <Skeleton height={25} width={600} className="mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(3)
              .fill(0)
              .map((_, idx) => (
                <div key={idx} className="p-4 bg-white rounded-lg shadow">
                  <Skeleton
                    circle
                    height={60}
                    width={60}
                    className="mx-auto mb-4"
                  />
                  <Skeleton height={20} width={120} className="mx-auto mb-2" />
                  <Skeleton
                    count={2}
                    height={15}
                    width={`80%`}
                    className="mx-auto"
                  />
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 md:py-16 bg-gradient-to-br from-[#101F3C] to-[#2A4D6F] text-white relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10 space-y-6">
          <Skeleton height={40} width={400} className="mx-auto" />
          <Skeleton height={25} width={600} className="mx-auto" />
          <div className="flex flex-col sm:flex-row justify-center gap-5 mt-6">
            <Skeleton height={50} width={200} />
            <Skeleton height={50} width={200} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicSkeleton;
