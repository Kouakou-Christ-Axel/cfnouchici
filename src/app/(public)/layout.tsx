import Navbar from "@/components/layouts/general/navbar";
import Footer from "@/components/layouts/general/footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Navbar />
			<main className="flex-1">{children}</main>
			<Footer />
		</>
	);
}
