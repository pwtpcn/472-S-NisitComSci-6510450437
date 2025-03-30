// repositories/SectionFormRepository.server.ts
export default class SectionFormRepository {
    // ดึงรายการฟอร์มทั้งหมด
    public async getAllSectionForms(): Promise<any> {
        const BACKEND_URL = process.env.BACKEND_URL as string;
        const response = await fetch(`${BACKEND_URL}/section-form/all`);
        if (!response.ok) {
            throw new Error("Failed to fetch section forms");
        }
        return await response.json();
    }

    // ดึงฟอร์มเดียวตาม formId
    public async getSectionFormById(formId: number): Promise<any> {
        const BACKEND_URL = process.env.BACKEND_URL as string;
        const response = await fetch(`${BACKEND_URL}/section-form/${formId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch section form");
        }
        return await response.json();
    }

    // สร้างฟอร์มใหม่
    public async createSectionForm(formData: {
        Section_Form_Name: string;
        Section_Form_Detail: string;
        Section_Form_Max_Number: number;
        Section_Form_Status: "open" | "close";
        Section_Form_Date: string;
        Section_Form_Nisit_Number?: number;
    }): Promise<any> {
        const BACKEND_URL = process.env.BACKEND_URL as string;
        const response = await fetch(`${BACKEND_URL}/section-form/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        if (!response.ok) {
            throw new Error("Failed to create section form");
        }
        return await response.json();
    }

    // เข้าร่วมฟอร์มโดยส่ง userId (แทน Section_Form_Nisit_Name)
    public async joinSectionForm(formId: number, userId: string): Promise<any> {
        console.log("joinSectionForm use ---------")
        console.log(formId)
        console.log(userId)
        const BACKEND_URL = process.env.BACKEND_URL as string;
        const response = await fetch(`${BACKEND_URL}/section-form/join`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ formId, userId }),
        });
        if (!response.ok) {
            throw new Error("Failed to join section form");
        }
        return await response.json();
    }

    // ลบฟอร์มออกจากระบบ
    public async deleteSectionForm(formId: number): Promise<any> {
        const BACKEND_URL = process.env.BACKEND_URL as string;
        const response = await fetch(`${BACKEND_URL}/section-form/${formId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
            throw new Error("Failed to delete section form");
        }
        return await response.json();
    }
}
