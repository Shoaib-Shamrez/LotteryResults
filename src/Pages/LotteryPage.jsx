// src/pages/LotteryPage.jsx
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Meta, useParams } from "react-router-dom";
import { getLotteryBySlug } from "../api/lotteryApi";
import SEO from "../components/SEO";
import { useAds } from "../context/AdProvider";
import AdBanner from "../components/AdBanner";
// import { T } from "vitest/dist/chunks/reporters.d.BFLkQcL6.js";

// const LotteryHero = lazy(() =>
//   import("../components/page_components/LotteryHero")
// );

import LotteryHero from "../components/page_components/LotteryHero";
const LotteryHistory = lazy(
  () => import("../components/page_components/LotteryHistory"),
);
const HowToPlay = lazy(() => import("../components/page_components/HowtoPlay"));
const TopWinners = lazy(
  () => import("../components/page_components/TopWinners"),
);
const LotteryFAQs = lazy(
  () => import("../components/page_components/LotteryFAQs"),
);

const LotteryPage = () => {
  const { slug } = useParams();
  const { getAdsFor } = useAds();
  const adsUnderHeader = getAdsFor("lotteryPage", "underHeader");
  const adsUnderGameCards = getAdsFor("lotteryPage", "underGameCards");
  const adsBottom = getAdsFor("lotteryPage", "bottom");

  const [lottery, setLottery] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [lotteries, setLotteries] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getLotteryBySlug(slug);
        setLottery(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [slug]);

  // IntersectionObserver-based deferred section renderer
  const LazySection = ({ heightClass = "h-56", children }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
      const node = ref.current;
      if (!node || visible) return;
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        },
        { rootMargin: "200px" },
      );
      obs.observe(node);
      return () => obs.disconnect();
    }, [visible]);

    return (
      <div ref={ref}>
        {visible ? (
          children
        ) : (
          <div className={`${heightClass} bg-gray-100 rounded mb-8`} />
        )}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-28 bg-gray-100 rounded mb-8 animate-pulse" />
        <div className="h-64 bg-gray-100 rounded mb-8 animate-pulse" />
        <div className="h-56 bg-gray-100 rounded mb-8 animate-pulse" />
        <div className="h-56 bg-gray-100 rounded mb-8 animate-pulse" />
        <div className="h-40 bg-gray-100 rounded mb-8 animate-pulse" />
      </div>
    );
  }

  // Not found state
  if (!lottery) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center p-10 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Lottery Not Found
          </h2>
          <p className="text-gray-600">
            The lottery "{slug}" could not be found.
          </p>
        </div>
      </div>
    );
  }
  const canonicalUrl = `${window.location.origin}/${slug}`;

  // Prepare SEO data
  const seoTitle = `${lottery?.name} - Latest Results, How to Play & Prize Info`;
  const seoDescription =
    lottery.description ||
    `Everything you need to know about ${lottery.name}. Check latest results, learn how to play, view prize breakdowns, and see top winners. Updated daily with official lottery information.`;
  const seoKeywords = `${lottery.name}, lottery, how to play, winning numbers, results, prize breakdown, lottery winners, ${lottery.name} results`;

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        type="website"
        canonical={canonicalUrl}
        keywords={seoKeywords}
        author="Lottery Results Hub"
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* <Suspense
          fallback={
            <div className="h-28 bg-white rounded mb-8 animate-pulse" />
          }
        >
          <LotteryHero title={lottery.name} description={lottery.description} />
        </Suspense> */}
        <LotteryHero title={lottery?.name} description={lottery?.description} />
        <div className="min-h-[120px] mb-8">
          {adsUnderHeader.map((a) => (
            <AdBanner key={a.slot} slot={a.slot} height={120} />
          ))}
        </div>

        <LazySection heightClass="h-64">
          <Suspense
            fallback={
              <div className=" bg-gray-100 rounded mb-8 animate-pulse" />
            }
          >
            <div className="min-h-64">
              <LotteryHistory history={lottery?.history} />
            </div>
          </Suspense>
        </LazySection>

        <LazySection heightClass="h-80">
          <Suspense
            fallback={
              <div className="min-h-60 bg-gray-100 rounded mb-8 animate-pulse" />
            }
          >
            <div className="min-h-80">
              <HowToPlay steps={lottery?.how_to_play} />
            </div>
          </Suspense>
        </LazySection>
        <div className="min-h-[120px] mb-8">
          {adsUnderGameCards.map((a) => (
            <AdBanner key={a.slot} slot={a.slot} height={120} />
          ))}
        </div>

        <LazySection heightClass="h-56">
          <Suspense
            fallback={
              <div className="h-56 bg-gray-100 rounded mb-8 animate-pulse" />
            }
          >
            <TopWinners winners={lottery?.winners} />
          </Suspense>
        </LazySection>
        <div className=" mb-8">
          {adsBottom.map((a) => (
            <AdBanner key={a.slot} slot={a.slot} height={120} />
          ))}
        </div>
      </div>
    </>
  );
};

export default LotteryPage;
