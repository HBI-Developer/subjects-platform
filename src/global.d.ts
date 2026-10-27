declare global {
  type ResourceType = "pdf" | "images" | "audio" | "video" | "office";

  interface CollectionInterface {
    id: string;
    title: string;
    createdTime: number;
    relatedSubjects: number;
  }

  interface SubjectInterface {
    id: string;
    icon: string;
    title: string;
    createdTime: number;
    belongToId: string;
    relatedResources: number;
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
