
export function StructuredData() {
  return (
    <>
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'KongTrade',
            url: 'https://kongtrade.com',
            logo: 'https://kongtrade.com/logo.png',
            description: 'Professional automated cryptocurrency trading bot with AI algorithms',
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer support',
              email: 'kongtrade.bot@gmail.com',
            },
            sameAs: [
              'https://t.me/KongTrade_bot',
              'https://x.com/KongTrade_bot',
              'https://www.youtube.com/channel/UCbiTXrgXZJzdfJAwjnxIXhg'
            ],
          }),
        }}
      />

      {/* Website Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'KongTrade',
            url: 'https://kongtrade.com',
            description: 'Automated cryptocurrency trading bot with AI algorithms',
          }),
        }}
      />

      {/* Software Application Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'KongTrade Automated Trading Bot',
            description: 'Professional automated cryptocurrency trading bot with AI algorithms for Binance and Bybit exchanges',
            url: 'https://kongtrade.com',
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Web-based',
            offers: {
              '@type': 'Offer',
              price: '50',
              priceCurrency: 'USD',
              priceValidUntil: '2025-12-31',
              availability: 'https://schema.org/InStock',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              reviewCount: '150',
              bestRating: '5',
              worstRating: '1',
            },
            creator: {
              '@type': 'Organization',
              name: 'KongTrade',
            },
          }),
        }}
      />
    </>
  )
}
