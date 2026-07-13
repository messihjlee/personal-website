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

export const socialLinks = {
  github: "https://github.com/messihjlee",
  email: "mailto:messihjlee@gmail.com",
  scholar: "https://scholar.google.com/citations?user=qUz4nA8AAAAJ",
} as const;
