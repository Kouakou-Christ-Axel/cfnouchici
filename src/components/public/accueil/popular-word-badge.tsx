import React from 'react';
import {Badge} from "@/components/ui/badge";
import {Link} from "@heroui/react";

function PopularWordBadge({mot, href}: { mot: string, href: string }) {
	return (
		<Badge asChild variant="outline" className="px-3 py-1">
			<Link href={href} className="text-sm">
				{mot}
			</Link>
		</Badge>
	);
}

export default PopularWordBadge;