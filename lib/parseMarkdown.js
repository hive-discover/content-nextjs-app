import { renderToString } from 'react-dom/server'

import { marked } from 'marked';
import base58 from 'base58-encode'
import htmlParser from 'html-react-parser';
import DOMPurify from 'dompurify';

export const domSanitizer = (html) => DOMPurify.sanitize(html);

function isImage(url){
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
}

const marked_renderer = {
    image : (href, title, text) => {
        const originalHref = href;

        // Proxy all Images through HiveBlog's ImageHoster
        if(href.indexOf("https://images.hive.blog/") !== 0) 
            href = `https://images.hive.blog/p/${base58(href)}`;

        return renderToString(
            <center>
                <img src={href}  style={{maxWidth : "100%"}}/>
                <small>
                    <i>
                        {/* Only show text when it specially wrote (not just the filename) */}
                        {!originalHref.includes(text.trim()) ? htmlParser(parseMarkdown(text)) : ""}
                    </i>
                </small>
            </center>
        );
    },
    link : (href, title, text) => {
        if(isImage(href)){
            return marked_renderer.image(href, title, text);
        }

        return renderToString(
            <a href={href} target="_blank">
                {htmlParser(text)}
            </a>
        );
    },
    html : (html) => {
        let parsed = htmlParser(html);
        if(!Array.isArray(parsed))
            parsed = [parsed];

        return renderToString(parsed.map((element) => {
            // Handle custom center
            if(element.type === "center"){
                const {children} = element.props;

                return <center>
                    {typeof children === "string" ? htmlParser(parseMarkdown(children)) : children}
                </center>
            }

            return element;
        }));
    }
}

marked.use({ renderer : marked_renderer });

export default function parseMarkdown(markdown) {
    // Check if markdown starts with a <html> tag, then remove it
    if(markdown.startsWith("<html>"))
        markdown = markdown.substring(4, markdown.length - 1);
    if(markdown.endsWith("</html>"))
        markdown = markdown.substring(0, markdown.length - 7);
    
    // Sanitize and Parse the markdown
    markdown = domSanitizer(markdown);
    markdown = marked.parse(markdown);
    return markdown;
}