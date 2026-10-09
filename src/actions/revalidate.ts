"use server";

import { revalidatePath } from "next/cache";

export async function revalidatePagePath(path: string) {
  try {
    revalidatePath(path);
    return { success: true };
  } catch (err) {
    console.error("Failed to revalidate", err);
    return { success: false };
  }
}
