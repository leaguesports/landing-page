import { createElement, type ComponentType } from "react";

import DefaultIcon from "./Default";
import MotorsportIcon from "./Motorsport";
import RugbyIcon from "./Rugby";
import SoccerIcon from "./Soccer";
import GolfIcon from "./Golf";
import PadelIcon from "./Padel";
import CricketIcon from "./Cricket";

/** Props accepted by all sport icon SVG components in this folder. */
export type SportIconProps = {
    size?: number;
    color?: string;
    strokeWidth?: number;
    background?: string;
    opacity?: number;
    rotation?: number;
    shadow?: number;
    flipHorizontal?: boolean;
    flipVertical?: boolean;
    padding?: number;
};

export type SportIconComponent = ComponentType<SportIconProps>;

/**
 * Maps **sport** slugs from Sanity (and common aliases) to icons.
 * Series are not keyed here: resolve a series to its sport, then use that sport slug.
 * Keys must be lowercase; use {@link normalizeSportSlug} when resolving.
 */
export const SPORT_ICON_BY_SLUG: Record<string, SportIconComponent> = {
    soccer: SoccerIcon as SportIconComponent,
    football: SoccerIcon as SportIconComponent,
    rugby: RugbyIcon as SportIconComponent,
    golf: GolfIcon as SportIconComponent,
    motorsport: MotorsportIcon as SportIconComponent,
    padel: PadelIcon as SportIconComponent,
    cricket: CricketIcon as SportIconComponent,
};

export function normalizeSportSlug(slug: string): string {
    return slug.trim().toLowerCase().replace(/\s+/g, "-");
}

/** Icon for a **sport** slug; {@link DefaultIcon} if missing or unknown. Not for series slugs. */
export function getSportIconBySlug(sportSlug: string | undefined | null): SportIconComponent {
    if (!sportSlug) return DefaultIcon as SportIconComponent;
    const key = normalizeSportSlug(sportSlug);
    return SPORT_ICON_BY_SLUG[key] ?? (DefaultIcon as SportIconComponent);
}

type SportIconResolvedProps = { sportSlug: string | undefined | null } & SportIconProps;

/** Renders the icon for a **sport** slug. For a series, pass its parent sport’s slug. */
export function SportIcon({ sportSlug, ...props }: SportIconResolvedProps) {
    return createElement(getSportIconBySlug(sportSlug), props);
}
