const axios = require("axios");
const cheerio = require("cheerio");

const trustedDomains = [
  "reuters.com",
  "apnews.com",
  "bbc.com",
  "bbc.co.uk",
  "thehindu.com",
  "indianexpress.com",
  "ndtv.com",
  "pib.gov.in",
  "who.int",
  "un.org",
  "gov.in"
];

const suspiciousDomains = [
  "unknownnews.com",
  "viraltruths.net",
  "dailyviralupdates.com",
  "breaking-shock-news.com"
];

const clickbaitWords = [
  "shocking",
  "unbelievable",
  "secret",
  "exposed",
  "viral",
  "viral message",
  "forward",
  "share immediately",
  "share this",
  "doctors hate",
  "you won't believe",
  "breaking",
  "miracle",
  "hidden truth",
  "must watch",
  "guaranteed",
  "limited time",
  "offer ends",
  "hurry",
  "urgent"
];

const emotionalWords = [
  "danger",
  "panic",
  "fear",
  "angry",
  "hate",
  "destroy",
  "scam",
  "threat",
  "emergency",
  "ban",
  "conspiracy",
  "fraud"
];

const claimWords = [
  "always",
  "never",
  "100%",
  "cure",
  "guaranteed",
  "everyone",
  "nobody",
  "all people",
  "all students",
  "all citizens",
  "all users",
  "free laptops",
  "free smartphones",
  "free mobile",
  "free recharge",
  "secretly",
  "officially announced",
  "government announced",
  "government secretly",
  "next month",
  "from next month"
];

const unverifiedPhrases = [
  "does not mention any official website",
  "no official website",
  "without official website",
  "no government notification",
  "does not mention any government notification",
  "without government notification",
  "not confirmed",
  "no proof",
  "without proof",
  "viral message claims",
  "message claims",
  "whatsapp forward",
  "forwarded message"
];

function cleanText(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function normalizeDomain(domain = "") {
  return domain.replace(/^www\./, "").toLowerCase();
}

function extractDomain(url = "") {
  try {
    const parsed = new URL(url);
    return normalizeDomain(parsed.hostname);
  } catch (error) {
    return "Unknown";
  }
}

function countMatches(text, words) {
  const lowerText = text.toLowerCase();
  return words.filter((word) => lowerText.includes(word)).length;
}

function calculateLabel(score) {
  if (score <= 25) return "Likely Reliable";
  if (score <= 55) return "Needs Verification";
  if (score <= 75) return "Suspicious";
  return "Likely Fake";
}

function credibilityToRisk(credibility, isUrlInput) {
  switch (credibility) {
    case "High":
      return 0;
    case "Medium":
      return 10;
    case "Low":
      return 25;
    case "Very Low":
      return 38;
    default:
      return isUrlInput ? 22 : 28;
  }
}

function getSourceCredibility(domain, customSources = []) {
  const normalized = normalizeDomain(domain);

  const customSource = customSources.find((source) =>
    normalized.includes(normalizeDomain(source.domain))
  );

  if (customSource) {
    return customSource.credibility;
  }

  if (trustedDomains.some((trusted) => normalized.includes(trusted))) {
    return "High";
  }

  if (suspiciousDomains.some((bad) => normalized.includes(bad))) {
    return "Very Low";
  }

  if (normalized === "unknown") {
    return "Unknown";
  }

  return "Unknown";
}

function analyzeText({ text, url = "", customSources = [] }) {
  const cleanedText = cleanText(text);
  const lowerText = cleanedText.toLowerCase();

  const isUrlInput = Boolean(url);
  const domain = url ? extractDomain(url) : "Unknown";
  const sourceCredibility = getSourceCredibility(domain, customSources);

  const clickbaitMatches = countMatches(cleanedText, clickbaitWords);
  const emotionalMatches = countMatches(cleanedText, emotionalWords);
  const claimMatches = countMatches(cleanedText, claimWords);
  const unverifiedMatches = countMatches(cleanedText, unverifiedPhrases);

  const uppercaseWords = cleanedText
    .split(/\s+/)
    .filter((word) => word.length > 3 && word === word.toUpperCase()).length;

  const hasManyExclamations = (cleanedText.match(/!/g) || []).length >= 2;
  const hasQuestionableLength = cleanedText.length < 80;

  const hasFreeGovernmentClaim =
    lowerText.includes("free") &&
    (lowerText.includes("government") ||
      lowerText.includes("students") ||
      lowerText.includes("citizens"));

  const hasFutureViralClaim =
    (lowerText.includes("viral") || lowerText.includes("message claims")) &&
    (lowerText.includes("next month") ||
      lowerText.includes("free") ||
      lowerText.includes("government"));

  const clickbaitScore = Math.min(clickbaitMatches * 9, 28);
  const emotionalScore = Math.min(emotionalMatches * 6, 22);
  const claimScore = Math.min(claimMatches * 8, 30);
  const unverifiedScore = Math.min(unverifiedMatches * 15, 35);
  const uppercaseScore = Math.min(uppercaseWords * 3, 15);
  const punctuationScore = hasManyExclamations ? 8 : 0;
  const shortTextScore = hasQuestionableLength ? 8 : 0;
  const sourceRiskScore = credibilityToRisk(sourceCredibility, isUrlInput);

  let patternScore = 0;

  if (hasFreeGovernmentClaim) {
    patternScore += 18;
  }

  if (hasFutureViralClaim) {
    patternScore += 18;
  }

  let riskScore =
    clickbaitScore +
    emotionalScore +
    claimScore +
    unverifiedScore +
    uppercaseScore +
    punctuationScore +
    shortTextScore +
    sourceRiskScore +
    patternScore;

  if (sourceCredibility === "High") {
    riskScore = Math.max(0, riskScore - 20);
  }

  if (sourceCredibility === "High" && clickbaitMatches === 0 && claimMatches === 0) {
    riskScore = Math.min(riskScore, 22);
  }

  if (sourceCredibility === "Unknown" && !isUrlInput && riskScore < 35) {
    riskScore = 35;
  }

  riskScore = Math.min(Math.round(riskScore), 100);

  const prediction = calculateLabel(riskScore);
  const confidence = Math.min(60 + Math.abs(riskScore - 50), 96);

  const reasons = [];

  if (sourceCredibility === "High") {
    reasons.push("The source appears to be from a high-credibility domain.");
  } else if (sourceCredibility === "Medium") {
    reasons.push("The source has medium credibility, so cross-checking is recommended.");
  } else if (sourceCredibility === "Low" || sourceCredibility === "Very Low") {
    reasons.push("The source has low credibility according to the source database.");
  } else {
    reasons.push("The source is unknown or not available in the trusted source database.");
  }

  if (clickbaitMatches > 0) {
    reasons.push("The content contains clickbait-style or viral-message words.");
  }

  if (emotionalMatches > 0) {
    reasons.push("The content uses emotional or fear-based language.");
  }

  if (claimMatches > 0) {
    reasons.push("The content contains broad, absolute, or exaggerated claims.");
  }

  if (unverifiedMatches > 0) {
    reasons.push("The content itself says that no official website, proof, or government notification is mentioned.");
  }

  if (hasFreeGovernmentClaim) {
    reasons.push("The content mentions a free government/student benefit, which should be verified from an official website.");
  }

  if (hasFutureViralClaim) {
    reasons.push("The message looks like a future viral claim and needs verification before sharing.");
  }

  if (uppercaseWords > 0 || hasManyExclamations) {
    reasons.push("The writing style uses shouting words or excessive punctuation.");
  }

  if (hasQuestionableLength) {
    reasons.push("The text is very short, so the system has limited evidence for verification.");
  }

  if (reasons.length === 1 && sourceCredibility === "High") {
    reasons.push("No strong suspicious language pattern was detected.");
  }

  let advice = "Do not share this content until it is verified from official or trusted sources.";

  if (prediction === "Likely Reliable") {
    advice = "This appears more reliable, but still confirm important claims from official sources.";
  } else if (prediction === "Needs Verification") {
    advice = "This needs verification. Check official websites and trusted news sources before sharing.";
  } else if (prediction === "Suspicious") {
    advice = "This looks suspicious. Verify it from official sources before believing or sharing it.";
  } else {
    advice = "This looks fake or misleading. Do not share it unless it is confirmed by official sources.";
  }

  return {
    extractedText: cleanedText,
    sourceDomain: domain,
    prediction,
    riskScore,
    confidence,
    sourceCredibility,
    clickbaitScore,
    emotionalScore,
    reasons,
    advice
  };
}

async function extractArticleFromUrl(url) {
  const response = await axios.get(url, {
    timeout: 10000,
    headers: {
      "User-Agent": "Mozilla/5.0 TruthShieldAI/1.0"
    }
  });

  const $ = cheerio.load(response.data);

  $("script, style, nav, footer, header, aside").remove();

  const title = cleanText(
    $("meta[property='og:title']").attr("content") ||
      $("title").text() ||
      $("h1").first().text() ||
      "Untitled article"
  );

  let articleText = cleanText($("article").text());

  if (articleText.length < 200) {
    articleText = cleanText(
      $("p")
        .map((_, element) => $(element).text())
        .get()
        .join(" ")
    );
  }

  if (!articleText) {
    articleText = title;
  }

  return {
    title,
    text: articleText.slice(0, 5000),
    domain: extractDomain(url)
  };
}

module.exports = {
  analyzeText,
  extractArticleFromUrl,
  extractDomain
};