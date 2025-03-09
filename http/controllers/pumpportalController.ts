"use server";

export const uploadMetadata = async (formData: FormData) => {
  const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
    method: "POST",
    body: formData,
  });

  if (!metadataResponse.ok) {
    throw new Error(`Failed to upload metadata: ${metadataResponse.statusText}`);
  }

  const metadataResponseJSON = await metadataResponse.json();

  return metadataResponseJSON;
};
