// app/routes/OpenSectionForm.tsx
import { useState, useEffect } from "react";
import {
    Link,
    redirect,
    useLoaderData,
    useRevalidator,
    useFetcher,
    type LoaderFunction,
    type MetaFunction,
    type ActionFunction,
} from "react-router";
import MenuBar from "./components/MenuBar";
import { authCookie } from "~/utils/session.server";
import Header from "./components/Header";

export interface Form {
    Section_Form_ID: number;
    Section_Form_Name: string;
    Section_Form_Detail: string;
    Section_Form_Max_Number: number;
    Section_Form_Nisit_Number: number;
    Section_Form_Date: string;
    Section_Form_Status: "open" | "close";
    // เพิ่ม relation ของนิสิตที่เข้าร่วมฟอร์ม
    Section_Form_Nisits: {
        userId: string;
        nisitName: string;
    }[];
}

interface LoaderData {
    user: any;
    forms: Form[];
}

export const meta: MetaFunction = () => {
    return [
        { title: "Open Section Form" },
        { name: "description", content: "เลือกแบบฟอร์มที่ต้องการเข้าร่วม" },
    ];
};

export const loader: LoaderFunction = async ({ request }) => {
    const session = request.headers.get("Cookie");
    const user = await authCookie.parse(session);
    if (!user) return redirect("/login");

    // ใช้ path แบบ absolute ด้วย "~/" เพื่อให้ Remix resolve ได้ถูกต้อง
    const { default: SectionFormRepository } = await import(
        "./repositories/SectionFormRepository.server"
    );
    const sectionFormRepository = new SectionFormRepository();
    const forms: Form[] = await sectionFormRepository.getAllSectionForms();

    return { user, forms };
};

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const _action = formData.get("_action");

    const { default: SectionFormRepository } = await import(
        "./repositories/SectionFormRepository.server"
    );
    const sectionFormRepository = new SectionFormRepository();

    if (_action === "saveForm") {
        const Section_Form_Name = formData.get("Section_Form_Name") as string;
        const Section_Form_Detail = formData.get("Section_Form_Detail") as string;
        const Section_Form_Max_Number = parseInt(
            formData.get("Section_Form_Max_Number") as string,
            10
        );
        const newForm = await sectionFormRepository.createSectionForm({
            Section_Form_Name,
            Section_Form_Detail,
            Section_Form_Max_Number,
            Section_Form_Status: "open",
            Section_Form_Date: new Date().toISOString(),
            Section_Form_Nisit_Number: 0,
        });
        return { _action, newForm };
    } else if (_action === "joinForm") {
        console.log("_action work");
        const formId = Number(formData.get("formId"));
        const userId = formData.get("userId") as string;
        console.log(formId);
        console.log(userId);
        try {
            await sectionFormRepository.joinSectionForm(formId, userId);
            return { _action, success: true, formId };
        } catch (error: any) {
            return { _action, error: error.message };
        }
    }
    return { _action, error: "Action not found" };
};

export default function OpenSectionForm() {
    const { user, forms } = useLoaderData<LoaderData>();
    const revalidator = useRevalidator();
    const fetcher = useFetcher();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formValues, setFormValues] = useState({
        Section_Form_Name: "",
        Section_Form_Detail: "",
        Section_Form_Max_Number: 0,
    });
    // state สำหรับ join forms ใน session นี้
    const [joinedForms, setJoinedForms] = useState<number[]>([]);
    const [confirmJoin, setConfirmJoin] = useState<{
        isOpen: boolean;
        formId: number | null;
    }>({
        isOpen: false,
        formId: null,
    });
    const [joinError, setJoinError] = useState<string | null>(null);

    useEffect(() => {
        document.body.style.overflow = isModalOpen ? "hidden" : "unset";
    }, [isModalOpen]);

    useEffect(() => {
        if (fetcher.data) {
            revalidator.revalidate();
            switch (fetcher.data._action) {
                case "joinForm":
                    if (fetcher.data.success) {
                        const formId = Number(fetcher.data.formId);
                        setJoinedForms((prev) => [...prev, formId]);
                        setJoinError(null);
                    } else if (fetcher.data.error) {
                        setJoinError(fetcher.data.error);
                    }
                    break;
                case "saveForm":
                    setIsModalOpen(false);
                    setFormValues({
                        Section_Form_Name: "",
                        Section_Form_Detail: "",
                        Section_Form_Max_Number: 0,
                    });
                    break;
                default:
                    break;
            }
        }
    }, [fetcher.data, revalidator]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]:
                name === "Section_Form_Max_Number" ? parseInt(value, 10) || 0 : value,
        }));
    };

    // เมื่อกดปุ่ม join ให้เปิด modal ยืนยัน
    const handleJoinClick = (formId: number) => {
        setConfirmJoin({ isOpen: true, formId });
    };

    // เมื่อกดยืนยันการ joinใน modal
    const confirmJoinAction = () => {
        if (confirmJoin.formId) {
            console.log("confirmJoinAction work");
            const data = new FormData();
            data.append("_action", "joinForm");
            data.append("formId", String(confirmJoin.formId));
            data.append("userId", user.uuid);
            fetcher.submit(data, { method: "post" });
        }
        setConfirmJoin({ isOpen: false, formId: null });
    };

    const cancelJoinAction = () => {
        setConfirmJoin({ isOpen: false, formId: null });
    };

    return (
        <div className="flex">
            <MenuBar user={user} />
            <div className="bg-[#C0E0FF] h-screen w-screen p-6 relative overflow-auto">

                <Header data="Open Section Form"/>

                {joinError && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                        {joinError}
                    </div>
                )}

                <div 
                    className="bg-white rounded-2xl shadow-lg w-full mx-auto overflow-y-auto p-4"
                    style={{ maxHeight: "min(85vh, 850px)" }}
                >

                <div className="flex justify-end pb-4">
                <button
                        onClick={() => setIsModalOpen(true)}
                        className="gap-6 px-4 py-2 pb-2 bg-[#7793AE] text-white font-semibold rounded-lg shadow-md hover:bg-[#43586c] transition"
                    >
                        Create Section
                    </button>
                </div>
                    <ul className="space-y-4">
                        {forms.map((form) => {
                            // ตรวจสอบว่า form นี้ถูก join แล้วหรือยัง
                            const isJoined =
                                joinedForms.includes(form.Section_Form_ID) ||
                                form.Section_Form_Nisits.some(
                                    (nisit) => nisit.userId === user.uuid
                                );
                            return (
                                <li
                                    key={form.Section_Form_ID}
                                    className="bg-gray-100 p-4 rounded shadow"
                                >
                                    <h2 className="text-xl font-semibold">
                                        {form.Section_Form_Name}
                                    </h2>
                                    <p className="mt-2">{form.Section_Form_Detail}</p>
                                    <button
                                        onClick={() => handleJoinClick(form.Section_Form_ID)}
                                        disabled={isJoined}
                                        className={`mt-4 px-4 py-2 font-semibold rounded-lg shadow-md transition ${isJoined
                                                ? "bg-gray-500 cursor-not-allowed"
                                                : "bg-[#7793AE] hover:bg-[#43586c] text-white transition"
                                            }`}
                                    >
                                        {isJoined ? "Joined" : "Join Form"}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-[#C0E0FF] bg-opacity-50">
                        <div className="bg-white p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto">
                            <h2 className="text-xl font-bold mb-4">
                                Create New Section Form
                            </h2>
                            <fetcher.Form method="post" className="space-y-4">
                                <input type="hidden" name="_action" value="saveForm" />
                                <div>
                                    <label className="block text-sm font-medium">
                                        Section Form Name
                                    </label>
                                    <input
                                        type="text"
                                        name="Section_Form_Name"
                                        value={formValues.Section_Form_Name}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-2xl bg-amber-100"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">
                                        Section Form Detail
                                    </label>
                                    <textarea
                                        name="Section_Form_Detail"
                                        value={formValues.Section_Form_Detail}
                                        onChange={handleChange}
                                        className="mt-1 block w-full bg-amber-100 rounded-2xl"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">
                                        Section Form Max Number
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        name="Section_Form_Max_Number"
                                        value={formValues.Section_Form_Max_Number}
                                        onChange={handleChange}
                                        className="mt-1 p-2 block w-full bg-amber-100 rounded-2xl"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="mt-4 px-4 py-2 bg-red-700  text-white font-semibold rounded-lg shadow-md hover:bg-red-500 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="mt-4 px-4 py-2 bg-[#61815D]  text-white font-semibold rounded-lg shadow-md hover:bg-[#7B9F77] transition"
                                    >
                                        Save
                                    </button>
                                </div>
                            </fetcher.Form>
                        </div>
                    </div>
                )}
                {confirmJoin.isOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-[#C0E0FF] bg-opacity-50">
                        <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
                            <h3 className="text-lg font-semibold mb-4">
                                ยืนยันเข้าร่วมฟอร์ม
                            </h3>
                            <p className="mb-6">คุณแน่ใจที่จะเข้าร่วมฟอร์มนี้หรือไม่?</p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={cancelJoinAction}
                                    className="px-4 py-2 bg-red-700 hover:bg-red-500 rounded-lg transition text-white"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={confirmJoinAction}
                                    className="px-4 py-2 bg-[#61815D] hover:bg-[#7B9F77] text-white transition rounded-lg"
                                >
                                    ยืนยัน
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
