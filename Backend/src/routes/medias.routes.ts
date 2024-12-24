import { Router } from "express"
import { uploadImageController, uploadVideoController, uploadVideoHLSController } from "~/controllers/medias.controllers";
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";
const mediasRouters = Router();


mediasRouters.post('/upload-image', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(uploadImageController))

mediasRouters.post('/upload-video', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(uploadVideoController))

mediasRouters.post('/upload-video-hls', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(uploadVideoHLSController))

export default mediasRouters