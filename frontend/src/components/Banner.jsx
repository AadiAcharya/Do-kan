import React from "react";

const Banner = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg p-8 text-white">
        <div className="grid grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-5xl font-bold mb-4 space-y-2">
              <div>Offer</div>
              <div>Offer</div>
              <div>Offer</div>
            </div>
            <button className="bg-white text-orange-500 px-6 py-2 rounded font-semibold hover:bg-gray-100">
              Shop Now
            </button>
          </div>

          <div className="flex items-center justify-center">
            <div className="bg-black rounded-lg p-6 text-center">
              <div className="text-white font-bold text-lg mb-2">Flash</div>
              <div className="text-white font-bold text-2xl mb-2">Sale</div>
              <div className="text-orange-400 font-bold text-xl">50% OFF</div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-right">
          <p className="text-lg font-semibold">Any Brand</p>
          <p className="text-lg font-semibold">Promotion</p>
          <p className="text-lg font-semibold">Space</p>
        </div>
      </div>
    </section>
  );
};

export default Banner;
