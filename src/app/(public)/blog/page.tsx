import React from 'react';
import type { Metadata } from "next";
import PostList from "@/components/public/blog/post-list";

export const metadata: Metadata = {
  title: "Blog | nouchi.ci",
  description: "Histoires, analyses et curiosités sur le nouchi, l'argot urbain de Côte d'Ivoire.",
};

function BlogPage() {
	return (
		<div className="my-12">
			<PostList/>
		</div>
	);
}

export default BlogPage;