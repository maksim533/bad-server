import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import sharp from 'sharp'
import { promises as fs } from 'fs';
import BadRequestError from '../errors/bad-request-error'
import { MIN_FILE_SIZE } from '../middlewares/file'
import { deleteFile } from '../utils/deleteFile';



export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }

     if (req.file.size < MIN_FILE_SIZE) { 
      return next(new BadRequestError('Файл слишком мал. Минимальный размер: 2KB'));
    }
    
    try {

         const fileBuffer = await fs.readFile(req.file.path);

        try {

            await sharp(fileBuffer).metadata();

        } catch (error) {

            await deleteFile(req.file.path);

            throw new BadRequestError('Файл не является валидным изображением');
        }
        
        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file?.filename}`
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file?.originalname,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
