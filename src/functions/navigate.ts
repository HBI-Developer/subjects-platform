import { NAVIGATION_DURATION } from "@/constants";
import { store } from "@/store";
import { setMainLoading } from "@/store/slice/loading";
import { setScope } from "@/store/slice/scope";

export default function navigate(currentShow: number, nextShow: number) {
  store.dispatch(setScope(currentShow));
  setTimeout(() => {
    store.dispatch(setMainLoading(true));
    store.dispatch(setScope(nextShow));
  }, NAVIGATION_DURATION);
}
