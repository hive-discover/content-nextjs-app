import { renderToString } from 'react-dom/server'

import { marked } from 'marked';
import base58 from 'base58-encode'

const marked_renderer = {
    image : (href, title, text) => {
        if(!href.indexOf("https://images.hive.blog/p/") === -1) // HiveBlog ImageHoster
            href = `https://images.hive.blog/p/${base58(href)}`;

        if(!href.indexOf("/api/imageProxy?imageUrl=") === -1) // Our API
            href = `/api/imageProxy?imageUrl=${href}`;

        return renderToString(
            <center>
                <img src={href}  style={{maxWidth : "100%"}}/> <br/>
                <p><small><i>
                    {/* Only show text when it specially wrote (not just the filename) */}
                    {!href.includes(text) ? text : ""}
                </i></small></p>
            </center>
        );
    },
    // blockquote : (quote) => {return renderToString(<Quote text={quote}/>)},
}

export default function parseMarkdown(markdown) {
    marked.use({ renderer : marked_renderer });
    return marked.parse(markdown);
}