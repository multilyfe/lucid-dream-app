'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DEFAULT_ORB_ACTIONS, type OrbActionConfig } from "../lib/orbActions";
import { usePersistentState } from "../hooks/usePersistentState";

type OrbProps = {
  disabled?: boolean;
};

const MODULE_ROUTES = [
  "/rpg/dashboard",
  "/rpg/journal",
  "/rpg/quests",
  "/rpg/analytics",
  "/rpg/settings",
  "/rpg/astral-map",
  "/rpg/companion-gallery",
  "/rpg/panty-realm",
  "/rpg/calendar",
  "/rpg/npcs",
];

export default function Orb({ disabled = false }: OrbProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [actions] = usePersistentState<OrbActionConfig[]>(
    "orbActions",
    () => DEFAULT_ORB_ACTIONS
  );

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (open) {
      setOpen(false);
    }
    // Close when navigating
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const activeActions = useMemo(() => actions ?? DEFAULT_ORB_ACTIONS, [actions]);

  const handleAction = useCallback(
    async (action: OrbActionConfig) => {
      if (!action.enabled) return;
      setOpen(false);
      switch (action.type) {
        case "link":
          if (action.href) {
            router.push(action.href);
          }
          break;
        case "randomDream": {
          router.push("/rpg/journal?dream=random" + Date.now());
          break;
        }
        case "latestDream":
          router.push("/rpg/journal?dream=latest");
          break;
        case "summonCompanion":
          router.push("/rpg/companion-gallery");
          break;
        case "randomModule": {
          const pool = MODULE_ROUTES;
          const target = pool[Math.floor(Math.random() * pool.length)];
          router.push(target);
          break;
        }
        default:
          break;
      }
    },
    [router]
  );

  const visibleActions = useMemo(() => activeActions.filter(Boolean), [activeActions]);

  const itemPositions = useMemo(() => {
    if (!open || visibleActions.length === 0) {
      return [] as Array<{ x: number; y: number }>;
    }
    const radius = 120;
    const angleStep = (Math.PI * 2) / visibleActions.length;
    return visibleActions.map((_, index) => {
      const angle = -Math.PI / 2 + angleStep * index;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };
    });
  }, [open, visibleActions]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && !disabled ? (
        <button
          type="button"
          aria-label="Close quick actions"
          className="fixed inset-0 z-10 cursor-default bg-slate-950/40 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <div className="relative">
        {open && (
          <ul className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center">
            {visibleActions.map((action, index) => {
              const position = itemPositions[index] ?? { x: 0, y: 0 };
              const disabledAction = disabled || !action.enabled;
              return (
                <li
                  key={action.id}
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    transitionDelay: `${index * 40}ms`,
                  }}
                  className="absolute transition-transform duration-300"
                >
                  <button
                    type="button"
                    onClick={() => handleAction(action)}
                    disabled={disabledAction}
                    className={`flex h-14 w-14 items-center justify-center rounded-full border text-2xl transition ${
                      disabledAction
                        ? "cursor-not-allowed border-slate-600 bg-slate-800 text-slate-400"
                        : "border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-500 via-rose-400 to-sky-400 text-white shadow-[0_0_25px_rgba(236,72,153,0.35)] hover:scale-110"
                    }`}
                    aria-label={action.label}
                    title={action.label}
                  >
                    <span>{disabledAction ? "🔒" : action.icon}</span>
                  </button>
                  <span className="mt-2 block whitespace-nowrap text-center text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-200">
                    {action.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        <button
          type="button"
          disabled={disabled}
          onClick={() => (!disabled ? setOpen((prev) => !prev) : undefined)}
          className={`orb z-30 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-2xl text-white shadow-lg shadow-pink-500/40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-200 ${
            disabled ? "cursor-not-allowed opacity-60" : open ? "scale-105" : "hover:scale-110"
          }`}
          aria-label={disabled ? "Orb disabled" : open ? "Close quick actions" : "Open quick actions"}
        >
          🔮
        </button>
      </div>
    </div>
  );
}
