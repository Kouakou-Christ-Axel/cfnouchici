'use client'

import {HeroUIProvider} from '@heroui/react'
import {ThemeProvider as NextThemesProvider} from "next-themes"
import {RootProvider} from "fumadocs-ui/provider/next"


export function Providers({children}: { children: React.ReactNode }) {
	return (
		<HeroUIProvider>
			<NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
				<RootProvider theme={{ enabled: false }} search={{ enabled: false }}>
					{children}
				</RootProvider>
			</NextThemesProvider>
		</HeroUIProvider>
	)
}