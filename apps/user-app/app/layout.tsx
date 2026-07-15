import { Providers } from "../provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* "Every component in my application should have access to the authentication session." */}
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}