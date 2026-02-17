import { promoEntries } from "@/data/promos";
import { siteMetadata } from "@/lib/site";

const promoStructuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `${siteMetadata.title} Promo List`,
  description: siteMetadata.description,
  url: siteMetadata.url,
  numberOfItems: promoEntries.length,
  itemListElement: promoEntries.map((entry, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "CreativeWork",
      name: entry.title,
      description: entry.description,
      url: entry.url,
      category: entry.category,
      datePublished: entry.addedDate,
      ...(entry.expiryDate === "Ongoing" ? {} : { expires: entry.expiryDate }),
    },
  })),
};

export const PromoStructuredData = () => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(promoStructuredData),
      }}
    />
  );
};
