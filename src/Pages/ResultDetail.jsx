// src/pages/ResultDetail.jsx

import dayjs from "dayjs";
import NumbersDisplay from "../components/page_components/NumberDisplay";
import PrizeBreakdownTable from "../components/page_components/PrizeBreakDown";
import ResultDetailHeader from "../components/page_components/ResultDetailHeader";
import JackpotBanner from "../components/page_components/JackpotBanner";
import {
  getPostbyCategory_And_Date,
  getPrizeBreakDownByPost,
} from "../api/postApi";
import { useEffect, useState } from "react";
import { formatDate } from "../utils/utilityfun";
import { apiUrl } from "../utils/apiBase";
import { useParams } from "react-router-dom";
import SEO from "../components/SEO";
import { useAds } from "../context/AdProvider";
import AdBanner from "../components/AdBanner";

const LotteryResultsPage = () => {
  const { slug, date } = useParams();
  const { getAdsFor } = useAds();
  const adsUnderHeader = getAdsFor("ResultDetail", "underHeader");
  const adsUnderGameCards = getAdsFor("ResultDetail", "underGameCards");
  const adsBottom = getAdsFor("ResultDetail", "bottom");
  const [middayBreakdown, setMiddayBreakdown] = useState([]);
  const [eveningBreakdown, setEveningBreakdown] = useState([]);
  const [postData, setPostData] = useState(null); // Initialize as null, not undefined
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);
  console.log("the slug inside results details is", slug, "the date is ", date);
  useEffect(() => {
    let isMounted = true; // flag to prevent state updates if unmounted

    const fetchBreakdowns = async () => {
      try {
        setLoading(true);

        const resultDetails = await getPostbyCategory_And_Date(date, slug);
        if (!isMounted) return; // stop if unmounted

        setPostData(resultDetails);

        const id = resultDetails?.id;
        if (!id) {
          console.error("No ID found in result details");
          return;
        }

        const data = await getPrizeBreakDownByPost(id);
        if (!isMounted) return; // stop if unmounted

        const midday = data.prizes.filter((p) => p.draw_type === "midday");
        const evening = data.prizes.filter((p) => p.draw_type === "evening");

        setMiddayBreakdown(midday);
        setEveningBreakdown(evening);
        setTotals(data.totals);
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching prize breakdowns:", err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBreakdowns();

    // cleanup runs when component unmounts or dependencies change
    return () => {
      isMounted = false;
    };
  }, [date, slug]);

  // Only construct SEO data AFTER postData is loaded
  const seoData = postData
    ? {
        canonicalUrl: `${window.location.origin}/${postData.category}/results/${postData.date}`,
        seoTitle:
          postData.meta_title ||
          `${postData.title} - ${postData.category} Results`,
        seoDescription:
          postData.meta_desc ||
          `Check the complete ${postData.category} lottery results for ${postData.date}. View winning numbers, prize breakdown, and winner statistics.`,
        seoKeywords: `${postData.category}, lottery results, winning numbers, ${postData.date}, prize breakdown, lottery winners`,
        publishedTime: new Date(postData.created_at).toISOString(),
        modifiedTime: postData.updated_at
          ? new Date(postData.updated_at).toISOString()
          : null,
        section: postData.category,
        tags: [postData.category, "lottery", "results", "winning numbers"],
      }
    : {
        // Default values while loading
        canonicalUrl: window.location.href,
        seoTitle: "Lottery Results",
        seoDescription: "Check lottery results and winning numbers.",
        seoKeywords: "lottery, results, winning numbers",
        publishedTime: null,
        modifiedTime: null,
        section: "lottery",
        tags: ["lottery", "results"],
      };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-28 bg-gray-100 rounded mb-8 animate-pulse" />
        <div className="h-64 bg-gray-100 rounded mb-8 animate-pulse" />
        <div className="h-56 bg-gray-100 rounded mb-8 animate-pulse" />
      </div>
    );
  }

  // Show error state
  if (!postData) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center p-10 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Results Not Found
          </h2>
          <p className="text-gray-600">
            The lottery results could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={seoData.seoTitle}
        description={seoData.seoDescription}
        type="article"
        canonical={seoData.canonicalUrl}
        keywords={seoData.seoKeywords} // Add this!
        author="Lottery Results Hub"
        publishedTime={seoData.publishedTime}
        modifiedTime={seoData.modifiedTime}
        section={seoData.section}
        tags={seoData.tags}
      />

      <div className="max-w-6xl mx-auto px-4 py-8 bg-gray-50">
        <ResultDetailHeader
          title={postData?.title}
          description={postData?.content}
        />
        {adsUnderHeader.map((a) => (
          <AdBanner key={a.slot} slot={a.slot} height={120} />
        ))}

        {/* Numbers Section */}
        <div>
          <div className="bg-blue-950 text-white px-4 rounded-t">
            <h2 className="text-xl font-semibold mb-4">
              {formatDate(postData?.created_at)}
            </h2>
          </div>

          <div className="flex flex-col md:flex-row mb-8">
            <NumbersDisplay
              title="Midday"
              numbers={postData?.Midday_Winnings}
              winners={totals.midday}
            />
            <NumbersDisplay
              title="Evening"
              numbers={postData?.Evening_Winnings}
              winners={totals.evening}
            />
          </div>
        </div>
        {adsUnderGameCards.map((a) => (
          <AdBanner key={a.slot} slot={a.slot} height={120} />
        ))}

        <JackpotBanner
          title="Next Jackpot"
          amount="$5 Million"
          nextDraw={dayjs().add(5, "hour").add(20, "minute").add(45, "second")}
          bgColor={"bg-blue-900"}
        />

        {/* CSV Download Button */}
        <div className="my-4 flex items-center">
          <button
            onClick={async () => {
              try {
                const response = await fetch(`${apiUrl(`/posts/${postData.id}/export?format=csv`)}`, {
                  credentials: 'include',
                });
                if (!response.ok) {
                  throw new Error('Failed to download CSV');
                }
                const blob = await response.blob();
                const disposition = response.headers.get('Content-Disposition');
                let filename = 'export.csv';
                if (disposition && disposition.includes('filename=')) {
                  filename = disposition.split('filename=')[1].replace(/"/g, '');
                }
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              } catch (err) {
                console.error(err);
                alert('Error downloading CSV');
              }
            }}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Download CSV
          </button>
        </div>
        {/* Prize Breakdown Section */}
        <div className="flex flex-col md:flex-row gap-6">
          <PrizeBreakdownTable
            title="Midday"
            data={middayBreakdown}
            totals={totals.midday}
          />
          <PrizeBreakdownTable
            title="Evening"
            data={eveningBreakdown}
            totals={totals.evening}
          />
        </div>
        {adsBottom.map((a) => (
          <AdBanner key={a.slot} slot={a.slot} height={120} />
        ))}
      </div>
    </>
  );
};

export default LotteryResultsPage;
