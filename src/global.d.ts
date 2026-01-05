declare global {
  type ResourceType = "pdf" | "images" | "audio" | "video";

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
  }
}

export default global;
