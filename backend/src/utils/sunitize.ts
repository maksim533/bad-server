import xss from 'xss';

export function sanitize(comment: string | undefined): string {
    if (!comment) return '';
    
    const sanitized = xss(comment, {
        whiteList: {}, 
        stripIgnoreTag: true, 
        stripIgnoreTagBody: ['script', 'style', 'img', 'iframe']
    });
    
    return sanitized;
}
