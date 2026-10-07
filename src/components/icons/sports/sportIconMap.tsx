import { createElement, type ComponentType } from "react";

import DefaultIcon from "./Default";
import MotorsportIcon from "./Motorsport";
import RugbyIcon from "./Rugby";
import SoccerIcon from "./Soccer";
import GolfIcon from "./Golf";
import PadelIcon from "./Padel";
import CricketIcon from "./Cricket";
import TennisIcon from "./Tennis";
import SquashIcon from "./Squash";
import ClimbingIcon from "./Climbing";

/** Props accepted by all sport icon SVG components in this folder. */
type SportIconProps = {
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

type SportIconComponent = ComponentType<SportIconProps>;

/**
 * Maps **sport** slugs from Sanity (and common aliases) to icons.
 * Series are not keyed here: resolve a series to its sport, then use that sport slug.
 * Keys must be lowercase; use {@link normalizeSportSlug} when resolving.
 */
const SPORT_ICON_BY_SLUG: Record<string, SportIconComponent> = {
    soccer: SoccerIcon as SportIconComponent,
    football: SoccerIcon as SportIconComponent,
    rugby: RugbyIcon as SportIconComponent,
    golf: GolfIcon as SportIconComponent,
    "indoor-golf": GolfIcon as SportIconComponent,
    "golf-sim": GolfIcon as SportIconComponent,
    "golf-simulator": GolfIcon as SportIconComponent,
    "driving-range": GolfIcon as SportIconComponent,
    "practice-range": GolfIcon as SportIconComponent,
    motorsport: MotorsportIcon as SportIconComponent,
    karting: MotorsportIcon as SportIconComponent,
    "go-karting": MotorsportIcon as SportIconComponent,
    "sim-racing": MotorsportIcon as SportIconComponent,
    simracing: MotorsportIcon as SportIconComponent,
    "racing-sim": MotorsportIcon as SportIconComponent,
    padel: PadelIcon as SportIconComponent,
    cricket: CricketIcon as SportIconComponent,
    tennis: TennisIcon as SportIconComponent,
    squash: SquashIcon as SportIconComponent,
    climbing: ClimbingIcon as SportIconComponent,
    bouldering: ClimbingIcon as SportIconComponent,
    "rock-climbing": ClimbingIcon as SportIconComponent,
    "indoor-climbing": ClimbingIcon as SportIconComponent,
};

function normalizeSportSlug(slug: string): string {
    return slug.trim().toLowerCase().replace(/\s+/g, "-");
}

/** True when the slug has its own mark. Unknown sports use {@link DefaultIcon}. */
export function hasSportIcon(sportSlug: string | undefined | null): boolean {
    if (!sportSlug) return false;
    return Boolean(SPORT_ICON_BY_SLUG[normalizeSportSlug(sportSlug)]);
}

/** Icon for a **sport** slug; {@link DefaultIcon} if missing or unknown. Not for series slugs. */
function getSportIconBySlug(sportSlug: string | undefined | null): SportIconComponent {
    if (!sportSlug) return DefaultIcon as SportIconComponent;
    const key = normalizeSportSlug(sportSlug);
    return SPORT_ICON_BY_SLUG[key] ?? (DefaultIcon as SportIconComponent);
}

type SportIconResolvedProps = { sportSlug: string | undefined | null } & SportIconProps;

/** Renders the icon for a **sport** slug. For a series, pass its parent sport’s slug. */
export function SportIcon({ sportSlug, ...props }: SportIconResolvedProps) {
    return createElement(getSportIconBySlug(sportSlug), props);
}
