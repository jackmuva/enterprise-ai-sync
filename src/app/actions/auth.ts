"use server";

import { signOut, withAuth } from "@workos-inc/authkit-nextjs";
import { SignJWT } from "jose";

export async function handleSignOut() {
  await signOut();
}

export async function userWithToken() {
  const user = (await withAuth({ ensureSignedIn: true, })).user;
  const PRIVATE_KEY = await importPrivateKey(process.env.PARAGON_SIGNING_KEY!);

  if (user) {
    try {
      const paragonUserToken = await new SignJWT({
        sub: user.id,
        aud: `useparagon.com/${process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID}`,
      })
        .setProtectedHeader({ alg: "RS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(PRIVATE_KEY);
      //console.log(paragonUserToken);

      return {
        user,
        paragonUserToken,
      };
    } catch (err) {
      console.error("Paragon signing error", err);
    }
  }
  return { user: null };
}

//export const auth = userWithToken;

export async function createParagonToken(userId: string) {
  const PRIVATE_KEY = await importPrivateKey(process.env.PARAGON_SIGNING_KEY!);
  try {
    const paragonUserToken = await new SignJWT({
      sub: userId,
      aud: `useparagon.com/${process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID}`,
    })
      .setProtectedHeader({ alg: "RS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(PRIVATE_KEY);

    return paragonUserToken;
  } catch (err) {
    console.error("Paragon signing error", err);
  }
}


/*
  Import a PEM encoded RSA private key, to use for RSA-PSS signing.
  Takes a string containing the PEM encoded key, and returns a Promise
  that will resolve to a CryptoKey representing the private key.
  */
export async function importPrivateKey(pem: string) {
  // Replace encoded newlines with actual newlines
  pem = pem.replace(/\\n/g, "\n");

  // Normalize newlines to '\n'
  pem = pem.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Remove unnecessary whitespace and ensure proper PEM format
  pem = pem.trim();

  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";

  if (!pem.startsWith(pemHeader) || !pem.endsWith(pemFooter)) {
    throw new Error("PEM format is incorrect.");
  }

  // Fetch the part of the PEM string between header and footer
  const pemContents = pem
    .substring(pemHeader.length, pem.length - pemFooter.length)
    .replace(/[\s\n]+/g, ""); // Remove all whitespace and newline characters

  // Base64 decode the string to get the binary data
  const binaryDerString = Buffer.from(pemContents, "base64");

  try {
    return await globalThis.crypto.subtle.importKey(
      "pkcs8",
      binaryDerString,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      true,
      ["sign"]
    );
  } catch (err) {
    console.warn(
      "Could not import signing key, it may be in an invalid format."
    );
    throw err;
  }
}

