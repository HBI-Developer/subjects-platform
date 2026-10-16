declare global {
  type ResourceType = "pdf" | "images" | "audio" | "video" | "office";

  interface CollectionInterface {
    id: string;
    title: string;
    createdTime: number;
  }

  interface SubjectInterface {
    id: string;
    icon: string;
    title: string;
    createdTime: number;
    belongToId: string;
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
