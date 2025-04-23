import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { promisify } from "util";

const execPromise = promisify(exec);

function nodeStreamToWebStream(nodeStream: Readable): ReadableStream {
  return new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      nodeStream.on("end", () => {
        controller.close();
      });
      nodeStream.on("error", (err) => {
        controller.error(err);
      });
    },
    cancel() {
      nodeStream.destroy();
    },
  });
}

export const GET = async () => {
  const filePath = path.join("/tmp", "dump.sql");
  try {
    // Use environment variables for credentials
    const DB_PASSWORD = process.env.DB_PASSWORD;
    const DB_USER = process.env.DB_USER;
    const DB_HOST = "db";
    const DB_NAME = process.env.DB_NAME;

    // Set password as an environment variable for pg_dump
    const command = `PGPASSWORD="${DB_PASSWORD}" pg_dump -h ${DB_HOST} -U ${DB_USER} ${DB_NAME} > ${filePath}`;

    // Execute pg_dump command
    await execPromise(command);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return new Response("Failed to create database dump", { status: 500 });
    }

    // Read the file as a stream
    const fileStream = fs.createReadStream(filePath);

    // Convert Node.js stream to Web stream
    const webStream = nodeStreamToWebStream(fileStream);

    // Set headers for file download
    const headers = new Headers({
      "Content-Type": "application/sql",
      "Content-Disposition": `attachment; filename="database-dump-${new Date().toISOString()}.sql"`,
    });

    // Return the response with the file stream
    return new Response(webStream, {
      headers,
      status: 200,
    });
  } catch (error) {
    console.error("Error during database dump:", error);
    return new Response("Internal server error", { status: 500 });
  }
};
