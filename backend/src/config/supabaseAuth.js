import { jwtVerify } from "jose";
import { createSecretKey } from "crypto";
import { env } from "./env.js";

const getJWTSecret = () => {
  if (env.SUPABASE_JWT_SECRET) {
    // PERBAIKAN: Langsung gunakan secret tanpa decode base64
    // Supabase JWT secret sudah dalam format plain text
    return createSecretKey(Buffer.from(env.SUPABASE_JWT_SECRET, "utf-8"));
  }

  console.warn("⚠️ SUPABASE_JWT_SECRET tidak ditemukan, menggunakan fallback");
  return null;
};

export async function verifySupabaseJWT(token) {
  const secret = getJWTSecret();

  if (!secret) {
    // Fallback: skip verification (HANYA UNTUK DEVELOPMENT)
    console.warn("⚠️ JWT verification dilewati - TIDAK AMAN untuk production!");
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT format");
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    return payload;
  }

  const { payload } = await jwtVerify(token, secret, {
    issuer: `${env.SUPABASE_URL}/auth/v1`,
  });
  return payload;
}

export function authGuard() {
  return async function (request, reply) {
    const header = request.headers.authorization || "";
    const [, token] = header.split(" ");

    if (!token) {
      console.warn("⚠️ No token provided");
      return reply.code(401).send({ message: "Unauthorized" });
    }

    try {
      console.log("🔐 Verifying JWT token...");
      const payload = await verifySupabaseJWT(token);
      console.log("✅ Token verified for user:", payload.sub || payload.id);
      request.user = payload;
    } catch (err) {
      console.error("❌ JWT Verification Error:", {
        name: err.name,
        message: err.message,
        code: err.code,
      });
      return reply.code(401).send({ message: "Invalid token" });
    }
  };
}

export const supabaseAuth = authGuard();
