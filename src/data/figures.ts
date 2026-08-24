import type { FigureId, ZoneId } from "./program";

/** Photorealistic image for a figure, if available (falls back to 3D rig otherwise). */
export const FIGURE_PHOTO: Partial<Record<FigureId, string>> = {
  squat: "https://image.qwenlm.ai/generated-images/db62e526-ca4f-4945-b42e-c22d4bbee7e4/_result.png",
  bridge: "https://image.qwenlm.ai/generated-images/9c4e20a8-aba9-4b0a-b393-5394638367e6/_result.png",
  donkey: "https://image.qwenlm.ai/generated-images/939fd980-c472-4fb6-97ed-7f4d087b9431/_result.png",
  pushup: "https://image.qwenlm.ai/generated-images/f7defae4-24e8-4b17-b241-e08f6b0bd686/_result.png",
  fly: "https://image.qwenlm.ai/generated-images/ea5a83f8-5ad2-429e-99e9-3da8df68c29b/_result.png",
  press: "https://image.qwenlm.ai/generated-images/ac330584-8301-4513-a01b-3af59b96634d/_result.png",
  planktap: "https://image.qwenlm.ai/generated-images/0f1dfa10-cf1a-4f37-a9bd-917becdf354c/_result.png",
  sideplank: "https://image.qwenlm.ai/generated-images/967e02f3-4427-4478-932f-52855162b3b8/_result.png",
  crunch: "https://image.qwenlm.ai/generated-images/837f9c48-421c-4efe-b3c2-9b982f49207d/_result.png",
};

/** Photorealistic standing figure used for body assessment. */
export const BODY_PHOTO =
  "https://image.qwenlm.ai/generated-images/108a1f77-eb7f-4d72-beaf-a6e26fcaa19f/_result.png";

/** Approximate working-muscle hotspot (percent of the photo) for the glow overlay. */
export const FIGURE_HOTSPOT: Partial<Record<FigureId, { x: number; y: number; zone: ZoneId }>> = {
  squat: { x: 40, y: 52, zone: "glutes" },
  bridge: { x: 45, y: 42, zone: "glutes" },
  donkey: { x: 55, y: 38, zone: "glutes" },
  pushup: { x: 40, y: 48, zone: "chest" },
  fly: { x: 45, y: 42, zone: "chest" },
  press: { x: 50, y: 36, zone: "chest" },
  planktap: { x: 46, y: 45, zone: "belly" },
  sideplank: { x: 46, y: 48, zone: "waist" },
  crunch: { x: 45, y: 45, zone: "belly" },
};

/** Approximate measurement guide positions on the standing body photo (% height). */
export const BODY_GUIDES: { label: string; y: number; zone: ZoneId }[] = [
  { label: "Грудь", y: 30, zone: "chest" },
  { label: "Талия", y: 47, zone: "waist" },
  { label: "Бёдра", y: 60, zone: "glutes" },
];
