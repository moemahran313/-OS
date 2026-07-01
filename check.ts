import { prisma } from "./server/services/prisma.js";
async function test() {
  try {
    const res = await prisma.notification.findMany({ where: { userId: "fake123" } });
    console.log("Success:", res);
  } catch (e) {
    console.log("Prisma Error:", e);
  }
}
test();
