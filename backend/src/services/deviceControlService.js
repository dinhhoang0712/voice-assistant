import { SERVICES } from "../constant/service_targets.js";
import { normalizeText } from "../utils/helper.js";

const extractQuery = (text) => {
  const t = normalizeText(text);

  const m1 = t.match(
    /\b(tìm|search|tra|tra cứu|tìm kiếm)\s+(.+?)\s*(?:\b(trên|ở)\b\s+.+)?$/i,
  );
  if (m1?.[2]) return m1[2].trim();

  const m2 = t.match(
    /\b(mở|vào)\b.+?\b(và|rồi|sau đó)\b\s*\b(tìm|search|tra|tra cứu|tìm kiếm)\s+(.+)$/i,
  );
  if (m2?.[4]) return m2[4].trim();

  return null;
};

const detectService = (text) => {
  const t = normalizeText(text);

  for (const s of SERVICES) {
    for (const n of s.names) {
      if (t.includes(n)) return s;
    }
  }

  // detect by domain mention
  for (const s of SERVICES) {
    for (const d of s.domains) {
      if (t.includes(d)) return s;
    }
  }

  return null;
};

const buildGoogleFallbackSearch = ({ query, service }) => {
  if (!query) return "https://www.google.com/";
  if (!service?.domains?.length) {
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }
  const d = service.domains[0];
  return `https://www.google.com/search?q=${encodeURIComponent(`${query} site:${d}`)}`;
};

const pickMobileDeepLink = (service) => {
  const links = service?.mobileDeepLinks || [];
  return links[0] || null;
};

export async function deviceHandler(text, { platform = "unknown" } = {}) {
  const t = normalizeText(text);
  const service = detectService(t) || SERVICES.find((s) => s.id === "google");
  const query = extractQuery(t);

  const wantsSearch =
    /\b(tìm|search|tra|tra cứu|tìm kiếm)\b/i.test(t) || !!query;
  const isMobile = platform === "mobile";

  // Choose primary target (pc web URL vs mobile deep link)
  const openTarget =
    isMobile && pickMobileDeepLink(service)
      ? { kind: "app", deepLink: pickMobileDeepLink(service) }
      : { kind: "web", url: service.pcUrl };

  // If search requested and service supports it, open service search URL on web.
  // If on mobile and deepLink exists but cannot encode search reliably, still open web search URL (works universally).
  if (wantsSearch && query) {
    if (typeof service.searchUrl === "function") {
      const url = service.searchUrl(query);
      return {
        reply: `Mình sẽ mở ${service.id} và tìm “${query}”. Nếu không thấy kết quả phù hợp, mình sẽ chuyển sang tìm trên Google.`,
        action: {
          type: "open",
          target: "web",
          url,
          fallback: {
            type: "open",
            target: "web",
            url: buildGoogleFallbackSearch({ query, service }),
          },
        },
      };
    }

    // Service doesn't have a searchable web endpoint (e.g. zalo/gmail)
    return {
      reply: `Trang/app ${service.id} không hỗ trợ tìm kiểu web từ phía mình. Mình sẽ tìm “${query}” trên Google nhé.`,
      action: {
        type: "open",
        target: "web",
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      },
    };
  }

  // Otherwise just open the service
  if (openTarget.kind === "app") {
    return {
      reply: `Mình sẽ mở app ${service.id}.`,
      action: {
        type: "open",
        target: "app",
        deepLink: openTarget.deepLink,
        fallback: service.pcUrl
          ? { type: "open", target: "web", url: service.pcUrl }
          : null,
      },
    };
  }

  return {
    reply: `Mình sẽ mở ${service.id}.`,
    action: {
      type: "open",
      target: "web",
      url: openTarget.url,
    },
  };
}
