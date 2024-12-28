import { Form, useActionData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();

    const response = await fetch("http://localhost/api/upload-test", {
        method: "POST",
        body: formData
    });

    const data = await response.json();

    if (!response.ok) {
        return json({ error: data.message || "Error uploading file" }, { status: response.status });
    }

    return json({ success: true, data });
};

export default function UploadTest() {
    const actionData = useActionData();

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Upload Test</h1>

            <Form method="post" encType="multipart/form-data" className="space-y-4">
                <div>
                    <label htmlFor="image">Select Image:</label>
                    <input
                        type="file"
                        name="image"
                        id="image"
                        accept="image/*"
                        className="block mt-1"
                    />
                </div>

                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Upload
                </button>

                {actionData?.error && (
                    <p className="text-red-500">{actionData.error}</p>
                )}

                {actionData?.success && (
                    <div className="mt-4">
                        <p className="text-green-500">Upload successful!</p>
                        <img
                            src={`http://localhost/storage/${actionData.data.path}`}
                            alt="Uploaded"
                            className="mt-2 max-w-xs"
                        />
                    </div>
                )}
            </Form>
        </div>
    );
}