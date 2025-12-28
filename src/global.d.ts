declare global {
  type ResourceType = "pdf" | "images" | "audio" | "video";

  interface Subject {
    id: string;
    icon: string;
    title: string;
  }

  interface ResourceInterface {
    id: string;
    type: ResourceType;
    title: string;
    resources: Array<string>;
  }
}

export default global;
