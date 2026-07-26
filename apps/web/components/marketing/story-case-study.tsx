import { Tag } from "@kori/ui/patterns/tag";
import { getTranslations } from "next-intl/server";

import type { StoryFigureTone, StoryRecord } from "@/content/stories";

const figureToneClasses: Record<StoryFigureTone, string> = {
  gold: "text-primary",
  ivory: "text-foreground",
  teal: "text-success dark:text-success-foreground",
};

export async function StoryCaseStudy({ story }: { story: StoryRecord }) {
  const t = await getTranslations("stories");

  return (
    <section className="px-6 py-15 md:px-8 md:py-20 xl:px-[3.75rem]">
      <div className="mx-auto grid max-w-[75rem] gap-12 min-[860px]:grid-cols-2">
        <article>
          <p className="font-interface text-[0.625rem] font-extralight tracking-[0.4em] text-primary uppercase">
            {t(`${story.id}.label`)}
          </p>
          <h2 className="mt-4 font-editorial text-4xl font-light max-[600px]:text-[1.75rem]">
            {story.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(`${story.id}.role`)}
          </p>
          <blockquote className="mt-8 border-l-2 border-primary pl-5 font-editorial text-[1.375rem] leading-[1.55] font-light italic max-[600px]:text-lg">
            {t(`${story.id}.quote`)}
          </blockquote>
          <div className="mt-8 grid gap-5">
            {story.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-[0.9375rem] leading-[1.8] text-muted-foreground"
              >
                {t(`${story.id}.paragraphs.${paragraph}`)}
              </p>
            ))}
          </div>
        </article>

        <aside className="self-start rounded-lg border border-border bg-secondary p-6 md:p-8">
          <h3 className="font-interface text-[0.8125rem] tracking-[0.1em] uppercase">
            {t("panelTitle")}
          </h3>
          <dl className="mt-6">
            {story.figures.map((figure) => (
              <div
                key={figure.labelKey}
                className="flex flex-col gap-1 border-b border-border py-3 last:border-b-0 min-[600px]:flex-row min-[600px]:items-baseline min-[600px]:justify-between"
              >
                <dt className="text-sm text-muted-foreground">
                  {t(`${story.id}.figures.${figure.labelKey}`)}
                </dt>
                <dd
                  className={`font-data text-base ${figureToneClasses[figure.tone]}`}
                >
                  {figure.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            {story.tags.map((tag) => (
              <Tag
                key={tag}
                tone={
                  [
                    "Kenya",
                    "Ghana",
                    "Ethiopia",
                    "Diaspora — Toronto",
                    "Seed Stage",
                  ].includes(tag)
                    ? "gold"
                    : "teal"
                }
              >
                {t(`tags.${tag}`)}
              </Tag>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="font-interface text-[0.6875rem] tracking-[0.14em] text-muted-foreground uppercase">
              {t("journeyTitle")}
            </h3>
            <ol className="mt-5 grid gap-5">
              {story.timeline.map((item) => (
                <li
                  key={item.textKey}
                  className="grid grid-cols-[auto_1fr] gap-3"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 size-2 rounded-full ${
                      item.status === "done" ? "bg-success" : "bg-primary"
                    }`}
                  />
                  <div>
                    <p className="text-sm leading-[1.55]">
                      {t(`${story.id}.timeline.${item.textKey}.text`)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t(`${story.id}.timeline.${item.textKey}.date`)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </section>
  );
}
