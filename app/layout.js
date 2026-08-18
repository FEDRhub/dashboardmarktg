export const metadata = {
  title: 'Radar — Veille marketing',
  description: 'Dashboard de veille marketing et communication',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
