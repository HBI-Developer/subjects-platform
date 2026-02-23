declare global {
  type ResourceType = "pdf" | "images" | "audio" | "video" | "office";

  interface SubjectInterface {
    id: string;
    icon: string;
    title: string;
    createdTime: number;
  }

  interface ResourceInterface {
    id: string;
    type: ResourceType;
    title: string;
    resources: Array<string>;
    createdTime: number;
  }
}

export default global;
