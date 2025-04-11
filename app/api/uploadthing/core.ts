import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";
const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 6,
    },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session) throw new UploadThingError("Unauthorized");
      return { userId: session?.user?.id };
    })
    .onUploadComplete(
      async ({ metadata }: { metadata: { userId: string } }) => {
        return { uploadedBy: metadata.userId };
      }
    ),
} satisfies FileRouter;
export type OurFileRouter = typeof ourFileRouter;
