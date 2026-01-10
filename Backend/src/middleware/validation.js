import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

export const productValidation = [
    body('Ma_SP').notEmpty().withMessage('Mã sản phẩm không được để trống'),
    body('Ten_SP').notEmpty().withMessage('Tên sản phẩm không được để trống'),
    body('Gia').isFloat({ min: 0.1 }).withMessage('Giá phải lớn hơn 0'),
    body('So_Luong').isInt({ min: 0 }).withMessage('Số lượng không được âm'),
    validate
];

export const vaccineValidation = [
    body('Ma_Vacxin').notEmpty().withMessage('Mã vaccin không được để trống'),
    body('Ten_Vacxin').notEmpty().withMessage('Tên vaccin không được để trống'),
    body('Gia').isFloat({ min: 0.1 }).withMessage('Giá phải lớn hơn 0'),
    validate
];

export const packageValidation = [
    body('Ma_GT').notEmpty().withMessage('Mã gói không được để trống'),
    body('Ten_GT').notEmpty().withMessage('Tên gói không được để trống'),
    body('Gia').isFloat({ min: 0.1 }).withMessage('Giá phải lớn hơn 0'),
    validate
];
