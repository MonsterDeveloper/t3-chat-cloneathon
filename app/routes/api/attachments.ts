import {
  type FileUploadHandler,
  parseFormData,
} from "@mjackson/form-data-parser"
import { composeId } from "~/lib/compose-id"
import type { Route } from "./+types/attachments"

export async function action({ request, context }: Route.ActionArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    throw new Response("Unauthorized", { status: 401 })
  }

  const uploadHandler: FileUploadHandler = async (fileUpload) => {
    if (
      fileUpload.fieldName === "file" &&
      fileUpload.type.startsWith("image/")
    ) {
      const attachmentId = composeId("attachment")

      await context.cloudflare.env.ATTACHMENTS.put(attachmentId, fileUpload, {
        httpMetadata: {
          contentType: fileUpload.type,
        },
        customMetadata: {
          userId: session.user.id,
        },
      })

      return `${attachmentId}#${fileUpload.type}`
    }
  }

  const formData = await parseFormData(request, uploadHandler)

  const files = formData.getAll("file")

  return {
    attachments: files.map((file) => {
      const [id, contentType] = String(file).split("#")

      return {
        id: id!,
        contentType: contentType!,
      }
    }),
  }
}
