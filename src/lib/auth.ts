import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET || "default-secret-key-change-this";
const key = new TextEncoder().encode(secretKey);

export interface SessionPayload {
    username: string;
    branch_id: string;
    branch_name: string;
    role: string;
    expiresAt: Date;
}

export async function encrypt(payload: SessionPayload): Promise<string> {
    return await new SignJWT({ ...payload, expiresAt: payload.expiresAt.toISOString() })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(key);
}

export async function decrypt(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ["HS256"],
        });
        return {
            username: payload.username as string,
            branch_id: payload.branch_id as string,
            branch_name: payload.branch_name as string,
            role: payload.role as string,
            expiresAt: new Date(payload.expiresAt as string),
        };
    } catch {
        return null;
    }
}

export async function createSession(user: {
    username: string;
    branch_id: string;
    branch_name: string;
    role: string;
}): Promise<void> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const session = await encrypt({
        ...user,
        expiresAt,
    });

    const cookieStore = await cookies();
    cookieStore.set("session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: expiresAt,
        sameSite: "lax",
        path: "/",
    });
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie?.value) {
        return null;
    }

    return await decrypt(sessionCookie.value);
}

export async function deleteSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}
