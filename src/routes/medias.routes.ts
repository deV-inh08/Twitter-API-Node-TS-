import { Router } from "express"
import { uploadSignleImageController } from "~/controllers/medias.controllers";
import { wrapRequestHandler } from "~/utils/handlers";
const mediasRouters = Router();


mediasRouters.post('/upload-image', wrapRequestHandler(uploadSignleImageController))

export default mediasRouters