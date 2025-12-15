import { store } from "@/store";
import { setMainLoading } from "@/store/slice/loading";
import { setScope } from "@/store/slice/scope";

export default function toPage(number: number) {
  store.dispatch(setMainLoading(false));
  store.dispatch(setScope(number));
}
