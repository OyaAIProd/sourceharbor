"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useRef } from "react";

type RouteTransitionProps = {
	children: ReactNode;
};

const ROUTE_NAME_MAP: Array<{ href: string; label: string }> = [
	{ href: "/", label: "Home" },
	{ href: "/subscriptions", label: "Subscriptions" },
	{ href: "/knowledge", label: "Knowledge" },
	{ href: "/jobs", label: "Jobs" },
	{ href: "/ingest-runs", label: "Ingest runs" },
	{ href: "/feed", label: "Digest feed" },
	{ href: "/settings", label: "Settings" },
];

function getRouteLabel(pathname: string | null): string {
	const normalizedPath = pathname ?? "/";
	for (const route of ROUTE_NAME_MAP) {
		if (
			route.href === "/"
				? normalizedPath === "/"
				: normalizedPath === route.href ||
					normalizedPath.startsWith(`${route.href}/`)
		) {
			return route.label;
		}
	}
	return "Page";
}

export function RouteTransition({ children }: RouteTransitionProps) {
	const pathname = usePathname();
	const transitionRef = useRef<HTMLDivElement>(null);
	const routeLabel = useMemo(() => getRouteLabel(pathname), [pathname]);
	const lastFocusedHeadingRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		const transitionElement = transitionRef.current;
		if (!transitionElement) {
			return;
		}
		const currentPathname = pathname ?? "/";
		if (transitionElement.getAttribute("data-route") !== currentPathname) {
			return;
		}

		const focusMainHeading = () => {
			let targetHeading: HTMLElement | null = null;
			const selectors = ["[data-route-heading]", "h1", "h2"];
			for (const selector of selectors) {
				targetHeading = transitionElement.querySelector<HTMLElement>(selector);
				if (targetHeading) {
					break;
				}
			}
			if (!targetHeading) {
				return;
			}

			const prev = lastFocusedHeadingRef.current;
			if (prev && prev !== targetHeading) {
				prev.removeAttribute("tabindex");
			}

			if (!targetHeading.hasAttribute("tabindex")) {
				targetHeading.setAttribute("tabindex", "-1");
			}
			lastFocusedHeadingRef.current = targetHeading;
			targetHeading.focus({ preventScroll: true });
		};

		const frameId = window.requestAnimationFrame(focusMainHeading);
		return () => {
			window.cancelAnimationFrame(frameId);
			const prev = lastFocusedHeadingRef.current;
			if (prev) {
				prev.removeAttribute("tabindex");
				lastFocusedHeadingRef.current = null;
			}
		};
	}, [pathname]);

	return (
		<div
			ref={transitionRef}
			key={pathname}
			className="route-transition route-transition-enter folo-route-layer"
			data-route={pathname}
		>
			<div aria-hidden="true" className="route-progress-indicator">
				<div aria-hidden="true" className="route-progress-bar" />
			</div>
			<output className="sr-only" aria-live="polite" aria-atomic="true">
				Switched to: {routeLabel}
			</output>
			{children}
		</div>
	);
}
