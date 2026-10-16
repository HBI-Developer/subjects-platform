import { Presence, type PresenceProps, Show } from "@chakra-ui/react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { NAVIGATION_DURATION } from "@/constants";
import type { RootState } from "@/store";

type Props = PresenceProps & {
  children: React.ReactNode;
  show: number;
  ready: number;
  initFunc?: () => void;
};

export default function Page({ children, show, ready, initFunc, ...props }: Props) {
  const scope = useSelector((state: RootState) => state.scope.value),
    mainLoading = useSelector((state: RootState) => state.loading.main),
    direction = { in: "left", out: "right" };

  // biome-ignore lint/correctness/useExhaustiveDependencies: init fires on scope transitions; initFunc has per-render identity
  useEffect(() => {
    if (scope === show && mainLoading) {
      initFunc?.();
    }
  }, [scope]);

  return (
    <Show when={scope === show || scope === ready}>
      <Presence
        present={scope === ready}
        position={"absolute"}
        top={0}
        left={0}
        bottom={0}
        right={0}
        {...props}
        _open={{
          animationName: `slide-in-${direction.in}`,
          animationDuration: `${NAVIGATION_DURATION}ms`,
          animationTimingFunction: "ease-in-out",
        }}
        _closed={{
          animationName: `slide-out-${direction.out}`,
          animationDuration: `${NAVIGATION_DURATION}ms`,
          animationTimingFunction: "ease-in-out",
        }}
      >
        {children}
      </Presence>
    </Show>
  );
}
