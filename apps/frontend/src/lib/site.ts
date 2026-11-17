import logo from "@/assets/logo.png"

export const site = {
  name: "SoloSocius",
  shortDescription:
    "A lightweight, single-user ActivityPub server built for self-hosting",
  description:
    "SoloSocius is an ActivityPub implementation focused on simplicity. It allows a single user to publish posts, interact with the Fediverse, and host their own social presence without the complexity of a multi-user platform.",
  language: "en",
  softwareUrl: "https://solosocius.767364.xyz/",
  repositoryUrl: "https://github.com/1337kid/SoloSocius",
} as const;

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://solosocius.767364.xyz/";

export const siteLogo = {
  url: logo.src,
  width: logo.width,
  height: logo.height,
  alt: site.name,
  type: "image/png",
} as const

const siteLogoUrl = new URL(siteLogo.url, siteUrl).href

export const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: site.name,
      url: siteUrl,
      description: site.description,
      inLanguage: site.language,
      image: siteLogoUrl,
    },
    {
      "@type": "SoftwareApplication",
      name: site.name,
      applicationCategory: "SocialNetworkingApplication",
      operatingSystem: "Web",
      url: siteUrl,
      description: site.description,
      image: siteLogoUrl,
      sameAs: site.repositoryUrl,
    },
  ],
};
