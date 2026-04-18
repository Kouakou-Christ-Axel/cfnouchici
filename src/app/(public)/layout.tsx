import Navbar from "@/components/layouts/general/navbar";
import Footer from "@/components/layouts/general/footer";
import { SearchModalProvider } from "@/components/search/search-context";
import { SearchModal } from "@/components/search/search-modal";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
	return (
		<SearchModalProvider>
			<Navbar />
			<SearchModal />
			<main className="flex-1">{children}</main>
			<Footer />
		</SearchModalProvider>
	);
}
