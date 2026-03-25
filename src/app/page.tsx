import HeroSection from "@/components/public/accueil/hero-section";
import PopularWordsSection from "@/components/public/accueil/popular-words-section";
import TrustSection from "@/components/public/accueil/trust-section";
import {Separator} from "@/components/ui/separator";
import RecentWordsSection from "@/components/public/accueil/recent-words-section";

export default function Home() {
	return (
		<>
			<HeroSection/>
			<TrustSection/>
			<Separator className="my-10 md:my-12" />
			<PopularWordsSection/>
			<RecentWordsSection/>
		</>
	);
}
