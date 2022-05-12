import { renderToString } from 'react-dom/server'

import { marked } from 'marked';
import base58 from 'base58-encode'

const marked_renderer = {
    image : (href, title, text) => {
        const originalHref = href;

        // Proxy all Images through HiveBlog's ImageHoster
        if(href.indexOf("https://images.hive.blog/p/") !== 0) 
            href = `https://images.hive.blog/p/${base58(href)}`;

        return renderToString(
            <center>
                <img src={href}  style={{maxWidth : "100%"}}/> <br/>
                <small><i>
                    {/* Only show text when it specially wrote (not just the filename) */}
                    {!originalHref.includes(text) ? text : ""}
                </i></small>
            </center>
        );
    },
}

export default function parseMarkdown(markdown) {
    marked.use({ renderer : marked_renderer });
    return marked.parse(markdown);
}