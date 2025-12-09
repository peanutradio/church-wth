import ReactGA from 'react-ga4';

// Initialize Google Analytics
export const initGA = () => {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

    if (measurementId && measurementId !== 'G-XXXXXXXXXX') {
        ReactGA.initialize(measurementId);
        console.log('Google Analytics initialized');
    } else {
        console.warn('Google Analytics measurement ID not configured');
    }
};

// Track page view
export const trackPageView = (path) => {
    ReactGA.send({ hitType: 'pageview', page: path });
};

// Track custom events
export const trackEvent = (category, action, label = null, value = null) => {
    ReactGA.event({
        category,
        action,
        label,
        value,
    });
};

// Track timing (performance metrics)
export const trackTiming = (category, variable, value, label = null) => {
    ReactGA.event({
        category: 'timing',
        action: category,
        label: `${variable}${label ? `: ${label}` : ''}`,
        value: Math.round(value),
    });
};
