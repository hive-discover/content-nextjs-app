
import parseMarkdown from "./parseMarkdown";
import HTMLParser from 'node-html-parser'
import base58 from 'base58-encode'

export default function preparePost(post){
    // Parse the post-fields
    post.body = parseMarkdown(post.body); 
    const parsedHTML = HTMLParser.parse(post.body);

    // Set default values to be inside the post-object
    //   * Images
    if(!post.json_metadata.image)
        post.json_metadata.image = [];

    // Set image-links to proxy API and HiveBlog ImageHosting
    post.json_metadata.image.forEach((url, index) => {
        if(url.indexOf("https://images.hive.blog/p/") === -1) // HiveBlog ImageHoster
            url = `https://images.hive.blog/p/${base58(url)}`;

        if(url.indexOf("/api/imageProxy?imageUrl=") === -1) // Our API
            url = `/api/imageProxy?imageUrl=${url}`;

        post.json_metadata.image[index] = url;
    });

    for(const img of parsedHTML.querySelectorAll('img')) {    
        let src = img.attrs.src;
        if(post.json_metadata.image.includes(src))
            continue;

        if(src.indexOf("https://images.hive.blog/p/") === -1) // HiveBlog ImageHoster
            src = `https://images.hive.blog/p/${base58(src)}`;

        if(src.indexOf("/api/imageProxy?imageUrl=") === -1) // Our API
            src = `/api/imageProxy?imageUrl=${src}`

        post.json_metadata.image.push(src);
    }

    // Enforce a Description 
    if (!post.json_metadata.description || post.json_metadata.description.length >= 160){
        // Get first plain text from HTML and set it as description (first 160 chars)
        const plainTextString = parsedHTML.text;
        post.json_metadata.description = plainTextString.length > 160 ? plainTextString.substring(0, 160) + "..." : plainTextString;
    }

    return post;
}