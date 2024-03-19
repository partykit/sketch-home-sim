type FixedItemType = "light";

type MoveableItemType = "robot" | "dog" | "person";

type FixedItem = {
  id: string;
  name: string;
  type: FixedItemType;
  state: any;
};

export type FixedItemLight = FixedItem & {
  type: "light";
  state: { on: boolean };
};

export type MoveableItem = {
  id: string;
  name: string;
  type: MoveableItemType;
  location: string;
};

export type Location = {
  id: string;
  name: string;
  contents: FixedItem[];
  exits: string[];
};

export type World = {
  locations: Location[];
  moveableItems: MoveableItem[];
};

export const DEFAULT_WORLD: World = {
  locations: [
    <Location>{
      id: "lounge",
      name: "Lounge",
      contents: [
        <FixedItemLight>{
          id: "lounge-light",
          name: "Light",
          type: "light",
          state: { on: false },
        },
      ],
      exits: ["hallway", "office"],
    },
    <Location>{
      id: "hallway",
      name: "Hallway",
      contents: [
        <FixedItemLight>{
          id: "hallway-light",
          name: "Light",
          type: "light",
          state: { on: true },
        },
      ],
      exits: ["lounge", "kitchen", "bedroom"],
    },
    <Location>{
      id: "kitchen",
      name: "Kitchen",
      contents: [
        <FixedItemLight>{
          id: "kitchen-light",
          name: "Light",
          type: "light",
          state: { on: false },
        },
      ],
      exits: ["hallway"],
    },
    <Location>{
      id: "bedroom",
      name: "Bedroom",
      contents: [
        <FixedItemLight>{
          id: "bedroom-light",
          name: "Light",
          type: "light",
          state: { on: false },
        },
      ],
      exits: ["hallway"],
    },
    <Location>{
      id: "office",
      name: "Office",
      contents: [
        <FixedItemLight>{
          id: "office-light",
          name: "Light",
          type: "light",
          state: { on: false },
        },
      ],
      exits: ["lounge"],
    },
  ],
  moveableItems: [
    <MoveableItem>{
      id: "robot",
      name: "Robot",
      type: "robot",
      location: "hallway",
    },
    <MoveableItem>{
      id: "dog",
      name: "Dog",
      type: "dog",
      location: "bedroom",
    },
    <MoveableItem>{
      id: "person",
      name: "Sally",
      type: "person",
      location: "office",
    },
  ],
};
