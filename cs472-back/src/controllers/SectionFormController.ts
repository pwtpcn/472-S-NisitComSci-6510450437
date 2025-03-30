// controllers/SectionFormController.ts
import { Elysia, t } from "elysia";
import SectionFormRepository from "../repositories/SectionFormRepository";
import AuthRepository from "../repositories/AuthRepository";
import UserRepository from "../repositories/UserRepository";

const sectionFormController = new Elysia({
    prefix: "/section-form",
    tags: ["SectionForm"],
});

sectionFormController.model({
    Section_Form_ID: t.Number(),
    Section_Form_Name: t.String(),
    Section_Form_Detail: t.String(),
    Section_Form_Max_Number: t.Number(),
    Section_Form_Nisit_Number: t.Number(),
    Section_Form_Date: t.String(),
    Section_Form_Status: t.String(),
});

// GET /section-form/all -> ดึงฟอร์มทั้งหมด
sectionFormController.get(
    "/all",
    async () => {
        const sectionFormRepo = new SectionFormRepository();
        const forms = await sectionFormRepo.getAllSectionForms();
        return forms;
    },
    {
        tags: ["SectionForm"],
        detail: {
            summary: "Get all Section Forms",
            description: "ดึงรายการฟอร์มทั้งหมดพร้อมรายชื่อนิสิตที่เข้าร่วม",
        },
    }
);

// GET /section-form/:id -> ดึงฟอร์มตาม ID
sectionFormController.get(
    "/:id",
    async ({ params }) => {
        const sectionFormRepo = new SectionFormRepository();
        const form = await sectionFormRepo.getSectionFormById(Number(params.id));

        if (!form) {
            return new Response(JSON.stringify({ error: "Form not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
        }

        return form;
    },
    {
        tags: ["SectionForm"],
        params: t.Object({
            id: t.String(),
        }),
        detail: {
            summary: "Get Section Form by ID",
            description: "ดึงข้อมูลฟอร์มตาม ID พร้อมรายชื่อนิสิตที่เข้าร่วม",
        },
    }
);

// POST /section-form/create -> สร้างฟอร์มใหม่
sectionFormController.post(
    "/create",
    async ({ body }: { body: any }) => {
        const sectionFormRepo = new SectionFormRepository();
        const newForm = await sectionFormRepo.createSectionForm({
            Section_Form_Name: body.Section_Form_Name,
            Section_Form_Detail: body.Section_Form_Detail,
            Section_Form_Max_Number: body.Section_Form_Max_Number,
            Section_Form_Status: "open",
            Section_Form_Nisit_Number: 0,
            Section_Form_Date: new Date().toISOString(),
        });
        return newForm;
    },
    {
        tags: ["SectionForm"],
        body: t.Object({
            Section_Form_Name: t.String(),
            Section_Form_Detail: t.String(),
            Section_Form_Max_Number: t.Number(),
        }),
        detail: {
            summary: "Create Section Form",
            description: "สร้างฟอร์มใหม่",
        },
    }
);

// POST /section-form/join -> เข้าร่วมฟอร์ม
sectionFormController.post(
    "/join",
    async ({ body }) => {
        const userRepu = new UserRepository();

        // ดึง formId และ userId จาก body
        const { formId, userId } = body;

        // ดึงข้อมูลผู้ใช้งานจาก userId
        const user = await userRepu.getUserByID(userId);
        if (!user) {
            return new Response(
                JSON.stringify({ error: "User not found" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }
        // ประกอบชื่อเต็มจาก name และ surname
        const userFullName = `${user.name} ${user.surname}`;
        const sectionFormRepo = new SectionFormRepository();

        // ตรวจสอบว่าฟอร์มมีอยู่หรือไม่
        const form = await sectionFormRepo.getSectionFormById(Number(formId));
        if (!form) {
            return new Response(
                JSON.stringify({ error: "Form not found" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        // ตรวจสอบว่าฟอร์มยังเปิดรับสมัครอยู่หรือไม่
        if (form.Section_Form_Status !== "open") {
            return new Response(
                JSON.stringify({ error: "Form is closed" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // ตรวจสอบว่าฟอร์มยังมีที่ว่างหรือไม่
        if (form.Section_Form_Nisit_Number >= form.Section_Form_Max_Number) {
            return new Response(
                JSON.stringify({ error: "Form is full" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // เรียกใช้ repository joinSectionForm พร้อมส่ง formId, userFullName และ userId
        const result = await sectionFormRepo.joinSectionForm(formId, userFullName, userId);

        return result;
    },
    {
        tags: ["SectionForm"],
        body: t.Object({
            formId: t.Number(), // body มี formId
            userId: t.String(), // และ userId
        }),
        detail: {
            summary: "Join Section Form",
            description: "เข้าร่วมฟอร์ม โดยดึงข้อมูลผู้ใช้งานจาก userId ใน body แล้วประกอบชื่อเต็ม",
        },
    }
);

export default sectionFormController;