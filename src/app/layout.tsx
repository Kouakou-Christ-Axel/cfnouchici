import type {Metadata} from "next";
import {Inter, Space_Grotesk} from "next/font/google";
import "./globals.css";
import {Providers} from "@/components/Providers";

const inter = Inter({
	variable: "--font-sans",
	subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
	variable: "--font-heading",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: "nouchi.ci — Le dictionnaire du nouchi ivoirien",
		template: "%s | nouchi.ci",
	},
	description: "Découvre et contribue au dictionnaire collaboratif du nouchi, l'argot urbain de Côte d'Ivoire.",
	openGraph: {
		title: "nouchi.ci — Le dictionnaire du nouchi ivoirien",
		description: "Découvre et contribue au dictionnaire collaboratif du nouchi, l'argot urbain de Côte d'Ivoire.",
		type: "website",
		locale: "fr_FR",
		siteName: "nouchi.ci",
	},
	twitter: {
		card: "summary_large_image",
		title: "nouchi.ci — Le dictionnaire du nouchi ivoirien",
		description: "Le street talk ivoirien, expliqué par ceux qui le parlent.",
	},
};

export default function RootLayout({children}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="fr" suppressHydrationWarning>
		<body
			className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased flex flex-col min-h-screen`}
		>
		<Providers>
			{children}
		</Providers>
		</body>
		</html>
	);
}
