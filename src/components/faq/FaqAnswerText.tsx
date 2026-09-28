import { parseFaqAnswer } from "@/lib/faq/answer";
import Link from "next/link";

const linkClassName =
  "underline decoration-current/40 underline-offset-2 hover:decoration-current";

/** Renders FAQ answers that may contain [label](/path) links. */
export function FaqAnswerText({ text }: { text: string }) {
  const parts = parseFaqAnswer(text);
  return parts.map((part, index) =>
    part.type === "link" ? (
      <Link key={index} href={part.href} className={linkClassName}>
        {part.text}
      </Link>
    ) : (
      <span key={index}>{part.text}</span>
    ),
  );
}
