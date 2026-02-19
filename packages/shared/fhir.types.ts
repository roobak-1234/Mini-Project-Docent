/**
 * FHIR Data Types for LifeLink AI
 * Compliant with HL7 FHIR R4
 */

export interface Helper {
    id: string;
    resourceType: string;
}

export interface FHIRPatient extends Helper {
    resourceType: 'Patient';
    active: boolean;
    name: Array<{
        use: 'official' | 'usual' | 'nickname';
        family: string;
        given: string[];
    }>;
    gender: 'male' | 'female' | 'other' | 'unknown';
    birthDate: string;
    address?: Array<{
        use: 'home' | 'work';
        line: string[];
        city: string;
        state: string;
        postalCode: string;
        country: string;
    }>;
    telecom?: Array<{
        system: 'phone' | 'email';
        value: string;
        use: 'home' | 'work' | 'mobile';
    }>;
}

export interface FHIRObservation extends Helper {
    resourceType: 'Observation';
    status: 'registered' | 'preliminary' | 'final' | 'amended';
    category: Array<{
        coding: Array<{
            system: string;
            code: string;
            display: string;
        }>;
    }>;
    code: {
        coding: Array<{
            system: string; // e.g., http://loinc.org
            code: string;
            display: string;
        }>;
    };
    subject: {
        reference: string; // Reference to Patient
    };
    effectiveDateTime: string;
    valueQuantity?: {
        value: number;
        unit: string;
        system: string;
        code: string;
    };
    component?: Array<{
        code: {
            coding: Array<{
                system: string;
                code: string;
                display: string;
            }>;
        };
        valueQuantity: {
            value: number;
            unit: string;
            system: string;
            code: string;
        };
    }>;
}

export interface FHIREncounter extends Helper {
    resourceType: 'Encounter';
    status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled';
    class: {
        system: string;
        code: string;
        display: string;
    };
    subject: {
        reference: string; // Reference to Patient
    };
    participant?: Array<{
        type: Array<{
            coding: Array<{
                system: string;
                code: string;
                display: string;
            }>;
        }>;
        individual: {
            reference: string; // Reference to Practitioner
        };
    }>;
    period: {
        start: string;
        end?: string;
    };
    reasonCode?: Array<{
        coding: Array<{
            system: string;
            code: string;
            display: string;
        }>;
    }>;
}
