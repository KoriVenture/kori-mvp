"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

type NodePoint = {
  x: number;
  y: number;
  z: number;
  r: number;
  c: string | null;
  tw: number;
  mate: number;
  hx: number;
  hy: number;
};

type Projection = {
  px: number;
  py: number;
  s: number;
  zr: number;
};

export function SiteEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let scrollP = 0;
    let darkTarget = 0;
    let canvasFrame = 0;
    const roomFrames = new Set<number>();
    const cleanups: Array<() => void> = [];

    const cv = document.getElementById("net") as HTMLCanvasElement | null;
    if (cv && !reduced) {
      const ctx = cv.getContext("2d");
      if (ctx) {
        const ACCENTS = ["#F98515", "#F5513E", "#049C9F", "#0590C6"];
        const INK_LIGHT = [28, 27, 27];
        const INK_DARK = [247, 243, 236];
        let W = 0;
        let H = 0;
        let CX = 0;
        let CY = 0;
        let darkMix = 0;

        const size = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          W = window.innerWidth;
          H = window.innerHeight;
          cv.width = W * dpr;
          cv.height = H * dpr;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          CX = W / 2;
          CY = H / 2;
        };
        size();
        window.addEventListener("resize", size);
        cleanups.push(() => window.removeEventListener("resize", size));

        const DEPTH = 4200;
        const F = 430;
        const N = 200;
        const REACH = 190;
        const nodes: NodePoint[] = Array.from({ length: N }, () => ({
          x: (Math.random() - 0.5) * 1900,
          y: (Math.random() - 0.5) * 1200,
          z: Math.random() * DEPTH,
          r: 0.8 + Math.random() * 1.8,
          c:
            Math.random() < 0.3
              ? ACCENTS[Math.floor(Math.random() * 4)]
              : null,
          tw: Math.random() * Math.PI * 2,
          mate: Math.floor(Math.random() * N),
          hx: 0,
          hy: 0,
        }));

        let curX = -999;
        let curY = -999;
        let curOn = false;
        const cur = document.getElementById("cur");
        const moveCursor = (event: MouseEvent) => {
          curX = event.clientX;
          curY = event.clientY;
          curOn = true;
          if (cur) {
            cur.style.opacity = "1";
            cur.style.left = `${curX}px`;
            cur.style.top = `${curY}px`;
          }
        };
        const leaveDocument = () => {
          curOn = false;
          if (cur) cur.style.opacity = "0";
        };
        window.addEventListener("mousemove", moveCursor);
        document.addEventListener("mouseleave", leaveDocument);
        cleanups.push(() => {
          window.removeEventListener("mousemove", moveCursor);
          document.removeEventListener("mouseleave", leaveDocument);
        });

        const project = (node: NodePoint, camZ: number): Projection => {
          let zr = node.z - camZ;
          while (zr < 50) {
            node.z += DEPTH;
            zr = node.z - camZ;
          }
          while (zr > DEPTH + 50) {
            node.z -= DEPTH;
            zr = node.z - camZ;
          }
          const scale = F / zr;
          return {
            px: CX + node.x * scale + node.hx,
            py: CY + node.y * scale + node.hy,
            s: scale,
            zr,
          };
        };

        const frame = (time: number) => {
          ctx.clearRect(0, 0, W, H);
          darkMix += (darkTarget - darkMix) * 0.04;
          const ink = INK_LIGHT.map((value, index) =>
            Math.round(value + (INK_DARK[index] - value) * darkMix),
          );
          const inkStr = `rgb(${ink.join(",")})`;
          const camZ = scrollP * (DEPTH * 0.8) + Math.sin(time / 2800) * 8;
          const roll = scrollP * 0.12;

          const cosr = Math.cos(-roll);
          const sinr = Math.sin(-roll);
          const rx = curX - CX;
          const ry = curY - CY;
          const cX = CX + rx * cosr - ry * sinr;
          const cY = CY + rx * sinr + ry * cosr;

          ctx.save();
          ctx.translate(CX, CY);
          ctx.rotate(roll);
          ctx.translate(-CX, -CY);

          const tethers: Array<{
            px: number;
            py: number;
            d: number;
            a: number;
            h: number;
            c: string | null;
          }> = [];

          for (let index = 0; index < nodes.length; index += 1) {
            const node = nodes[index];
            const projection = project(node, camZ);
            if (
              projection.px < -80 ||
              projection.px > W + 80 ||
              projection.py < -80 ||
              projection.py > H + 80
            ) {
              node.hx *= 0.9;
              node.hy *= 0.9;
              continue;
            }
            const depthFade = Math.max(0, 1 - projection.zr / 2400);
            const nearFade = Math.min(1, (projection.zr - 60) / 170);
            const alpha = depthFade * nearFade;
            if (alpha <= 0.01) {
              node.hx *= 0.9;
              node.hy *= 0.9;
              continue;
            }

            let hover = 0;
            if (curOn) {
              const dx = cX - projection.px;
              const dy = cY - projection.py;
              const distance = Math.hypot(dx, dy);
              if (distance < REACH) {
                hover = 1 - distance / REACH;
                hover *= hover;
                node.hx +=
                  ((dx / (distance || 1)) * 26 * hover - node.hx) * 0.1;
                node.hy +=
                  ((dy / (distance || 1)) * 26 * hover - node.hy) * 0.1;
                tethers.push({
                  px: projection.px,
                  py: projection.py,
                  d: distance,
                  a: alpha,
                  h: hover,
                  c: node.c,
                });
              } else {
                node.hx *= 0.92;
                node.hy *= 0.92;
              }
            } else {
              node.hx *= 0.92;
              node.hy *= 0.92;
            }

            const mate = nodes[node.mate];
            if (mate) {
              const mateProjection = project(mate, camZ);
              if (
                Math.abs(mateProjection.zr - projection.zr) < 950 &&
                mateProjection.px > -80 &&
                mateProjection.px < W + 80
              ) {
                ctx.globalAlpha = alpha * 0.08;
                ctx.strokeStyle = inkStr;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(projection.px, projection.py);
                ctx.lineTo(mateProjection.px, mateProjection.py);
                ctx.stroke();
              }
            }

            const pulse = 0.75 + 0.25 * Math.sin(time / 950 + node.tw);
            const radius =
              Math.min(4.2, node.r * projection.s * 3) * (1 + hover * 0.5);
            if (node.c) {
              ctx.globalAlpha = Math.min(
                1,
                alpha * 0.14 * pulse * (1 + hover * 2),
              );
              ctx.fillStyle = node.c;
              ctx.beginPath();
              ctx.arc(
                projection.px,
                projection.py,
                radius * 3.2,
                0,
                Math.PI * 2,
              );
              ctx.fill();
              ctx.globalAlpha = Math.min(
                1,
                alpha * 0.88 * pulse * (1 + hover * 0.4),
              );
              ctx.beginPath();
              ctx.arc(
                projection.px,
                projection.py,
                radius,
                0,
                Math.PI * 2,
              );
              ctx.fill();
            } else {
              ctx.globalAlpha = Math.min(
                1,
                alpha * (0.45 + hover * 0.35) * pulse,
              );
              ctx.fillStyle = hover > 0.04 ? "#F5513E" : inkStr;
              ctx.beginPath();
              ctx.arc(
                projection.px,
                projection.py,
                radius * 0.8,
                0,
                Math.PI * 2,
              );
              ctx.fill();
            }
          }

          tethers.sort((left, right) => left.d - right.d);
          for (let index = 0; index < Math.min(7, tethers.length); index += 1) {
            const tether = tethers[index];
            ctx.globalAlpha = tether.a * tether.h * 0.45;
            ctx.strokeStyle = tether.c || inkStr;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(cX, cY);
            ctx.lineTo(tether.px, tether.py);
            ctx.stroke();
          }

          ctx.restore();
          ctx.globalAlpha = 1;
          canvasFrame = window.requestAnimationFrame(frame);
        };
        canvasFrame = window.requestAnimationFrame(frame);
      }
    }

    const clamp = (value: number, minimum: number, maximum: number) =>
      Math.max(minimum, Math.min(maximum, value));
    const map01 = (point: number, start: number, end: number) =>
      clamp((point - start) / (end - start), 0, 1);

    const progress = document.getElementById("progress");
    const ghostc = document.getElementById("ghostc") as HTMLImageElement | null;
    const updateGhostSource = () => {
      if (!ghostc?.dataset.src) return;
      if (window.innerWidth > 900) {
        ghostc.src = ghostc.dataset.src;
      } else {
        ghostc.removeAttribute("src");
      }
    };
    updateGhostSource();
    window.addEventListener("resize", updateGhostSource);
    cleanups.push(() =>
      window.removeEventListener("resize", updateGhostSource),
    );

    const paintScroll = () => {
      const total =
        document.documentElement.scrollHeight - window.innerHeight;
      scrollP = total ? window.scrollY / total : 0;
      if (progress) progress.style.transform = `scaleX(${scrollP})`;
      if (ghostc) {
        const fadeIn = map01(scrollP, 0.3, 0.5);
        const fadeOut = 1 - map01(scrollP, 0.78, 0.9);
        ghostc.style.opacity = (0.5 * Math.min(fadeIn, fadeOut)).toFixed(3);
        ghostc.style.transform = `translateY(-50%) scale(${1.05 - Math.min(fadeIn, 1) * 0.05})`;
      }
    };
    window.addEventListener("scroll", paintScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", paintScroll));

    const rooms = Array.from(
      document.querySelectorAll<HTMLElement>("[data-bg]"),
    ).filter((element) => element.tagName !== "BODY");
    if (rooms.length) {
      let currentBackground: string | null = null;
      const paintRoom = () => {
        const middle = window.innerHeight * 0.5;
        let active = rooms[0];
        for (let index = 0; index < rooms.length; index += 1) {
          if (rooms[index].getBoundingClientRect().top <= middle) {
            active = rooms[index];
          } else {
            break;
          }
        }
        const background = active.dataset.bg ?? "";
        if (background !== currentBackground) {
          currentBackground = background;
          document.body.style.backgroundColor = background;
          const dark = active.dataset.dark === "1";
          document.body.classList.toggle("on-dark", dark);
          darkTarget = dark ? 1 : 0;
        }
      };
      const scheduleRoomPaint = () => {
        const id = window.requestAnimationFrame(() => {
          roomFrames.delete(id);
          paintRoom();
        });
        roomFrames.add(id);
      };
      window.addEventListener("scroll", scheduleRoomPaint, { passive: true });
      window.addEventListener("resize", paintRoom);
      cleanups.push(() => {
        window.removeEventListener("scroll", scheduleRoomPaint);
        window.removeEventListener("resize", paintRoom);
      });
      paintRoom();
    }

    let revealObserver: IntersectionObserver | null = null;
    const targets = document.querySelectorAll<HTMLElement>(".anim-text-up");
    if (targets.length) {
      if (reduced || !("IntersectionObserver" in window)) {
        targets.forEach((element) => element.classList.add("in"));
      } else {
        revealObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("in");
                revealObserver?.unobserve(entry.target);
              }
            });
          },
          { threshold: .05, rootMargin: "0px 0px -6% 0px" },
        );
        targets.forEach((element) => revealObserver?.observe(element));
      }
    }

    let drawObserver: IntersectionObserver | null = null;
    const drawn = document.querySelectorAll<SVGGeometryElement>(
      "[data-draw] path",
    );
    if (drawn.length) {
      drawn.forEach((path) => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = String(length);
        path.style.strokeDashoffset = reduced ? "0" : String(length);
      });
      if (!reduced) {
        drawObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target
                .querySelectorAll<SVGGeometryElement>("path")
                .forEach((path, index) => {
                  path.style.transition = `stroke-dashoffset 1.6s var(--ease) ${index * 0.18}s`;
                  path.style.strokeDashoffset = "0";
                });
              drawObserver?.unobserve(entry.target);
            });
          },
          { threshold: .3 },
        );
        document
          .querySelectorAll<HTMLElement>("[data-draw]")
          .forEach((element) => drawObserver?.observe(element));
      }
    }

    const carousel = document.querySelector<HTMLElement>(
      "[data-team-carousel]",
    );
    if (carousel) {
      const cards = Array.from(carousel.querySelectorAll<HTMLElement>(".person"));
      const handlers: Array<{
        button: HTMLElement;
        handler: () => void;
      }> = [];
      const activate = (card: HTMLElement) => {
        cards.forEach((item) => {
          const active = item === card;
          item.classList.toggle("is-active", active);
          item
            .querySelector<HTMLElement>(".person-toggle")
            ?.setAttribute("aria-expanded", String(active));
        });
      };
      cards.forEach((card) => {
        const button = card.querySelector<HTMLElement>(".person-toggle");
        if (!button) return;
        const handler = () => activate(card);
        button.addEventListener("click", handler);
        handlers.push({ button, handler });
      });
      cleanups.push(() => {
        handlers.forEach(({ button, handler }) =>
          button.removeEventListener("click", handler),
        );
      });
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      revealObserver?.disconnect();
      drawObserver?.disconnect();
      if (canvasFrame) window.cancelAnimationFrame(canvasFrame);
      roomFrames.forEach((frame) => window.cancelAnimationFrame(frame));
      document.body.classList.remove("on-dark");
      document.body.style.backgroundColor = "";
    };
  }, [pathname]);

  return null;
}
