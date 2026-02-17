type PromoEntriesModule = typeof import("../data/promos");

const promosModule = (await import("../data/promos")) as PromoEntriesModule;

const { promoEntries } = promosModule;

type ExpiredPromo = {
  id: string;
  title: string;
  url: string;
  expiryDate: string;
};

const isJsonOutput = process.argv.includes("--json");

const today = new Date();
const todayUtc = new Date(
  Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
);

const expiredPromos: ExpiredPromo[] = [];

for (const entry of promoEntries) {
  if (entry.expiryDate === "Ongoing") {
    continue;
  }

  const parsedExpiry = new Date(entry.expiryDate);
  if (Number.isNaN(parsedExpiry.getTime())) {
    console.warn(
      `Skipping promo with invalid expiry date: ${entry.id} -> ${entry.expiryDate}`,
    );
    continue;
  }

  if (parsedExpiry < todayUtc) {
    expiredPromos.push({
      id: entry.id,
      title: entry.title,
      url: entry.url,
      expiryDate: entry.expiryDate,
    });
  }
}

if (isJsonOutput) {
  console.log(JSON.stringify(expiredPromos));
  process.exit(0);
}

if (expiredPromos.length === 0) {
  console.log("No expired promos found.");
  process.exit(0);
}

console.log(
  `Found ${expiredPromos.length} expired promo${
    expiredPromos.length === 1 ? "" : "s"
  }:`,
);

for (const promo of expiredPromos) {
  console.log(
    `- ${promo.title} (${promo.id}) expired on ${promo.expiryDate} -> ${promo.url}`,
  );
}
