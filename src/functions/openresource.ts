import type { Props } from "@/pages/resource";

/** Load the resource overlay only after the user asks to open a resource. */
export default async function openResource(props: Props) {
  const { default: Resource } = await import("@/pages/resource");
  Resource.open("r", props);
}
