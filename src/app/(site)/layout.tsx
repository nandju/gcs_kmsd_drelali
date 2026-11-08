// Layout minimal du groupe (site) : il ne reste que /signin —
// les pages marketing du template ont été retirées.
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="flex flex-1 flex-col">{children}</div>;
}
