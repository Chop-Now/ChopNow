import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE = 'https://www.chopnow.app';

// Pages a search engine should list. Everything else (carts, orders, dashboards, sign-in
// flows, admin, and any address that does not exist) is kept out of search results.
const INDEXABLE = [
  /^\/$/,
  /^\/shop(\/[^/]+){0,2}$/,
  /^\/faq$/,
  /^\/contact-us$/,
  /^\/terms-of-service$/,
  /^\/privacy-policy$/,
  /^\/how-we-calculate-impact$/,
  /^\/login$/,
  /^\/signup$/,
];

// Titles for pages that do not set their own with <SEO>.
const TITLES = {
  '/faq': 'FAQ',
  '/contact-us': 'Contact us',
  '/terms-of-service': 'Terms of service',
  '/privacy-policy': 'Privacy policy',
  '/how-we-calculate-impact': 'How we calculate impact',
  '/login': 'Log in',
  '/signup': 'Sign up',
};

/**
 * Sets the canonical address and the robots rule for whichever page is showing. One fixed
 * canonical in index.html told search engines every page was the home page.
 */
const RouteMeta = () => {
  const { pathname } = useLocation();
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const indexable = INDEXABLE.some((re) => re.test(path));
  const title = TITLES[path];

  return (
    <Helmet>
      <link rel="canonical" href={`${SITE}${path === '/' ? '/' : path}`} />
      <meta name="robots" content={indexable ? 'index, follow' : 'noindex, nofollow'} />
      {title && <title>{`${title} | ChopNow`}</title>}
    </Helmet>
  );
};

export default RouteMeta;
