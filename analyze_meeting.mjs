import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

async function main() {
    try {
        const uploadResponse = await fileManager.uploadFile("data/pdfs/reuniao.mp4", {
            mimeType: "video/mp4",
            displayName: "Meeting Recording",
        });

        console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

        let file = await fileManager.getFile(uploadResponse.file.name);
        while (file.state === "PROCESSING") {
            process.stdout.write(".");
            await new Promise((resolve) => setTimeout(resolve, 10000));
            file = await fileManager.getFile(uploadResponse.file.name);
        }

        if (file.state === "FAILED") {
            throw new Error("Video processing failed.");
        }

        console.log("\nVideo processing complete. Analyzing...");

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: file.mimeType,
                    fileUri: file.uri,
                },
            },
            { text: "Detailed analysis of this meeting recording. Please provide: 1. A summary of the conversation. 2. A specific list of requirements and changes requested by the client (Fernando). 3. Any visual context or UI/UX changes discussed, referencing specific timestamps or visual elements shown. 4. Technical implications of these changes." },
        ]);

        console.log(result.response.text());
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
