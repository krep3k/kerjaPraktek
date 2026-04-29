import { createUploadthing, FileRouter } from "uploadthing/next";
const f = createUploadthing();

export const ourFileRouter = {
    guruUploader: f({
        image: {maxFileSize: "16MB", maxFileCount: 1},
        pdf: {maxFileSize: "16MB", maxFileCount: 1},
        text: {maxFileSize: "16MB", maxFileCount: 1}
    }).onUploadComplete(async ({metadata, file}) => {
        console.log("Upload success. URL File: ", file.url);
        return {url: file.url, namaFile: file.name, ukuran: file.size};
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;