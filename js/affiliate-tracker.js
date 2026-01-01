/**
 * Affiliate Click Tracker
 * Tracks Amazon affiliate link clicks using localStorage
 * No external dependencies, privacy-respecting, GDPR-compliant
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'affiliate_clicks';
  const MAX_ENTRIES = 500;

  // Initialize storage
  function getClicks() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveClicks(clicks) {
    try {
      // Keep only last MAX_ENTRIES
      if (clicks.length > MAX_ENTRIES) {
        clicks = clicks.slice(-MAX_ENTRIES);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clicks));
    } catch (e) {
      // Storage full or disabled
    }
  }

  // Extract product info from Amazon URL
  function extractProductInfo(url) {
    const info = { asin: null, tag: null };
    try {
      const urlObj = new URL(url);
      // Extract ASIN from various URL formats
      const asinMatch = url.match(/\/(?:dp|gp\/product|exec\/obidos\/asin)\/([A-Z0-9]{10})/i);
      if (asinMatch) info.asin = asinMatch[1];
      // Extract affiliate tag
      info.tag = urlObj.searchParams.get('tag');
    } catch (e) {}
    return info;
  }

  // Track click
  function trackClick(link, event) {
    const url = link.href;
    const productInfo = extractProductInfo(url);
    const linkText = link.textContent.trim().substring(0, 100);
    const pageUrl = window.location.pathname;

    const clickData = {
      ts: Date.now(),
      page: pageUrl,
      asin: productInfo.asin,
      tag: productInfo.tag,
      text: linkText,
      pos: getElementPosition(link)
    };

    const clicks = getClicks();
    clicks.push(clickData);
    saveClicks(clicks);
  }

  // Get element position for analysis
  function getElementPosition(el) {
    const rect = el.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    const posFromTop = rect.top + scrollTop;

    // Categorize position
    if (posFromTop < viewportHeight) return 'above-fold';
    if (posFromTop < viewportHeight * 2) return 'mid-page';
    return 'below-fold';
  }

  // Check if URL is an Amazon affiliate link
  function isAmazonAffiliateLink(url) {
    return url && (
      url.includes('amazon.com') ||
      url.includes('amzn.to') ||
      url.includes('amzn.com')
    );
  }

  // Initialize tracking
  function init() {
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (link && isAmazonAffiliateLink(link.href)) {
        trackClick(link, e);
      }
    }, true);
  }

  // Export analytics getter for dashboard
  window.getAffiliateAnalytics = function() {
    const clicks = getClicks();
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // Group by ASIN
    const byAsin = {};
    const byPage = {};
    const byPosition = { 'above-fold': 0, 'mid-page': 0, 'below-fold': 0 };

    clicks.forEach(c => {
      // By ASIN
      if (c.asin) {
        if (!byAsin[c.asin]) {
          byAsin[c.asin] = { count: 0, text: c.text, lastClick: c.ts };
        }
        byAsin[c.asin].count++;
        if (c.ts > byAsin[c.asin].lastClick) {
          byAsin[c.asin].lastClick = c.ts;
        }
      }

      // By page
      if (!byPage[c.page]) byPage[c.page] = 0;
      byPage[c.page]++;

      // By position
      if (c.pos) byPosition[c.pos]++;
    });

    // Sort ASINs by click count
    const topProducts = Object.entries(byAsin)
      .map(([asin, data]) => ({ asin, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Sort pages by clicks
    const topPages = Object.entries(byPage)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalClicks: clicks.length,
      last24h: clicks.filter(c => now - c.ts < dayMs).length,
      last7d: clicks.filter(c => now - c.ts < 7 * dayMs).length,
      topProducts,
      topPages,
      byPosition,
      rawData: clicks
    };
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
