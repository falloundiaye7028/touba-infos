import { prisma } from "./db";

export type InfoAd = {
  id: string;
  name: string;
  position: string;
  imageUrl: string;
  linkUrl: string;
  label: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

function rowToAd(r: {
  id: string;
  name: string;
  position: string;
  imageUrl: string;
  linkUrl: string;
  label: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}): InfoAd {
  return {
    id: r.id,
    name: r.name,
    position: r.position,
    imageUrl: r.imageUrl,
    linkUrl: r.linkUrl,
    label: r.label,
    active: r.active,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function listAds(): Promise<InfoAd[]> {
  const rows = await prisma.infoAd.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(rowToAd);
}

export async function getAd(id: string): Promise<InfoAd | null> {
  const r = await prisma.infoAd.findUnique({ where: { id } });
  return r ? rowToAd(r) : null;
}

export async function getActiveAd(position: string): Promise<InfoAd | null> {
  const r = await prisma.infoAd.findFirst({
    where: { position, active: true },
    orderBy: { createdAt: "asc" },
  });
  return r ? rowToAd(r) : null;
}

export type AdInput = {
  name: string;
  position: string;
  imageUrl: string;
  linkUrl: string;
  label?: string;
  active?: boolean;
};

export async function createAd(input: AdInput): Promise<InfoAd> {
  const r = await prisma.infoAd.create({
    data: {
      name: input.name,
      position: input.position,
      imageUrl: input.imageUrl,
      linkUrl: input.linkUrl,
      label: input.label || "Publicité",
      active: input.active ?? true,
    },
  });
  return rowToAd(r);
}

export async function updateAd(id: string, input: Partial<AdInput>): Promise<InfoAd> {
  const r = await prisma.infoAd.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.position !== undefined ? { position: input.position } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      ...(input.linkUrl !== undefined ? { linkUrl: input.linkUrl } : {}),
      ...(input.label !== undefined ? { label: input.label } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
    },
  });
  return rowToAd(r);
}

export async function deleteAd(id: string): Promise<void> {
  await prisma.infoAd.delete({ where: { id } });
}

export async function toggleAd(id: string): Promise<InfoAd> {
  const current = await getAd(id);
  if (!current) throw new Error("Publicité introuvable");
  return updateAd(id, { active: !current.active });
}
