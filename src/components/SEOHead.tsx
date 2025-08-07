import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  structuredData?: object;
}

const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  ogImage = 'https://tapdodo.com/og-image.jpg',
  canonicalUrl,
  structuredData 
}: SEOHeadProps) => {
  const location = useLocation();
  
  const defaultTitle = 'TapDodo - QR Code Restaurant Menu System | Digital Ordering Solution';
  const defaultDescription = 'Transform your restaurant with TapDodo\'s contactless QR code menu system. Easy digital ordering, real-time menu updates, and seamless customer experience for restaurants, hotels, cafes, and food trucks.';
  const baseUrl = 'https://tapdodo.com';
  
  const fullTitle = title ? `${title} | TapDodo` : defaultTitle;
  const fullDescription = description || defaultDescription;
  const fullCanonicalUrl = canonicalUrl || `${baseUrl}${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update meta tags
    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update link tags
    const updateLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Basic meta tags
    updateMetaTag('description', fullDescription);
    if (keywords) updateMetaTag('keywords', keywords);

    // Open Graph tags
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', fullDescription, true);
    updateMetaTag('og:url', fullCanonicalUrl, true);
    updateMetaTag('og:image', ogImage, true);

    // Twitter tags
    updateMetaTag('twitter:title', fullTitle, true);
    updateMetaTag('twitter:description', fullDescription, true);
    updateMetaTag('twitter:image', ogImage, true);
    updateMetaTag('twitter:url', fullCanonicalUrl, true);

    // Canonical URL
    updateLinkTag('canonical', fullCanonicalUrl);

    // Structured data
    if (structuredData) {
      const existingScript = document.querySelector('script[data-seo-structured-data]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-seo-structured-data', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      const structuredDataScript = document.querySelector('script[data-seo-structured-data]');
      if (structuredDataScript) {
        structuredDataScript.remove();
      }
    };
  }, [fullTitle, fullDescription, keywords, ogImage, fullCanonicalUrl, structuredData]);

  return null; // This component doesn't render anything
};

export default SEOHead;