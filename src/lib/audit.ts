import { db } from "./db";

interface AuditLogData {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  severity?: string;
}

export async function logAudit(data: AuditLogData): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        details: data.details ? JSON.stringify(data.details) : undefined,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        severity: data.severity || "info",
      },
    });
  } catch (error) {
    console.error("Failed to log audit:", error);
  }
}
