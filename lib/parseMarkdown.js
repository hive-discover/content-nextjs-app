import { renderToString } from 'react-dom/server'

import { marked } from 'marked';

const marked_renderer = {
    image : (href, title, text) => {
        return renderToString(
            <center>
                <img src={`/api/imageProxy?imageUrl=${href}`}  style={{maxWidth : "100%"}}/> <br/>
                <small><i>
                    {/* Only show text when it specially wrote (not just the filename) */}
                    {!href.includes(text) ? text : ""}
                </i></small>
            </center>
        );
    },
    // blockquote : (quote) => {return renderToString(<Quote text={quote}/>)},
}

export default function parseMarkdown(markdown) {
    marked.use({ renderer : marked_renderer });
    return marked.parse(markdown);
}