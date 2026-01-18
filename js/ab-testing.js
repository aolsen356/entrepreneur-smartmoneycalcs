/**
 * A/B Testing Framework for Finance Calculators (SmartMoneyCalcs)
 * Client-side A/B testing for static sites
 * Tracks variants and conversions in localStorage
 *
 * @version 1.0.0
 */
(function(window) {
  'use strict';

  const STORAGE_KEY = 'smc_ab_tests';
  const EVENTS_KEY = 'smc_ab_events';
  const MAX_EVENTS = 1000;

  const ABTest = {
    /**
     * Get or assign variant for a test
     */
    getVariant: function(testId, variants) {
      const tests = this._getTests();

      if (!tests[testId]) {
        // Assign random variant
        const variant = variants[Math.floor(Math.random() * variants.length)];
        tests[testId] = {
          variant: variant,
          assignedAt: Date.now(),
          views: 0,
          conversions: {}
        };
        this._saveTests(tests);
        this._logEvent(testId, 'assign', { variant });
      }

      // Increment view count
      tests[testId].views++;
      this._saveTests(tests);
      this._logEvent(testId, 'view', { variant: tests[testId].variant });

      return tests[testId].variant;
    },

    /**
     * Run a test with variant configurations
     */
    run: function(testId, variants, configs) {
      const variant = this.getVariant(testId, variants);

      if (configs && configs[variant]) {
        const config = configs[variant];
        if (typeof config === 'function') {
          config();
        } else if (typeof config === 'object') {
          this._applyConfig(config);
        }
      }

      return variant;
    },

    /**
     * Track a conversion event
     */
    convert: function(testId, action) {
      const tests = this._getTests();

      if (tests[testId]) {
        if (!tests[testId].conversions[action]) {
          tests[testId].conversions[action] = 0;
        }
        tests[testId].conversions[action]++;
        this._saveTests(tests);
        this._logEvent(testId, 'convert', {
          variant: tests[testId].variant,
          action: action
        });
      }
    },

    /**
     * Get results for all tests
     */
    getResults: function() {
      const tests = this._getTests();
      const events = this._getEvents();
      const results = {};

      Object.keys(tests).forEach(testId => {
        const test = tests[testId];
        const conversions = Object.values(test.conversions).reduce((a, b) => a + b, 0);
        const rate = test.views > 0 ? (conversions / test.views * 100) : 0;

        results[testId] = {
          variant: test.variant,
          views: test.views,
          conversions: test.conversions,
          totalConversions: conversions,
          conversionRate: rate.toFixed(2) + '%',
          assignedAt: new Date(test.assignedAt).toISOString()
        };
      });

      // Aggregate by variant across all users (from events)
      const aggregated = {};
      events.forEach(e => {
        if (!e.testId) return;
        const key = `${e.testId}:${e.variant}`;
        if (!aggregated[key]) {
          aggregated[key] = { testId: e.testId, variant: e.variant, views: 0, converts: 0 };
        }
        if (e.type === 'view') aggregated[key].views++;
        if (e.type === 'convert') aggregated[key].converts++;
      });

      return {
        thisUser: results,
        aggregated: Object.values(aggregated),
        eventCount: events.length
      };
    },

    /**
     * Reset all tests (for development)
     */
    reset: function() {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(EVENTS_KEY);
    },

    // Private methods
    _getTests: function() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      } catch (e) {
        return {};
      }
    },

    _saveTests: function(tests) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
      } catch (e) {}
    },

    _getEvents: function() {
      try {
        return JSON.parse(localStorage.getItem(EVENTS_KEY)) || [];
      } catch (e) {
        return [];
      }
    },

    _logEvent: function(testId, type, data) {
      const events = this._getEvents();
      events.push({
        testId: testId,
        type: type,
        variant: data.variant,
        action: data.action,
        ts: Date.now(),
        page: window.location.pathname
      });

      // Keep only last MAX_EVENTS
      const trimmed = events.slice(-MAX_EVENTS);
      try {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed));
      } catch (e) {}
    },

    _applyConfig: function(config) {
      Object.keys(config).forEach(selector => {
        const elements = document.querySelectorAll(selector);
        const changes = config[selector];

        elements.forEach(el => {
          if (changes.text) el.textContent = changes.text;
          if (changes.html) el.innerHTML = changes.html;
          if (changes.style) Object.assign(el.style, changes.style);
          if (changes.class) el.className = changes.class;
          if (changes.addClass) el.classList.add(changes.addClass);
          if (changes.removeClass) el.classList.remove(changes.removeClass);
        });
      });
    }
  };

  // Expose globally
  window.ABTest = ABTest;

  // Auto-run tests when DOM is ready
  function initTests() {
    // Test 1: CTA Button Color
    ABTest.run('cta-color', ['green', 'blue', 'gold'], {
      'green': function() {
        // Default - do nothing
      },
      'blue': function() {
        const ctas = document.querySelectorAll('button[type="submit"], .cta-button, a.bg-emerald-500, a.bg-green-500');
        ctas.forEach(cta => {
          cta.style.background = '#3B82F6'; // Tailwind blue-500
          cta.addEventListener('mouseenter', function() { this.style.background = '#2563EB'; });
          cta.addEventListener('mouseleave', function() { this.style.background = '#3B82F6'; });
        });
      },
      'gold': function() {
        const ctas = document.querySelectorAll('button[type="submit"], .cta-button, a.bg-emerald-500, a.bg-green-500');
        ctas.forEach(cta => {
          cta.style.background = '#F59E0B'; // Tailwind amber-500
          cta.style.color = '#1F2937'; // Dark text for contrast
          cta.addEventListener('mouseenter', function() { this.style.background = '#D97706'; });
          cta.addEventListener('mouseleave', function() { this.style.background = '#F59E0B'; });
        });
      }
    });

    // Test 2: CTA Button Text
    ABTest.run('cta-text', ['calculate', 'plan', 'free'], {
      'calculate': function() {
        // Default - do nothing
      },
      'plan': function() {
        const ctas = document.querySelectorAll('button[type="submit"]');
        ctas.forEach(cta => {
          if (cta.textContent.toLowerCase().includes('calculate')) {
            cta.textContent = 'Create My Plan';
          }
        });
      },
      'free': function() {
        const ctas = document.querySelectorAll('button[type="submit"]');
        ctas.forEach(cta => {
          if (cta.textContent.toLowerCase().includes('calculate')) {
            cta.textContent = 'Calculate Free';
          }
        });
      }
    });

    // Track CTA clicks as conversions
    document.querySelectorAll('button[type="submit"], .cta-button').forEach(btn => {
      btn.addEventListener('click', function() {
        ABTest.convert('cta-color', 'click');
        ABTest.convert('cta-text', 'click');
      });
    });

    // Track affiliate clicks as conversions
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (link && (link.href.includes('amazon.com') || link.href.includes('amzn.to'))) {
        ABTest.convert('cta-color', 'affiliate-click');
        ABTest.convert('cta-text', 'affiliate-click');
      }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTests);
  } else {
    initTests();
  }

})(window);
