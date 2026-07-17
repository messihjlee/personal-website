export const siteConfig = {
  name: "Messi H.J. Lee",
  firstName: "Messi",
  title: "Messi H.J. Lee — Machine Psychology Researcher",
  description:
    "Researcher exploring the intersection of psychology, cognition, and artificial intelligence.",
  url: "https://messihjlee.com",
  // Where the "test your luck" donation flow sends supporters. Ko-fi takes no
  // fee on one-off donations — swap this single line for GitHub Sponsors /
  // Stripe / PayPal to change the target everywhere.
  donationUrl: "https://ko-fi.com/messihjlee",
};

export const navLinks = [
  { href: "/", label: "Home" },
] as const;

// The poker table is an overlay on the home page rather than a route of its
// own, so there's no url to link back to. This query param is the way in: the
// home page opens the table on arrival and then strips it back off the url.
export const PLAY_PARAM = "play";
export const PLAY_HREF = `/?${PLAY_PARAM}=1`;

export const socialLinks = {
  github: "https://github.com/messihjlee",
  email: "mailto:messihjlee@gmail.com",
  scholar: "https://scholar.google.com/citations?user=qUz4nA8AAAAJ",
} as const;
