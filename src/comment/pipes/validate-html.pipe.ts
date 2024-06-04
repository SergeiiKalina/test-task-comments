import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class ValidateTagsHTML implements PipeTransform {
  transform(html: string) {
    const clearHTML = sanitizeHtml(html, {
      allowedTags: ['a', 'code', 'i', 'strong'],
      allowedAttributes: {
        a: ['href', 'title'],
      },
      enforceHtmlBoundary: true,
    });

    return clearHTML;
  }
}
