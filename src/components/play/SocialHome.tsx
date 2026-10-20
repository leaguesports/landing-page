"use client";

import {
  SocialHomeView,
  initialSocialHome,
  reduceSocialHome,
  socialFeedHref,
  type SocialFeed,
} from "@/lib/play/social-home";
import { useEffect, useReducer } from "react";

function publishFeed(feed: SocialFeed) {
  const href = socialFeedHref(feed);
  const current = `${window.location.pathname}${window.location.search}`;
  if (current !== href) window.history.replaceState(null, "", href);
}

export function SocialHome({ initialFeed }: { initialFeed: string | null }) {
  const [state, dispatch] = useReducer(reduceSocialHome, initialFeed, initialSocialHome);

  useEffect(() => {
    dispatch({ type: "hydrate", search: window.location.search });
  }, [initialFeed]);

  function onFeed(feed: SocialFeed) {
    const next = reduceSocialHome(state, { type: "select", feed });
    dispatch({ type: "select", feed });
    if (next.feed !== state.feed) publishFeed(next.feed);
  }

  return (
    <SocialHomeView
      feed={state.feed}
      notice={state.notice}
      onFeed={onFeed}
      onCompose={() => dispatch({ type: "compose" })}
    />
  );
}
