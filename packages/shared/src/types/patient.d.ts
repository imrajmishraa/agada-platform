export interface Patient {
    id: string;
    abhaId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: "MALE" | "FEMALE" | "OTHER";
    mobileNumber: string;
    email?: string;
    address: {
        village: string;
        district: string;
        state: string;
        pincode: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export interface VitalSigns {
    bloodPressure?: {
        systolic: number;
        diastolic: number;
    };
    heartRate?: number;
    respiratoryRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    bmi?: number;
}
export interface TriageResult {
    score: number;
    category: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    action: "HOME_CARE" | "TELECONSULT" | "URGENT_REFERRAL" | "EMERGENCY";
    recommendation: string;
    nextSteps: string[];
}
export interface Referral {
    id: string;
    patientId: string;
    fromFacility: string;
    toFacility: string;
    reason: string;
    urgency: "NORMAL" | "URGENT" | "EMERGENCY";
    status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "REDIRECTED";
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    feedback?: string;
}
//# sourceMappingURL=patient.d.ts.map