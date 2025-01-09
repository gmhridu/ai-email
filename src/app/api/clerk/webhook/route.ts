/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { db } from "@/server/db";

interface ClerkWebhookData {
  id: string;
  email_addresses: {
    email_address: string;
  }[];
  first_name: string;
  last_name: string;
  image_url?: string;
}

export const POST = async (req: Request) => {
  const { data }: { data: ClerkWebhookData } = await req.json();

  if (!data) {
    console.error("Invalid webhook data received");
    return new Response("Invalid webhook data", { status: 400 });
  }

  const id = data?.id;
  const emailAddress = data?.email_addresses[0]?.email_address;
  const firstName = data?.first_name;
  const lastName = data?.last_name;
  const imageUrl = data?.image_url;

  // Validate required fields
  if (!id || !emailAddress || !firstName || !lastName) {
    console.error("Missing required fields", { id, emailAddress, firstName, lastName });
    return new Response("Missing required fields", { status: 400 });
  }

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { id },
  });

  if (existingUser) {
    return new Response("User already exists", { status: 409 });
  }

  // Create the user
  await db.user.create({
    data: {
      id,
      emailAddress,
      firstName,
      lastName,
      imageUrl,
    },
  });

  return new Response("Webhook received", { status: 200 });
};
